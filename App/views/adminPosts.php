<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> Gestión de publicaciones y comentarios | A D M I N </title>
        <link rel = "icon" href="/media/miniLogoW.png"> <!--logo-->
        <link rel="stylesheet" href="/css/main.css">
        <link rel="stylesheet" href="/css/admin.css">
        <link rel="stylesheet" href="/css/modular/post.css">
        <link rel="stylesheet" href="/css/modular/navBar.css">
        <link rel="stylesheet" href="/css/modular/filters.css">
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="/icons/icons-1.13.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="/fonts/Offside/Offside.css">
        <link rel="stylesheet" href="/fonts/Syncopate/Syncopate.css">
        <script src="/bootstrap/js/bootstrap.bundle.min.js"></script>
    </head>
    <body class="defaultBackground noScrollX">
        <header id="navBar-container"></header>
        <div class="container-fluid noPadding">
            <div class="row w-100">
               <aside class="col-2 bg-dark border-end noPadding">
                    <a href="/adminPosts"><p class="asideOptions">Gestión de publicaciones y comentarios</p></a>
                    <hr>
                    <a href="/addCategory"><p class="asideOptions">Crear categorías</p></a>
                    <hr>
                    <a href="/adminMundials"><p class="asideOptions">Administrar mundiales</p></a>
                    <hr>
                    <button onclick="location.href='/'" class="exitButton">Salir del modo admin</button>
                </aside>
                <main class="col-10">
                    <h1 class="pageTitle">Gestión de publicaciones y comentarios</h1>
                    <hr class="whiteGreyText">
                    <!--NOTA: a este switch solo se le tendría que leer si está en la opción de prendido o apagado con el js, o eso leí-->
                    <div class="form-check form-switch d-flex justify-content-end align-items-center m-4">
                        <input class="form-check-input" type="checkbox" role="switch" id="switchCheckDefault">
                        <label class="form-check-label whiteGreyText offside-regular addPaddingRight" for="switchCheckDefault">Ordenar por antigüedad</label>
                    </div>
                    
                    <!-- Container for dynamic posts loaded via JavaScript -->
                    <div id="postsContainer">
                        <!-- Posts will be loaded here dynamically -->
                    </div>
                </main>
            </div>
                
        <script src="/js/fetchThings/fetchNavBar.js"></script>
        <script src="/js/filters.js"></script>
        <script src="/js/tooltip.js"></script>
        <script src="/js/adminPosts.js"></script>
    </body>
</html>