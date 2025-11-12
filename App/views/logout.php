<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Starmates | Cerrando sesión</title>
    <link rel="icon" href="/media/miniLogoW.png">
    <meta http-equiv="refresh" content="2;url=/login">
    <link rel="stylesheet" href="/fonts/Syncopate/Syncopate.css">
    <link rel="stylesheet" href="/fonts/Offside/Offside.css">
    <style>
        :root {
            --almostBlack: rgb(19, 19, 19);
            --greyDarker: rgb(32, 31, 31);
            --greyMedium: rgb(46, 46, 46);
            --whiteGrey: rgb(180, 180, 180);
            --greyWhite: rgb(220, 220, 220);
        }
        
        body {
            background-image: url("/media/background.png");
            background-repeat: repeat;
            background-size: cover !important;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Offside', sans-serif;
        }
        
        .logout-container {
            background-color: var(--greyDarker);
            padding: 5% 5% 3% 5%;
            color: aliceblue;
            width: 550px;
            max-width: 90%;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .logout-title {
            font-family: 'Syncopate', sans-serif;
            font-size: xx-large !important;
            font-weight: bold !important;
            padding: 0.1%;
            margin: 0% 0% 5% 0%;
            color: aliceblue;
        }
        
        .logout-message {
            font-family: "Offside", sans-serif;
            font-size: larger;
            margin: 20px 0;
            color: var(--whiteGrey);
        }
        
        .spinner {
            border: 4px solid var(--greyMedium);
            border-top: 4px solid aliceblue;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 30px auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        hr {
            border-color: var(--whiteGrey);
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="logout-container">
        <h1 class="logout-title">Cerrando sesión</h1>
        <hr>
        <div class="spinner"></div>
        <p class="logout-message">Serás redirigido al login en un momento...</p>
    </div>

    <script>
        // Limpiar todo el sessionStorage
        sessionStorage.clear();
        
        // Resetear foto del navbar si existe
        const navPhoto = document.getElementById('photoUser');
        if (navPhoto) {
            navPhoto.src = '/media/userPhoto.png';
        }
        
        // Redireccionar después de 1 segundo
        setTimeout(function() {
            window.location.href = '/login';
        }, 1000);
    </script>
</body>
</html>