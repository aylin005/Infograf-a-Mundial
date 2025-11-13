<?php
namespace App\Controllers;
use App\Models\PostModel;
use Exception;

class PostController
{
    private PostModel $model;

    public function __construct(PostModel $model)
    {
        $this->model = $model;
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
        $post = $this->model->getOne($id);

        if (!$post) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Post not found"]);
            return;
        }

        switch ($method) {
            // GET /posts/:id
            case "GET":
                header('Content-Type: application/json');
                echo json_encode($post);
                break;

            // DELETE /posts/:id
            case "DELETE":
                header('Content-Type: application/json');
                $result = $this->model->delete($id);

                if (isset($result['exito']) && $result['exito']) {
                    http_response_code(200);
                } else {
                    http_response_code(400);
                }

                echo json_encode($result);
                break;

            default:
                http_response_code(405);
                header("Allow: GET, DELETE");
                break;
        }
    }

    private function processCollectionRequest(string $method): void
    {
        switch ($method) {
            // GET /posts
            case "GET":
                header('Content-Type: application/json');
                echo json_encode($this->model->getAll());
                break;
                
            // POST /posts
            case "POST":
                header('Content-Type: application/json');
                
                try {
                    $data = $this->processRequestData();
                    
                    // log de datos recibidos para debug
                    error_log("PostController POST - Datos recibidos: " . json_encode($data));
                    
                    // procesar categorías si vienen del frontend
                    if (isset($data['category_ids']) && is_string($data['category_ids'])) {
                        // los IDs ya vienen como CSV desde el frontend
                        error_log("PostController POST - Category IDs recibidos: " . $data['category_ids']);
                    } else {
                        error_log("PostController POST - No se recibieron category_ids o no es string");
                    }
                    
                    // procesar selecciones si vienen del frontend
                    if (isset($data['selections']) && is_string($data['selections'])) {
                        // ya vienen como CSV desde el frontend
                        error_log("PostController POST - Selections recibidas: " . $data['selections']);
                    } else {
                        error_log("PostController POST - No se recibieron selections o no es string");
                    }
                    
                    // validar campos requeridos
                    $requiredFields = ['title', 'content', 'worldcup_id'];
                    foreach ($requiredFields as $field) {
                        if (empty($data[$field])) {
                            http_response_code(400);
                            echo json_encode([
                                'exito' => false,
                                'mensaje' => "Campo requerido faltante: $field"
                            ]);
                            return;
                        }
                    }

                    // obtener user_id desde sesion (por ahora usar 1 como default para testing)
                    session_start();
                    $userId = $_SESSION['user_id'] ?? 1; // fallback para testing
                    $data['user_id'] = $userId;
                    
                    error_log("PostController POST - user_id asignado: $userId");

                    $result = $this->model->insert($data);

                    if (isset($result['exito']) && $result['exito']) {
                        http_response_code(201);
                    } else {
                        http_response_code(400);
                    }

                    echo json_encode($result);

                } catch (Exception $e) {
                    error_log("Error in PostController POST: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode([
                        'exito' => false,
                        'mensaje' => 'Error interno del servidor'
                    ]);
                }
                break;

            default:
                http_response_code(405);
                header("Allow: GET, POST");
                break;
        }
    }

    private function processRequestData(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (strpos($contentType, 'application/json') !== false) {
            // manejar JSON
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON data');
            }
            
            return $data ?? [];
        } else {
            // manejar form data (multipart/form-data o application/x-www-form-urlencoded)
            $data = [];
            
            // obtener datos de POST
            foreach ($_POST as $key => $value) {
                $data[$key] = $value;
            }
            
            // procesar archivos si los hay (para futuras implementaciones)
            if (!empty($_FILES)) {
                error_log("PostController - Files received: " . json_encode(array_keys($_FILES)));
                // aqui se procesarian archivos en el futuro
            }
            
            return $data;
        }
    }
}