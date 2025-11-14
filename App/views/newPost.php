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
                    <form action="#" method="post" accept-charset="UTF-8" id="addPostForm" enctype="multipart/form-data">
                        <div class="container-fluid">
                            <input id="postTitle" name="postTitle" maxlength="40" class="postFormTitle" placeholder="Ponle un título a tu publicación" autocomplete="off" required>
                            <div class="row">
                                <!-- NOTA: Apartado para definir categorías/post -->
                                <div class="col-5">
                                    <div class="d-flex align-items-center">
                                        <label for="selectYear">Sobre Mundiales</label>
                                        <select id="selectYear" name="selectYear" required>
                                            <option value="">Selecciona un mundial</option>
                                        </select>
                                    </div>
                                    <!--NOTA: De acuerdo al año que el usuario haya seleccionado, hacer display del nombre de mundial-->
                                    <p id="showCountries" class="whiteGreyText countryDisplay">Selecciona un mundial</p>
                                    <!---------------------------------------------------------->
                                    <div class="d-flex align-items-center">
                                        <input type="checkbox" id="isSelection" name="isSelection"> 
                                        <label for="isSelection">Sobre selecciones</label>
                                    </div>
                                    <div class="d-flex">
                                        <select id="selectionSelected" class="w-100">
                                            <option value="">Selecciona una selección</option>
                                        </select>
                                        <button type="button" id="addSelection" class="noBackground noBorder transparentButton marginSides5x"><i class="bi bi-plus-square addCatIcon"></i></button>
                                    </div>
                                    <div id="listSelections" name="listSelections" class="previewList">
                                        <!-- selecciones se agregaran dinamicamente aqui -->
                                    </div>
                                    <!---------------------------------------------------------->
                                    <!--NOTA: Esto de las categorías podría modularse-->
                                    <hr class="whiteGreyText">
                                    <label for="tagSelected">Seleccionar categorías</label>
                                    <div class="d-flex">
                                        <select id="tagSelected" class="w-100">
                                            <option value="">Cargando categorías...</option>
                                        </select>
                                        <button type="button" id="addCategory" class="noBackground noBorder transparentButton marginSides5x"><i class="bi bi-plus-square addCatIcon"></i></button>
                                    </div>
        
                                    <div id="listCategories" name="listCategories" class="previewList">
                                        <!-- categorias se agregaran dinamicamente aqui -->
                                    </div>
                                    <br>
                                </div>
                                <!-- NOTA: Apartado para descripción -->
                                <div class="col-7 border-start">
                                    <textarea id="postContent" name="postContent" class="postContent" placeholder="Comparte algo con el mundo" autocomplete="off" required></textarea>
                                </div>
                                <hr>
                                <!-- NOTA: Apartado para la media -->
                                <h2 id="importantText" class="textLeft aliceblueText m-4">Selecciona la media que desees compartir</h2>
                                <div class="d-flex align-items-center w-100">
                                    <label for="mediaFiles" class="d-flex justify-content-center align-items-center">
                                        <i class="bi bi-upload btn"></i>
                                    </label>
                                    <!-- Container para preview horizontal de medios -->
                                    <div id="mediaContainer" class="w-100 mediaContainer d-flex overflow-auto">
                                        <!-- Los archivos seleccionados aparecerán aquí -->
                                    </div>
                                </div>
                            <input type="file" id="mediaFiles" name="mediaFiles[]" accept="image/*,video/*" multiple autocomplete="off" class="hideThing">
                            </div>
                        <br><br>
                        <p id="custom-alert-message" class="text-center fadeUp" style="min-height: 20px;"></p>
                        <div id="newpost-spinner" class="spinner" style="display: none;"></div>
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
        <script src="/js/navBar.js"></script>
        <script src="/js/filters.js"></script>
        <script src="/js/tooltip.js"></script>
    </body>
</html>