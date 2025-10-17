window.addEventListener("load", () => 
{
    document.getElementById("formOverLogo").classList.add("show");
    document.getElementById("signUpContainer").classList.add("show");
});

document.addEventListener("DOMContentLoaded", function() 
{
    'use strict';
    /////////////////////////////////////////////////////////////////////////////////////////
    const form = document.getElementById('signUpForm');

    const user = document.getElementById('username');
    const errorMsg4 = document.getElementById('user-Check');

    const passIcon = document.getElementById("passwordIcon");
    const passIconConf = document.getElementById("passwordIconConf");

    const pass = document.getElementById('password');
    const passConf = document.getElementById("passwordConf");
    const errorMsg1 = document.getElementById('pass-Check');
    const errorMsg2 = document.getElementById('passConf-Check');

    const pfp = document.getElementById("userPhoto");
    const pfpButton = document.getElementById("photo");
    const genderButtons = document.querySelectorAll(".genderSelectBtn");
    const genderDisplay = document.getElementById("genderDisplay");
    const genderInput = document.getElementById("gender");
    const genderLabels = { gender1: "Masculino", gender2: "Femenino", gender3: "Otro" };

    const dateBirthday = document.getElementById("birthday");
    const errorMsg3 = document.getElementById("birthday-Check");

    //NOTA: Esta es la imagen default que se le asigna a todos los usuarios antes de que decida modificarla
    // no sé si se maneja así, pero igual ahí te dejo la variableee
    const defaultBgImage= "/media/pruebas/logo_fifa_2026_0.png"; 

    let areCampsFilled = false;
    let isUserCorrect = false;
    let isPasswordCorrect = false;
    let isBirthdayCorrect = false;
    let checkBirthday;
    /////////////////////////////////////////////////////////////////////////////////////////
    //NOTA: Por default se selecciona el masculino
    const defaultBtn = document.getElementById("gender1");
    defaultBtn.classList.add("selectedGender");
    genderDisplay.textContent = genderLabels["gender1"];
    genderInput.value = genderLabels["gender1"];
    /////////////////////////////////////////////////////////////////////////////////////////
    if (passIcon)
        passIcon.onclick = () => ClickEyeButton(pass, passIcon);

    if (passIconConf)
        passIconConf.onclick = () => ClickEyeButton(passConf, passIconConf);
    /////////////////////////////////////////////////////////////////////////////////////////
    pfpButton.onchange = () => ChangeImg(pfp, pfpButton);
    /////////////////////////////////////////////////////////////////////////////////////////
    genderButtons.forEach(btn => 
    {
        btn.addEventListener("click", () => 
        {
            genderButtons.forEach(b => b.classList.remove("selectedGender"));
            btn.classList.add("selectedGender");
            genderDisplay.textContent = genderLabels[btn.id];
            genderInput.value = genderLabels[btn.id];
        });
    });
    /////////////////////////////////////////////////////////////////////////////////////////
    //NOTA: Modificar para que se valide con los de la bd
    user.addEventListener("input", () => 
    {
        if (user.value.trim() === "admin") 
            isUserCorrect = ShowError(user, errorMsg4, '[❌] El usuario ya existe.', 'is-invalid'); 
        else 
            isUserCorrect = HideError(user, errorMsg4, 'is-invalid');
    });
    /////////////////////////////////////////////////////////////////////////////////////////
    //NOTA: Validar las contraseñas -> requisitos y que sean iguales
    password.addEventListener("input", () => {isPasswordCorrect = CheckPasswords(password, passwordConf, errorMsg1, errorMsg2);});
    passwordConf.addEventListener("input", () => {isPasswordCorrect = CheckPasswords(password, passwordConf, errorMsg1, errorMsg2);});
    /////////////////////////////////////////////////////////////////////////////////////////
    //NOTA: Validar la fecha ingresada por el usuario
    dateBirthday.addEventListener("input", () =>
    {   
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDate = GetMinAge(today);
        const maxDate = GetMaxAge(today);
        const dateBirthdayData = new Date(dateBirthday.value + "T00:00:00");
        console.log("Validando fechas");

        checkBirthday = CheckBirthday(today, dateBirthdayData, minDate, maxDate);
        if(checkBirthday != 0)
        {
            let message;
            if(checkBirthday === 1)
                message = '[❌] No se aceptan menores de 12 años';
            else
                message = '[❌] Edad Inválida';

            isBirthdayCorrect = ShowError(dateBirthday, errorMsg3, message, 'is-invalid');
        }
        else
            isBirthdayCorrect = HideError(dateBirthday, errorMsg3, 'is-invalid');
    })
    /////////////////////////////////////////////////////////////////////////////////////////
    //NOTA: Se valida si hay espacios vacíos o con datos incorrectos antes de enviarse
    form.addEventListener('submit', event => 
    {
        event.preventDefault();
        form.classList.add('was-validated');
        if (!form.checkValidity()) 
        {
            DisplayCustomAlert("[❗] A T E N C I Ó N: Faltan campos por llenar");
            event.stopPropagation();
            areCampsFilled = false;
        }
        else
        {
            HideCustomAlert();
            areCampsFilled = true;
        }
        
        console.log(areCampsFilled);
        console.log(isPasswordCorrect);
        console.log(isBirthdayCorrect);
        console.log(isUserCorrect);

        if(areCampsFilled && isPasswordCorrect && isBirthdayCorrect && isUserCorrect)
        {
            console.log("Ya se andan mandando mi rey");
            form.submit();
        }
    });
});