<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> Añadir categorías | A D M I N </title>
        <link rel = "icon" href="/media/miniLogoW.png"> <!--logo-->
        <link rel="stylesheet" href="/css/main.css">
        <link rel="stylesheet" href="/css/admin.css">
        <link rel="stylesheet" href="/css/modular/navBar.css">
        <link rel="stylesheet" href="/css/modular/filters.css">
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="/icons/icons-1.13.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="/fonts/Offside/Offside.css">
        <link rel="stylesheet" href="/fonts/Syncopate/Syncopate.css">
        <script src="/bootstrap/js/bootstrap.bundle.min.js"></script>
    </head>
    <body class="defaultBackground">
        <nav id="navBar-container"></nav>
        <div class="row w-100">
            <aside class="col-2 bg-dark border-end noPadding">
                <a href="adminPosts.html"><p class="asideOptions">Gestión de publicaciones y comentarios</p></a>
                <hr>
                <a href="addCategory.html"><p class="asideOptions">Crear categorías</p></a>
                <hr>
                <a href="adminMundials.html"><p class="asideOptions">Administrar mundiales</p></a>
                <hr>
                <button onclick="location.href='index.html'" class="exitButton">Salir del modo admin</button>
            </aside>
            <main class="col-10">
                <h1 class="pageTitle">Crear categorías</h1>
                <hr class="whiteGreyText">
                <form id="addCategoryPost" action="addCategory.html" method="post" accept-charset="UTF-8">
                    <div class="d-flex justify-content-center align-items-center">
                        <input id="typeCategory" name="typeCategory" type="text" class="w-80" placeholder="Añade una nueva categoría aquí">
                        <button type="submit" id="addCatButton" class="addCatButton"><i class="bi bi-plus-square addCatIcon x-largeText aliceblueText"></i></button>
                    </div>
                </form>
                <div id="listCategory" name="listCategory" class="w-100">
                    <div id="addedCategory" name="addedCategory" class="categoryDisplay">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-10">
                                    <p id="tagTitle" class="tagTitle">#Asistentes</p>
                                </div>     
                                <div class="col-2">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <button id="editButton" class="noBackground noBorder tagButton"><i class="bi bi-pencil-square"></i></button>
                                        <button id="deleteButton" class="noBackground noBorder  tagButton deleteButton"><i class="bi bi-x-square"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="addedCategory" name="addedCategory" class="categoryDisplay">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-10">
                                    <p id="tagTitle" class="tagTitle">#Polemicas</p>
                                </div>     
                                <div class="col-2">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <button id="editButton" class="noBackground noBorder tagButton"><i class="bi bi-pencil-square"></i></button>
                                        <button id="deleteButton" class="noBackground noBorder  tagButton deleteButton"><i class="bi bi-x-square"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        <script src="/js/fetchThings/fetchNavBar.js"></script>
        <script src="/js/tooltip.js"></script>
    </body>
    </body>
</html>