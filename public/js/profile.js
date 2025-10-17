document.addEventListener("DOMContentLoaded", function() {
    let userData = null;
    try { userData = JSON.parse(sessionStorage.getItem('user')); } catch (e) {}
    if (!userData) { window.location.href = '/login'; return; }

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
    if (document.getElementById('countrySelect') && userData.birth_place) {
        let sel = document.getElementById('countrySelect');
        for (let i = 0; i < sel.options.length; i++) {
            if (sel.options[i].text === userData.birth_place) sel.selectedIndex = i;
        }
    }
    if (document.getElementById('nationalitySelect') && userData.nationality) {
        let sel = document.getElementById('nationalitySelect');
        for (let i = 0; i < sel.options.length; i++) {
            if (sel.options[i].text === userData.nationality) sel.selectedIndex = i;
        }
    }
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