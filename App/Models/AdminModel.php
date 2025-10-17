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
        // Hash password with SHA-256 (to match DB)
        $hash = hash('sha256', $password);
        $sql = "SELECT username, hash_password FROM admin WHERE username = :username AND hash_password = :hash_password";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":username", $username, PDO::PARAM_STR);
        $stmt->bindValue(":hash_password", $hash, PDO::PARAM_STR);
        
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
