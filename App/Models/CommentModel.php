<?php
namespace App\Models;
use App\Core\Database;
use PDO;
use Exception;

class CommentModel
{
    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    /**
     * Crear un nuevo comentario
     * @param int $userId - ID del usuario que crea el comentario
     * @param int $postId - ID del post al que pertenece el comentario
     * @param string $content - Contenido del comentario
     * @return array - resultado con exito, mensaje, id
     */
    public function insertComment(int $userId, int $postId, string $content): array
    {
        try {
            // preparar stored procedure
            $sql = "CALL sp_comment_save_delete('create', NULL, :userId, :postId, :content)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':postId', $postId, PDO::PARAM_INT);
            $stmt->bindValue(':content', $content, PDO::PARAM_STR);
            $stmt->execute();
            
            // obtener resultado
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt->closeCursor();
            
            return [
                'exito' => (bool)($result['exito'] ?? false),
                'mensaje' => $result['mensaje'] ?? 'Error desconocido',
                'id' => $result['id'] ?? null
            ];
            
        } catch (Exception $e) {
            error_log("Error en insertComment: " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error al crear el comentario: ' . $e->getMessage(),
                'id' => null
            ];
        }
    }

    /**
     * Eliminar un comentario
     * @param int $commentId - ID del comentario a eliminar
     * @param int $userId - ID del usuario que intenta eliminar
     * @return array - resultado con exito, mensaje
     */
    public function deleteComment(int $commentId, int $userId): array
    {
        try {
            // preparar stored procedure
            $sql = "CALL sp_comment_save_delete('delete', :commentId, :userId, NULL, NULL)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':commentId', $commentId, PDO::PARAM_INT);
            $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            // obtener resultado
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt->closeCursor();
            
            return [
                'exito' => (bool)($result['exito'] ?? false),
                'mensaje' => $result['mensaje'] ?? 'Error desconocido',
                'id' => $result['id'] ?? null
            ];
            
        } catch (Exception $e) {
            error_log("Error en deleteComment: " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error al eliminar el comentario: ' . $e->getMessage(),
                'id' => null
            ];
        }
    }

    /**
     * Eliminar un comentario como administrador (sin validar ownership)
     * @param int $commentId - ID del comentario a eliminar
     * @return array - resultado con exito, mensaje
     */
    public function deleteCommentByAdmin(int $commentId): array
    {
        try {
            // usar stored procedure con user_id = 0 para admin
            $sql = "CALL sp_comment_save_delete('delete', :commentId, 0, NULL, NULL)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':commentId', $commentId, PDO::PARAM_INT);
            $stmt->execute();
            
            // obtener resultado
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt->closeCursor();
            
            return [
                'exito' => (bool)($result['exito'] ?? false),
                'mensaje' => $result['mensaje'] ?? 'Error desconocido',
                'id' => $result['id'] ?? null
            ];
            
        } catch (Exception $e) {
            error_log("Error en deleteCommentByAdmin: " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error al eliminar el comentario: ' . $e->getMessage(),
                'id' => null
            ];
        }
    }
}
