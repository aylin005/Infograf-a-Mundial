<?php 
use App\Core\Router;
require_once __DIR__ . '/helpers.php';
use App\Core\Database;
use App\Models\UserModel;
use App\Controllers\UserController;

$config = require_once __DIR__ . '\..\config\config.php';

// Crear una instancia compartida de Database (reuse)
$database = new Database($config['db']['connection1']);

$router = new Router();

// Helper para renderizar vistas (ruta absoluta desde el proyecto)
$renderView = function(string $viewPath) {
    $full = __DIR__ . '/../views/' . ltrim($viewPath, '/');
    if (file_exists($full)) {
        // allow view to use relative paths for assets starting with '/'
        require $full;
        return;
    }

    // si no existe la vista, devolver 404 simple
    http_response_code(404);
    echo "View not found";
};

// Ruta raíz -> renderiza la vista index.php
$router->add('/', function() use ($renderView) {
    $renderView('index.php');
});

// Rutas para módulos que se cargan por fetch desde el cliente
$router->add('/modular/navBar', function() use ($renderView) {
    $renderView('modular/navBar.php');
});

$router->add('/modular/filters', function() use ($renderView) {
    $renderView('modular/filters.php');
});

// Registrar la ruta /products; el closure crea el gateway y el controller y delega
$router->add('/users', function(string $method, ?string $id = null) use ($database) {
    $gateway = new UserModel($database);
    $controller = new UserController($gateway);
    $controller->processRequest($method, $id);
});

// Ejemplo para /products/:id si quieres ruta con id explícita
$router->add('/users/:id', function(string $method, string $id) use ($database) {
    $gateway = new UserModel($database);
    $controller = new UserController($gateway);
    $controller->processRequest($method, $id);
});


$router->dispatch($_SERVER['REQUEST_URI']);