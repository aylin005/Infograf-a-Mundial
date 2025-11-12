<?php
namespace App\Controllers;
use App\Models\CategoryModel;
use Exception;

class CategoryController
{
    private CategoryModel $model;

    public function __construct(CategoryModel $model)
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
        $category = $this->model->getOne($id);

        if (!$category) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["message" => "Category not found"]);
            return;
        }

        switch ($method) {
            case "GET":
                header('Content-Type: application/json');
                echo json_encode($category);
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
        switch ($method) {
            // GET /categories
            case "GET":
                header('Content-Type: application/json');
                echo json_encode($this->model->getAll());
                break;
                
            // POST /categories
            case "POST":
                header('Content-Type: application/json');
                
                try {
                    $data = $this->processRequestData();
                    
                    // ID = 0 -> INSERT; ID > 0 -> UPDATE
                    $isEdit = !empty($data['id']) && $data['id'] > 0;
                    $categoryId = $isEdit ? $data['id'] : 0;
                    
                    error_log("Category POST request - isEdit: " . ($isEdit ? 'true' : 'false') . ", categoryId: " . $categoryId);
                    
                    $result = $this->model->insert($data, $categoryId);
                    
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
        
        error_log("Category request - Content-Type: '$contentType'");
        
        if (strpos($contentType, 'application/json') !== false) {
            $json = file_get_contents("php://input");
            error_log("Category request - Raw JSON: " . $json);
            $data = (array) json_decode($json, true);
            error_log("Category request - Parsed data: " . json_encode($data));
        } else {
            // Form data o URL-encoded
            $data = $_POST;
            error_log("Category request - POST data: " . json_encode($data));
        }
        
        return $data;
    }
}