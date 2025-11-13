<?php
namespace App\Controllers;
use App\Models\WorldCupModel;
use Exception;

class WorldCupController
{
    private WorldCupModel $model;

    public function __construct(WorldCupModel $model)
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
        $worldCup = $this->model->getOne($id);

        if (!$worldCup) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["message" => "World Cup not found"]);
            return;
        }

        switch ($method) {
            //GET /worldcups/:id
            case "GET":
                header('Content-Type: application/json');
                echo json_encode($worldCup);
                break;

            //DELETE /worldcups/:id
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
        
        error_log("WorldCup collection request - Method: $method, URI: $uri");
        
        // GET /worldcups/years
        if ($method === "GET" && strpos($uri, '/worldcups/years') !== false) {
            header('Content-Type: application/json');
            echo json_encode($this->model->getYears());
            return;
        }

        switch ($method) {
            // GET /worldcups
            case "GET":
                header('Content-Type: application/json');
                echo json_encode($this->model->getAll());
                break;
                
            // POST /worldcups
            case "POST":
                header('Content-Type: application/json');
                
                try {
                    $data = $this->processRequestData();
                    
                    // validar campos requeridos
                    $requiredFields = ['name', 'year', 'champion', 'subchampion', 'score', 'admin_id'];
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
                    
                    // id = 0 -> INSERT; id > 0 -> UPDATE
                    $isEdit = !empty($data['id']) && $data['id'] > 0;
                    $worldCupId = $isEdit ? $data['id'] : 0;
                    
                    error_log("WorldCup POST request - isEdit: " . ($isEdit ? 'true' : 'false') . ", worldCupId: " . $worldCupId);
                    
                    $result = $this->model->insert($data, $worldCupId);
                    
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
        
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        error_log("WorldCup request - Content-Type: '$contentType'");
        error_log("WorldCup request - POST data: " . json_encode($_POST));
        error_log("WorldCup request - FILES data: " . json_encode(array_keys($_FILES)));
        
        if (strpos($contentType, 'multipart/form-data') !== false) {
            // datos del formulario con archivos
            $data = $_POST;
            
            // procesar archivos de imagen
            $maxSize = 15 * 1024 * 1024; // 15MB
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
            
            // imagen principal
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                if ($_FILES['image']['size'] > $maxSize) {
                    throw new Exception("La imagen principal es muy pesada.");
                }
                
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $_FILES['image']['tmp_name']);
                finfo_close($finfo);
                
                if (!in_array($mimeType, $allowedTypes)) {
                    throw new Exception("Formato de imagen no valido. Use JPG, PNG o GIF.");
                }
                
                $imageContent = file_get_contents($_FILES['image']['tmp_name']);
                $data['image'] = $imageContent;
                error_log("Processed main image file, size: " . strlen($imageContent) . " bytes");
            }
            
            // logo
            if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
                if ($_FILES['logo']['size'] > $maxSize) {
                    throw new Exception("El logo es muy pesado.");
                }
                
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $_FILES['logo']['tmp_name']);
                finfo_close($finfo);
                
                if (!in_array($mimeType, $allowedTypes)) {
                    throw new Exception("Formato de logo no valido. Use JPG, PNG o GIF.");
                }
                
                $logoContent = file_get_contents($_FILES['logo']['tmp_name']);
                $data['logo'] = $logoContent;
                error_log("Processed logo file, size: " . strlen($logoContent) . " bytes");
            }
            
            // procesar attachments 
            if (isset($_FILES['attachments'])) {
                $attachments = [];
                $attachmentFiles = $_FILES['attachments'];
                
                // manejar multiples archivos
                if (is_array($attachmentFiles['name'])) {
                    for ($i = 0; $i < count($attachmentFiles['name']); $i++) {
                        if ($attachmentFiles['error'][$i] === UPLOAD_ERR_OK) {
                            if ($attachmentFiles['size'][$i] > $maxSize) {
                                continue; // saltar archivos muy pesados
                            }
                            
                            $finfo = finfo_open(FILEINFO_MIME_TYPE);
                            $mimeType = finfo_file($finfo, $attachmentFiles['tmp_name'][$i]);
                            finfo_close($finfo);
                            
                            if (in_array($mimeType, $allowedTypes)) {
                                $attachmentContent = file_get_contents($attachmentFiles['tmp_name'][$i]);
                                $attachments[] = [
                                    'image' => $attachmentContent,
                                    'description' => $_POST['attachment_descriptions'][$i] ?? 'Attachment ' . ($i + 1)
                                ];
                            }
                        }
                    }
                }
                
                if (!empty($attachments)) {
                    $data['attachments'] = $attachments;
                }
            }
            
            // procesar host_countries si vienen como JSON string
            if (isset($data['host_countries_json']) && is_string($data['host_countries_json'])) {
                $data['host_countries'] = json_decode($data['host_countries_json'], true);
                error_log("WorldCup Controller - host_countries parsed: " . json_encode($data['host_countries']));
            } elseif (isset($data['host_countries']) && is_string($data['host_countries'])) {
                $data['host_countries'] = json_decode($data['host_countries'], true);
            }
            
            // procesar attachments individuales (attachment_0, attachment_1, etc.)
            $attachments = [];
            $attachmentCount = intval($data['attachments_count'] ?? 0);
            
            for ($i = 0; $i < $attachmentCount; $i++) {
                $attachmentKey = "attachment_$i";
                $descriptionKey = "attachment_{$i}_description";
                
                if (isset($_FILES[$attachmentKey]) && $_FILES[$attachmentKey]['error'] === UPLOAD_ERR_OK) {
                    $attachmentFile = $_FILES[$attachmentKey];
                    
                    // validar tamaño
                    if ($attachmentFile['size'] > $maxSize) {
                        error_log("Attachment $i too large: " . $attachmentFile['size'] . " bytes");
                        continue;
                    }
                    
                    // validar tipo
                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
                    $mimeType = finfo_file($finfo, $attachmentFile['tmp_name']);
                    finfo_close($finfo);
                    
                    if (in_array($mimeType, $allowedTypes)) {
                        $attachmentContent = file_get_contents($attachmentFile['tmp_name']);
                        $attachments[] = [
                            'image' => $attachmentContent,
                            'description' => $data[$descriptionKey] ?? "Attachment " . ($i + 1)
                        ];
                        error_log("Processed attachment $i, size: " . strlen($attachmentContent) . " bytes");
                    }
                }
            }
            
            if (!empty($attachments)) {
                $data['attachments'] = $attachments;
                error_log("WorldCup Controller - attachments processed: " . count($attachments) . " items");
            }
            
        } elseif (strpos($contentType, 'application/json') !== false) {
            // datos JSON
            $json = file_get_contents("php://input");
            error_log("WorldCup request - Raw JSON: " . $json);
            $data = (array) json_decode($json, true);
            error_log("WorldCup request - Parsed data: " . json_encode($data));
        } else {
            // form data url-encoded
            $data = $_POST;
            error_log("WorldCup request - Form data: " . json_encode($data));
        }
        
        error_log("WorldCup ProcessRequestData - Final data keys: " . json_encode(array_keys($data)));
        
        return $data;
    }
}