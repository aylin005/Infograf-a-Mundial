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

    /**
     * obtener posts pendientes paginados
     * @param int $pageNumber - numero de pagina (inicia en 1)
     * @param int $pageSize - tamaño de pagina
     * @return array - resultado con posts, total_records, current_page, has_more
     */
    public function getPending(int $pageNumber = 1, int $pageSize = 10): array
    {
        try {
            // preparar stored procedure
            $sql = "CALL sp_post_general('getPending', NULL, NULL,:pageNumber, :pageSize)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':pageNumber', $pageNumber, PDO::PARAM_INT);
            $stmt->bindValue(':pageSize', $pageSize, PDO::PARAM_INT);
            $stmt->execute();
            
            // primer result set: conteo total
            $countResult = $stmt->fetch(PDO::FETCH_ASSOC);
            $totalRecords = $countResult['total_records'] ?? 0;
            
            // avanzar al segundo result set
            $stmt->nextRowset();
            
            // segundo result set: datos de posts
            $posts = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // procesar arrays json
                if (isset($row['categories'])) {
                    $row['categories'] = json_decode($row['categories'], true) ?? [];
                }
                if (isset($row['national_teams'])) {
                    $row['national_teams'] = json_decode($row['national_teams'], true) ?? [];
                }
                if (isset($row['multimedia'])) {
                    $row['multimedia'] = json_decode($row['multimedia'], true) ?? [];
                }
                
                // procesar imagen del usuario (BLOB a base64)
                if (isset($row['image']) && $row['image'] !== null) {
                    // si es un recurso (resource), leerlo
                    if (is_resource($row['image'])) {
                        $row['image'] = stream_get_contents($row['image']);
                    }
                    // convertir a base64 si no está vacío
                    if (!empty($row['image'])) {
                        $row['image'] = base64_encode($row['image']);
                    } else {
                        $row['image'] = null;
                    }
                }
                
                $posts[] = $row;
            }
            
            // calcular si hay mas paginas
            $hasMore = ($pageNumber * $pageSize) < $totalRecords;
            
            return [
                'posts' => $posts,
                'total_records' => $totalRecords,
                'current_page' => $pageNumber,
                'page_size' => $pageSize,
                'has_more' => $hasMore,
                'total_pages' => ceil($totalRecords / $pageSize)
            ];
            
        } catch (Exception $e) {
            error_log("Error in PostModel getPending(): " . $e->getMessage());
            return [
                'posts' => [],
                'total_records' => 0,
                'current_page' => $pageNumber,
                'page_size' => $pageSize,
                'has_more' => false,
                'total_pages' => 0
            ];
        }
    }

    /**
     * Aprobar o rechazar un post
     * @param int $postId - ID del post
     * @param bool $approve - true para aprobar, false para rechazar
     * @return array - resultado con exito, mensaje, id
     */
    public function approvePost(int $postId, bool $approve): array
    {
        try {
            // preparar stored procedure
            $sql = "CALL sp_post_general('approve', :postId, :approve, NULL, NULL)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':postId', $postId, PDO::PARAM_INT);
            $stmt->bindValue(':approve', $approve, PDO::PARAM_BOOL);
            $stmt->execute();
            
            // obtener resultado
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return [
                'exito' => $result['exito'] ?? false,
                'mensaje' => $result['mensaje'] ?? 'Error desconocido',
                'id' => $result['id'] ?? $postId
            ];
            
        } catch (Exception $e) {
            error_log("Error in PostModel approvePost(): " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error al procesar la solicitud: ' . $e->getMessage(),
                'id' => $postId
            ];
        }
    }

    /**
     * Buscar posts con filtros avanzados
     * @param array $filters - Filtros de búsqueda
     * @return array - resultado con posts, total_records, current_page, has_more
     */
    public function searchPosts(array $filters): array
    {
        try {
            $pageNumber = $filters['page'] ?? 1;
            $pageSize = $filters['page_size'] ?? 10;
            
            // preparar stored procedure
            $sql = "CALL sp_post_search(
                :term, 
                :category_ids_csv, 
                :host_country, 
                :national_team, 
                :date_from, 
                :date_to, 
                :sort_by, 
                :page_number, 
                :page_size
            )";
            
            $stmt = $this->conn->prepare($sql);
            
            // bindear parametros (usar NULL si no están presentes)
            $stmt->bindValue(':term',               $filters['term'] ?? null,               PDO::PARAM_STR);
            $stmt->bindValue(':category_ids_csv',   $filters['category_ids_csv'] ?? null,   PDO::PARAM_STR);
            $stmt->bindValue(':host_country',       $filters['host_country'] ?? null,       PDO::PARAM_STR);
            $stmt->bindValue(':national_team',      $filters['national_team'] ?? null,      PDO::PARAM_STR);
            $stmt->bindValue(':date_from',          $filters['date_from'] ?? null,          PDO::PARAM_STR);
            $stmt->bindValue(':date_to',            $filters['date_to'] ?? null,            PDO::PARAM_STR);
            $stmt->bindValue(':sort_by',            $filters['sort_by'] ?? 'newest',        PDO::PARAM_STR);
            $stmt->bindValue(':page_number',        $pageNumber,                            PDO::PARAM_INT);
            $stmt->bindValue(':page_size',          $pageSize,                              PDO::PARAM_INT);
            
            $stmt->execute();
            
            // primer result set: conteo total
            $countResult = $stmt->fetch(PDO::FETCH_ASSOC);
            $totalRecords = $countResult['total_records'] ?? 0;
            
            // avanzar al segundo result set
            $stmt->nextRowset();
            
            // segundo result set: datos de posts
            $posts = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // procesar arrays json
                if (isset($row['categories'])) {
                    $row['categories'] = json_decode($row['categories'], true) ?? [];
                }
                if (isset($row['national_teams'])) {
                    $row['national_teams'] = json_decode($row['national_teams'], true) ?? [];
                }
                if (isset($row['multimedia'])) {
                    $row['multimedia'] = json_decode($row['multimedia'], true) ?? [];
                }
                
                // procesar imagen del usuario (BLOB a base64)
                if (isset($row['image']) && $row['image'] !== null) {
                    if (is_resource($row['image'])) {
                        $row['image'] = stream_get_contents($row['image']);
                    }
                    if (!empty($row['image'])) {
                        $row['image'] = base64_encode($row['image']);
                    } else {
                        $row['image'] = null;
                    }
                }
                
                $posts[] = $row;
            }
            
            // calcular si hay mas paginas
            $hasMore = ($pageNumber * $pageSize) < $totalRecords;
            
            return [
                'posts' => $posts,
                'total_records' => $totalRecords,
                'current_page' => $pageNumber,
                'page_size' => $pageSize,
                'has_more' => $hasMore,
                'total_pages' => ceil($totalRecords / $pageSize),
                'filters_applied' => array_filter($filters, function($value) {
                    return $value !== null && $value !== '';
                })
            ];
            
        } catch (Exception $e) {
            error_log("Error in PostModel searchPosts(): " . $e->getMessage());
            return [
                'posts' => [],
                'total_records' => 0,
                'current_page' => $pageNumber ?? 1,
                'page_size' => $pageSize ?? 10,
                'has_more' => false,
                'total_pages' => 0,
                'error' => $e->getMessage()
            ];
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