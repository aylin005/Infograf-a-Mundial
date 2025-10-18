document.addEventListener("DOMContentLoaded", function() {
    let userData = null;
    let countriesData = [];
    try { userData = JSON.parse(sessionStorage.getItem('user')); } catch (e) {}
    if (!userData) { window.location.href = '/login'; return; }

    // Cargar países antes de mostrar perfil
    loadCountries();

    // Mostrar datos en la vista de perfil
    if (window.profileBackground && userData.background) profileBackground.src = userData.background;
    if (window.profilePhoto && userData.image) profilePhoto.src = userData.image;
    if (window.profileName && userData.username) profileName.textContent = '@' + userData.username;
    if (window.profileMail && userData.email) profileMail.textContent = userData.email;

    // Género emoji en perfil
    let genderIcon = '❎';
    if (userData.gender === 'Masculino') genderIcon = '🚹';
    else if (userData.gender === 'Femenino') genderIcon = '🚺';
    if (window.profileGender) profileGender.textContent = '| ' + genderIcon;

    // Rellenar campos de edición (excepto fecha de nacimiento)
    if (document.getElementById('username')) document.getElementById('username').value = userData.username || '';
    if (document.getElementById('mail')) document.getElementById('mail').value = userData.email || '';
    if (document.getElementById('name')) document.getElementById('name').value = userData.full_name || '';
    if (document.getElementById('gender')) document.getElementById('gender').value = userData.gender || '';

    // Imagen de fondo y foto de perfil (edición)
    if (document.getElementById('backgroundPhoto') && userData.background) {
        document.getElementById('backgroundPhoto').src = userData.background;
    }
    if (document.getElementById('userPhoto') && userData.image) {
        document.getElementById('userPhoto').src = userData.image;
    }
    // Manejo de input de imagen de fondo
    const fileInput = document.getElementById("backgroundPhoto");
    const fileLabel = document.querySelector("label[for='backgroundPhoto']");
    if (fileInput && fileLabel) {
        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                fileLabel.textContent = `${fileName}`;
            } else {
                fileLabel.textContent = "Subir foto de fondo";
            }
        });
    }

    // Función para cargar países desde la API
    async function loadCountries() {
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,unicodeFlag,dialCode');
            const data = await response.json();
            
            if (data.error === false && data.data) {
                countriesData = data.data;
                const countrySelect = document.getElementById('countrySelect');
                const nationalitySelect = document.getElementById('nationalitySelect');
                const miniFlag = document.getElementById('miniFlag');
                const natFlag = document.getElementById('natFlag');
                
                if (countrySelect) populateCountrySelect(countrySelect, miniFlag, userData.birth_place);
                if (nationalitySelect) populateCountrySelect(nationalitySelect, natFlag, userData.nationality);
            }
        } catch (error) {
            console.error('Error al cargar países:', error);
        }
    }

    // Función para llenar los selectores con países
    function populateCountrySelect(selectElement, flagElement, selectedCountry) {
        selectElement.innerHTML = '<option value="">Seleccione un país</option>';
        
        // Ocultar bandera por defecto
        flagElement.style.display = 'none';
        flagElement.src = '';
        
        countriesData.forEach(country => {
            const option = document.createElement('option');
            option.value = country.name;
            option.textContent = country.name;
            option.dataset.flag = country.flag || '';
            if (country.name === selectedCountry) option.selected = true;
            selectElement.appendChild(option);
        });
        
        // Mostrar bandera del país seleccionado
        if (selectedCountry) {
            const selectedOption = Array.from(selectElement.options).find(opt => opt.value === selectedCountry);
            if (selectedOption && selectedOption.dataset.flag) {
                flagElement.src = selectedOption.dataset.flag;
                flagElement.style.display = 'block';
            }
        }
        
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

    // PATCH al guardar perfil
    const form = document.getElementById('signUpForm');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            let feedback = document.getElementById('custom-alert-message');
            if (feedback) feedback.textContent = '';

            // Recolectar datos, enviar null si vacío
            const id = userData.id;
            const username = document.getElementById('username').value.trim() || null;
            const email = document.getElementById('mail').value.trim() || null;
            const full_name = document.getElementById('name').value.trim() || null;
            const gender = document.getElementById('gender').value || null;
            const birth_place = document.getElementById('countrySelect')?.value || null;
            const nationality = document.getElementById('nationalitySelect')?.value || null;
            // Imagenes (no obligatorio)
            let image = null, background = null;
            if (document.getElementById('userPhoto')?.src) image = document.getElementById('userPhoto').src;
            if (document.getElementById('backgroundPhoto')?.src) background = document.getElementById('backgroundPhoto').src;
            // Contraseña solo si se llenó
            let password = document.getElementById('password').value;
            let passwordConf = document.getElementById('passwordConf').value;
            let hash_password = null;
            if (password && passwordConf) {
                if (password !== passwordConf) {
                    if (feedback) feedback.textContent = '❌ Las contraseñas no coinciden.';
                    return;
                }
                // Validar requisitos aquí si quieres (longitud, etc)
                hash_password = password;
            }

            // Construir payload solo con campos editables
            const payload = {
                username,
                email,
                full_name,
                gender,
                birth_place,
                nationality,
                image,
                background,
                hash_password
            };
            // Eliminar campos nulos
            Object.keys(payload).forEach(k => { if (payload[k] === null || payload[k] === '') delete payload[k]; });

            try {
                const res = await fetch(`/users/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.exito) {
                    if (feedback) feedback.textContent = '✅ Cambios guardados correctamente.';
                    // Actualizar sessionStorage
                    Object.assign(userData, payload);
                    sessionStorage.setItem('user', JSON.stringify(userData));
                } else {
                    if (feedback) feedback.textContent = '❌ Error: ' + (result.mensaje || 'No se pudo guardar.');
                }
            } catch (err) {
                if (feedback) feedback.textContent = '❌ Error de conexión.';
            }
        });
    }
});