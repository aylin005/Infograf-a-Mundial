<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> Gestión de publicaciones y comentarios | A D M I N </title>
        <link rel = "icon" href="../../Design/media/miniLogoW.png"> <!--logo-->
        <link rel="stylesheet" href="../../Design/CSS/main.css">
        <link rel="stylesheet" href="../../Design/CSS/admin.css">
        <link rel="stylesheet" href="../../Design/CSS/modular/post.css">
        <link rel="stylesheet" href="../../Design/CSS/modular/navBar.css">
        <link rel="stylesheet" href="../../Design/CSS/modular/filters.css">
        <link rel="stylesheet" href="../../Structure/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="../../Design/icons/icons-1.13.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="../../Design/fonts/Offside/Offside.css">
        <link rel="stylesheet" href="../../Design/fonts/Syncopate/Syncopate.css">
        <script src="../../Structure/bootstrap/js/bootstrap.bundle.min.js"></script>
    </head>
    <body class="defaultBackground noScrollX">
        <header id="navBar-container"></header>
        <div class="container-fluid noPadding">
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
                    <h1 class="pageTitle">Gestión de publicaciones y comentarios</h1>
                    <hr class="whiteGreyText">
                    <!--NOTA: a este switch solo se le tendría que leer si está en la opción de prendido o apagado con el js, o eso leí-->
                    <div class="form-check form-switch d-flex justify-content-end align-items-center m-4">
                        <input class="form-check-input" type="checkbox" role="switch" id="switchCheckDefault">
                        <label class="form-check-label whiteGreyText offside-regular addPaddingRight" for="switchCheckDefault">Ordenar por antigüedad</label>
                    </div>
                    <div id="publication" class="publication">
                        <div class="container-fluid noPadding">
                            <div class="row w-100">
                                <div class="col-1">
                                    <img id="postUserPhoto" class="postUserPhoto img-fluid" src="../../../Design/Design/media/userPhoto.png">
                                </div>
                                <div class="col-7">
                                    <p id="postUsername" class="postUsername"> @itsie</p>
                                    <p id="datePosted" class="postData"> <i class="bi bi-clock"></i> 21-04-06</p>
                                    <p id="dateEdited" class="postData"> <i class="bi bi-pencil-square"></i> 22-04-06</p>
                                </div>
                                <div class="col-4">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <button id="approvedButton" type="button" class="noBorder noBackground adjustButton" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Aprobar"><i class="bi bi-check-square"></i></button>
                                        <button id="deniedButton" type="button" class="noBorder noBackground adjustButton denied"  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Rechazar"><i class="bi bi-x-square"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr class="whiteGreyText">
                        <button onClick="location.href='results.html'" id="mundialPost" class="posTickets" >1986</button>
                        <button onClick="location.href='results.html'" id="selectionPost" class="posTickets" >Selección Argentina</button>
                        <h1 id="postTitle" class="postTitle">La mejor jugada de Maradona</h1>
                        <p id="postDescription" class="postDescription">Yo creo que la mejor jugada fue en el 86, aquí adjunto mis pruebas</p>
                        <hr class="whiteGreyText noMargin">
                        <div id="mediaContainer" class="mediaContainer">
                            <div id="displayMediaImg" class="displayMediaImg">
                                <img src="../../../Design/Design/media/pruebas/Roblox-Wallpapers-Desktop.jpg" class="showImage">
                                <i class="bi bi-zoom-in zoomIcon"></i>
                            </div>
                            <div id="displayMediaVideo" class="displayMediaVideo">
                                <video src="../../../Design/Design/media/Mundiales/1986/Publications/1.mp4" class="showVideo" controls>
                                <i class="bi bi-zoom-in"></i>
                            </div>
                            <div id="displayMediaImg" class="displayMediaImg">
                                <img src="../../../Design/Design/media/pruebas/Roblox-Wallpapers-Desktop.jpg" class="showImage">
                                <i class="bi bi-zoom-in zoomIcon"></i>
                            </div>
                            <div id="displayMediaVideo" class="displayMediaVideo">
                                <video src="../../../Design/Design/media/Mundiales/1986/Publications/1.mp4" class="showVideo" controls>
                                <i class="bi bi-zoom-in"></i>
                            </div>
                            <div id="displayMediaImg" class="displayMediaImg">
                                <img src="../../../Design/Design/media/pruebas/Roblox-Wallpapers-Desktop.jpg" class="showImage">
                                <i class="bi bi-zoom-in zoomIcon"></i>
                            </div>
                            <div id="displayMediaVideo" class="displayMediaVideo">
                                <video src="../../../Design/Design/media/Mundiales/1986/Publications/1.mp4" class="showVideo" controls>
                                <i class="bi bi-zoom-in"></i>
                            </div>
                        </div>
                        <div id="categoryContainer" class="categoryContainer">
                            <button onClick="location.href='results.html'" id="postTag" class="postTagButton" >#Goleadas</button>
                            <button onClick="location.href='results.html'" id="postTag" class="postTagButton" >#CampeonDelMundo</button>
                        </div>
                    </div>
                    
                    <div id="comments" class="publication">
                        <div class="container-fluid noPadding">
                            <div class="row w-100">
                                <div class="col-1">
                                    <img id="postUserPhoto" class="postUserPhoto img-fluid" src="../../../Design/Design/media/userPhoto.png">
                                </div>
                                <div class="col-7">
                                    <p id="postUsername" class="postUsername"> @queso-999</p>
                                    <p id="datePosted" class="postData"> <i class="bi bi-clock"></i> 08-09-2025</p>
                                    <p id="dateEdited" class="postData"> <i class="bi bi-pencil-square"></i> 09-09-2025</p>
                                </div>
                                <div class="col-4">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <button id="approvedButton" type="button" class="noBorder noBackground adjustButton" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Aprobar"><i class="bi bi-check-square"></i></button>
                                        <button id="deniedButton" type="button" class="noBorder noBackground adjustButton denied"  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Rechazar"><i class="bi bi-x-square"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr class="whiteGreyText">
                        <p id="postDescription" class="postDescription">Solo hay dos puntos de vista, el mío y el equivocado</p>
                        <button onclick="location.href='postDisplay.html'" id="ogPost" class="btn d-block mx-auto py-1 shadow smallerText">Ver publicación original</button>
                    </div>
                </main>
            </div>
                
        <script src="../../../Scripts/fetchThings/fetchNavBar.js"></script>
        <script src="../../../Scripts/tooltip.js"></script>
    </body>
    </body>
</html>