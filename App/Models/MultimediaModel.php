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

}