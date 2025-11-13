<?php
namespace App\Models;
use App\Core\Database;
use PDO;
use Exception;

class PostModel
{
    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    // obtener todos los posts
    public function getAll(): array
    {
        try {
            $sql = "SELECT * FROM posts WHERE is_active = TRUE ORDER BY created_at DESC";
            $stmt = $this->conn->query($sql);
            $data = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $data[] = $row;
            }

            return $data;
        } catch (Exception $e) {
            error_log("Error in PostModel getAll(): " . $e->getMessage());
            return [];
        }
    }

    // obtener un post especifico
    public function getOne(string $id): array|false
    {
        try {
            $sql = "SELECT * FROM posts WHERE id = :id AND is_active = TRUE";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Error in PostModel getOne(): " . $e->getMessage());
            return false;
        }
    }

    // insertar o actualizar post
    public function insert(array $data, int $id = 0): array
    {
        try {
            // validar campos requeridos
            $requiredFields = ['user_id', 'worldcup_id', 'title', 'content'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty(trim($data[$field]))) {
                    return [
                        'exito' => false,
                        'mensaje' => "Campo requerido faltante: $field",
                        'id' => $id
                    ];
                }
            }

            // procesar categorias
            $categoryIds = null;
            if (isset($data["category_ids"]) && !empty($data["category_ids"])) {
                if (is_string($data["category_ids"])) {
                    // ya viene como CSV desde el frontend
                    $categoryIds = trim($data["category_ids"]);
                    error_log("PostModel - Category IDs received as CSV: $categoryIds");
                } elseif (is_array($data["category_ids"])) {
                    // si viene como array, convertir a CSV
                    $validIds = array_filter($data["category_ids"], function($id) {
                        return is_numeric($id) && $id > 0;
                    });
                    
                    if (!empty($validIds)) {
                        $categoryIds = implode(',', $validIds);
                        error_log("PostModel - Category IDs processed from array: $categoryIds");
                    }
                }
            }

            // procesar selecciones (nombres de países)
            $nationalTeamsNames = null;
            if (isset($data["selections"]) && !empty($data["selections"])) {
                if (is_string($data["selections"])) {
                    // ya viene como CSV desde el frontend
                    $nationalTeamsNames = trim($data["selections"]);
                    error_log("PostModel - National teams received as CSV: $nationalTeamsNames");
                } elseif (is_array($data["selections"])) {
                    // si viene como array, convertir a CSV
                    $validNames = array_filter($data["selections"], function($name) {
                        return !empty(trim($name));
                    });
                    
                    if (!empty($validNames)) {
                        $nationalTeamsNames = implode(',', $validNames);
                        error_log("PostModel - National teams processed from array: $nationalTeamsNames");
                    }
                }
            }

            // llamar al stored procedure actualizado
            $sql = "CALL sp_post_insert(:id, :user_id, :worldcup_id, :title, :content, :category_ids_csv, :nationalteams_names_csv)";
            $stmt = $this->conn->prepare($sql);

            // bind parametros
            $stmt->bindValue(":id",                         $id,                        PDO::PARAM_INT);
            $stmt->bindValue(":user_id",                    (int)$data["user_id"],      PDO::PARAM_INT);
            $stmt->bindValue(":worldcup_id",                (int)$data["worldcup_id"],  PDO::PARAM_INT);
            $stmt->bindValue(":title",                      trim($data["title"]),       PDO::PARAM_STR);
            $stmt->bindValue(":content",                    trim($data["content"]),     PDO::PARAM_STR);
            $stmt->bindValue(":category_ids_csv",           $categoryIds,               PDO::PARAM_STR);
            $stmt->bindValue(":nationalteams_names_csv",    $nationalTeamsNames,        PDO::PARAM_STR);

            error_log("PostModel - Calling SP with category_ids_csv: " . ($categoryIds ?? 'NULL'));
            error_log("PostModel - Calling SP with nationalteams_names_csv: " . ($nationalTeamsNames ?? 'NULL'));

            error_log("PostModel insert - Calling SP with params: id=$id, user_id={$data['user_id']}, worldcup_id={$data['worldcup_id']}, title='{$data['title']}'");

            if ($stmt->execute()) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                $stmt->closeCursor();
                
                error_log("PostModel insert - SP result: " . json_encode($result));
                return $result ?: [
                    'exito' => false,
                    'mensaje' => 'No se obtuvo respuesta del stored procedure',
                    'id' => $id
                ];
            } else {
                return [
                    'exito' => false,
                    'mensaje' => 'Error ejecutando stored procedure',
                    'id' => $id
                ];
            }

        } catch (Exception $e) {
            error_log("Error in PostModel insert(): " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error interno del servidor: ' . $e->getMessage(),
                'id' => $id
            ];
        }
    }

    // eliminar post (soft delete)
    public function delete(string $id): array
    {
        try {
            $sql = "UPDATE posts SET is_active = FALSE WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            
            if ($stmt->execute() && $stmt->rowCount() > 0) {
                return [
                    'exito' => true,
                    'mensaje' => 'Post eliminado correctamente',
                    'id' => $id
                ];
            } else {
                return [
                    'exito' => false,
                    'mensaje' => 'Post no encontrado',
                    'id' => $id
                ];
            }

        } catch (Exception $e) {
            error_log("Error in PostModel delete(): " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error interno del servidor',
                'id' => $id
            ];
        }
    }
}