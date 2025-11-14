<?php
namespace App\Controllers;
use App\Models\UserModel;
use Exception;

class UserController
{
    private UserModel $model;

    public function __construct(UserModel $model)
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
        $user = $this->model->getOne($id);

        if (!$user) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["message" => "User not found"]);
            return;
        }

        switch ($method) {
            case "GET":
                header('Content-Type: application/json');
                echo json_encode($user);
                break;

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
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        
        error_log("Collection request - Method: $method, URI: $uri");
        
        //POST /login
        if ($method === "POST" && (strpos($uri, '/login') !== false || strpos($uri, 'login') !== false)) {
            error_log("Entering login block");
            header('Content-Type: application/json');

            $data = (array) json_decode(file_get_contents("php://input"), true); //datos JSON
            
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';
            if (!$username || !$password) {
                http_response_code(400);
                echo json_encode(['exito' => false, 'mensaje' => 'Username and password required']);
                return;
            }

            $result = $this->model->login($username, $password); //model
            if ($result['exito']) {
                if (session_status() === PHP_SESSION_NONE) { session_start(); }

                //asignar rol
                if (($result['role'] ?? '') === 'admin') { 
                    $_SESSION['admin'] = [ //asigna ADMIN
                        'username' => $result['username'] ?? $username
                    ];
                } else {
                    $_SESSION['user'] = [ //asigna USER
                        'id' => $result['id'] ?? 0,
                        'username' => $result['username'] ?? '',
                        'email' => $result['email'] ?? '',
                        'full_name' => $result['full_name'] ?? '',
                        'birth_date' => $result['birth_date'] ?? '',
                        'image' => $result['image'] ?? '',
                        'background_image' => $result['background_image'] ?? '',
                        'gender' => $result['gender'] ?? '',
                        'birth_place' => $result['birth_place'] ?? '',
                        'nationality' => $result['nationality'] ?? ''
                    ];
                }
                http_response_code(200);
            } else {
                http_response_code(401);
            }
            echo json_encode($result);
            return;
        }

        // Default: registro y getAll
        switch ($method) {
            // GET /users
            case "GET":
                header('Content-Type: application/json');
                echo json_encode($this->model->getAll());
                break;
            // POST /users
            case "POST":
                header('Content-Type: application/json');
                
                try {
                    $data = $this->processRequestData(); //procesa datos json y si hay archivos
                    
                    // ID = 0 OR NULL -> INSERT; ID > 0 -> EDIT
                    $isEdit = !empty($data['id']);
                    $userId = $isEdit ? $data['id'] : null;
                    
                    error_log("POST request - isEdit: " . ($isEdit ? 'true' : 'false') . ", userId: " . ($userId ?? 'null'));
                    
                    $result = $this->model->insert($data, $userId);
                    
                    if (isset($result['exito']) && $result['exito']) {
                        http_response_code($isEdit ? 200 : 201);
                    } else {
                        http_response_code(400);
                    }
                    
                    echo json_encode($result);
                } catch (Exception $e) {
                    http_response_code(500);
                    echo json_encode([
                        'exito' => false,
                        'mensaje' => 'Error interno: ' . $e->getMessage(),
                        'debug' => $e->getTraceAsString()
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
        $data = [];
        
        // Revisar si es multipart/form-data request (si se subio un archivo)
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        error_log("Content-Type received: '$contentType'");
        error_log("POST data available: " . json_encode($_POST));
        error_log("FILES data available: " . json_encode($_FILES));
        
        if (strpos($contentType, 'multipart/form-data') !== false) { //si hay archivos
            $data = $_POST; //datos del form
            
            // Debug logging
            error_log("Multipart request detected");
            error_log("POST data: " . json_encode($_POST));
            error_log("FILES available: " . json_encode(array_keys($_FILES)));
            error_log("Data after POST assignment: " . json_encode($data));
            
            // Procesar archivos si existen
            $maxSize = 15 * 1024 * 1024; // 15MB
            
            //  FOTO DE PERFIL////
            if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                // Validar tamaño de archivo
                if ($_FILES['photo']['size'] > $maxSize) {
                    throw new Exception("La imagen de perfil es muy pesada.");
                }
                
                // Validar tipo de archivo
                $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $_FILES['photo']['tmp_name']);
                finfo_close($finfo);
                
                if (!in_array($mimeType, $allowedTypes)) {
                    throw new Exception("Formato de imagen no válido. Use JPG, PNG o GIF.");
                }
                
                $imageContent = file_get_contents($_FILES['photo']['tmp_name']); //Guardar imagen
                $data['image'] = $imageContent;
                error_log("Processed photo file, size: " . strlen($imageContent) . " bytes");
            }
            
            // FOTO DE FONDO////
            if (isset($_FILES['backgroundPhoto']) && $_FILES['backgroundPhoto']['error'] === UPLOAD_ERR_OK) {
                // Validar tamaño de archivo
                if ($_FILES['backgroundPhoto']['size'] > $maxSize) {
                    throw new Exception("La imagen de fondo es muy pesada.");
                }
                
                // Validar tipo de archivo
                $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $_FILES['backgroundPhoto']['tmp_name']);
                finfo_close($finfo);
                
                if (!in_array($mimeType, $allowedTypes)) {
                    throw new Exception("Formato de imagen no válido. Use JPG, PNG o GIF.");
                }
                
                $bgContent = file_get_contents($_FILES['backgroundPhoto']['tmp_name']);
                $data['background_image'] = $bgContent;
                error_log("Processed background photo file, size: " . strlen($bgContent) . " bytes");
            }
            
        } elseif (strpos($contentType, 'application/json') !== false) {
            $json = file_get_contents("php://input");
            error_log("Raw JSON received: " . $json);
            $data = (array) json_decode($json, true);
            error_log("Parsed JSON data: " . json_encode($data));
            
        } else {
            //URL-encoded form data
            parse_str(file_get_contents("php://input"), $data);
        }
        
        error_log("ProcessRequestData - Final data: " . json_encode($data));
        
        return $data;
    }

    /**
     * Obtener información del usuario actual desde la sesión
     * GET /users/current
     */
    public function getCurrentUser(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        header('Content-Type: application/json');

        // verificar si hay usuario en sesión
        if (isset($_SESSION['user']) && isset($_SESSION['user']['id'])) {
            http_response_code(200);
            echo json_encode([
                'authenticated' => true,
                'user_id' => $_SESSION['user']['id'],
                'username' => $_SESSION['user']['username'] ?? '',
                'email' => $_SESSION['user']['email'] ?? '',
                'full_name' => $_SESSION['user']['full_name'] ?? ''
            ]);
        } else {
            http_response_code(200);
            echo json_encode([
                'authenticated' => false
            ]);
        }
    }


}
