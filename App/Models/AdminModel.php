<?php
namespace App\Models;
use App\Core\Database;
use PDO;
use Exception;

class AdminModel
{
    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    /**
     * Login admin by username and password
     * @param string $username
     * @param string $password (plain text)
     * @return array (exito, mensaje, admin data if success)
     */
    public function login(string $username, string $password): array
    {
        // Comparar directamente con el campo 'password' de la tabla 'admins' (texto plano)
        $sql = "SELECT username FROM admins WHERE username = :username AND password = :password";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":username", $username, PDO::PARAM_STR);
        $stmt->bindValue(":password", $password, PDO::PARAM_STR);
        
        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result !== false) {
                return [
                    'exito' => true,
                    'mensaje' => 'Login successful',
                    'username' => $result['username']
                ];
            }
            return [
                'exito' => false,
                'mensaje' => 'Invalid admin credentials',
            ];
        }
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Database error: " . ($errorInfo[2] ?? 'Unknown error'));
    }
}
