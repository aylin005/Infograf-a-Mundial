<?php
namespace App\Models;
use App\Core\Database;
use PDO;
use Exception;

class WorldCupModel
{
    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    public function getAll(): array
    {
        $sql = "CALL sp_world_cup_general('getAll', 0)";
        $stmt = $this->conn->query($sql);
        $data = []; 

        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // convertir blob a base64 para imagenes
            if (isset($row['image']) && !is_null($row['image'])) {
                $row['image'] = $this->convertBinaryToBase64($row['image']);
            }
            if (isset($row['logo']) && !is_null($row['logo'])) {
                $row['logo'] = $this->convertBinaryToBase64($row['logo']);
            }
            
            $data[] = $row;
        }
        
        $stmt->closeCursor();
        return $data;
    }

    public function getOne(string $id): array|false
    {
        $sql = "CALL sp_world_cup_general('getOne', :id)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            // obtener datos principales del mundial
            $worldCup = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($worldCup) {
                // convertir imagenes a base64
                if (isset($worldCup['image']) && !is_null($worldCup['image'])) {
                    $worldCup['image'] = $this->convertBinaryToBase64($worldCup['image']);
                }
                if (isset($worldCup['logo']) && !is_null($worldCup['logo'])) {
                    $worldCup['logo'] = $this->convertBinaryToBase64($worldCup['logo']);
                }
                
                // obtener anexos - segundo resultado
                $stmt->nextRowset();
                $attachments = [];
                while($attachment = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    if (isset($attachment['image']) && !is_null($attachment['image'])) {
                        $attachment['image'] = $this->convertBinaryToBase64($attachment['image']);
                    }
                    $attachments[] = $attachment;
                }
                $worldCup['attachments'] = $attachments;
                
                // obtener paises anfitriones - tercer resultado
                $stmt->nextRowset();
                $hostCountries = [];
                while($country = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $hostCountries[] = $country;
                }
                $worldCup['host_countries'] = $hostCountries;
            }
            
            $stmt->closeCursor();
            return $worldCup ?: false;
        }
        
        return false;
    }

    public function getYears(): array
    {
        $sql = "CALL sp_world_cup_general('getYears', 0)";
        $stmt = $this->conn->query($sql);
        $data = []; 

        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }
        
        $stmt->closeCursor();
        return $data;
    }

    public function insert(array $data, $id = 0): array
    {
        // procesar imagenes 
        $imageData = isset($data["image"]) ? $this->convertToBlob($data["image"]) : null;
        $logoData = isset($data["logo"]) ? $this->convertToBlob($data["logo"]) : null;
        
        // debug de tamaños de imagen
        error_log("WorldCup Model - image data size: " . ($imageData ? strlen($imageData) : 'NULL') . " bytes");
        error_log("WorldCup Model - logo data size: " . ($logoData ? strlen($logoData) : 'NULL') . " bytes");
        
        // verificar tamaños máximos (temporal para debug)
        if ($imageData && strlen($imageData) > 16777215) { // 16MB max para MEDIUMBLOB
            error_log("WorldCup Model - WARNING: Image too large for MEDIUMBLOB");
        }
        if ($logoData && strlen($logoData) > 16777215) { // 16MB max para MEDIUMBLOB  
            error_log("WorldCup Model - WARNING: Logo too large for MEDIUMBLOB");
        }
        
        // procesar arrays para JSON
        $hostCountriesJson = "[]"; // JSON vacío por defecto
        if (isset($data["host_countries"]) && is_array($data["host_countries"])) {
            $hostCountriesJson = json_encode($data["host_countries"]);
            error_log("WorldCup Model - host_countries processed as array: " . $hostCountriesJson);
        } elseif (isset($data["host_countries_json"]) && is_string($data["host_countries_json"])) {
            // si viene como JSON string, usarlo directamente
            $hostCountriesJson = $data["host_countries_json"];
            error_log("WorldCup Model - host_countries_json used directly: " . $hostCountriesJson);
        } else {
            error_log("WorldCup Model - No host_countries found in data. Available keys: " . implode(', ', array_keys($data)));
        }
        
        $attachmentsJson = "[]"; // JSON vacío por defecto
        if (isset($data["attachments"]) && is_array($data["attachments"])) {
            // procesar solo los metadatos para JSON (sin imágenes binarias)
            $attachmentMetadata = [];
            foreach ($data["attachments"] as $index => $attachment) {
                $metadata = [
                    'id' => $index,
                    'description' => $attachment['description'] ?? "Attachment " . ($index + 1),
                    'type' => 'image'
                ];
                $attachmentMetadata[] = $metadata;
            }
            
            if (!empty($attachmentMetadata)) {
                $attachmentsJson = json_encode($attachmentMetadata);
                error_log("WorldCup Model - attachments metadata JSON: " . $attachmentsJson);
            }
            
            // solo guardamos los metadatos en el JSON
            error_log("WorldCup Model - attachments processed: " . count($data["attachments"]) . " items (metadata only)");
        } else {
            error_log("WorldCup Model - No attachments array found");
        }

        $sql = "CALL sp_world_cup_insert_update(:id, :name, :slogan, :fun_fact, :extra_info, :year, 
                :image, :image_description, :logo, :description, :champion, :subchampion, :score, 
                :overtime, :penalties_champion, :penalties_subchampion, :leading_scorer, :admin_id, 
                :host_countries_json, :attachments_json)";
        
        $stmt = $this->conn->prepare($sql);

        // bind parametros principales
        $stmt->bindValue(":id",                     $id,                                    PDO::PARAM_INT);
        $stmt->bindValue(":name",                   $data["name"] ?? null,                  PDO::PARAM_STR);
        $stmt->bindValue(":slogan",                 $data["slogan"] ?? null,                PDO::PARAM_STR);
        $stmt->bindValue(":fun_fact",               $data["fun_fact"] ?? null,              PDO::PARAM_STR);
        $stmt->bindValue(":extra_info",             $data["extra_info"] ?? null,            PDO::PARAM_STR);
        $stmt->bindValue(":year",                   $data["year"] ?? null,                  PDO::PARAM_INT);
        
        $stmt->bindValue(":image",                  $imageData,                             PDO::PARAM_LOB);
        $stmt->bindValue(":image_description",      $data["image_description"] ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(":logo",                   $logoData,                              PDO::PARAM_LOB);
        $stmt->bindValue(":description",            $data["description"] ?? null,           PDO::PARAM_STR);
        // Debug: verificar valores NOT NULL antes de bind
        $championValue = $data["champion"] ?? '';
        $subchampionValue = $data["subchampion"] ?? '';
        $scoreValue = $data["score"] ?? '';
        
        error_log("WorldCup SP - NOT NULL fields check - champion: '$championValue', subchampion: '$subchampionValue', score: '$scoreValue'");
        
        // Asegurar que los campos NOT NULL no sean vacíos
        $championValue = !empty($championValue) ? $championValue : 'TBD';
        $subchampionValue = !empty($subchampionValue) ? $subchampionValue : 'TBD';
        $scoreValue = !empty($scoreValue) ? $scoreValue : '0-0';
        
        $stmt->bindValue(":champion",               $championValue,                         PDO::PARAM_STR);
        $stmt->bindValue(":subchampion",            $subchampionValue,                      PDO::PARAM_STR);
        $stmt->bindValue(":score",                  $scoreValue,                            PDO::PARAM_STR);
        $stmt->bindValue(":overtime",               $data["overtime"] ?? null,              PDO::PARAM_INT);
        $stmt->bindValue(":penalties_champion",     $data["penalties_champion"] ?? null,    PDO::PARAM_INT);
        $stmt->bindValue(":penalties_subchampion",  $data["penalties_subchampion"] ?? null, PDO::PARAM_INT);
        $stmt->bindValue(":leading_scorer",         $data["leading_scorer"] ?? null,        PDO::PARAM_STR);
        $stmt->bindValue(":admin_id",               $data["admin_id"] ?? null,              PDO::PARAM_STR);
        $stmt->bindValue(":host_countries_json",    $hostCountriesJson,                     PDO::PARAM_STR);
        $stmt->bindValue(":attachments_json",       $attachmentsJson,                       PDO::PARAM_STR);

        // debug log de parametros
        $isUpdate = ($id > 0);
        error_log("WorldCup SP Parameters (" . ($isUpdate ? 'UPDATE' : 'INSERT') . ") - ID: " . ($id ?? 'NULL') . 
                  ", name: " . (isset($data["name"]) ? $data["name"] : 'NOT_SET') . 
                  ", year: " . (isset($data["year"]) ? $data["year"] : 'NOT_SET') . 
                  ", admin_id: " . (isset($data["admin_id"]) ? $data["admin_id"] : 'NOT_SET') .
                  ", has_image: " . ($imageData ? 'YES' : 'NO') .
                  ", has_logo: " . ($logoData ? 'YES' : 'NO') .
                  ", host_countries_count: " . (isset($data["host_countries"]) ? count($data["host_countries"]) : 0) .
                  ", attachments_count: " . (isset($data["attachments"]) ? count($data["attachments"]) : 0));

        // Verificación final antes de ejecutar
        error_log("WorldCup SP - Final check - image is null: " . ($imageData === null ? 'YES' : 'NO') . 
                  ", logo is null: " . ($logoData === null ? 'YES' : 'NO'));
                  
        // DEBUG: Verificar qué stored procedure existe
        try {
            $spCheck = $this->conn->query("SHOW CREATE PROCEDURE sp_world_cup_insert_update");
            $spInfo = $spCheck->fetch(PDO::FETCH_ASSOC);
            error_log("WorldCup SP - Current procedure exists: " . ($spInfo ? 'YES' : 'NO'));
            if ($spInfo) {
                // Buscar si contiene la palabra "UPDATE" para imágenes (indicaría la nueva versión)
                $hasImageUpdate = (strpos($spInfo['Create Procedure'], 'UPDATE world_cup SET image') !== false);
                error_log("WorldCup SP - Has image UPDATE logic: " . ($hasImageUpdate ? 'YES' : 'NO'));
            }
        } catch (Exception $e) {
            error_log("WorldCup SP - Could not check procedure: " . $e->getMessage());
        }
        
        // Verificar configuración de MySQL para BLOBs grandes
        try {
            $configCheck = $this->conn->query("SHOW VARIABLES WHERE Variable_name IN ('max_allowed_packet', 'wait_timeout', 'net_read_timeout', 'net_write_timeout')");
            while ($row = $configCheck->fetch(PDO::FETCH_ASSOC)) {
                error_log("MySQL Config - " . $row['Variable_name'] . ": " . $row['Value']);
            }
        } catch (Exception $e) {
            error_log("Could not check MySQL config: " . $e->getMessage());
        }
        
        // DEBUG: Verificar estructura actual de la tabla
        try {
            $tableCheck = $this->conn->query("DESCRIBE world_cup");
            while ($row = $tableCheck->fetch(PDO::FETCH_ASSOC)) {
                if ($row['Field'] === 'image' || $row['Field'] === 'logo') {
                    error_log("WorldCup Table - Column " . $row['Field'] . ": Type=" . $row['Type'] . ", Null=" . $row['Null'] . ", Default=" . ($row['Default'] ?? 'NULL'));
                }
            }
        } catch (Exception $e) {
            error_log("Could not check table structure: " . $e->getMessage());
        }

        // TEST: Probar stored procedure NULL test
        if (false) { // Probar si NULL funciona
            try {
                $nullSQL = "CALL sp_world_cup_test_null(?, ?, ?, ?)";
                $nullStmt = $this->conn->prepare($nullSQL);
                $nullStmt->execute([
                    $data["name"] ?? 'Test Mundial', 
                    $data["year"] ?? 2024, 
                    $data["admin_id"] ?? 'admin1',
                    $data["champion"] ?? 'Test Champion'
                ]);
                $nullResult = $nullStmt->fetch(PDO::FETCH_ASSOC);
                $nullStmt->closeCursor();
                error_log("WorldCup NULL SP Result: " . json_encode($nullResult));
                
                if ($nullResult && $nullResult['exito'] == 1) {
                    return ["exito" => 1, "mensaje" => "NULL SP test successful - Table allows NULL", "id" => $nullResult['id']];
                }
            } catch (Exception $e) {
                error_log("WorldCup NULL SP failed: " . $e->getMessage());
                return ["exito" => 0, "mensaje" => "NULL SP failed: " . $e->getMessage(), "id" => 0];
            }
        }
        
        // TEST: Probar INSERT directo sin SP para debug
        if (false) { // cambiar a true para usar directo, false para SP
            try {
                $directSQL = "INSERT INTO world_cup (name, slogan, fun_fact, extra_info, year, image, image_description, logo, description, champion, subchampion, score, overtime, penalties_champion, penalties_subchampion, leading_scorer, admin_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)";
                $directStmt = $this->conn->prepare($directSQL);
                $directStmt->execute([
                    $data["name"], 
                    $data["slogan"], 
                    $data["fun_fact"], 
                    $data["extra_info"], 
                    $data["year"], 
                    $imageData, 
                    $data["image_description"], 
                    $logoData, 
                    $data["description"], 
                    $data["champion"], 
                    $data["subchampion"], 
                    $data["score"], 
                    $data["overtime"], 
                    $data["penalties_champion"], 
                    $data["penalties_subchampion"], 
                    $data["leading_scorer"], 
                    $data["admin_id"]
                ]);
                $newId = $this->conn->lastInsertId();
                error_log("WorldCup Model - Direct INSERT successful, ID: " . $newId);
                
                // Ahora insertar host_countries directamente también
                if (isset($data["host_countries"]) && is_array($data["host_countries"])) {
                    foreach ($data["host_countries"] as $hostCountry) {
                        $hostSQL = "INSERT INTO host_countries (world_cup_id, country, city, stadium) VALUES (?, ?, ?, ?)";
                        $hostStmt = $this->conn->prepare($hostSQL);
                        $hostStmt->execute([
                            $newId,
                            $hostCountry["country"] ?? $hostCountry["name"] ?? null,
                            $hostCountry["city"] ?? null,
                            $hostCountry["stadium"] ?? null
                        ]);
                    }
                    error_log("WorldCup Model - Host countries inserted successfully");
                }
                
                // Insertar attachments directamente
                if (isset($data["attachments"]) && is_array($data["attachments"])) {
                    foreach ($data["attachments"] as $attachment) {
                        $attachSQL = "INSERT INTO world_cup_attachments (world_cup_id, image, description, is_active) VALUES (?, ?, ?, 1)";
                        $attachStmt = $this->conn->prepare($attachSQL);
                        $attachStmt->execute([
                            $newId,
                            $attachment["image"],
                            $attachment["description"] ?? 'Attachment'
                        ]);
                    }
                    error_log("WorldCup Model - Attachments inserted: " . count($data["attachments"]) . " items");
                }
                
                return ["exito" => 1, "mensaje" => "World Cup created (direct insert)", "id" => $newId];
            } catch (Exception $e) {
                error_log("WorldCup Model - Direct INSERT failed: " . $e->getMessage());
            }
        }

        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("WorldCup SP Result: " . json_encode($result));
            $stmt->closeCursor();
            
            // Si el stored procedure fue exitoso y tenemos attachments, procesar las imágenes
            if ($result && $result['exito'] && isset($data["attachments"]) && is_array($data["attachments"])) {
                $worldCupId = $result['id'];
                $this->processAttachmentImages($worldCupId, $data["attachments"]);
            }
            
            return $result;
        }

        return [
            'exito' => false,
            'mensaje' => 'Error executing query',
            'id' => null
        ];
    }

    private function processAttachmentImages(int $worldCupId, array $attachments): void
    {
        try {
            // Obtener los attachments existentes usando stored procedure
            $getStmt = $this->conn->prepare("CALL sp_world_cup_general('getAttachments', ?)");
            $getStmt->execute([$worldCupId]);
            $dbAttachments = $getStmt->fetchAll(PDO::FETCH_ASSOC);
            $getStmt->closeCursor();
            
            error_log("WorldCup - Processing attachment images for worldcup_id: $worldCupId");
            error_log("WorldCup - DB attachments found: " . count($dbAttachments));
            error_log("WorldCup - Form attachments received: " . count($attachments));
            
            // Actualizar cada attachment con su imagen correspondiente usando stored procedure
            foreach ($attachments as $index => $attachment) {
                error_log("WorldCup - Attachment $index keys: " . implode(', ', array_keys($attachment)));
                if (isset($dbAttachments[$index]) && isset($attachment['image'])) {
                    $attachmentId = $dbAttachments[$index]['id'];
                    $imageBlob = $this->convertToBlob($attachment['image']);
                    
                    if ($imageBlob) {
                        $updateStmt = $this->conn->prepare("CALL sp_attachment_update_image(?, ?)");
                        $updateStmt->bindValue(1, $attachmentId, PDO::PARAM_INT);
                        $updateStmt->bindValue(2, $imageBlob, PDO::PARAM_LOB);
                        
                        if ($updateStmt->execute()) {
                            $updateResult = $updateStmt->fetch(PDO::FETCH_ASSOC);
                            $updateStmt->closeCursor();
                            
                            if ($updateResult && $updateResult['exito']) {
                                error_log("WorldCup - Updated attachment ID: $attachmentId with image data (" . strlen($imageBlob) . " bytes)");
                            } else {
                                error_log("WorldCup - SP Error updating attachment $attachmentId: " . ($updateResult['mensaje'] ?? 'Unknown error'));
                            }
                        }
                    } else {
                        error_log("WorldCup - Warning: Could not convert attachment $index to BLOB");
                    }
                } else {
                    error_log("WorldCup - Warning: No image data for attachment index $index");
                }
            }
            
        } catch (Exception $e) {
            error_log("WorldCup - Error processing attachment images: " . $e->getMessage());
        }
    }

    public function delete(string $id): array
    {
        $sql = "CALL sp_world_cup_general('delete', :id)";
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
            'mensaje' => 'Error deleting world cup',
            'id' => $id
        ];
    }

    // convertir datos binarios a base64 para envio al frontend
    private function convertBinaryToBase64($binaryData): string
    {
        if (is_null($binaryData)) return '';
        
        // si ya es base64, retornarlo
        if (strpos($binaryData, 'data:image/') === 0) return $binaryData;
        
        // convertir a base64 y agregar prefijo
        $base64 = base64_encode($binaryData);
        return 'data:image/png;base64,' . $base64;
    }

    // convertir base64 o archivo a binario
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
        
        // Si es string binario (como viene de file_get_contents), validar tamaño también
        if (is_string($imageData)) {
            $maxSize = 15 * 1024 * 1024; // 15MB
            if (strlen($imageData) > $maxSize) {
                throw new Exception("La imagen es muy pesada.");
            }
            return $imageData; // devolver tal como está
        }
        
        return null;
    }
}