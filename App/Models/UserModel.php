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
        $stmt = $this->conn->query($sql);
        $data = []; 

        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { //fetch fetches the next row from a result set
            // de blob a base64
            if (isset($row['image']) && !is_null($row['image'])) {
                $row['image'] = $this->convertBinaryToBase64($row['image']);
            }
            if (isset($row['background_image']) && !is_null($row['background_image'])) {
                $row['background_image'] = $this->convertBinaryToBase64($row['background_image']);
            }
            
            $data[] = $row; //add the row to the results array
        }
        // Cerrar cursor después de procesar todos los resultados
        $stmt->closeCursor();

        return $data; //return the results array
    }


    public function insert (array $data, $id = null ): array //id accepts null
    {
        // Para UPDATE (id existe), solo convertir a null campos opcionales
        // Para INSERT (id null), convertir todos los campos vacíos excepto los obligatorios
        $isUpdate = ( $id > 0);
        
        if ($isUpdate) {
            // En UPDATE: solo convertir campos opcionales a null si están vacíos
            $optionalFields = ['gender', 'birth_place', 'nationality', 'birth_date'];
            foreach ($optionalFields as $field) {
                if (isset($data[$field]) && trim($data[$field]) === '') {
                    $data[$field] = null;
                }
            }
            // En UPDATE: campos como username, email, full_name NO se convierten a null
            // Si están vacíos, se omiten (se mantiene valor actual)
            $requiredFields = ['username', 'email', 'full_name'];
            foreach ($requiredFields as $field) {
                if (isset($data[$field]) && trim($data[$field]) === '') {
                    unset($data[$field]); // Remover para que IFNULL mantenga valor actual
                }
            }
        } else {
            // En INSERT: convertir campos vacíos a null (excepto los que son NOT NULL)
            $fields = ['username', 'gender', 'birth_place', 'nationality', 'birth_date'];
            foreach ($fields as $field) {
                if (isset($data[$field]) && trim($data[$field]) === '') {
                    $data[$field] = null;
                }
            }
            // email y full_name no se pueden convertir a null en INSERT porque son NOT NULL
        }
        
        //Hashear la contraseña solo si se envía
        if (isset($data["hash_password"]) && $data["hash_password"] !== null && $data["hash_password"] !== '') {
            if (!preg_match('/^[a-f0-9]{64}$/i', $data["hash_password"])) {
                $data["hash_password"] = hash('sha256', $data["hash_password"]);
            }
        } else {
            $data["hash_password"] = null;
        }

        //validar género solo si se envía
        if (array_key_exists("gender", $data) && $data["gender"] !== null && $data["gender"] !== '') {
            $validGenders = ["Masculino", "Femenino", "Otro"];
            if (!in_array($data["gender"], $validGenders)) {
                return [
                    'exito' => false,
                    'id' => 0,
                    'mensaje' => 'Error: El género debe ser "Masculino", "Femenino" u "Otro"'
                ];
            }
        }

        // Procesar imágenes 
        $imageData = isset($data["image"]) ? $this->convertToBlob($data["image"]) : null;
        $backgroundImageData = isset($data["background_image"]) ? $this->convertToBlob($data["background_image"]) : null;

        // quey
        $sql = "CALL sp_user_insert(:id, :username, :email, :hash_password, :full_name,
                :birth_date, :image, :background_image, :gender, :birth_place, :nationality)"; // : named placeholders
        
        $stmt = $this->conn->prepare($sql); //prepare prepares a SQL statement for execution and returns a PDOStatement object

        $stmt->bindValue(":id",                 $id,                            PDO::PARAM_INT);
        $stmt->bindValue(":username",           $data["username"]?? NULL,       PDO::PARAM_STR);
        $stmt->bindValue(":email",              $data["email"]?? NULL,          PDO::PARAM_STR);
        $stmt->bindValue(":hash_password",      $data["hash_password"]?? NULL,  PDO::PARAM_STR);
        $stmt->bindValue(":full_name",          $data["full_name"]?? NULL,      PDO::PARAM_STR);
        $stmt->bindValue(":birth_date",         $data["birth_date"]?? NULL,     PDO::PARAM_STR);
        $stmt->bindValue(":image",              $imageData,                     PDO::PARAM_LOB); //LOB para longblob
        $stmt->bindValue(":background_image",   $backgroundImageData,           PDO::PARAM_LOB);
        $stmt->bindValue(":gender",             $data["gender"]?? NULL,         PDO::PARAM_STR);
        $stmt->bindValue(":birth_place",        $data["birth_place"]?? NULL,    PDO::PARAM_STR);
        $stmt->bindValue(":nationality",        $data["nationality"] ?? NULL,   PDO::PARAM_STR);

        // DEBUG: Log de parámetros antes de ejecutar
        $isUpdate = ($id !== null);
        error_log("SP Parameters (" . ($isUpdate ? 'UPDATE' : 'INSERT') . ") - ID: " . ($id ?? 'NULL') . 
                  ", username: " . (isset($data["username"]) ? $data["username"] : 'NOT_SET') . 
                  ", email: " . (isset($data["email"]) ? $data["email"] : 'NOT_SET') . 
                  ", full_name: " . (isset($data["full_name"]) ? $data["full_name"] : 'NOT_SET') . 
                  ", gender: " . (isset($data["gender"]) ? ($data["gender"] ?? 'NULL') : 'NOT_SET') . 
                  ", birth_place: " . (isset($data["birth_place"]) ? ($data["birth_place"] ?? 'NULL') : 'NOT_SET') . 
                  ", nationality: " . (isset($data["nationality"]) ? ($data["nationality"] ?? 'NULL') : 'NOT_SET') .
                  ", has_image: " . ($imageData ? 'YES' : 'NO') .
                  ", has_bg_image: " . ($backgroundImageData ? 'YES' : 'NO'));

        // resultado
        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("SP Result: " . json_encode($result));
            
            $stmt->closeCursor();

            if ($result) {
                $result['exito'] = isset($result['exito']) ? (bool)$result['exito'] : false;
                $result['id'] = isset($result['id']) ? (int)$result['id'] : 0;
                $result['mensaje'] = $result['mensaje'] ?? '';

                //datos actualizados del usuario
                if ($result['exito'] && $id !== null) {
                    $updatedUserData = $this->getOne($id);
                    if ($updatedUserData) {
                        $result['user_data'] = $updatedUserData;
                    }
                }

                // Si es un update y falló, agregar más info
                if (!$result['exito'] && $id !== null && strpos($result['mensaje'], 'No update') !== false) {
                    $result['debug_info'] = [
                        'attempted_id' => $id,
                        'sent_data' => array_keys(array_filter($data, function($v) { return $v !== null; }))
                    ];
                }

                return $result;
            }

            return $result;
        }

        // error de ejecucion
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

        $stmt->closeCursor();

        if ($data) {            
            //se pasa la imagen de blob a base 64 para el front
            if (isset($data['image']) && !is_null($data['image'])) {
                $data['image'] = $this->convertBinaryToBase64($data['image']);
            }
            if (isset($data['background_image']) && !is_null($data['background_image'])) {
                $data['background_image'] = $this->convertBinaryToBase64($data['background_image']);
            }
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
            
            $stmt->closeCursor();

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



    public function login(string $username, string $password): array
    {
        // hash password
        $hash = hash('sha256', $password);
        // call sp
        $sql = "CALL sp_auth_login(:username, :hash_password)";

        //send data
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":username", $username, PDO::PARAM_STR);
        $stmt->bindValue(":hash_password", $hash, PDO::PARAM_STR);
        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt->closeCursor();
            
            // si hay resultado, devolverlo
            if ($result !== false) {
                $result['exito'] = isset($result['exito']) ? (bool)$result['exito'] : false;
                if (isset($result['id'])) { $result['id'] = (int)$result['id']; }
                
                // de blob a base64
                if (isset($result['image']) && !is_null($result['image'])) {
                    $result['image'] = $this->convertBinaryToBase64($result['image']);
                }
                
                return $result;
            }
        }
        return ['exito' => false, 'mensaje' => 'No data returned'];
    }


    // Convertir imagen a binario para BD
    private function convertToBlob($imageData): ?string
    {
        if (empty($imageData)) return null;
        
        // Si es data URL base64, extraer los datos
        if (strpos($imageData, 'data:image/') === 0) {
            $parts = explode(',', $imageData, 2);
            if (isset($parts[1])) {
                $binaryData = base64_decode($parts[1]);
                
                // Validar tamaño de imagen (máximo 15MB)
                $maxSize = 15 * 1024 * 1024; // 15MB
                if (strlen($binaryData) > $maxSize) {
                    throw new Exception("La imagen es muy pesada.");
                }
                
                return $binaryData;
            }
            return null;
        }
        
        // Si es string binario, validar tamaño también
        if (is_string($imageData)) {
            $maxSize = 15 * 1024 * 1024; // 15MB
            if (strlen($imageData) > $maxSize) {
                throw new Exception("La imagen es muy pesada.");
            }
            return $imageData;
        }
        
        return null;
    }

    // Convertir binario a base64 para frontend  
    private function convertBinaryToBase64($binaryData): ?string
    {
        if (empty($binaryData)) return null;
        if (strpos($binaryData, 'data:image/') === 0) return $binaryData;
        return 'data:image/png;base64,' . base64_encode($binaryData);
    }
}