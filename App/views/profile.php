<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> Perfil </title>
        <link rel = "icon" href="/media/miniLogoW.png"> <!--logo-->
        <link rel="stylesheet" href="/CSS/main.css">
        <link rel="stylesheet" href="/CSS/home.css">
        <link rel="stylesheet" href="/CSS/forms.css">
        <link rel="stylesheet" href="/CSS/profile.css">
        <link rel="stylesheet" href="/CSS/modular/navBar.css">
        <link rel="stylesheet" href="/CSS/modular/cardPost.css">
        <link rel="stylesheet" href="/CSS/modular/filters.css">
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="/icons/icons-1.13.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="/fonts/Offside/Offside.css">
        <link rel="stylesheet" href="/fonts/Syncopate/Syncopate.css">
        <script src="/bootstrap/js/bootstrap.bundle.min.js"></script>
    </head>
    <body class="defaultBackground noScrollX">
        <header id="navBar-container"></header>
        <div id="main"  class="d-flex">
            <main id="main" class="w-100">
                <div class="d-block spaceTaken">
                    <div class="profileContainer">
                        <div class="row">
                            <div class="col-12">
                                <img id="profileBackground" src="/media/pruebas/logo_fifa_2026_0.png" class="img-fluid displayBackgroundPhoto" alt="foto de usuario">
                            </div>
                        </div>
                        <div class="row align-items-center profile-header-content">
                            <div class="col-auto mx-4">
                                <div class="profile-photo-container">
                                    <img id="profilePhoto" class="user-photo img-fluid" src="/media/pruebas/logo_fifa_2026_0.png" alt="Foto de perfil del usuario">
                                </div>
                            </div>
                            <div class="col">
                                <br><br><br>
                                <h1 id="profileName" class="displayUserName">@user</h1>
                                <h2 id="profileMail" class="displayUserMail">user@gmail.com</h2>
                                <div class="d-flex align-items-center">
                                    <img id="profileNationality" class="displayUserNationality me-2" src="">
                                    <h5 id="profileGender" class="displayUserGender my-1">| </h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <br><br>

                <ul class="nav nav-tabs" data-bs-theme="dark">
                    <li class="nav-item">
                        <a class="nav-link active" data-bs-toggle="tab" aria-current="page" href="#postContainer" role="tab">Mis publicaciones</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="tab" href="#notificationContainer" role="tab">Notificaciones</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="tab" href="#editProfile" role="tab">Gestionar perfil</a>
                    </li>
                </ul>

                <div class="tab-content">
                    <div class="tab-pane fade show active" id="postContainer" role="tabpanel">
                        <div id="container4Post" class="container4Post">
                            <div id="postCard" class="d-flex">
                                <div class="card cardSize borderDegraded" data-bs-theme="dark">
                                    <div class="card-body imageDegraded noMargin noPadding">
                                        <video id="videoCard" src="/media/Mundiales/1986/Publications/1.mp4" class="backgroundCard" muted loop></video>
                                        <div class="row">
                                            <div class="col-7 over">
                                            <!--NOTA: Si está en su perfil, aparecer los íconos de edición. Si no, solo hacer display del nombre-->
                                            <!-- <p id="userCard" class="userCard"> @itsie</p> -->
                                                <a href="/newPost"><i id="editPost" class="bi bi-pencil-square cardIcon"></i></a>
                                                <i id="deletePost" class="bi bi-trash cardIcon"></i>
                                            </div>
                                            <div class="col-5 over">
                                                <div class="d-flex calificationCard align-items-center justify-content-center">
                                                    <div class="d-flex align-items-center">
                                                        <a href="/postDisplay"><i id="goToComments" class="bi bi-chat-left-dots messageIcon"></i></a>
                                                        <p id="commentsCard" class="cantUpvotes noMargin">4M</p>
                                                    </div>
                                                    <div class="d-flex align-items-center">
                                                        <i id="goodVotePost" class="bi bi-arrow-up-square-fill goodVoteIcon"></i>
                                                        <p id="upvotesCard" class="cantUpvotes noMargin">4M</p>
                                                    </div>
                                                    <i id="badvotesCard" class="bi bi-arrow-down-square-fill badVoteIcon"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-12 over">
                                                <a href="/postDisplay" class="over"><h5 id="titleCard" class="card-title cardTitle over">La mejor jugada de Maradona</h5></a>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div id="ticketsContainer" class="col-12 over">
                                                <div class="d-flex over">
                                                    <button id="yearCard" type="button" onclick="location.href='/results'" class="ticketsCard">1986</button>
                                                    <button id="selectionCard" type="button" onclick="location.href='/results'" class="ticketsCard">Selección argentina</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-12 over">
                                                <div id="tagContainer" class="d-flex align-items-center tagContainer">
                                                    <button id="tagCard" type="button" onclick="location.href='/results'" class="tags">#TopJugadas</button>
                                                    <button id="tagCard" type="button" onclick="location.href='/results'" class="tags">#Mejoresjugadores</button>
                                                    <button id="tagCard" type="button" onclick="location.href='/results'" class="tags">#Argentina</button>
                                                    <button id="tagCard" type="button" onclick="location.href='/results'" class="tags">#Campeón</button>
                                                    <button id="tagCard" type="button" onclick="location.href='/results'" class="tags">#ElReyDelFutbol</button>
                                                    <button id="tagCard" type="button" onclick="location.href='/results'" class="tags">#epocaDorada</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- ---------------------------------------------------------------------------------------------------- -->
                        </div>
                    </div>
          
                    <div class="tab-pane fade" id="notificationContainer" role="tabpanel">
                        <div id="notificationContainer" data-bs-theme="dark">
                        <!-- ------------------------------------------------------------------------------------- -->
                        <!-- NOTA: Publicación aceptada---------------------------------------------------------- -->
                        <div id="acceptedPost" class="notifyPost">
                            <div class="alert alert-success m-5 d-flex align-items-center" role="alert">
                                <i class="bi bi-check-square adjustIcon"></i>
                                <div class="w-100"> 
                                    <p class="notifyText smallText textRight noPadding">01/09/2025 03:33</p>
                                    <p class="notifyText syncopate-regular noPadding">Tu publicación "Que opinan del logo del FIFA 2026?" ha sido aceptada</p>
                                </div>
                            </div>
                        </div>

                        <!-- NOTA: Publicación negada---------------------------------------------------------- -->
                        <div id="deniedPost" class="notifyPost">
                            <div class="alert alert-danger m-5 d-flex align-items-center" role="alert">
                                <i class="bi bi-x-square adjustIcon"></i>
                                <div class="w-100"> 
                                    <p class="notifyText smallText textRight noPadding">31/07/2025 14:23</p>
                                    <p class="notifyText syncopate-regular noPadding">Tu publicación "Recetas con mango" ha sido rechazada</p>
                                    <button onclick="location.href='/newPost'" type="button" class="reviewButton m-2">Revisar</button>
                                </div>
                            </div>
                        </div>

                        <!-- NOTA: Publicación en espera de revisión---------------------------------------------------------- -->
                        <div id="acceptedPost" class="notifyPost">
                            <div class="alert alert-warning m-5 d-flex align-items-center" role="alert">
                                <i class="bi bi-exclamation-square adjustIcon"></i>
                                <div class="w-100"> 
                                    <p class="notifyText smallText textRight noPadding">21/06/2025 09:15</p>
                                    <p class="notifyText syncopate-regular noPadding">Tu publicación "1950: el reinicio" está en proceso de revisión.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>

                    <div class="tab-pane fade" id="editProfile" role="tabpanel">
                        <div id="signUpContainer" class= "shadow">
                            <form method="post" id="signUpForm" action="/profile" accept-charset="UTF-8" novalidate enctype="multipart/form-data">
                                <div class="row">
                                    <div class="col-md-6 col-12 border-end">
                                    <!--SUBIR FOTO-->
                                    <!-- NOTA: No tiene validación porque ya hay una foto por default-->
                                        <img id="userPhoto" name="userPhoto" src="/media/userPhoto.png" class ="img-fluid" alt="Foto de usuario">
                                        <input type="file" id="photo" name="photo" accept="image/*" autocomplete="off" class="hideThing">
                                        <label for="photo" class="d-flex justify-content-center">
                                            <i class="bi bi-upload btn"></i>
                                        </label>
                                        <br>

                                        <!--SUBIR FOTO DE FONDO-->
                                        <div class="d-flex justify-content-center">
                                            <label for="backgroundPhoto" class="d-flex justify-content-center btn w-60 smallText">Subir foto de fondo</label>
                                        </div>
                                        <input type="file" id="backgroundPhoto" name="backgroundPhoto" accept="image/*" autocomplete="off" class="hideThing">
                                    
                                        <!--NOMBRE DE USUARIO-->
                                        <div class="formCamps">
                                            <label for="username">Nombre de usuario</label>
                                            <div>
                                                <input id="username" name="username" type="text" class="form-control  w-100"  aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off">
                                            </div>
                                        </div>
                                        <br>

                                        <!--CONTRASEÑA-->
                                        <div class="formCamps">
                                            <label for="password">Contraseña</label>
                                            <div class="has-validation">
                                                <div class="passContainer"> 
                                                    <input id="password" name="password" type="password" class="form-control w-100" aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off">
                                                    <i id="passwordIcon" class="bi bi-eye eyeIcon"></i>
                                                </div> 
                                                <div id="pass-Check"class="invalid-feedback"></div>
                                            </div>
                                        </div>
                                        <br>

                                        <!--VALIDAR CONTRASEÑA-->
                                        <div class="formCamps">
                                            <label for="password">Confirma la contraseña</label>
                                            <div class="has-validation">
                                                <div class="passContainer"> 
                                                    <input id="passwordConf" name="passwordConf" type="password" class="form-control w-100" aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off">
                                                    <i id="passwordIconConf" class="bi bi-eye eyeIcon"></i>
                                                </div> 
                                                <div id="passConf-Check"  class="invalid-feedback"></div>
                                            </div>
                                        </div>
                                        <br>

                                         <!--EMAIL-->
                                        <div class="formCamps">
                                            <label for="mail">Correo electronico</label>
                                            <div>
                                                <input type="email" id="mail" name="mail"  class="form-control  w-100" placeholder="ejemplo@gmail.com" aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="mail">
                                            </div>
                                        </div>
                                        <br>
                                    </div>

                                    <div class="col-md-6 col-12">
                                        <!--NOMBRE COMPLETO-->
                                        <div class="formCamps">
                                            <label for="name">Nombre completo</label>
                                            <div>
                                                <input id="name" name="name" type="text" class="form-control  w-100"  aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off">
                                            </div>
                                        </div>
                                        <br>

                                        <!--SELECCIONAR PAÍS DE ORIGEN-->
                                        <div class="formCamps">
                                            <label for= "countrySelect">País de origen </label>
                                            <div class="d-flex">
                                                <img id="miniFlag" class="miniFlag">
                                                <select id="countrySelect" class="form-control w-100" data-bs-theme="dark" autocomplete="off">
                                                    <option value="">Cargando países...</option>
                                                </select>
                                            </div>
                                        </div>
                                        <br>

                                        <!--SELECCIONAR NACIONALIDAD-->
                                        <div class="formCamps">
                                            <label for= "nationalitySelect">Nacionalidad </label>
                                            <div class="d-flex">
                                                <img id="natFlag" class="miniFlag">
                                                <select id="nationalitySelect" class="form-control w-100" aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off">
                                                    <option value="">Cargando países...</option>
                                                </select>
                                            </div>
                                        </div>
                                        <br>

                                        <!--GÉNERO-->
                                        <!--NOTA: Modularizar estos selects-->
                                        <div class="formCamps">
                                            <label for= "gender">Género</label>
                                            <input type="hidden" id="gender" name="gender">  
                                            <div class="d-flex justify-content-center almostBlackBackground">
                                                <button type="button" id="gender1" class="genderSelectBtn">🚹</button>
                                                <button type="button" id="gender2" class="genderSelectBtn">🚺</button>
                                                <button type="button" id="gender3" class="genderSelectBtn">❎</button>
                                            </div>
                                            <p id="genderDisplay" class="text-center greyMediumBackground">Seleccione un género</p>
                                        </div>
                                        <br>
                        
                                        <!--CUMPLEAÑOS-->
                                        <div class="formCamps">
                                            <label for="birthday">Fecha de nacimiento</label>
                                            <div>
                                                <input id="birthday" name="birthday" type="date" class="form-control  w-100 text-center"  aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off" readonly disabled>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr>
                                <p id="custom-alert-message" class="text-center fadeUp" style="min-height: 20px;"></p>
                                <div id="profile-spinner" class="spinner" style="display: none;"></div>
                                <button id="submitButton" type="submit" class="btn d-block mx-auto mb-5 shadow">Guardar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <div id="filterContainer"></div>
        <script src="/js/scripts.js"></script>
        <script src="/js/fetchThings/fetchNavBar.js"></script>
        <script src="/js/navBar.js"></script>
        <script src="/js/filters.js"></script>
        <script src="/js/fetchThings/fetchCardsPosts.js"></script>
        <script src="/js/tooltip.js"></script>
        <script src="/js/cardPost.js"></script>
        <!-- <script src="/js/mundial.js"></script> -->
        <script src="/js/signUp.js"></script>
        <script src="/js/profile.js"></script>
    </body>
</html>
