<?php 
use App\Core\Router;
use App\Core\Database;
use App\Models\UserModel;
use App\Controllers\UserController;

$config = require_once __DIR__ . '\..\config\config.php';

// Crear una instancia compartida de Database (reuse)
$database = new Database($config['db']['connection1']);

$router = new Router();

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