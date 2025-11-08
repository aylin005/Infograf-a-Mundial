<?php 
use App\Core\Router;
require_once __DIR__ . '/helpers.php';
use App\Core\Database;
use App\Models\UserModel;
use App\Models\AdminModel;
use App\Controllers\UserController;
use App\Controllers\AdminController;
use App\Middlewares\AuthMiddleware;

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

$router->add('/modular/likes', function() use ($renderView) {
    $renderView('modular/likes.php');
});

// Backwards-compatible routes for pages previously named .html
$router->add('/signUp', function() use ($renderView) { $renderView('signUp.php'); });
$router->add('/login', function(...$args) use ($renderView, $database) {
    // Limpiar sesión si ya estaba autenticado
    AuthMiddleware::clearSessionOnLogin();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $gateway = new UserModel($database);
        $controller = new UserController($gateway);
        $controller->processRequest('POST');
    } else {
        $renderView('logIn.php');
    }
});
$router->add('/admin', function() use ($renderView) {
    AuthMiddleware::requireAdmin();
    // Reutilizamos adminMundials como landing administrativa
    $renderView('adminMundials.php');
});
$router->add('/profile', function() use ($renderView) { 
    AuthMiddleware::requireAuth();
    $renderView('profile.php'); 
});
$router->add('/postDisplay', function() use ($renderView) { $renderView('postDisplay.php'); });
$router->add('/newPost', function() use ($renderView) { 
    AuthMiddleware::requireAuth();
    $renderView('newPost.php'); 
});
$router->add('/results', function() use ($renderView) { $renderView('results.php'); });
$router->add('/mundialDisplay', function() use ($renderView) { $renderView('mundialDisplay.php'); });
$router->add('/adminPosts', function() use ($renderView) { 
    AuthMiddleware::requireAdmin();
    $renderView('adminPosts.php'); 
});
$router->add('/adminMundials', function() use ($renderView) { 
    AuthMiddleware::requireAdmin();
    $renderView('adminMundials.php'); 
});
$router->add('/addCategory', function() use ($renderView) { 
    AuthMiddleware::requireAdmin();
    $renderView('addCategory.php'); 
});


// Rutas de API para controladores
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

// Ruta de logout
$router->add('/logout', function() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    session_unset();
    session_destroy();
    header('Location: /login');
    exit();
});

// Ruta de login para admin
$router->add('/admin/login', function(...$args) use ($renderView, $database) {
    AuthMiddleware::clearSessionOnLogin();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $gateway = new AdminModel($database);
        $controller = new AdminController($gateway);
        $controller->login();
    } else {
        // Puedes crear una vista adminLogin.php o reutilizar logIn.php
        $renderView('logIn.php');
    }
});

$router->dispatch($_SERVER['REQUEST_URI']);