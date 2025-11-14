<?php
namespace App\Controllers;
use App\Models\PostModel;
use App\Models\MultimediaModel;
use App\Core\MediaHandler;
use App\Core\Database;
use Exception;

class PostController
{
    private PostModel $model;
    private MultimediaModel $multimediaModel;

    public function __construct(PostModel $model, Database $database = null)
    {
        $this->model = $model;
        
        // Si no se proporciona database, crear una nueva instancia
        if ($database === null) {
            $config = require_once __DIR__ . '/../config/config.php';
            $database = new Database($config['db']['connection1']);
        }
        
        $this->multimediaModel = new MultimediaModel($database);
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
                        // Post creado exitosamente, procesar archivos multimedia
                        $postId = $result['id'];
                        $multimediaResults = $this->processMultimediaFiles($postId, $userId);
                        
                        // Agregar información de multimedia al resultado
                        $result['multimedia'] = $multimediaResults;
                        
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
            }
            
            return $data;
        }
    }

    /**
     * Procesar archivos multimedia para un post
     * @param int $postId - ID del post creado
     * @param int $userId - ID del usuario
     * @return array - Resultados del procesamiento
     */
    private function processMultimediaFiles(int $postId, int $userId): array
    {
        $results = [
            'processed' => 0,
            'errors' => 0,
            'files' => []
        ];

        error_log("PostController - All FILES: " . json_encode(array_keys($_FILES)));
        error_log("PostController - FILES content: " . json_encode($_FILES));
        
        // Buscar archivos multimedia en diferentes posibles claves
        $files = null;
        if (!empty($_FILES['mediaFiles'])) {
            $files = $_FILES['mediaFiles'];
            error_log("PostController - Found files under 'mediaFiles' key");
        } elseif (!empty($_FILES)) {
            // Buscar la primera clave que contenga archivos
            foreach ($_FILES as $key => $fileData) {
                if (!empty($fileData['name'])) {
                    $files = $fileData;
                    error_log("PostController - Found files under '$key' key");
                    break;
                }
            }
        }
        
        if (empty($files)) {
            error_log("PostController - No multimedia files found in any key");
            return $results;
        }
        
        // Normalizar array de archivos (PHP puede enviarlos en diferentes formatos)
        $normalizedFiles = $this->normalizeFilesArray($files);

        error_log("PostController - Processing " . count($normalizedFiles) . " multimedia files");

        foreach ($normalizedFiles as $position => $file) {
            try {
                error_log("PostController - Processing file: " . $file['name'] . " (size: " . $file['size'] . ")");
                
                // Procesar archivo usando MediaHandler
                $processedData = MediaHandler::processMediaFile($file, $userId, $position);
                error_log("PostController - MediaHandler result: " . json_encode([
                    'type' => $processedData['type'],
                    'path' => $processedData['path'] ?? 'N/A',
                    'has_image' => !empty($processedData['image']),
                    'position' => $processedData['position']
                ]));
                
                // Añadir post_id
                $processedData['post_id'] = $postId;
                
                // Insertar en base de datos
                error_log("PostController - Calling MultimediaModel insert with post_id: $postId");
                $insertResult = $this->multimediaModel->insert($processedData);
                error_log("PostController - MultimediaModel result: " . json_encode($insertResult));
                
                if ($insertResult['exito']) {
                    $results['processed']++;
                    $results['files'][] = [
                        'position' => $position,
                        'type' => $processedData['type'],
                        'status' => 'success',
                        'id' => $insertResult['id'],
                        'message' => 'Archivo procesado exitosamente'
                    ];
                    error_log("PostController - Multimedia file processed: {$file['name']} (ID: {$insertResult['id']})");
                } else {
                    $results['errors']++;
                    $results['files'][] = [
                        'position' => $position,
                        'status' => 'error',
                        'message' => $insertResult['mensaje']
                    ];
                    error_log("PostController - Error processing multimedia: {$insertResult['mensaje']}");
                }
                
            } catch (Exception $e) {
                $results['errors']++;
                $results['files'][] = [
                    'position' => $position,
                    'status' => 'error',
                    'message' => $e->getMessage()
                ];
                error_log("PostController - Exception processing multimedia file: " . $e->getMessage());
            }
        }

        error_log("PostController - Multimedia processing complete: {$results['processed']} processed, {$results['errors']} errors");
        
        return $results;
    }

    /**
     * Normalizar array de archivos de PHP
     * @param array $files - Array de archivos desde $_FILES
     * @return array - Array normalizado
     */
    private function normalizeFilesArray(array $files): array
    {
        $normalized = [];
        
        if (isset($files['name'])) {
            if (is_array($files['name'])) {
                // Múltiples archivos
                for ($i = 0; $i < count($files['name']); $i++) {
                    if ($files['error'][$i] === UPLOAD_ERR_OK) {
                        $normalized[] = [
                            'name' => $files['name'][$i],
                            'type' => $files['type'][$i],
                            'tmp_name' => $files['tmp_name'][$i],
                            'error' => $files['error'][$i],
                            'size' => $files['size'][$i]
                        ];
                    }
                }
            } else {
                // Un solo archivo
                if ($files['error'] === UPLOAD_ERR_OK) {
                    $normalized[] = $files;
                }
            }
        }
        
        return $normalized;
    }

    // GET /pendingPosts / se llama desde routes.php
    public function getPendingPosts(string $method): void
    {
        if ($method !== 'GET') {
            http_response_code(405);
            header("Allow: GET");
            echo json_encode(['error' => 'metodo no permitido']);
            return;
        }

        try {
            // obtener parametros de paginacion
            $page = (int)($_GET['page'] ?? 1);
            $pageSize = (int)($_GET['page_size'] ?? 10);
            
            // validar parametros
            if ($page < 1) $page = 1;
            if ($pageSize < 1 || $pageSize > 100) $pageSize = 10;
            
            // obtener posts pendientes del modelo
            $result = $this->model->getPending($page, $pageSize);
            
            // enviar respuesta
            header('Content-Type: application/json');
            echo json_encode($result);
            
        } catch (Exception $e) {
            error_log("Error in PostController getPendingPosts(): " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'error interno del servidor',
                'posts' => [],
                'total_records' => 0,
                'current_page' => 1,
                'has_more' => false
            ]);
        }
    }
}