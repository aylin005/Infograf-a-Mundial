<?php
namespace App\Models;

use App\Core\Database;
use PDO;
use Exception;

/**
 * Modelo para manejar la tabla multimedia
 */
class MultimediaModel
{
    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    /**
     * Insertar archivo multimedia usando stored procedure
     * @param array $data - Datos del multimedia
     * @return array - Resultado de la operación
     */
    public function insert(array $data): array
    {
        try {
            // Validar campos requeridos
            $requiredFields = ['post_id', 'type'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty(trim($data[$field]))) {
                    return [
                        'exito' => false,
                        'mensaje' => "Campo requerido faltante: $field",
                        'id' => 0
                    ];
                }
            }

            // Llamar al stored procedure
            $sql = "CALL sp_post_add_multimedia(:post_id, :type, :image, :path, :position)";
            $stmt = $this->conn->prepare($sql);

            // Bind parámetros
            $postId = (int)$data["post_id"];
            $type = trim($data["type"]);
            $path = $data["path"] ?? null;
            $position = (int)($data["position"] ?? 0);
            
            error_log("MultimediaModel - Binding params: post_id=$postId, type=$type, path=$path, position=$position");
            
            $stmt->bindValue(":post_id",        $postId,                           PDO::PARAM_INT);
            $stmt->bindValue(":type",           $type,                             PDO::PARAM_STR);
            $stmt->bindValue(":image",          $data["image"] ?? null,            PDO::PARAM_LOB);
            $stmt->bindValue(":path",           $path,                             PDO::PARAM_STR);
            $stmt->bindValue(":position",       $position,                         PDO::PARAM_INT);

            error_log("MultimediaModel insert - Calling SP with: post_id={$data['post_id']}, type={$data['type']}, position=" . ($data["position"] ?? 0));

            if ($stmt->execute()) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                $stmt->closeCursor();
                
                error_log("MultimediaModel insert - SP result: " . json_encode($result));
                
                return $result ?: [
                    'exito' => false,
                    'mensaje' => 'No se obtuvo respuesta del stored procedure',
                    'id' => 0
                ];
            } else {
                return [
                    'exito' => false,
                    'mensaje' => 'Error ejecutando stored procedure',
                    'id' => 0
                ];
            }

        } catch (Exception $e) {
            error_log("Error in MultimediaModel insert(): " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error interno del servidor: ' . $e->getMessage(),
                'id' => 0
            ];
        }
    }

    /**
     * Obtener multimedia por post ID
     * @param int $postId - ID del post
     * @return array - Array de archivos multimedia
     */
    public function getByPostId(int $postId): array
    {
        try {
            $sql = "SELECT 
                        id,
                        post_id,
                        type,
                        path,
                        position,
                        uploaded_at
                    FROM multimedia 
                    WHERE post_id = :post_id AND is_active = 1 
                    ORDER BY position ASC, uploaded_at ASC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":post_id", $postId, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            return [];
            
        } catch (Exception $e) {
            error_log("Error in MultimediaModel getByPostId(): " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener una imagen multimedia específica (blob)
     * @param int $id - ID del multimedia
     * @return array|false - Datos de la imagen o false si no existe
     */
    public function getImageBlob(int $id)
    {
        try {
            $sql = "SELECT 
                        image,
                        type
                    FROM multimedia 
                    WHERE id = :id AND type = 'image' AND is_active = 1";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
            
            return false;
            
        } catch (Exception $e) {
            error_log("Error in MultimediaModel getImageBlob(): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Eliminar archivo multimedia
     * @param int $id - ID del multimedia
     * @param int $postId - ID del post (para seguridad)
     * @return bool
     */
    public function delete(int $id, int $postId): bool
    {
        try {
            // Obtener datos del archivo antes de eliminarlo (para cleanup)
            $multimedia = $this->getOne($id);
            
            if (!$multimedia || $multimedia['post_id'] != $postId) {
                error_log("MultimediaModel delete - Multimedia no encontrado o post_id no coincide");
                return false;
            }

            // Marcar como inactivo (soft delete)
            $sql = "UPDATE multimedia SET is_active = 0 WHERE id = :id AND post_id = :post_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->bindValue(":post_id", $postId, PDO::PARAM_INT);
            
            $success = $stmt->execute() && $stmt->rowCount() > 0;
            
            if ($success) {
                error_log("MultimediaModel delete - Multimedia {$id} marcado como inactivo");
                
                // Si es video, intentar eliminar archivo físico
                if ($multimedia['type'] === 'video' && !empty($multimedia['path'])) {
                    require_once __DIR__ . '/../Core/MediaHandler.php';
                    \App\Core\MediaHandler::deleteVideoFile($multimedia['path']);
                }
            }
            
            return $success;
            
        } catch (Exception $e) {
            error_log("Error in MultimediaModel delete(): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener un archivo multimedia por ID
     * @param int $id - ID del multimedia
     * @return array|false
     */
    private function getOne(int $id)
    {
        try {
            $sql = "SELECT 
                        id,
                        post_id,
                        type,
                        path,
                        position
                    FROM multimedia 
                    WHERE id = :id AND is_active = 1";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
            
            return false;
            
        } catch (Exception $e) {
            error_log("Error in MultimediaModel getOne(): " . $e->getMessage());
            return false;
        }
    }
}