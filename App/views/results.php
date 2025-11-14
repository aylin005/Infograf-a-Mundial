<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> Publicaciones | Resultados </title>
         <link rel = "icon" href="/media/miniLogoW.png"> <!--logo-->
        <link rel="stylesheet" href="/css/main.css">
        <link rel="stylesheet" href="/css/home.css">
        <link rel="stylesheet" href="/css/modular/navBar.css">
        <link rel="stylesheet" href="/css/modular/cardPost.css">
        <link rel="stylesheet" href="/css/modular/previewPost.css">
        <link rel="stylesheet" href="/css/modular/filters.css">
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="/icons/icons-1.13.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="/fonts/Offside/Offside.css">
        <link rel="stylesheet" href="/fonts/Syncopate/Syncopate.css">
        <script src="/bootstrap/js/bootstrap.bundle.min.js"></script>
    </head>
    <body class="defaultBackground">
        <div id="navBar-container"></div>
        <main id="main" class="container-fluid noPadding">
            <div class="row">
                <main class="col-9">
                    <br>
                    <p id="totalResults" class="whiteGreyText text-center offside-regular smallerText italicText">Se encontraron [250] resultados relacionados a tu búsqueda</p>
                    <hr class="whiteGreyText">
                    <div id="container4Post" class="container4Post"></div>
                </main>
                <aside class="col-md-3 bg-dark border-start asideContainer noPadding" data-bs-theme="dark">
                    <h1 class="addPading6x pageSubtitle m-4"> El top &#9734</h1>
                    <hr class="whiteGreyText">
                    <div id="previewContainer" class="container4Post"></div>
                </aside>
            </div>
        </main>
        <div id="filterContainer"></div>
        <script src="/js/fetchThings/fetchNavBar.js"></script>
        <script src="/js/filters.js"></script>
        <script src="/js/fetchThings/fetchPreviewPosts.js"></script>
        <script src="/js/fetchThings/fetchCardsPosts.js"></script>
        <script src="/js/tooltip.js"></script>
    </body>
</body>
</html>