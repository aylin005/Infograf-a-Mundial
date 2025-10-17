<?php
namespace App\Controllers;
use App\Models\UserModel;

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

            case "PATCH":
                header('Content-Type: application/json');
                $data = (array) json_decode(file_get_contents("php://input"), true);
                // $errors = $this->getValidationErrors($data, false);

                // if (!empty($errors)) {
                //     http_response_code(422);
                //     echo json_encode(["errors" => $errors]);
                //     break;
                // }

                $result = $this->model->insert($data, $id);

                if (isset($result['exito']) && $result['exito']) {
                    http_response_code(200);
                } else {
                    http_response_code(400);
                }

                echo json_encode($result);
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
                header("Allow: GET, PATCH, DELETE");
                break;
        }
    }

    private function processCollectionRequest(string $method): void
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        // Handle /login POST separately
        if ($method === "POST" && strpos($uri, '/login') !== false) {
            header('Content-Type: application/json');
            $data = (array) json_decode(file_get_contents("php://input"), true);
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';
            if (!$username || !$password) {
                http_response_code(400);
                echo json_encode(['exito' => false, 'mensaje' => 'Username and password required']);
                return;
            }
            $result = $this->model->login($username, $password);
            if ($result['exito']) {
                // Start session and store user info
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }
                $_SESSION['user'] = [
                    'id' => $result['id'],
                    'username' => $result['username'] ?? '',
                    'email' => $result['email'] ?? '',
                    'full_name' => $result['full_name'] ?? '',
                    'birth_date' => $result['birth_date'] ?? '',
                    'image' => $result['image'] ?? '',
                    'gender' => $result['gender'] ?? '',
                    'birth_place' => $result['birth_place'] ?? '',
                    'nationality' => $result['nationality'] ?? ''
                ];
                http_response_code(200);
            } else {
                http_response_code(401);
            }
            echo json_encode($result);
            return;
        }
        // Default: registration and getAll
        switch ($method) {
            case "GET":
                header('Content-Type: application/json');
                echo json_encode($this->model->getAll());
                break;
            case "POST":
                header('Content-Type: application/json');
                $data = (array) json_decode(file_get_contents("php://input"), true);
                $result = $this->model->insert($data);
                if (isset($result['exito']) && $result['exito']) {
                    http_response_code(201);
                } else {
                    http_response_code(400);
                }
                echo json_encode($result);
                break;
            default:
                http_response_code(405);
                header("Allow: GET, POST");
                break;
        }
    }

    private function getValidationErrors(array $data, bool $is_new = true): array
    {
        $errors = [];

        if ($is_new && empty($data["name"])) {
            $errors[] = "Name is required";
        }

        if (isset($data["size"]) && !filter_var($data["size"], FILTER_VALIDATE_INT)) {
            $errors[] = "Size must be an integer";
        }

        if (isset($data["is_available"]) && !is_bool($data["is_available"])) {
            $errors[] = "Is Available must be a boolean";
        }

        return $errors;
    }
}
