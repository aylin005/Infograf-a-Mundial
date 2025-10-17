<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> Administrar mundiales | A D M I N </title>
        <link rel = "icon" href="/media/miniLogoW.png"> <!--logo-->
        <link rel="stylesheet" href="/css/main.css">
        <link rel="stylesheet" href="/css/admin.css">
        <link rel="stylesheet" href="/css/mundial.css">
        <link rel="stylesheet" href="/css/forms.css">
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
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-10">
                                <h1 class="pageTitle">Cronología de mundiales</h1>
                            </div>
                            <div class="col-2 d-flex align-items-center">
                                <!-- NOTA: Si está editando, mostrar modal de confirmación, si no, llamar a función que limpie los inputs para evitar recargar la página -->
                                <button id="addMundialButton" type="button" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Añadir mundial" class="addButton">
                                    <i class="bi bi-plus-square addIcon scaleIcon"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <br><br><br>
                    <div class="mundialContainer">
                        <div id="displayMundials" class="displayMundial">
                            <div class="container-fluid noPadding">
                                <div class="row defineHeightRow">
                                    <div class="col-1 d-flex align-items-center justify-content-center">
                                        <i id="moveLeft" class="bi bi-arrow-left-square-fill arrow"></i>
                                    </div>
                                    <div class="col-10">
                                        <div class="timeline">
                                            <hr class="timelineLine">
                                            <div class="buttonContainer d-flex align-items-center">
                                                <button id="timelineButton1" class="timelineButton shadow">1930</button>
                                                <button id="timelineButton2" class="timelineButton shadow">1934</button>
                                                <button id="timelineButton2" class="timelineButton shadow">1938</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-1 d-flex align-items-center justify-content-center">
                                        <i id="moveRight" class="bi bi-arrow-right-square-fill arrow"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <br><br>
                        <hr class="whiteGreyText">
                        <!-- ----------------------------------------------------------------------------- -->
                        <form action="/adminMundials" method="post" id="addMundialForm" enctype="multipart/form-data" class="noPadding noMargin noBackground">
                            <div class="mundialDisplay">
                                <div class="container-fluid">
                                    <div class="row">
                                        <div class="col-2">
                                            <p class="instruction">Sube un logo aquí</p>
                                            <img id="logo" name="logo" src="/media/userPhoto.png" class="img-fluid formLogo shadow-lg" alt="Foto del mundial">
                                            <input type="file" id="mundialLogo" name="mundialLogo" accept="image/*" class="hideThing" autocomplete="off" required>
                                            <label for="mundialLogo" class="d-flex justify-content-center">
                                                <i class="bi bi-upload btn"></i>
                                            </label>
                                        </div>
                                        <div class="col-10">
                                            <div class="container-fluid">
                                                <div class="row height50x">
                                                    <div class="col-4">
                                                        <input id="mundialYear" name="mundialYear" type="number" maxlength="4" class="selectYear shadow" placeholder="Ingresa el año">
                                                    </div>
                                                    <div class="col-7">
                                                        <div class="d-flex">
                                                            <img id="miniFlag" class="miniFlag">
                                                            <select id="countrySelect" class="selectCountry" required>
                                                                <option id="flag-Can" name="flag-Can" data-image="/media/Flags/Canada-Emoji.png" class="selectOpt">Canadá</option>
                                                                <option id="flag-Mex" name="flag-Mex" data-image="/media/Flags/Mexico-Emoji.png" class="selectOpt">México</option>
                                                                <option id="flag-EU" name="flag-EU" data-image="/media/Flags/US-Emoji.png" class="selectOpt">Estados Unidos</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="col-1">
                                                        <button type="button" class="addButton">
                                                            <i class="bi bi-plus-square addCatIcon"></i>
                                                        </button>
                                                    </div>
                                                    <h2 class="mediumText whiteGreyText"> &nbsp Sedes seleccionadas:</h2>
                                                    <div id="previewCountries" class="previewList">
                                                        <div id="addedCountry" class="d-flex align-items-center height50x">
                                                            <p id="mundialCountries" class="showListElement shadow"> Uruguay</p>
                                                            <button type="button" class="addButton"><i class="bi bi-x-square deleteIcon"></i></button>
                                                        </div>
                                                    </div>
                                                    <input id="mundialSlogan" class="sloganInput shadow" placeholder="Ingresa una frase corta aquí">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <br><br>
                                <div class="container-fluid">
                                    <div class="row">
                                        <div class="col-8">
                                            <textarea id="generalDescription" name="generalDescription" class="description setHeight500px scrollOnY" placeholder="Escribe la información general aquí"></textarea>
                                            <div class="w-100 mundialWinner noMargin">
                                                <div class="d-flex align-items-center">
                                                    <i class="bi bi-trophy trophyIcon"></i>
                                                    <label for="winnerCountry" class="infoTitle aliceblueText">Selección ganadora</label>
                                                </div>
                                                <div class="d-flex m-3">
                                                    <img id="natFlag" class="miniFlag">
                                                    <select id="nationalitySelect" class="selectCountry" required>
                                                        <option id="flag-Can" name="flag-Can" data-image="/media/Flags/Canada-Emoji.png" class="selectOpt">Canadá</option>
                                                        <option id="flag-Mex" name="flag-Mex" data-image="/media/Flags/Mexico-Emoji.png" class="selectOpt">México</option>
                                                        <option id="flag-EU" name="flag-EU" data-image="/media/Flags/US-Emoji.png" class="selectOpt">Estados Unidos</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="invalid-feedback">
                                                [!] Necesita llenar este campo.
                                            </div>
    
                                            <!-- ----------------------------------------------------------------------------- -->
    
                                            <hr class="whiteGreyText">
                                            <div class="card bg-dark" data-bs-theme="dark">
                                                <div class="card-header">
                                                    <h4 class="infoTitle"> &#9734 ¿Sabías qué?</h4>
                                                </div>
                                                <div class="card-body">
                                                    <figure>
                                                        <textarea class="w-100 noBackground noBorder m-2 offside-regular" placeholder="Añade algo importante aquí"></textarea>
                                                    </figure>
                                                </div>
                                            </div>
                                            <hr class="whiteGreyText">
                                            <!-- ----------------------------------------------------------------------------- -->
                                            <h4 class="infoTitle noMargin m-4">Anexos</h4>
                                            <div class="container-fluid">
                                                <div class="row">
                                                    <div class="col-1">
                                                        <input type="file" id="mundialPhoto" name="mundialPhoto" accept="image/*" autocomplete="off" hidden>
                                                        <label for="mundialPhoto" class="d-flex justify-content-center align-items-center addTop5x">
                                                            <i class="bi bi-upload btn"></i>
                                                        </label>
                                                    </div>
                                                    <div class="col-10">
                                                        <input type="text" id="tooltip" name="tooltip" placeholder="Ingresa una descripción para el anexo" class="addTooltip"></input>
                                                    </div>
                                                    <div class="col-1">
                                                        <button type="button" class="addButton">
                                                            <i class="bi bi-plus-square addCatIcon"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
    
                                            <div class="d-flex">
                                            </div>
                                            <div class="imageContainer">
                                                <div class="previewInfoImage">
                                                    <img id="logo" src="/media/userPhoto.png" class="img-fluid mundialImage shadow-lg">
                                                    <button class="noBackground noBorder"><i class="bi bi-x-square-fill quitIcon"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="card adjustCard bg-dark" data-bs-theme="dark">
                                                <div class="card-header noMargin noPadding">
                                                    <img id="mundialPrincipalImage" class="mundialPrincipalImage m-3 shadow img-fluid centerTextNImages" src="/media/userPhoto.png">
                                                    <input type="file" id="mundialPrincipalPhoto" name="mundialPrincipalPhoto" accept="image/*" autocomplete="off" hidden required>
                                                        <label for="mundialPrincipalPhoto" class="d-flex justify-content-center align-items-center">
                                                            <i class="bi bi-upload btn"></i>
                                                        </label>
                                                    <br>
                                                </div>
                                                <div class="card-body">
                                                    <textarea class="w-100 m-2 offside-regular noBackground noBorder smallerText" placeholder="Añade algo importante aquí" autocomplete="off"></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                </div>
                                <div class="d-flex justify-content-center align-items-center helperContainer">
                                    <button type="button" id="cancelBtn" class="btn p-2 m-4">Cancelar</button>
                                    <button type="submit" id="submitBtn" class="btn p-2 m-4">Guardar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
        <script src="/js/scripts.js"></script>
        <script src="/js/fetchThings/fetchNavBar.js"></script>
        <script src="/js/tooltip.js"></script>
        <script src="/js/mundial.js"></script>
        <script src="/js/addMundial.js"></script>
    </body>
</html>