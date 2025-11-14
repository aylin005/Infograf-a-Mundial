<?php
namespace App\Controllers;
use App\Models\CommentModel;
use App\Core\Database;
use Exception;

class CommentController
{
    private CommentModel $model;

    public function __construct(CommentModel $model = null)
    {
        if ($model === null) {
            $config = require_once __DIR__ . '/../config/config.php';
            $database = new Database($config['db']['connection1']);
            $this->model = new CommentModel($database);
        } else {
            $this->model = $model;
        }
    }

    public function processRequest(string $method, ?string $id = null): void
    {
        if ($id !== null) {
            $this->processResourceRequest($method, $id);
        } else {
            $this->processCollectionRequest($method);
        }
    }

    private function processResourceRequest(string $method, string $id): void
    {
        $commentId = (int)$id;
        
        if ($commentId <= 0) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Invalid comment ID"]);
            return;
        }

        switch ($method) {
            // DELETE /comments/:id
            case "DELETE":
                $this->destroy($commentId);
                break;
                
            default:
                http_response_code(405);
                header('Allow: DELETE');
                break;
        }
    }

    private function processCollectionRequest(string $method): void
    {
        switch ($method) {
            // POST /comments
            case "POST":
                $this->store();
                break;
                
            default:
                http_response_code(405);
                header('Allow: POST');
                break;
        }
    }

    /**
     * Crear un nuevo comentario
     * POST /comments
     * Body: { "post_id": int, "content": string }
     */
    private function store(): void
    {
        // iniciar sesión si no está iniciada
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // verificar autenticacion
        if (!isset($_SESSION['user']['id'])) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Usuario no autenticado"]);
            return;
        }

        $userId = (int)$_SESSION['user']['id'];
        
        // obtener datos del body
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['post_id']) || !isset($data['content'])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Faltan datos requeridos: post_id y content"]);
            return;
        }

        $postId = (int)$data['post_id'];
        $content = trim($data['content']);

        // validar contenido
        if (empty($content)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["message" => "El contenido del comentario no puede estar vacío"]);
            return;
        }

        if (strlen($content) > 1000) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["message" => "El comentario es demasiado largo (máximo 1000 caracteres)"]);
            return;
        }

        try {
            $result = $this->model->insertComment($userId, $postId, $content);

            if ($result['exito']) {
                http_response_code(201);
                header('Content-Type: application/json');
                echo json_encode([
                    "message" => $result['mensaje'],
                    "comment_id" => $result['id']
                ]);
            } else {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(["message" => $result['mensaje']]);
            }

        } catch (Exception $e) {
            error_log("Error en CommentController::store(): " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Error interno del servidor"]);
        }
    }

    /**
     * Eliminar un comentario
     * DELETE /comments/:id
     */
    private function destroy(int $commentId): void
    {
        // iniciar sesión si no está iniciada
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // verificar autenticacion (usuario o admin)
        $isAdmin = isset($_SESSION['admin']);
        $isUser = isset($_SESSION['user']['id']);
        
        if (!$isAdmin && !$isUser) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Usuario no autenticado"]);
            return;
        }

        // si es admin, puede eliminar cualquier comentario
        // si es usuario normal, solo puede eliminar sus propios comentarios
        $userId = $isUser ? (int)$_SESSION['user']['id'] : 0;

        try {
            // si es admin, forzamos la eliminación sin validar ownership
            if ($isAdmin) {
                $result = $this->model->deleteCommentByAdmin($commentId);
            } else {
                $result = $this->model->deleteComment($commentId, $userId);
            }

            if ($result['exito']) {
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode(["message" => $result['mensaje']]);
            } else {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(["message" => $result['mensaje']]);
            }

        } catch (Exception $e) {
            error_log("Error en CommentController::destroy(): " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Error interno del servidor"]);
        }
    }
}
