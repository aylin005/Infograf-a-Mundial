<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> Starmates | 1934 </title>
        <link rel = "icon" href="/media/miniLogoW.png"> <!--logo-->
        <link rel="stylesheet" href="/css/main.css">
        <link rel="stylesheet" href="/css/home.css">
        <link rel="stylesheet" href="/css/mundial.css">
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
        <div id="main" class="row">
            <main class="col-12 col-md-9">
                <div class="row setHeight75px">
                    <div class="col-2 d-flex align-items-center">
                        <button id="beforeMundial" onclick="location.href='/'" type="button" class="moveButton beforeButton shadow">
                            <i class="bi bi-arrow-left-square"></i> 1930
                        </button>
                    </div>
                    <div class="col-8 d-flex align-items-center">
                        <button id="seeMundials" onclick="location.href='/'" type="button" class="moveButton middleButton shadow">
                            Cronología de los mundiales
                        </button>
                    </div>
                    <div class="col-2 d-flex align-items-center">
                        <button id="afterMundial" onclick="location.href='/'" type="button" class="moveButton afterButton shadow">
                            1938 <i class="bi bi-arrow-right-square"></i>
                        </button>
                    </div>
                </div>
                <div class="mundialDisplay">
                    <div class="row">
                        <div class="col-2">
                            <img id="mundialLogo" src="/media/Mundiales/1934/PageContent/2.jpg" class="mundialLogo img-fluid">
                        </div>
                        <div class="col-10">
                            <div class="row setHeight50px">
                                <h1 id="mundialYear" class="mundialYear textShadow">1934</h1>
                                <h2 id="mundialCountries" class="mundialCountrys textShadow">Italia</h2>
                            </div>
                        </div>
                    </div>
                    <hr class="whiteGreyText">
                    <h3 id="mundialSlogan" class="mundialSlogan textLeft textShadow">El trofeo bajo la sombra de un ideal</h3>

                    <div class="container-fluid">
                        <div class="row align-items-start">
                            <div class="col-8 textDisplay">
                                <p id="mundialDescription" class="description">La II Copa Mundial de Fútbol se desarrolló en Italia entre el 27 de mayo y el 10 de junio de 1934. <br>Para este torneo treinta y cuatro asociaciones solicitaron participar, por lo que esta vez se realizaron eliminatorias para determinar las dieciséis selecciones participantes. Sólo participaron cuatro seleccionados no europeos: Argentina, Brasil, Estados Unidos y Egipto, que fue la primer selección africana en participar del certamen. <br> Como protesta al boicot del torneo anterior, Uruguay se negó a participar y se convirtió en el único equipo campeón que no ha defendido su título. <br>En esta edición el torneo sufriría un cambio de formato, se sutituyó la fase de grupos por dos fases de eliminación directa. Los partidos se definirían en 90 minutos, con una prórroga en caso de empate. Si el partido continuaba empatado luego de los 120 minutos, se jugaba un partido revancha en lugar de una definición por penales.</p>
                                <hr class="whiteGreyText">
                                <div class="w-100 mundialWinner noMargin">
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-trophy trophyIcon"></i>
                                        <h4 class="infoTitle">Selección ganadora</h4>
                                    </div>
                                    <div class="d-flex align-items-center addLeftMargin">
                                        <img id="mundialWinnerFlag" class="mundialWinnerFlag" src="/media/Flags/Italia-Emoji.png">
                                        <p id="mundialWinnerName" class="mundialWinnerName" >Italia</p>
                                    </div>
                                </div>
                                <hr class="whiteGreyText">
                                <div class="card bg-dark m-2" data-bs-theme="dark">
                                    <div class="card-header">
                                        <h4 class="infoTitle"> &#9734 ¿Sabías qué?</h4>
                                    </div>
                                    <div class="card-body">
                                        <figure>
                                            <blockquote class="blockquote"><p id="mundialFunFact">Austria fue el equipo revelación del torneo. Los austríacos contaban con un gran equipo encabezado por Matthias Sindelar, apodado “el Mozart del fútbol”. </p></blockquote>
                                        </figure>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="card bg-dark m-2" data-bs-theme="dark">
                                    <div class="card-header noMargin noPadding">
                                        <img id="mundialPrincipalImage" class="mundialPrincipalImage m-3 shadow img-fluid" src="/media/Mundiales/1934/PageContent/4.jpg">
                                    </div>
                                    <div class="card-body">
                                        <figure>
                                            <blockquote class="blockquote"><p id="mundialPrincipalSubtitle" class="smallerText">Italia 1934: El torneo se celebró bajo el régimen fascista de Benito Mussolini en Italia, y se utilizó como herramienta de propaganda para fortalecer la imagen del fascismo</p></blockquote>
                                        </figure>
                                    </div>
                                </div>
                            </div>
                            <hr class="whiteGreyText">
                            <h4 class="infoTitle noMargin m-4 addLeftMargin">Anexos</h4>
                            <div id="mediaContainer" class="d-flex mediaContainer">
                                <img id="mundialMedia" src="/media/Mundiales/1934/PageContent/1.png" class="mundialMedia" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Balón del mundial 1934" >
                                <img id="mundialMedia" src="/media/Mundiales/1934/PageContent/2.png" class="mundialMedia" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Italia vs Checoslovaquia">
                                <img id="mundialMedia" src="/media/Mundiales/1934/PageContent/3.png" class="mundialMedia" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="La victoria de Italia fue mediática">
                                <img id="mundialMedia" src="/media/Mundiales/1934/PageContent/2.jpg" class="mundialMedia"  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Logo del mundial">
                                <img id="mundialMedia" src="/media/Mundiales/1934/PageContent/3.jpg" class="mundialMedia"  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Suecia vs Alemania">
                            </div>
                        </div>
                        <!-- ------------------------------------------------------------------------------------------ -->
                        <hr class="whiteGreyText">
                        <h2 class="textShadow textLeft addPading0x5x pageSubtitle m-4">También podría interesarte...</h1>
                        <div id="container4Post" class="container4Post"></div>
                    </div>
                </div>
            </main>
            <aside class="col-md-3 bg-dark border-start asideContainer noPadding" data-bs-theme="dark">
                <h1 class="addPading6x pageSubtitle m-4"> El top &#9734</h1>
                <hr class="whiteGreyText">
                <div id="previewContainer" class="container4Post"></div>
            </aside>
        </div>
        <div id="filterContainer"></div>
        <script src="/js/fetchThings/fetchNavBar.js"></script>
        <script src="/js/fetchThings/fetchPreviewPosts.js"></script>
        <script src="/js/fetchThings/fetchCardsPosts.js"></script>
        <script src="/js/tooltip.js"></script>
    </body>
</html>