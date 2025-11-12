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
        
        // procesar arrays para JSON
        $hostCountriesJson = null;
        if (isset($data["host_countries"]) && is_array($data["host_countries"])) {
            $hostCountriesJson = json_encode($data["host_countries"]);
        }
        
        $attachmentsJson = null;
        if (isset($data["attachments"]) && is_array($data["attachments"])) {
            // procesar imagenes en attachments
            $processedAttachments = [];
            foreach ($data["attachments"] as $attachment) {
                $processedAttachment = $attachment;
                if (isset($attachment["image"])) {
                    $processedAttachment["image"] = $this->convertToBlob($attachment["image"]);
                }
                $processedAttachments[] = $processedAttachment;
            }
            $attachmentsJson = json_encode($processedAttachments);
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
        $stmt->bindValue(":champion",               $data["champion"] ?? null,              PDO::PARAM_STR);
        $stmt->bindValue(":subchampion",            $data["subchampion"] ?? null,           PDO::PARAM_STR);
        $stmt->bindValue(":score",                  $data["score"] ?? null,                 PDO::PARAM_STR);
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

        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("WorldCup SP Result: " . json_encode($result));
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
    private function convertToBlob($imageData)
    {
        if (is_null($imageData) || empty($imageData)) return null;
        
        // si es base64, extraer solo los datos
        if (strpos($imageData, 'data:image/') === 0) {
            $parts = explode(',', $imageData);
            if (count($parts) > 1) {
                return base64_decode($parts[1]);
            }
        }
        
        // si es string, asumimos que es base64 sin prefijo
        if (is_string($imageData)) {
            return base64_decode($imageData);
        }
        
        return $imageData;
    }
}