<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> ¡Bienvenido a Starmates! </title>
        <link rel = "icon" href="/media/miniLogoW.png"> <!--logo-->
        <link rel="stylesheet" href="/css/main.css">
        <link rel="stylesheet" href="/css/forms.css">
        <link rel="stylesheet" href="/css/modular/navBar.css">
        <link rel="stylesheet" href="/css/modular/filters.css">
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="/icons/icons-1.13.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="/fonts/Offside/Offside.css">
        <link rel="stylesheet" href="/fonts/Syncopate/Syncopate.css">
        <script src="/bootstrap/js/bootstrap.bundle.min.js"></script>
    </head>
    <body>
        <header id="navBar-container"></header>
        <main id="main" class="position-relative">
            <!----------------------------------------------------------------------------------------------->
            <img id="formOverLogo" src="/media/logo.png" alt="Logo Starmates" class="fadeUp img-fluid">
            <!----------------------------------------------------------------------------------------------->
            <div id="signUpContainer" class= "fadeUp shadow">
                <form method="post" id="signUpForm" action="/" accept-charset="UTF-8" novalidate enctype="multipart/form-data">
                    <h1 class="formTitle">Registro</h1>
                    <h2 id="importantText">Crea una cuenta para formar parte de la mejor comunidad futbolistica mundial ⚽</h2>
                    <hr>
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

                            <!--NOMBRE DE USUARIO-->
                            <div class="formCamps">
                                <label for="username">Nombre de usuario</label>
                                <div class="has-validation">
                                    <input id="username" name="username" type="text" class="form-control  w-100"  aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off" required>
                                    <div id="user-Check" class="invalid-feedback">
                                    </div>
                                </div>
                            </div>
                            <br>

                            <!--CONTRASEÑA-->
                            <div class="formCamps">
                                <label for="password">Contraseña</label>
                                <div class="has-validation">
                                    <div class="passContainer"> 
                                        <input id="password" name="password" type="password" class="form-control w-100" aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off" required>
                                        <i id="passwordIcon" class="bi bi-eye eyeIcon"></i>
                                    </div> 
                                    <div id="pass-Check"class="invalid-feedback">
                                    </div>
                                </div>
                            </div>
                            <br>

                            <!--VALIDAR CONTRASEÑA-->
                            <div class="formCamps">
                                <label for="password">Confirma la contraseña</label>
                                <div class="has-validation">
                                    <div class="passContainer"> 
                                        <input id="passwordConf" name="passwordConf" type="password" class="form-control w-100" aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off" required>
                                        <i id="passwordIconConf" class="bi bi-eye eyeIcon"></i>
                                    </div> 
                                    <div id="passConf-Check"  class="invalid-feedback">
                                    </div>
                                </div>
                            </div>
                            <br>

                             <!--EMAIL-->
                            <div class="formCamps">
                                <label for="mail">Correo electronico</label>
                                <div class="has-validation">
                                    <input type="email" id="mail" name="mail"  class="form-control  w-100" placeholder="ejemplo@gmail.com" aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="mail" required>
                                    <div class="invalid-feedback">
                                    </div>
                                </div>
                            </div>
                            <br>
                        </div>

                        <div class="col-md-6 col-12">
                            <!--NOMBRE COMPLETO-->
                            <div class="formCamps">
                                <label for="name">Nombre completo</label>
                                <div class="has-validation">
                                    <input id="name" name="name" type="text" class="form-control  w-100"  aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off" required>
                                    <div class="invalid-feedback">
                                    </div>
                                </div>
                            </div>
                            <br>

                            <!--SELECCIONAR PAÍS DE ORIGEN-->
                            <div class="formCamps">
                                <label for= "countrySelect">País de origen </label>
                                <div class="d-flex">
                                    <img id="miniFlag" class="miniFlag">
                                    <select id="countrySelect" class="form-control w-100" data-bs-theme="dark" autocomplete="off" required>
                                        <option id="flag-Can" name="flag-Can" data-image="/media/Flags/Canada-Emoji.png" class="selectOpt">Canadá</option>
                                        <option id="flag-Mex" name="flag-Mex" data-image="/media/Flags/Mexico-Emoji.png" class="selectOpt">México</option>
                                        <option id="flag-EU" name="flag-EU" data-image="/media/Flags/US-Emoji.png" class="selectOpt">Estados Unidos</option>
                                    </select>
                                </div>
                            </div>
                            <br>

                            <!--SELECCIONAR NACIONALIDAD-->
                            <div class="formCamps">
                                <label for= "nationalitySelect">Nacionalidad </label>
                                <div class="d-flex">
                                    <img id="natFlag" class="miniFlag">
                                    <select id="nationalitySelect" class="form-control w-100" aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off" required>
                                        <option id="flag-Can" name="flag-Can" data-image="/media/Flags/Canada-Emoji.png" class="selectOpt">Canadá</option>
                                        <option id="flag-Mex" name="flag-Mex" data-image="/media/Flags/Mexico-Emoji.png" class="selectOpt">México</option>
                                        <option id="flag-EU" name="flag-EU" data-image="/media/Flags/US-Emoji.png" class="selectOpt">Estados Unidos</option>
                                    </select>
                                </div>
                                <div class="invalid-feedback">
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
                                <div class="has-validation">
                                    <input id="birthday" name="birthday" type="date" class="form-control  w-100 text-center"  aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off" required>
                                    <div id="birthday-Check" class="invalid-feedback">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <p id="custom-alert-message" class="text-center text-danger fadeUp"></p>
                    <button id="submitButton" type="submit" class="btn d-block mx-auto mb-5 shadow">Registrarme</button>
                </form>
            </div>
        </main>
        <div id="filterContainer"></div>
        <script src="/js/fetchThings/fetchNavBar.js"></script>
        <script src="/js/scripts.js"></script>
        <script src="/js/mundial.js"></script>
        <script src="/js/signUp.js"></script>
    </body>
</html>
