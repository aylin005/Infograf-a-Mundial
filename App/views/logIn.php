<!DOCTYPE html>
<html lang = "es">
    <head>
        <meta charset="UTF-8">
        <meta name = "viewport" content="width=device-width, initial-scale = 1.0">
        <title> Starmates | LogIn </title>
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
        <main id="main" class="container-fluid">
            <div class="row">
                <!----------------------------------------------------------------------------------------------->
                <div class="col-12 col-md-6"> <!--NOTA: col-12 ocupa todo el ancho en pantallas pequeñas, col-md-6 ocupa la mitad del ancho en pantallas grandes-->
                    <img id="formLogo" src="/media/logo.png" alt="Starmates logo" class="principalLogo fadeUp img-fluid">
                </div>
                <!----------------------------------------------------------------------------------------------->
                <div class="col-12 col-md-6 d-flex justify-content-center align-items-center allHeight">
                    <div id="formContainer" class="fadeUp shadow">
                        <h1 class="formTitle">Iniciar sesión</h1>
                        <hr>
                        <form action="index.html" method="post" id="logInForm" class="needs-validation" novalidate accept-charset="UTF-8">
                            <div class="formCamps">
                                <label for="username">Nombre de usuario</label>
                                <div class="has-validation">
                                    <input id="username" name="username" type="text" class="form-control  w-100"  aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off" required>
                                    <div class="invalid-feedback">
                                    </div>
                                </div>
                            </div>
                            <br>
                            <!----------------------------------------------------------------------------------------------->
                            <div class="formCamps">
                                <label for="password">Contraseña</label>
                                <div class="has-validation">
                                    <div class="passContainer"> 
                                        <input id="password" name="password" type="password" class="form-control w-100" aria-describedby="inputGroupPrepend" data-bs-theme="dark" autocomplete="off" required>
                                        <i id="passwordIcon" class="bi bi-eye eyeIcon"></i>
                                    </div> 
                                    <div class="invalid-feedback"></div>
                                </div>
                            </div>
                            <br>
                            <p id="custom-alert-message" class="text-center text-danger small fadeUp"></p>
                            <button type="submit" class="btn d-block mx-auto mb-5 shadow">Continuar</button>
                        </form> 
                        <p class="text-center instruction smallerText">¿Aún no tienes una cuenta?</p>
                        <button onclick="location.href='signUp.html'" id="gotoSignUpButton" type="button" class="btn d-block mx-auto mb-2 shadow">Registrarme</button>
                    </div>
                </div>
            </div>
            <br>
        </main>
        <div id="filterContainer"></div>
        <script src="/js/scripts.js"></script>
        <script src="/js/logIn.js"></script>
        <script src="/js/fetchThings/fetchNavBar.js"></script>
    </body>
</html>

 