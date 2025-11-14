window.addEventListener("load", () => 
{
    const formOverLogo = document.getElementById("formOverLogo");
    const signUpContainer = document.getElementById("signUpContainer");
    
    if (formOverLogo) formOverLogo.classList.add("show");
    if (signUpContainer) signUpContainer.classList.add("show");
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

    const countrySelect = document.getElementById("countrySelect");
    const nationalitySelect = document.getElementById("nationalitySelect");
    const miniFlag = document.getElementById("miniFlag");
    const natFlag = document.getElementById("natFlag");

    //NOTA: Esta es la imagen default que se le asigna a todos los usuarios antes de que decida modificarla
    // no sé si se maneja así, pero igual ahí te dejo la variableee
    const defaultBgImage= "/media/pruebas/logo_fifa_2026_0.png"; 

    let areCampsFilled = false;
    let isUserCorrect = false;
    let isPasswordCorrect = false;
    let isBirthdayCorrect = false;
    let checkBirthday;
    let countriesData = [];
    /////////////////////////////////////////////////////////////////////////////////////////
    // Cargar países desde la API
    loadCountries();
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
            console.log("Enviando datos a la API...");
            showSignupSpinner();
            registerUser();
        }
    });
});

/**
 * Función para registrar un nuevo usuario mediante la API
 */
async function registerUser() {
    try {
        // Recolectar datos del formulario
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const email = document.getElementById('mail').value.trim();
        const fullName = document.getElementById('name').value.trim();
        const birthDate = document.getElementById('birthday').value;
        const gender = document.getElementById('gender').value;
        const birthPlace = document.getElementById('countrySelect').value;
        const nationality = document.getElementById('nationalitySelect').value;
        
        // Validar que el género sea uno de los valores permitidos
        const validGenders = ["Masculino", "Femenino", "Otro"];
        if (!validGenders.includes(gender)) {
            DisplayCustomAlert('❌ Error: Género inválido. Debe ser "Masculino", "Femenino" u "Otro".');
            return;
        }
        
        console.log("Género seleccionado:", gender);
        
        // Obtener la imagen (si se subió)
        const photoInput = document.getElementById('photo');
        let imageBase64 = null;
        
        if (photoInput.files && photoInput.files[0]) {
            imageBase64 = await convertImageToBase64(photoInput.files[0]);
        }

        // Preparar datos en el formato que espera el modelo
        const userData = {
            username: username,
            email: email,
            hash_password: password, // El backend debería hashear esto
            full_name: fullName,
            birth_date: birthDate,
            image: imageBase64,
            gender: gender,
            birth_place: birthPlace,
            nationality: nationality
        };

        console.log("Datos a enviar:", userData);

        // Enviar petición POST a la API
        const response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        console.log("Respuesta de la API:", result);

        if (response.ok && result.exito) {
            // Registro exitoso
            hideSignupSpinner();
            DisplayCustomAlert(`✅ ${result.mensaje || 'Registro exitoso!'}`);
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            // Error en el registro
            hideSignupSpinner();
            DisplayCustomAlert(`❌ ${result.mensaje || 'Error al registrar usuario'}`);
        }

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        hideSignupSpinner();
        DisplayCustomAlert('❌ Error de conexión. Intente nuevamente.');
    }
}

/**
 * Convierte una imagen a Base64
 */
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Carga los países desde la API y llena los selectores
 */
async function loadCountries() {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,unicodeFlag,dialCode');
        const data = await response.json();
        
        if (data.error === false && data.data) {
            countriesData = data.data;
            populateCountrySelect(countrySelect, miniFlag);
            populateCountrySelect(nationalitySelect, natFlag);
        } else {
            console.error('Error al cargar países:', data);
            countrySelect.innerHTML = '<option value="">Error al cargar países</option>';
            nationalitySelect.innerHTML = '<option value="">Error al cargar países</option>';
        }
    } catch (error) {
        console.error('Error al cargar países:', error);
        countrySelect.innerHTML = '<option value="">Error al cargar países</option>';
        nationalitySelect.innerHTML = '<option value="">Error al cargar países</option>';
    }
}

/**
 * Llena un selector con los países y actualiza la bandera al cambiar
 */
function populateCountrySelect(selectElement, flagElement) {
    selectElement.innerHTML = '<option value="">Seleccione un país</option>';
    
    // Ocultar bandera por defecto
    flagElement.style.display = 'none';
    flagElement.src = '';
    
    countriesData.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = country.name;
        option.dataset.flag = country.flag || '';
        selectElement.appendChild(option);
    });
    
    // Listener para actualizar la bandera cuando cambia la selección
    selectElement.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const flagUrl = selectedOption.dataset.flag;
        if (flagUrl && flagUrl !== '') {
            flagElement.src = flagUrl;
            flagElement.style.display = 'block';
        } else {
            flagElement.src = '';
            flagElement.style.display = 'none';
        }


    });
}

//spinner de signup
function showSignupSpinner() {
    const spinner = document.getElementById('signup-spinner');
    const button = document.getElementById('submitButton');
    if (spinner && button) {
        spinner.style.display = 'block';
        button.disabled = true;
        button.textContent = 'Registrando...';
    }
}

function hideSignupSpinner() {
    const spinner = document.getElementById('signup-spinner');
    const button = document.getElementById('submitButton');
    if (spinner && button) {
        spinner.style.display = 'none';
        button.disabled = false;
        button.textContent = 'Registrarme';
    }
}