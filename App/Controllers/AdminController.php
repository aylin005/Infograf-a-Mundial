<?php
namespace App\Controllers;
use App\Models\AdminModel;

class AdminController
{
    private AdminModel $model;

    public function __construct(AdminModel $model)
    {
        $this->model = $model;
    }

    public function login(): void
    {
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
            // Start session and store admin info
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['admin'] = [
                'username' => $result['username']
            ];
            http_response_code(200);
        } else {
            http_response_code(401);
        }
        
        echo json_encode($result);
    }
}
