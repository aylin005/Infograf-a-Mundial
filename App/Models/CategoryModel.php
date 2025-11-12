<?php
namespace App\Models;
use App\Core\Database;
use PDO;

class CategoryModel
{
    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    public function getAll(): array
    {
        $sql = "CALL sp_categories_general('getAll', 0)";
        $stmt = $this->conn->query($sql);
        $data = []; 

        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }

        $stmt->closeCursor();

        return $data;
    }

    public function getOne(string $id): array|false
    {
        $sql = "CALL sp_categories_general('getOne', :id)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt->closeCursor();
            return $result ?: false;
        }
        
        return false;
    }

    public function insert(array $data, $id = 0): array
    {
        $sql = "CALL sp_categories_insert(:id, :name)";
        
        $stmt = $this->conn->prepare($sql);

        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->bindValue(":name", $data["name"] ?? NULL, PDO::PARAM_STR);

        // DEBUG: Log de parámetros antes de ejecutar
        $isUpdate = ($id > 0);
        error_log("Category SP Parameters (" . ($isUpdate ? 'UPDATE' : 'INSERT') . ") - ID: " . ($id ?? 'NULL') . 
                  ", name: " . (isset($data["name"]) ? $data["name"] : 'NOT_SET'));

        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("Category SP Result: " . json_encode($result));
            $stmt->closeCursor();
            return $result;
        }

        return [
            'exito' => false,
            'mensaje' => 'Error executing query',
            'id' => null
        ];
    }

    public function delete(string $id): array
    {
        $sql = "CALL sp_categories_general('delete', :id)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt->closeCursor();
            
            if ($result) {
                return $result;
            }
        }
        
        return [
            'exito' => false,
            'mensaje' => 'Error deleting category',
            'id' => $id
        ];
    }
}