<?php 
use App\Core\Router;
require_once __DIR__ . '/helpers.php';
use App\Core\Database;
use App\Models\UserModel;
use App\Models\AdminModel;
use App\Models\CategoryModel;
use App\Models\WorldCupModel;
use App\Models\PostModel;
use App\Controllers\UserController;
use App\Controllers\AdminController;
use App\Controllers\CategoryController;
use App\Controllers\WorldCupController;
use App\Controllers\PostController;
use App\Middlewares\AuthMiddleware;

$config = require_once __DIR__ . '\..\config\config.php';

// Crear una instancia compartida de Database (reuse)
$database = new Database($config['db']['connection1']);

$router = new Router();

// Helper para renderizar vistas (ruta absoluta desde el proyecto)
$renderView = function(string $viewPath) {
    $full = __DIR__ . '/../views/' . ltrim($viewPath, '/');
    if (file_exists($full)) {
        require $full;
        return;
    }

    // si no existe la vista, devolver 404 simple
    http_response_code(404);
    echo "View not found";
};

//////////////////////////////////////////////////////////////////
// RUTAS PARA MODULOS /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
$router->add('/modular/navBar', function() use ($renderView) { $renderView('modular/navBar.php');});
$router->add('/modular/filters', function() use ($renderView) {$renderView('modular/filters.php');});
$router->add('/modular/likes', function() use ($renderView) { $renderView('modular/likes.php'); });

///////////////////////////////////////////////////////////////
// RUTAS PARA VIEWS ///////////////////////////////////////////
///////////////////////////////////////////////////////////////
$router->add('/', function() use ($renderView) {$renderView('index.php');});
$router->add('/signUp', function() use ($renderView) { $renderView('signUp.php'); });
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


////////////////////////////////////////////////////////////////////
// RUTAS PARA CONTROLADORES /////////////////////////////////////////
////////////////////////////////////////////////////////////////////

// /users
$router->add('/users', function(string $method, ?string $id = null) use ($database) {
    $gateway = new UserModel($database);
    $controller = new UserController($gateway);
    $controller->processRequest($method, $id);
});
$router->add('/users/:id', function(string $method, string $id) use ($database) {
    $gateway = new UserModel($database);
    $controller = new UserController($gateway);
    $controller->processRequest($method, $id);
});

// /categories
$router->add('/categories', function(string $method, ?string $id = null) use ($database) {
    $gateway = new CategoryModel($database);
    $controller = new CategoryController($gateway);
    $controller->processRequest($method, $id);
});
$router->add('/categories/:id', function(string $method, string $id) use ($database) {
    $gateway = new CategoryModel($database);
    $controller = new CategoryController($gateway);
    $controller->processRequest($method, $id);
});

// /worldcups - RUTAS ESPECÍFICAS PRIMERO
// ruta especial para obtener solo los años de mundiales
$router->add('/worldcups/years', function(string $method) use ($database) {
    $gateway = new WorldCupModel($database);
    $controller = new WorldCupController($gateway);
    $controller->processRequest($method);
});

// ruta especial para obtener datos del slider
$router->add('/worldcups/slider', function(string $method) use ($database) {
    $gateway = new WorldCupModel($database);
    $controller = new WorldCupController($gateway);
    $controller->processRequest($method);
});

// /worldcups - RUTAS GENERALES DESPUÉS  
$router->add('/worldcups', function(string $method, ?string $id = null) use ($database) {
    $gateway = new WorldCupModel($database);
    $controller = new WorldCupController($gateway);
    $controller->processRequest($method, $id);
});
$router->add('/worldcups/:id', function(string $method, string $id) use ($database) {
    $gateway = new WorldCupModel($database);
    $controller = new WorldCupController($gateway);
    $controller->processRequest($method, $id);
});

// /posts 
$router->add('/posts', function(string $method, ?string $id = null) use ($database) {
    $gateway = new PostModel($database);
    $controller = new PostController($gateway);
    $controller->processRequest($method, $id);
});
$router->add('/posts/:id', function(string $method, string $id) use ($database) {
    $gateway = new PostModel($database);
    $controller = new PostController($gateway);
    $controller->processRequest($method, $id);
});

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
$router->add('/logout', function() use ($renderView) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    session_unset();
    session_destroy();
    
    $renderView('logout.php');
});
$router->add('/admin/login', function(...$args) use ($renderView, $database) {
    AuthMiddleware::clearSessionOnLogin();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $gateway = new AdminModel($database);
        $controller = new AdminController($gateway);
        $controller->login();
    } else {
        $renderView('logIn.php');
    }
});

////////////////////////////////////////////////////////////////
// RUTAS PARA ADMIN /////////////////////////////////////////////
////////////////////////////////////////////////////////////////
$router->add('/admin', function() use ($renderView) {
    AuthMiddleware::requireAdmin();
    $renderView('adminMundials.php');
});
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



// Disparar el router con la URI actual
$router->dispatch($_SERVER['REQUEST_URI']);