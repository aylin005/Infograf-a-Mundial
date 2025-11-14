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
            <div class="row">
                <div class="col-sm-7 col">
                    <div id="publication" class="publication">
                        <div class="container-fluid noPadding">
                            <div class="row w-100">
                                <div class="col-1 col-sm-2">
                                    <img id="postUserPhoto" class="postUserPhoto img-fluid" src="/media/userPhoto.png">
                                </div>
                                <div class="col-4 col-sm-7">
                                    <p id="postUsername" class="postUsername img-fluid">@usuario</p>
                                    <p id="datePosted" class="postData"><i class="bi bi-clock"></i> --/--/--</p>
                                    <p id="dateEdited" class="postData"><i class="bi bi-pencil-square"></i> --/--/--</p>
                                </div>
                                <div class="col-7 col-sm-3">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <div id="goodVoteButton" class="d-flex showCalif">
                                            <button class="noBackground noBorder transparentButton"><i class="bi bi-arrow-up-square m-1 goodVoteIcon"></i></button> 
                                            <p id="goodVote" class="syncopate-regular m-2">0</p>
                                        </div>
                                        <div class="d-flex showCalif">
                                            <button id="badVoteButton" class="noBackground noBorder transparentButton"><i class="bi bi-arrow-down-square m-1 badVoteIcon"></i></button>
                                            <p id="badVote" class="syncopate-regular m-2">0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr class="whiteGreyText m-1">
                        <h1 id="postTitle" class="postTitle">Cargando...</h1>
                        <p id="postDescription" class="postDescription">Cargando contenido...</p>
                        <hr class="whiteGreyText noMargin">
                        <div id="mediaContainer" class="mediaContainer">
                            <!-- Multimedia se cargará dinámicamente -->
                        </div>
                        <div class="row">
                            <div class="col-10">
                                <div id="categoryContainer" class="categoryContainer">
                                    <!-- Categorías se cargarán dinámicamente -->
                                </div>
                            </div>
                            <div class="col-2">
                                <div class="d-flex align-items-center justify-content-center">
                                    <button id="sharePost" class="noBackground noBorder transparentButton margin7x"><i class="bi bi-share postOptions"></i></button>
                                    <!--NOTA: las opciones de abajo solo le aparecen al creador de la publicación-->
                                    <button id="editPost" onclick="location.href='/newPost'" class="noBackground noBorder transparentButton margin7x" style="display: none;"><i class="bi bi-pencil-square postOptions"></i></button>
                                    <button id="deletePost" class="noBackground noBorder transparentButton margin7x" style="display: none;"><i class="bi bi-trash postOptions"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-5 col p-3 blackWAlpha25Background activateScrollY height570x">
                    <form action="/postDisplay" method="post" id="addComment" accept-charset="UTF-8">
                        <textarea id="commentSomething" name="commentSomething" class="commentSomething" placeholder="Comenta algo aquí..."></textarea>
                        <div class="d-flex justify-content-end">
                            <button type="submit"class="commentButton small shadow addMarginRight5x">Publicar</button>
                        </div>
                        <br>
                    </form> 
                    <div id="commentsContainer">
                        <div id="comments" class="comments quitMarginBottom">
                            <div class="container-fluid noPadding">
                                <div class="row w-100">
                                    <div class="col-1">
                                        <img id="commentUserPhoto" class="commentUserPhoto img-fluid" src="/media/pruebas/ll.png">
                                    </div>
                                    <div class="col-9">
                                        <p id="postUsername" class="commentUsername"> @cocos</p>
                                        <p id="datePosted" class="commentData"> <i class="bi bi-clock"></i> 21-04-06</p>
                                    </div>
                                    <div class="col-2">
                                        <div class="d-flex align-items-center justify-content-center">
                                            <button id="likePost" class="noBackground transparentButton margin7xLnR noBorder"><i class="bi bi-hand-thumbs-up postOptions"></i></button>
                                            <p class="my-auto p-0 small whiteGreyText">123</p>
                                        </div>
                                        <!-- <i class="bi bi-hand-thumbs-up-fill"></i> -->
                                    </div>
                                </div>
                                <hr class="whiteGreyText m-1">
                                <p id="commentDescription" class="commentDescription">Estás equivocado porque</p>
                                <hr class="whiteGreyText noMargin">
                                <div class="row">
                                    <div class="col-11">
                                        <button id="reportComment" class="noBackground noBorder transparentButton"  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Reportar"><i class="bi bi-flag postOptions"></i></button>
                                    </div>
                                    <div class="col-1">
                                        <div class="d-flex align-items-center justify-content-center">
                                            <button id="deletePost" class="noBackground noBorder transparentButton margin7xLnR"><i class="bi bi-trash postOptions"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- --------------------------------------------------------------------- -->
                        <form action="/postDisplay" id="replyForm" method="post" class="border-top">
                            <textarea id="replyText" name="replyText" class="commentSomething" placeholder="Comenta algo aquí..."></textarea>
                            <div class="d-flex justify-content-end">
                                <button type="submit" class="commentButton small addMarginRight5x">Publicar</button>
                            </div>
                            <br>
                        </form>
                        <!-- --------------------------------------------------------------------->
                        <!-- --------------------------------------------------------------------->
                        <div class="d-flex justify-content-center">
                            <button class="showReplyButton">Mostrar respuestas <i class="bi bi-arrow-down-square"></i> </button>
                        </div>
                        <div id="allReplys">
                            <div id="replyComment" class="replyComment">
                                <div class="container-fluid noPadding">
                                    <div class="row w-100">
                                        <div class="col-1">
                                            <img id="replyUserPhoto" class="commentUserPhoto img-fluid" src="/media/pruebas/momazo.jpg">
                                        </div>
                                        <div class="col-9">
                                            <p id="replyUsername" class="commentUsername"> @ye</p>
                                            <p id="datePosted" class="commentData"> <i class="bi bi-clock"></i> 21-04-06</p>
                                        </div>
                                        <div class="col-2">
                                            <div class="d-flex align-items-center justify-content-center">
                                                <button id="likePost" class="noBackground transparentButton margin7xLnR noBorder"><i  class="bi bi-hand-thumbs-up postOptions"></i></button>
                                                <p class="my-auto p-0 small whiteGreyText">23</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr class="whiteGreyText m-1">
                                <p id="replyDescription" class="commentDescription">IP: 92.28.211.234</p>
                                <hr class="whiteGreyText noMargin">
                                <div class="row">
                                    <div class="col-11">
                                        <button id="reportComment" class="noBackground noBorder transparentButton"  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Reportar"><i class="bi bi-flag postOptions"></i></button>
                                    </div>
                                    <div class="col-1">
                                        <div class="d-flex align-items-center justify-content-center">
                                            <button id="deletePost" class="noBackground noBorder transparentButton margin7xLnR"><i id="deleteReply" class="bi bi-trash postOptions"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="comments" class="comments quitMarginBottom">
                            <div class="container-fluid noPadding">
                                <div class="row w-100">
                                    <div class="col-1">
                                        <img id="commentUserPhoto" class="commentUserPhoto img-fluid" src="/media/pruebas/Mario-64-cake-620x360.jpg">
                                    </div>
                                    <div class="col-9">
                                        <p id="postUsername" class="commentUsername"> @tuabuelito</p>
                                        <p id="datePosted" class="commentData"> <i class="bi bi-clock"></i> 21-04-06</p>
                                    </div>
                                    <div class="col-2">
                                        <div class="d-flex align-items-center justify-content-center">
                                            <button id="likePost" class="noBackground transparentButton margin7xLnR noBorder"><i  class="bi bi-hand-thumbs-up postOptions"></i></button>
                                            <p class="my-auto p-0 small whiteGreyText">70</p>
                                        </div>
                                    </div>
                                </div>
                                <hr class="whiteGreyText m-1">
                                <p id="commentDescription" class="commentDescription">No peleen 😭</p>
                                <hr class="whiteGreyText noMargin">
                                <div class="row">
                                    <div class="col-11">
                                        <button id="reportComment" class="noBackground noBorder transparentButton"  data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Reportar"><i class="bi bi-flag postOptions"></i></button>
                                    </div>
                                    <div class="col-1">
                                        <div class="d-flex align-items-center justify-content-center">
                                            <button id="deletePost" class="noBackground noBorder transparentButton margin7xLnR"><i class="bi bi-trash postOptions"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br>
                </div>
                </div>
            </div>
        </div>
    </main>
    <div id="filterContainer"></div>
    <div id="votesContainer"></div>
    <script src="/js/fetchThings/fetchNavBar.js"></script>
    <script src="/js/filters.js"></script>
    <script src="/js/fetchThings/fetchVotesModal.js"></script>
    <script src="/js/Scripts/tooltip.js"></script>
    <script src="/js/postDisplay.js"></script>
</body>

</html>