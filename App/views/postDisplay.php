<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale = 1.0">
    <title> Home | Publicación </title>
    <link rel = "icon" href="/media/miniLogoW.png"> <!--logo-->
    <link rel="stylesheet" href="/CSS/main.css">
    <link rel="stylesheet" href="/CSS/modular/post.css">
    <link rel="stylesheet" href="/CSS/modular/navBar.css">
    <link rel="stylesheet" href="/CSS/modular/filters.css">
    <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="/icons/icons-1.13.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="/fonts/Offside/Offside.css">
    <link rel="stylesheet" href="/fonts/Syncopate/Syncopate.css">
    <script src="/bootstrap/js/bootstrap.bundle.min.js"></script>
</head>

<body class="defaultBackground">
    <header id="navBar-container"></header>
    <main id="main">
        <div class="container-fluid">
            <br>
            <button onclick="location.href='/'" id="goBackButton" type="button"><i class="bi bi-arrow-left-square m-1"></i>Regresar</button>
            <div id="publication" class="publication">
                <div class="container-fluid noPadding">
                    <div class="row w-100">
                        <div class="col-1 col-sm-1">
                            <img id="postUserPhoto" class="postUserPhoto img-fluid" src="/media/pruebas/270 sin título_20240830204638.png">
                        </div>
                        <div class="col-4 col-sm-7">
                            <p id="postUsername" class="postUsername img-fluid"> @itsie</p>
                            <p id="datePosted" class="postData"> <i class="bi bi-clock"></i> 21-04-06</p>
                            <p id="dateEdited" class="postData"> <i class="bi bi-pencil-square"></i> 22-04-06</p>
                        </div>
                        <div class="col-7 col-sm-4">
                            <div class="d-flex align-items-center justify-content-center">
                                <div class="d-flex showCalif">
                                    <button id="goodVoteButton" class="noBackground noBorder transparentButton"><i class="bi bi-arrow-up-square m-1 goodVoteIcon"></i></button> 
                                    <p id="goodVote" class="syncopate-regular m-2">4M</p>
                                </div>
                                <div class="d-flex showCalif">
                                    <button id="badVoteButton" class="noBackground noBorder transparentButton"><i class="bi bi-arrow-down-square m-1 badVoteIcon"></i></button>
                                    <p id="badVote" class="syncopate-regular m-2">66</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr class="whiteGreyText">
                <button onClick="location.href='/results'" id="mundialPost"class="posTickets">1986</button>
                <button onClick="location.href='/results'" id="selectionPost" class="posTickets">Selección Argentina</button>
                <h1 id="postTitle" class="postTitle x-largeText">La mejor jugada de Maradona</h1>
                <p id="postDescription" class="postDescription">Yo creo que la mejor jugada fue en el 86, aquí adjunto mispruebas</p>
                <hr class="whiteGreyText noMargin">
                <div id="mediaContainer" class="mediaContainer">
                    <div id="displayMediaVideo" class="displayMediaVideo">
                        <video src="/media/Mundiales/1986/Publications/1.mp4" class="showVideo" controls>
                    </div>
                    <div id="displayMediaImg" class="displayMediaImg">
                        <img src="/media/pruebas/Roblox-Wallpapers-Desktop.jpg" class="showImage">
                        <i class="bi bi-zoom-in zoomIcon"></i>
                    </div>
                </div>
                <div class="row">
                    <div class="col-10">
                        <div id="categoryContainer" class="categoryContainer">
                            <button onClick="location.href='/results'" id="postTag" class="postTagButton">#Goleadas</button>
                                        <button onClick="location.href='/results'" id="postTag" class="postTagButton">#CampeonDelMundo</button>
                        </div>
                    </div>
                    <div class="col-2">
                        <div class="d-flex align-items-center justify-content-center">
                            <button id="editPost" class="noBackground noBorder transparentButton margin7x"><i class="bi bi-share postOptions"></i></button>
                            <!--NOTA: las opciones de abajo solo le aparecen al creador de la publicación-->
                            <button id="editPost" onclick="location.href='/newPost'" class="noBackground noBorder transparentButton margin7x"><i class="bi bi-pencil-square postOptions"></i></button>
                            <button id="deletePost" class="noBackground noBorder transparentButton margin7x"><i class="bi bi-trash postOptions"></i></button>
                        </div>
                    </div>
                </div>
            </div>
    
            <form action="/postDisplay" method="post" id="addComment" accept-charset="UTF-8" class="border-top">
                <textarea id="commentSomething" name="commentSomething" class="commentSomething" placeholder="Comenta algo aquí..."></textarea>
                <div class="d-flex justify-content-end">
                    <button type="submit"class=" btn shadow addMarginRight5x">Publicar</button>
                </div>
                <br>
            </form>
    
            <div id="commentsContainer">
                <div id="comments" class="comments">
                    <div class="container-fluid noPadding">
                        <div class="row w-100">
                            <div class="col-1">
                                <img id="commentUserPhoto" class="postUserPhoto img-fluid" src="/media/pruebas/ll.png">
                            </div>
                            <div class="col-7">
                                <p id="postUsername" class="postUsername"> @cocos</p>
                                <p id="datePosted" class="postData"> <i class="bi bi-clock"></i> 21-04-06</p>
                                <p id="dateEdited" class="postData"> <i class="bi bi-pencil-square"></i> 22-04-06</p>
                            </div>
                            <div class="col-4">
                                <div class="d-flex align-items-center justify-content-center">
                                    <div class="d-flex showCalif">
                                        <button id="goodVoteButton" class="noBackground noBorder transparentButton"><i class="bi bi-arrow-up-square m-1 goodVoteIcon"></i></button>
                                        <p id="goodVote" class="syncopate-regular m-2">69M</p>
                                    </div>
                                    <div class="d-flex showCalif">
                                        <button id="badVoteButton" class="noBackground noBorder transparentButton"><i class="bi bi-arrow-down-square m-1 badVoteIcon"></i></button>
                                        <p id="badVote" class="syncopate-regular m-2">-6</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr class="whiteGreyText">
                    <p id="commentDescription" class="postDescription">No.</p>
                    <hr class="whiteGreyText noMargin">
                    <div class="row">
                        <div class="col-10"></div>
                        <div class="col-2">
                            <div class="d-flex align-items-center justify-content-center">
                                <button id="sharePost" class="noBackground noBorder transparentButton margin7x"><i  class="bi bi-share postOptions"></i></button>
                                <!--NOTA: las opciones de abajo solo le aparecen al creador de la publicación-->
                                <button id="editPost" onclick="location.href='/newPost'" class="noBackground noBorder transparentButton margin7x"><i id="editPost" class="bi bi-pencil-square postOptions"></i></button>
                                <button id="sharePost" class="noBackground noBorder transparentButton margin7x"><i id="deletePost" class="bi bi-trash postOptions"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- --------------------------------------------------------------------- -->
                <form action="/postDisplay" id="replyForm" method="post" class="border-top">
                    <textarea id="replyText" name="replyText" class="commentSomething" placeholder="Comenta algo aquí..."></textarea>
                    <div class="d-flex justify-content-end">
                        <button type="submit"class="btn shadow addMarginRight5x">Publicar</button>
                    </div>
                    <br>
                </form>
                <!-- --------------------------------------------------------------------->
                <!-- --------------------------------------------------------------------->
                <!-- <button>Mostrar comentarios <i class="bi bi-arrow-down-square"></i></button> -->
    
                <div id="replyComment" class="replyComment">
                    <div class="container-fluid noPadding">
                        <div class="row w-100">
                            <div class="col-1">
                                <img id="replyUserPhoto" class="postUserPhoto img-fluid" src="/media/pruebas/momazo.jpg">
                            </div>
                            <div class="col-7">
                                <p id="replyUsername" class="postUsername"> @ye</p>
                                <p id="datePosted" class="postData"> <i class="bi bi-clock"></i> 21-04-06</p>
                                <p id="dateEdited" class="postData"> <i class="bi bi-pencil-square"></i> 22-04-06</p>
                            </div>
                            <div class="col-4">
                                <div class="d-flex align-items-center justify-content-center">
                                    <div class="d-flex showCalif">
                                        <button id="goodVoteButton" class="noBackground noBorder transparentButton margin7x"><i class="bi bi-arrow-up-square m-1 goodVoteIcon"></i></button>
                                        <p id="goodVote" class="syncopate-regular m-2">99M</p>
                                    </div>
                                    <div class="d-flex showCalif">
                                        <button id="badVoteButton" class="noBackground noBorder transparentButton margin7x"><i class="bi bi-arrow-down-square m-1 badVoteIcon"></i></button>
                                        <p id="badVote" class="syncopate-regular m-2">-1</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr class="whiteGreyText">
                    <p id="replyDescription" class="postDescription">IP: 92.28.211.234</p>
                    <hr class="whiteGreyText noMargin">
                    <div class="row">
                        <div class="col-10"></div>
                        <div class="col-2">
                            <div class="d-flex align-items-center justify-content-center">
                                <button id="sharePost" class="noBackground noBorder transparentButton margin7x"><i id="shareReply" class="bi bi-share postOptions"></i></button>
                                <!--NOTA: las opciones de abajo solo le aparecen al creador de la publicación-->
                                <button id="editPost" class="noBackground noBorder transparentButton margin7x"><i id="editReply" class="bi bi-pencil-square postOptions"></i></button>
                                <button id="deletePost" class="noBackground noBorder transparentButton margin7x"><i id="deleteReply" class="bi bi-trash postOptions"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <br>
            </div>
            
        </div>
    </main>
    <div id="filterContainer"></div>
    
    <script src="/js/fetchThings/fetchNavBar.js"></script>
    <script src="/js/tooltip.js"></script>
</body>

</html>