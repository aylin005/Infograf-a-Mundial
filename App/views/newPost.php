<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> Publicación </title>
        <link rel = "icon" href="/media/miniLogoW.png"> <!--logo-->
        <link rel="stylesheet" href="/CSS/main.css">
        <link rel="stylesheet" href="/CSS/forms.css">
        <link rel="stylesheet" href="/CSS/modular/post.css">
        <link rel="stylesheet" href="/CSS/modular/navBar.css">
        <link rel="stylesheet" href="/CSS/modular/filters.css">
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="/icons/icons-1.13.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="/fonts/Offside/Offside.css">
        <link rel="stylesheet" href="/fonts/Syncopate/Syncopate.css">
        <script src="/bootstrap/js/bootstrap.bundle.min.js"></script>
    </head>
    <body class="defaultBackground noScrollX">
        <header id="navBar-container"></header>
        <main id="main">
            <!--NOTA: Modificar en código para que se intercale entre editar y crear, si es que eso es posible -> SÍ ES POSIBLE, LO CHEQUÉ CON GCW-->
            <!--NOTA: Por si se quiere poner una nota al usuario-->
            <!-- <div class="alert alert-danger m-5" role="alert" data-bs-theme="dark">
                <h4 class="alert-heading syncopate-bold"> ⚠️ A T E N C I Ó N: </h4>
                <p class="mb-0 syncopate-regular">Tu publicación "Recetas con mango" ha sido rechazada por: </p>
                <hr class="noMargin noPadding">
                <p class="offside-regular mb-0">No se cumple con la temática del sitio, editala y vuelve a subirla</p>
            </div> -->
            <br>
            <h1 id="titleDisplay" class="formTitle noPadding">Crear publicación</h1>
            <hr class="whiteGreyText">
            <!--NOTA: Añadir nota para cuando le rechazan la publicación-->
            <div class="container-fluid">
                <div id="newPostContainer" class="shadow">
                    <form action="index.html" method="post" accept-charset="UTF-8" id="addPostForm" enctype="multipart/form-data">
                        <div class="container-fluid">
                            <input id="postTitle" name="postTitle" maxlength="40" class="postFormTitle" placeholder="Ponle un título a tu publicación" autocomplete="off">
                            <div class="row">
                                <!-- NOTA: Apartado para definir categorías/post -->
                                <div class="col-5">
                                    <div class="d-flex align-items-center">
                                        <input type="checkbox" id="isMundial" name="isMundial"> 
                                        <label for="isMundial">Sobre Mundiales</label>
                                        <!--NOTA: Este se debe de activar solo si la opción está seleccionada-->
                                        <select id="selectYear">
                                            <option id="1" name="1">1930</option>
                                            <option id="2" name="2">1934</option>
                                            <option id="3" name="3">1938</option>
                                        </select>
                                    </div>
                                    <!--NOTA: De acuerdo al año que el usuario haya seleccionado, hacer display de las sedes-->
                                    <p id="showCountries" class="whiteGreyText countryDisplay"> Italia</p>
                                    <!---------------------------------------------------------->
                                    <div class="d-flex align-items-center">
                                        <input type="checkbox" id="isSelection" name="isSelection"> 
                                        <label for="isSelection">Sobre selecciones</label>
                                    </div>
                                    <div class="d-flex">
                                        <select id="selectionSelected" class="w-100">
                                            <option id="ca" name="ca">Canadiense</option>
                                            <option id="mx" name="mx">Mexicana</option>
                                            <option id="us" name="us">Estadounidense</option>
                                        </select>
                                        <button type="button" id="addCategory" class="noBackground noBorder transparentButton  marginSides5x"><i class="bi bi-plus-square addCatIcon"></i></button>
                                    </div>
                                    <div id="listCategories" name="listCategories" class="previewList">
                                        <div id="addedCategory" name="addedCategory" class="d-flex align-items-center height50x">
                                            <p class="showListElement shadow">Canadiense</p>
                                            <button type="button" class="addButton noBackground noBorder"><i class="bi bi-x-square deleteIcon"></i></button>
                                        </div>
                                    </div>
                                    <!---------------------------------------------------------->
                                    <!--NOTA: Esto de las categorías podría modularse-->
                                    <hr class="whiteGreyText">
                                    <label for="tagSelected">Seleccionar categorías</label>
                                    <div class="d-flex">
                                        <select id="tagSelected" class="w-100">
                                            <option id="cat1" name="cat1">#Jugadas</option>
                                            <option id="cat2" name="cat2">#Entrevistas</option>
                                            <option id="cat3" name="cat3">#Asistentes</option>
                                        </select>
                                        <button type="button" id="addCategory" class="noBackground noBorder transparentButton  marginSides5x"><i class="bi bi-plus-square addCatIcon"></i></button>
                                    </div>
        
                                    <div id="listCategories" name="listCategories" class="previewList">
                                        <div id="addedCategory" name="addedCategory" class="d-flex align-items-center height50x">
                                            <p class="showListElement shadow">#hola</p>
                                            <button type="button" class="addButton noBackground noBorder"><i class="bi bi-x-square deleteIcon"></i></button>
                                        </div>
                                    </div>
                                    <br>
                                </div>
                                <!-- NOTA: Apartado para descripción -->
                                <div class="col-7 border-start">
                                    <textarea class="postContent" placeholder="Comparte algo con el mundo" autocomplete="off" required></textarea>
                                </div>
                                <hr>
                                <!-- NOTA: Apartado para la media -->
                                <h2 id="importantText" class="textLeft aliceblueText m-4">Selecciona la media que desees compartir</h2>
                                <div class="d-flex align-items-center w-100">
                                    <label for="mundialPhoto" class="d-flex justify-content-center align-items-center">
                                        <i class="bi bi-upload btn"></i>
                                    </label>
                                    <!-- NOTA:Añadir scroll en x -->
                                    <div id="mediaContainer" class="w-100 mediaContainer">
                                        <div id="displayMediaImg" class="displayMediaImg">
                                            <img src="/media/pruebas/Roblox-Wallpapers-Desktop.jpg" class="showImage">
                                            <i class="bi bi-zoom-in zoomIcon"></i>
                                        </div>
                                        <div id="displayMediaVideo" class="displayMediaVideo">
                                            <video src="/media/Mundiales/1986/Publications/1.mp4" class="showVideo" controls>
                                                <i class="bi bi-zoom-in"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <input type="file" id="mundialPhoto" name="mundialPhoto" accept="image/*" autocomplete="off" class="hideThing">
                            </div>
                        <br><br>
                        <div class="d-flex justify-content-center align-items-center helperContainer">
                            <button type="button" id="discardPost" class="btn m-4 largeText">Descartar</button>
                            <button type="submit" id="postPost" class="btn m-4 largeText">Publicar</button>
                        </div>
                    </form>
                </div>
                <br><br>
            </div>
        </main>
        <div id="filterContainer"></div>
        <script src="/js/newPost.js"></script>
        <script src="/js/fetchThings/fetchNavBar.js"></script>
        <script src="/js/tooltip.js"></script>
    </body>
</html>