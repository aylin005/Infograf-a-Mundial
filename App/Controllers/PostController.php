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

    public function __construct(PostModel $model, Database $database)
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
        // convertir id a entero
        $postId = (int)$id;
        
        if ($postId <= 0) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Invalid post ID"]);
            return;
        }

        switch ($method) {
            // GET /posts/:id
            case "GET":
                $post = $this->model->getOne($postId);

                if (!$post) {
                    http_response_code(404);
                    header('Content-Type: application/json');
                    echo json_encode(["message" => "Post not found"]);
                    return;
                }

                header('Content-Type: application/json');
                echo json_encode($post);
                break;

            // DELETE /posts/:id
            case "DELETE":
                // header('Content-Type: application/json');
                // $result = $this->model->delete($postId);

                // if (isset($result['exito']) && $result['exito']) {
                //     http_response_code(200);
                // } else {
                //     http_response_code(400);
                // }

                // echo json_encode($result);
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
                //echo json_encode($this->model->getAll());
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

                    // obtener user_id desde sesión
                    if (session_status() === PHP_SESSION_NONE) {
                        session_start();
                    }
                    
                    // verificar que el usuario esté autenticado
                    if (!isset($_SESSION['user']['id'])) {
                        http_response_code(401);
                        echo json_encode([
                            'exito' => false,
                            'mensaje' => 'Usuario no autenticado'
                        ]);
                        return;
                    }
                    
                    $userId = (int)$_SESSION['user']['id'];
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
        // manejar GET y POST
        if ($method === 'GET') {
            $this->handleGetPendingPosts();
        } elseif ($method === 'POST') {
            $this->handleApprovePost();
        } else {
            http_response_code(405);
            header("Allow: GET, POST");
            echo json_encode(['error' => 'metodo no permitido']);
        }
    }

    // GET - obtener posts pendientes
    private function handleGetPendingPosts(): void
    {
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
            error_log("Error in PostController handleGetPendingPosts(): " . $e->getMessage());
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

    // POST - aprobar o rechazar post
    private function handleApprovePost(): void
    {
        try {
            // leer body del request
            $input = json_decode(file_get_contents('php://input'), true);
            
            // validar datos requeridos
            if (!isset($input['id']) || !isset($input['approve'])) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'Faltan parametros requeridos: id y approve'
                ]);
                return;
            }
            
            $postId = (int)$input['id'];
            $approve = (bool)$input['approve'];
            
            // validar que el ID sea valido
            if ($postId <= 0) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'ID de post invalido'
                ]);
                return;
            }
            
            // llamar al modelo para aprobar/rechazar
            $result = $this->model->approvePost($postId, $approve);
            
            // establecer codigo de respuesta segun resultado
            if ($result['exito']) {
                http_response_code(200);
            } else {
                http_response_code(500);
            }
            
            // enviar respuesta
            header('Content-Type: application/json');
            echo json_encode($result);
            
        } catch (Exception $e) {
            error_log("Error in PostController handleApprovePost(): " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'exito' => false,
                'mensaje' => 'Error interno del servidor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * GET /posts/search - buscar posts con filtros avanzados
     * Query params:
     * - term: término de búsqueda en título o contenido
     * - category_ids_csv: IDs de categorías separados por coma (ej: "1,3,4")
     * - host_country: país sede del mundial
     * - national_team: selección nacional mencionada en el post
     * - worldcup_id: ID del mundial específico
     * - date_from: fecha desde (formato: YYYY-MM-DD)
     * - date_to: fecha hasta (formato: YYYY-MM-DD)
     * - sort_by: ordenamiento (newest, oldest, popular, most_liked, most_comments)
     * - page: número de página (default: 1)
     * - page_size: tamaño de página (default: 10, max: 100)
     */
    public function searchPosts(string $method): void
    {
        if ($method !== 'GET') {
            http_response_code(405);
            header("Allow: GET");
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Método no permitido']);
            return;
        }

        try {
            // construir array de filtros desde query params
            $filters = [
                'term' => $_GET['term'] ?? $_GET['search'] ?? null,
                'category_ids_csv' => $_GET['category_ids_csv'] ?? $_GET['categories'] ?? null,
                'host_country' => $_GET['host_country'] ?? null,
                'national_team' => $_GET['national_team'] ?? null,
                'worldcup_id' => $_GET['worldcup_id'] ?? null,
                'date_from' => $_GET['date_from'] ?? null,
                'date_to' => $_GET['date_to'] ?? null,
                'sort_by' => $_GET['sort_by'] ?? 'newest',
                'page' => (int)($_GET['page'] ?? 1),
                'page_size' => (int)($_GET['page_size'] ?? 10)
            ];
            
            // validar parámetros de paginación
            if ($filters['page'] < 1) {
                $filters['page'] = 1;
            }
            if ($filters['page_size'] < 1 || $filters['page_size'] > 100) {
                $filters['page_size'] = 10;
            }
            
            // validar opciones de ordenamiento
            $validSortOptions = ['newest', 'oldest', 'popular', 'most_liked', 'most_comments', 'likes_desc', 'comments_desc'];
            if (!in_array($filters['sort_by'], $validSortOptions)) {
                $filters['sort_by'] = 'newest';
            }
            
            // mapear sort_by a formato del SP si es necesario
            if ($filters['sort_by'] === 'most_liked') {
                $filters['sort_by'] = 'likes_desc';
            } elseif ($filters['sort_by'] === 'most_comments') {
                $filters['sort_by'] = 'comments_desc';
            } elseif ($filters['sort_by'] === 'popular') {
                $filters['sort_by'] = 'likes_desc';
            }
            
            // validar formato de fechas si están presentes
            if ($filters['date_from'] && !$this->isValidDate($filters['date_from'])) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Formato de date_from inválido. Use YYYY-MM-DD'
                ]);
                return;
            }
            
            if ($filters['date_to'] && !$this->isValidDate($filters['date_to'])) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Formato de date_to inválido. Use YYYY-MM-DD'
                ]);
                return;
            }
            
            // llamar al modelo para realizar la búsqueda
            $result = $this->model->searchPosts($filters);
            
            // enviar respuesta exitosa
            header('Content-Type: application/json');
            echo json_encode($result);
            
        } catch (Exception $e) {
            error_log("Error in PostController searchPosts(): " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Error interno del servidor',
                'posts' => [],
                'total_records' => 0,
                'current_page' => 1,
                'has_more' => false,
                'total_pages' => 0
            ]);
        }
    }

    /**
     * Validar formato de fecha YYYY-MM-DD
     * @param string $date - fecha a validar
     * @return bool - true si es válida, false si no
     */
    private function isValidDate(string $date): bool
    {
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }

    /**
     * Obtener comentarios de un post
     * GET /posts/comments?post_id=X
     */
    public function getComments(): void
    {
        // verificar que se proporcione post_id
        if (!isset($_GET['post_id'])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Falta el parámetro post_id"]);
            return;
        }

        $postId = (int)$_GET['post_id'];

        if ($postId <= 0) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["message" => "ID de post inválido"]);
            return;
        }

        try {
            $comments = $this->model->getComments($postId);
            
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'comments' => $comments,
                'total' => count($comments)
            ]);

        } catch (Exception $e) {
            error_log("Error en PostController::getComments(): " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Error interno del servidor"]);
        }
    }

    /**
     * Votar en un post
     * POST /posts/vote
     * Body: { "post_id": int, "vote_type": "upvote"|"downvote" }
     */
    public function votePost(): void
    {
        // iniciar sesión si no está iniciada
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // verificar autenticación
        if (!isset($_SESSION['user']['id'])) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Usuario no autenticado"]);
            return;
        }

        $userId = (int)$_SESSION['user']['id'];

        // obtener datos del body
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['post_id']) || !isset($data['vote_type'])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Faltan datos requeridos: post_id y vote_type"]);
            return;
        }

        $postId = (int)$data['post_id'];
        $voteType = $data['vote_type'];

        // validar vote_type
        if (!in_array($voteType, ['upvote', 'downvote'])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["message" => "vote_type debe ser 'upvote' o 'downvote'"]);
            return;
        }

        try {
            $result = $this->model->votePost($userId, $postId, $voteType);

            if ($result['exito']) {
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => true,
                    "message" => $result['mensaje']
                ]);
            } else {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "message" => $result['mensaje']
                ]);
            }

        } catch (Exception $e) {
            error_log("Error en PostController::votePost(): " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Error interno del servidor"]);
        }
    }

    /**
     * Obtener el voto actual del usuario para un post
     */
    public function getUserVote(string $postId): void
    {
        // iniciar sesión si no está iniciada
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // verificar autenticación
        if (!isset($_SESSION['user']['id'])) {
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(["vote" => null]);
            return;
        }

        $userId = (int)$_SESSION['user']['id'];
        $postId = (int)$postId;

        try {
            $vote = $this->model->getUserVote($userId, $postId);
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(["vote" => $vote]);
        } catch (Exception $e) {
            error_log("Error en PostController::getUserVote(): " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(["vote" => null]);
        }
    }

    /**
     * Obtener posts de un usuario específico
     */
    public function getPostsByUser(string $method): void
    {
        if ($method !== 'GET') {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Método no permitido"]);
            return;
        }

        // obtener user_id del query param
        $userId = $_GET['user_id'] ?? null;

        if (!$userId) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Falta el parámetro user_id"]);
            return;
        }

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $pageSize = isset($_GET['page_size']) ? (int)$_GET['page_size'] : 10;

        try {
            $result = $this->model->getPostsByUser((int)$userId, $page, $pageSize);
            
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode($result);
        } catch (Exception $e) {
            error_log("Error en PostController::getPostsByUser(): " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'posts' => [],
                'total_records' => 0,
                'message' => 'Error al obtener posts del usuario'
            ]);
        }
    }

    /**
     * Obtener usuarios que votaron en un post
     */
    public function getVoteUsers(string $postId): void
    {
        try {
            $users = $this->model->getVoteUsers((int)$postId);
            
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode($users);
        } catch (Exception $e) {
            error_log("Error en PostController::getVoteUsers(): " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'upvotes' => [],
                'downvotes' => [],
                'message' => 'Error al obtener usuarios'
            ]);
        }
    }
}
