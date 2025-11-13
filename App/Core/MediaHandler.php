<?php
namespace App\Core;

use Exception;

/**
 * Clase para manejar archivos multimedia (imágenes y videos)
 */
class MediaHandler
{
    private const UPLOAD_DIR = 'uploads/multimedia/';
    private const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB para imágenes
    private const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB para videos
    
    private const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    
    /**
     * Procesar archivo multimedia
     * @param array $file - Archivo desde $_FILES
     * @param int $userId - ID del usuario
     * @param int $position - Posición del archivo en el post
     * @return array - Datos procesados del archivo
     */
    public static function processMediaFile(array $file, int $userId, int $position = 0): array
    {
        try {
            // Validar que el archivo se subió correctamente
            if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('Error en la subida del archivo: ' . self::getUploadErrorMessage($file['error'] ?? UPLOAD_ERR_NO_FILE));
            }
            
            $mimeType = $file['type'];
            $fileSize = $file['size'];
            $originalName = $file['name'];
            
            // Determinar tipo de multimedia
            $mediaType = self::getMediaType($mimeType);
            
            // Validar tamaño según el tipo
            self::validateFileSize($mediaType, $fileSize);
            
            if ($mediaType === 'image') {
                // Para imágenes, convertir a blob
                return [
                    'type' => 'image',
                    'image' => file_get_contents($file['tmp_name']),
                    'path' => null,
                    'position' => $position,
                    'original_name' => $originalName
                ];
            } else {
                // Para videos, guardar en servidor y retornar path
                $savedPath = self::saveVideoFile($file, $userId);
                return [
                    'type' => 'video',
                    'image' => null,
                    'path' => $savedPath,
                    'position' => $position,
                    'original_name' => $originalName
                ];
            }
            
        } catch (Exception $e) {
            error_log("MediaHandler Error: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Determinar el tipo de multimedia basado en MIME type
     */
    private static function getMediaType(string $mimeType): string
    {
        if (in_array($mimeType, self::ALLOWED_IMAGE_TYPES)) {
            return 'image';
        } elseif (in_array($mimeType, self::ALLOWED_VIDEO_TYPES)) {
            return 'video';
        } else {
            throw new Exception("Tipo de archivo no permitido: $mimeType");
        }
    }
    
    /**
     * Validar tamaño del archivo
     */
    private static function validateFileSize(string $mediaType, int $fileSize): void
    {
        $maxSize = $mediaType === 'image' ? self::MAX_IMAGE_SIZE : self::MAX_VIDEO_SIZE;
        
        if ($fileSize > $maxSize) {
            $maxSizeMB = round($maxSize / (1024 * 1024));
            throw new Exception("El archivo es demasiado grande. Tamaño máximo permitido: {$maxSizeMB}MB");
        }
    }
    
    /**
     * Guardar archivo de video en el servidor
     */
    private static function saveVideoFile(array $file, int $userId): string
    {
        // Crear directorio si no existe
        $baseDir = self::getProjectRoot() . '/' . self::UPLOAD_DIR;
        if (!is_dir($baseDir)) {
            if (!mkdir($baseDir, 0755, true)) {
                throw new Exception('No se pudo crear el directorio de uploads');
            }
        }
        
        // Generar nombre único para el archivo
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $uniqueName = self::generateUniqueFileName($userId, $extension);
        
        // Ruta completa del archivo
        $fullPath = $baseDir . $uniqueName;
        
        // Mover archivo temporal al destino final
        if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
            throw new Exception('No se pudo guardar el archivo de video');
        }
        
        // Retornar path relativo para la BD
        return self::UPLOAD_DIR . $uniqueName;
    }
    
    /**
     * Generar nombre único para archivo
     */
    private static function generateUniqueFileName(int $userId, string $extension): string
    {
        $timestamp = time();
        $microseconds = microtime(true) * 1000000;
        $random = mt_rand(1000, 9999);
        
        return "video_{$userId}_{$timestamp}_{$microseconds}_{$random}.{$extension}";
    }
    
    /**
     * Obtener directorio raíz del proyecto
     */
    private static function getProjectRoot(): string
    {
        // Buscar hacia arriba hasta encontrar el directorio que contiene 'public'
        $currentDir = __DIR__;
        
        while ($currentDir !== dirname($currentDir)) {
            if (is_dir($currentDir . '/public')) {
                return $currentDir;
            }
            $currentDir = dirname($currentDir);
        }
        
        throw new Exception('No se pudo determinar el directorio raíz del proyecto');
    }
    
    /**
     * Obtener mensaje de error de upload
     */
    private static function getUploadErrorMessage(int $errorCode): string
    {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
                return 'El archivo excede el tamaño máximo permitido por PHP';
            case UPLOAD_ERR_FORM_SIZE:
                return 'El archivo excede el tamaño máximo permitido por el formulario';
            case UPLOAD_ERR_PARTIAL:
                return 'El archivo se subió parcialmente';
            case UPLOAD_ERR_NO_FILE:
                return 'No se subió ningún archivo';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Falta el directorio temporal';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Error al escribir el archivo en disco';
            case UPLOAD_ERR_EXTENSION:
                return 'Subida detenida por extensión PHP';
            default:
                return 'Error desconocido en la subida';
        }
    }
    
    /**
     * Eliminar archivo de video del servidor
     */
    public static function deleteVideoFile(string $path): bool
    {
        try {
            $fullPath = self::getProjectRoot() . '/' . $path;
            
            if (file_exists($fullPath)) {
                return unlink($fullPath);
            }
            
            return true; // Si no existe, consideramos que ya está eliminado
            
        } catch (Exception $e) {
            error_log("Error eliminando archivo de video: " . $e->getMessage());
            return false;
        }
    }
}