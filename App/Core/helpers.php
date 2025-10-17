<?php
// Helpers para construir rutas de assets y URL base
function base_url(): string {
    // Asumiendo que la carpeta pública es / (document root = public)
    // Si el proyecto se despliega en un subdirectorio, actualiza esta constante.
    return rtrim('', '/');
}

function asset(string $path): string {
    $path = ltrim($path, '/');
    return '/' . $path;
}

?>
