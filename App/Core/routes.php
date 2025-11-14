<?php 
use App\Core\Router;
require_once __DIR__ . '/helpers.php';
use App\Core\Database;
use App\Models\UserModel;
use App\Models\AdminModel;
use App\Models\CategoryModel;
use App\Models\WorldCupModel;
use App\Models\PostModel;
use App\Models\MultimediaModel;
use App\Models\CommentModel;
use App\Controllers\UserController;
use App\Controllers\AdminController;
use App\Controllers\CategoryController;
use App\Controllers\WorldCupController;
use App\Controllers\PostController;
use App\Controllers\CommentController;
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

// /users/current - obtener usuario actual de la sesión (DEBE IR ANTES de /users/:id)
$router->add('/users/current', function(string $method) use ($database) {
    $gateway = new UserModel($database);
    $controller = new UserController($gateway);
    $controller->getCurrentUser();
});

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

// /multimedia/image/:id - Servir imágenes multimedia
$router->add('/multimedia/image/:id', function(string $method, string $id) use ($database) {
    if ($method !== 'GET') {
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $multimediaModel = new MultimediaModel($database);
    $imageData = $multimediaModel->getImageBlob((int)$id);
    
    if ($imageData && !empty($imageData['image'])) {
        // Determinar tipo MIME desde los datos binarios
        $imageInfo = getimagesizefromstring($imageData['image']);
        $contentType = $imageInfo['mime'] ?? 'image/jpeg'; // default
        
        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . strlen($imageData['image']));
        header('Cache-Control: public, max-age=3600'); // Cache por 1 hora
        echo $imageData['image'];
    } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Image not found']);
    }
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

// /posts/search - búsqueda avanzada de posts 
$router->add('/posts/search', function(string $method) use ($database) {
    $gateway = new PostModel($database);
    $controller = new PostController($gateway, $database);
    $controller->searchPosts($method);
});

// /posts/vote - votar en un post
$router->add('/posts/vote', function(string $method) use ($database) {
    $gateway = new PostModel($database);
    $controller = new PostController($gateway, $database);
    $controller->votePost();
});

// /posts/comments - obtener comentarios de un post
$router->add('/posts/comments', function(string $method) use ($database) {
    $gateway = new PostModel($database);
    $controller = new PostController($gateway, $database);
    $controller->getComments();
});

// /posts 
$router->add('/posts', function(string $method, ?string $id = null) use ($database) {
    $gateway = new PostModel($database);
    $controller = new PostController($gateway, $database);
    $controller->processRequest($method, $id);
});
$router->add('/posts/:id', function(string $method, string $id) use ($database) {
    $gateway = new PostModel($database);
    $controller = new PostController($gateway, $database);
    $controller->processRequest($method, $id);
});

// /comments - crear comentario (POST)
$router->add('/comments', function(string $method) use ($database) {
    $gateway = new CommentModel($database);
    $controller = new CommentController($gateway);
    $controller->processRequest($method);
});

// /comments/like - toggle like en comentario (POST)
$router->add('/comments/like', function(string $method) use ($database) {
    $gateway = new CommentModel($database);
    $controller = new CommentController($gateway);
    $controller->toggleLike();
});

// /comments/:id - eliminar comentario (DELETE)
$router->add('/comments/:id', function(string $method, string $id) use ($database) {
    $gateway = new CommentModel($database);
    $controller = new CommentController($gateway);
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

// ruta para obtener posts pendientes (solo admin)
$router->add('/pendingPosts', function(string $method) use ($database) {
    AuthMiddleware::requireAdmin();
    $gateway = new PostModel($database);
    $controller = new PostController($gateway, $database);
    $controller->getPendingPosts($method);
});



// Disparar el router con la URI actual
$router->dispatch($_SERVER['REQUEST_URI']);