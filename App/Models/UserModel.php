<?php
namespace App\Models;
use App\Core\Database;
use PDO;
use Exception;
class UserModel
{
    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    public function getAll(): array
    {
        $sql = "CALL sp_user_general('getAll', 0)";
        $stmt = $this->conn->query($sql); //query executes a SQL statement and returns a PDOStatement object
        
        $data = []; //array to hold the results

        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { //fetch fetches the next row from a result set
            
            $row["is_active"] = (bool)$row["is_active"]; //convert the is_available field to a boolean
            
            $data[] = $row; //add the row to the results array
        }

        return $data; //return the results array
    }

    public function insert (array $data, $id = null ): array //id accepts null
    {
        // Hashear la contraseña con SHA-256 si viene en texto plano (no 64 caracteres hex)
        if (isset($data["hash_password"]) && !empty($data["hash_password"])) {
            // Si no es un hash SHA-256 válido (64 hex)
            if (!preg_match('/^[a-f0-9]{64}$/i', $data["hash_password"])) {
                $data["hash_password"] = hash('sha256', $data["hash_password"]);
            }
        }

        // Validar género: solo permitir "Masculino", "Femenino" u "Otro"
        if (isset($data["gender"]) && !empty($data["gender"])) {
            $validGenders = ["Masculino", "Femenino", "Otro"];
            if (!in_array($data["gender"], $validGenders)) {
                return [
                    'exito' => false,
                    'id' => 0,
                    'mensaje' => 'Error: El género debe ser "Masculino", "Femenino" u "Otro"'
                ];
            }
        }

        $sql = "CALL sp_user_insert(:id, :username, :email, :hash_password, :full_name,
                :birth_date, :image, :gender, :birth_place, :nationality)"; // : named placeholders
        
        $stmt = $this->conn->prepare($sql); //prepare prepares a SQL statement for execution and returns a PDOStatement object

        $stmt->bindValue(":id",             $id,                            PDO::PARAM_INT);
        $stmt->bindValue(":username",       $data["username"]?? NULL,       PDO::PARAM_STR);
        $stmt->bindValue(":email",          $data["email"]?? NULL,          PDO::PARAM_STR);
        $stmt->bindValue(":hash_password",  $data["hash_password"]?? NULL,  PDO::PARAM_STR);
        $stmt->bindValue(":full_name",      $data["full_name"]?? NULL,      PDO::PARAM_STR);
        $stmt->bindValue(":birth_date",     $data["birth_date"]?? NULL,     PDO::PARAM_STR);
        $stmt->bindValue(":image",          $data["image"]?? NULL,          PDO::PARAM_STR);
        $stmt->bindValue(":gender",         $data["gender"]?? NULL,         PDO::PARAM_STR);
        $stmt->bindValue(":birth_place",    $data["birth_place"]?? NULL,    PDO::PARAM_STR);
        $stmt->bindValue(":nationality",    $data["nationality"] ?? NULL,   PDO::PARAM_STR);

        // Execute and read the result row (procedure returns a table with exito,id,mensaje)
        if ($stmt->execute()) { //execute executes a prepared statement
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result !== false) {
                // Normalize types
                $result['exito'] = isset($result['exito']) ? (bool)$result['exito'] : false;
                $result['id'] = isset($result['id']) ? (int)$result['id'] : 0;
                $result['mensaje'] = $result['mensaje'] ?? '';

                return $result;
            }

            // If the procedure did not return a row, fall back to lastInsertId
            return [
                'exito' => true,
                'id' => (int)$this->conn->lastInsertId(),
                'mensaje' => 'OK'
            ];
        }

        // If execute() returned false, throw an exception with PDO error info
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Database error: " . ($errorInfo[2] ?? 'Unknown error'));
    }

    public function getOne(string $id):array|false
    {
        $sql = "CALL sp_user_general('getOne', :id)";
        
        $stmt = $this->conn->prepare($sql);
        
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        
        $stmt->execute();

        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            $data["is_active"] = (bool)$data["is_active"]; //cast to boolean
        }

        return $data;
    }


    public function delete(string $id): array
    {
        $sql = "CALL sp_user_general('delete', :id)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindValue(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result !== false) {
                $result['exito'] = isset($result['exito']) ? (bool)$result['exito'] : false;
                $result['id'] = isset($result['id']) ? (int)$result['id'] : (int)$id;
                $result['mensaje'] = $result['mensaje'] ?? '';

                return $result;
            }

            return [
                'exito' => true,
                'id' => (int)$id,
                'mensaje' => 'Deleted'
            ];
        }

        $errorInfo = $stmt->errorInfo();
        throw new Exception("Database error: " . ($errorInfo[2] ?? 'Unknown error'));
    }
    /**
     * Login user by username and password
     * @param string $username
     * @param string $password (plain text)
     * @return array (exito, mensaje, user data if success)
     */
    public function login(string $username, string $password): array
    {
        // Hash password with SHA-256 (to match DB)
        $hash = hash('sha256', $password);
        $sql = "CALL sp_user_login(:username, :hash_password)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":username", $username, PDO::PARAM_STR);
        $stmt->bindValue(":hash_password", $hash, PDO::PARAM_STR);
        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result !== false) {
                $result['exito'] = isset($result['exito']) ? (bool)$result['exito'] : false;
                $result['id'] = isset($result['id']) ? (int)$result['id'] : 0;
                return $result;
            }
            return [
                'exito' => false,
                'mensaje' => 'No data returned',
            ];
        }
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Database error: " . ($errorInfo[2] ?? 'Unknown error'));
    }
}