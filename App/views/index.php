<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> Starmates | Home </title>
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
    <body class="defaultBackground noScrollX">
        <header id="navBar-container"></header>
        <main id="main" class="container-fluid ignoreThis">
            <div class="row">
                <div class="col-12 col-md-9">
                    <h1 class="pageTitle aliceblueText">La cronología del hito deportivo</h1>
                    <div id="mundialSlider" class="carousel slide addPadding0x5x" data-ride="carousel" data-bs-ride="true">
                        <div id="carousel-inner" class="carousel-inner">
                            <div id="carousel-indicators" class="carousel-indicators"></div>
                        </div>
                        <!--////////////////////////////////////////////////////////////////////////////////////-->
                        <button class="carousel-control-prev" type="button" data-bs-target="#mundialSlider" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previo</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#mundialSlider" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Siguiente</span>
                        </button>
                    </div>
                    <!--////////////////////////////////////////////////////////////////////////////////////-->
                    <hr class="whiteGreyText">
                    <!--NOTA: display central de publicaciones-->
                    <h2 class="textShadow textLeft addPading0x5x pageSubtitle m-4">Mantente al día</h2>
                    <div id="container4Post" class="container4Post"></div>
                </div>
                <!--////////////////////////////////////////////////////////////////////////////////////-->
                <aside class="col-md-3 bg-dark border-start asideContainer noPadding" data-bs-theme="dark">
                    <h1 class="addPading6x pageSubtitle m-4"> El top &#9734</h1>
                    <hr class="whiteGreyText">
                    <div id="previewContainer" class="container4Post"></div>
                </aside>
            </div>
            <!--////////////////////////////////////////////////////////////////////////////////////-->
        </main>
        <div id="filterContainer"></div>
        <script src="/js/fetchThings/fetchNavBar.js"></script>
        <script src="/js/fetchThings/fetchCardsPosts.js"></script>
        <script src="/js/fetchThings/fetchPreviewPosts.js"></script>
        <script src="/js/home.js"></script>
    </body>
</html>
