document.addEventListener("DOMContentLoaded", function() {
    let userData = null;
    let countriesData = [];
    try { userData = JSON.parse(sessionStorage.getItem('user')); } catch (e) {}
    if (!userData) { window.location.href = '/login'; return; }

    // Cargar países antes de mostrar perfil
    loadCountries();

    // Mostrar datos en la vista de perfil
    if (window.profileBackground && userData.background) {
        // Verificar si es una URL válida o base64
        if (userData.background.startsWith('data:') || userData.background.startsWith('http')) {
            profileBackground.src = userData.background;
        }
    }
    if (window.profilePhoto && userData.image) {
        // Verificar si es una URL válida o base64
        if (userData.image.startsWith('data:') || userData.image.startsWith('http')) {
            profilePhoto.src = userData.image;
        }
    }
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
    
    // Mostrar fecha de nacimiento (readonly)
    if (document.getElementById('birthday') && userData.birth_date) {
        document.getElementById('birthday').value = userData.birth_date;
    }
    
    // Seleccionar el género correcto según el usuario
    const genderButtons = document.querySelectorAll('.genderSelectBtn');
    const genderDisplay = document.getElementById('genderDisplay');
    const genderInput = document.getElementById('gender');
    const genderLabels = { gender1: "Masculino", gender2: "Femenino", gender3: "Otro" };
    
    if (genderButtons.length > 0 && userData.gender) {
        // Determinar qué botón debe estar seleccionado
        let selectedButton = null;
        if (userData.gender === 'Masculino') selectedButton = document.getElementById('gender1');
        else if (userData.gender === 'Femenino') selectedButton = document.getElementById('gender2');
        else if (userData.gender === 'Otro') selectedButton = document.getElementById('gender3');
        
        // Limpiar selecciones previas y seleccionar el correcto
        genderButtons.forEach(btn => btn.classList.remove('selectedGender'));
        if (selectedButton) {
            selectedButton.classList.add('selectedGender');
            if (genderDisplay) genderDisplay.textContent = userData.gender;
            if (genderInput) genderInput.value = userData.gender;
        }
        
        // Agregar listeners para cambio de género
        genderButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                genderButtons.forEach(b => b.classList.remove('selectedGender'));
                btn.classList.add('selectedGender');
                const gender = genderLabels[btn.id];
                if (genderDisplay) genderDisplay.textContent = gender;
                if (genderInput) genderInput.value = gender;
            });
        });
    }

    // Imagen de fondo y foto de perfil (edición)
    if (document.getElementById('backgroundPhoto') && userData.background) {
        if (userData.background.startsWith('data:') || userData.background.startsWith('http')) {
            document.getElementById('backgroundPhoto').src = userData.background;
        }
    }
    if (document.getElementById('userPhoto') && userData.image) {
        if (userData.image.startsWith('data:') || userData.image.startsWith('http')) {
            document.getElementById('userPhoto').src = userData.image;
        }
    }
    // Manejo de input de imagen de perfil
    const photoInput = document.getElementById("photo");
    const userPhotoImg = document.getElementById("userPhoto");
    if (photoInput && userPhotoImg) {
        photoInput.addEventListener("change", () => {
            if (photoInput.files && photoInput.files[0]) {
                const file = photoInput.files[0];
                
                // Validar tamaño de imagen (máximo 15MB)
                const maxSize = 15 * 1024 * 1024; // 15MB en bytes
                if (file.size > maxSize) {
                    showErrorText('La imagen de perfil es muy pesada.', false);
                    photoInput.value = ''; // Limpiar input
                    return;
                }
                
                // Validar tipo de archivo
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                if (!validTypes.includes(file.type)) {
                    showErrorText('Formato de imagen no válido. Use JPG, PNG o GIF.', false);
                    photoInput.value = ''; // Limpiar input
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    userPhotoImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Manejo de input de imagen de fondo
    const fileInput = document.getElementById("backgroundPhoto");
    const fileLabel = document.querySelector("label[for='backgroundPhoto']");
    const profileBackgroundImg = document.getElementById("profileBackground");
    if (fileInput && fileLabel) {
        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                
                // Validar tamaño de imagen (máximo 15MB)
                const maxSize = 15 * 1024 * 1024; // 15MB en bytes
                if (file.size > maxSize) {
                    showErrorText('La imagen de fondo es muy pesada.', false);
                    fileInput.value = ''; // Limpiar input
                    fileLabel.textContent = "Subir foto de fondo";
                    return;
                }
                
                // Validar tipo de archivo
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                if (!validTypes.includes(file.type)) {
                    showErrorText('Formato de imagen no válido. Use JPG, PNG o GIF.', false);
                    fileInput.value = ''; // Limpiar input
                    fileLabel.textContent = "Subir foto de fondo";
                    return;
                }
                
                const fileName = file.name;
                fileLabel.textContent = `${fileName}`;
                
                // Update background image preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (profileBackgroundImg) {
                        profileBackgroundImg.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
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

    // POST al guardar perfil
    const form = document.getElementById('signUpForm');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            let feedback = document.getElementById('custom-alert-message');
            if (feedback) {
                showErrorText('', false);
            }

            // Recolectar datos, enviar null si vacío
            const id = userData.id;
            const username = document.getElementById('username').value.trim() || '';
            const email = document.getElementById('mail').value.trim() || '';
            const full_name = document.getElementById('name').value.trim() || '';
            const gender = document.getElementById('gender').value || '';
            const birth_place = document.getElementById('countrySelect')?.value || '';
            const nationality = document.getElementById('nationalitySelect')?.value || '';
            
            // Usar FormData
            const formData = new FormData();
            formData.append('id', id); // ID para indicar que es actualización
            formData.append('username', username);
            formData.append('email', email);
            formData.append('full_name', full_name);
            formData.append('gender', gender);
            formData.append('birth_place', birth_place);
            formData.append('nationality', nationality);
            
            // Agregar archivos si existen
            const photoInput = document.getElementById('photo');
            if (photoInput && photoInput.files && photoInput.files[0]) {
                formData.append('photo', photoInput.files[0]);
            }
            
            const backgroundPhotoInput = document.getElementById('backgroundPhoto');
            if (backgroundPhotoInput && backgroundPhotoInput.files && backgroundPhotoInput.files[0]) {
                formData.append('backgroundPhoto', backgroundPhotoInput.files[0]);
            }
            // Contraseña solo si se llenó
            let password = document.getElementById('password').value;
            let passwordConf = document.getElementById('passwordConf').value;
            let hash_password = null;
            if (password && passwordConf) {
                if (password !== passwordConf) {
                    if (feedback) {
                        showErrorText('❌ Las contraseñas no coinciden.', false);
                    }
                    return;
                }
                // Validar requisitos aquí si quieres (longitud, etc)
                formData.append('hash_password', password);
            }

            // AJAX FETCH - POST /users
            try {
                console.log('Enviando POST a /users (edición con ID=' + id + ')');
                console.log('FormData entries:', Array.from(formData.entries()));
                
                const res = await fetch(`/users`, {
                    method: 'POST',
                    body: formData // No headers - browser will set multipart/form-data
                });
                
                console.log('Response status:', res.status);
                const result = await res.json();
                console.log('Response data:', result);
                if (result.exito) { 
                    if (feedback) {
                        showErrorText('✅ Cambios guardados correctamente.', true);
                    }
                    
                    // Si el backend devolvió datos actualizados completos, usarlos
                    if (result.user_data) {
                        console.log('Actualizando sessionStorage con datos completos del servidor');
                        userData = result.user_data; // Usar datos completos del servidor
                    } else {
                        // Fallback: actualizar campos individuales
                        console.log('Actualizando sessionStorage con datos del formulario');
                        if (username) userData.username = username;
                        if (email) userData.email = email;
                        if (full_name) userData.full_name = full_name;
                        if (gender) userData.gender = gender;
                        if (birth_place) userData.birth_place = birth_place;
                        if (nationality) userData.nationality = nationality;
                    }
                    
                    //función async para manejar compresión y guardado
                    const saveUserData = async () => {
                        try {
                            //1. intentar guardar datos completos primero
                            sessionStorage.setItem('user', JSON.stringify(userData));
                            console.log('User data saved to sessionStorage successfully');
                        } catch (error) {
                            //si se pasa un error de cuota comprimir imagenes
                            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                                console.warn('SessionStorage quota exceeded, compressing images');
                                
                                try {
                                    //comprimir imágenes y reintentar
                                    let compressedUserData = { ...userData };
                                    
                                    if (compressedUserData.image) {
                                        console.log('Compressing profile image...');
                                        compressedUserData.image = await compressImageForStorage(compressedUserData.image, 200);
                                    }
                                    
                                    if (compressedUserData.background_image) {
                                        console.log('Compressing background image...');
                                        compressedUserData.background_image = await compressImageForStorage(compressedUserData.background_image, 200);
                                    }
                                    
                                    sessionStorage.setItem('user', JSON.stringify(compressedUserData));
                                    console.log('User data saved with compressed images');
                                    
                                    // Actualizar userData para que las imágenes comprimidas se usen en UI
                                    userData = compressedUserData;
                                    
                                } catch (compressionError) {
                                    console.warn('Compression failed, saving without images');
                                    // Crear copia sin imágenes para sessionStorage
                                    const userDataNoImages = { ...userData };
                                    delete userDataNoImages.image;
                                    delete userDataNoImages.background_image;
                                    
                                    try {
                                        sessionStorage.setItem('user', JSON.stringify(userDataNoImages));
                                        console.log('User data saved without images');
                                        
                                        // Guardar imágenes comprimidas por separado para UI
                                        try {
                                            if (userData.image) {
                                                const compressedImage = await compressImageForStorage(userData.image, 150);
                                                sessionStorage.setItem('user_image_temp', compressedImage);
                                            }
                                            if (userData.background_image) {
                                                const compressedBg = await compressImageForStorage(userData.background_image, 150);
                                                sessionStorage.setItem('user_bg_temp', compressedBg);
                                            }
                                            console.log('Compressed images saved separately for UI');
                                        } catch (tempError) {
                                            console.log('Could not save even compressed images separately');
                                        }
                                        
                                    } catch (secondError) {
                                        console.error('Failed to save even without images:', secondError);
                                        sessionStorage.clear();
                                        const essentialData = {
                                            id: userData.id,
                                            username: userData.username,
                                            email: userData.email,
                                            full_name: userData.full_name
                                        };
                                        sessionStorage.setItem('user', JSON.stringify(essentialData));
                                    }
                                }
                            } else {
                                console.error('Unexpected sessionStorage error:', error);
                            }
                        }
                    };
                    
                    // Ejecutar la función de guardado
                    await saveUserData();
                    
                    //actualizar la foto en el navBar y perfil si hay nueva imagen
                    updateUserPhotoElements(userData);
                    
                    // Disparar evento personalizado para notificar cambio de datos de usuario
                    window.dispatchEvent(new CustomEvent('userDataUpdated', { 
                        detail: userData 
                    }));
                    
                    // Recargar la página después de 1.5 segundos
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    if (feedback) {
                        showErrorText('❌ Error: ' + (result.mensaje || 'No se pudo guardar.'), false);
                    }
                }
            } catch (err) {
                console.error('Error en POST:', err);
                if (feedback) {
                    showErrorText('❌ Error de conexión: ' + err.message, false);
                }
            }
        });
    }

    // Función para actualizar las imágenes del usuario en diferentes elementos
    function updateUserPhotoElements(optionalUserData = null) {
        // Usar datos pasados como parámetro o los de sessionStorage
        let userData = optionalUserData || JSON.parse(sessionStorage.getItem('user') || '{}');
        
        // Si no tiene imágenes en userData, buscar en storage temporal
        if (!userData.image) {
            const tempImage = sessionStorage.getItem('user_image_temp');
            if (tempImage) userData.image = tempImage;
        }
        
        if (!userData.background_image) {
            const tempBg = sessionStorage.getItem('user_bg_temp');
            if (tempBg) userData.background_image = tempBg;
        }
        
        // Actualizar foto en el navBar
        const navPhoto = document.getElementById('photoUser');
        if (navPhoto && userData.image) {
            if (userData.image.startsWith('data:') || userData.image.startsWith('http')) {
                navPhoto.src = userData.image;
                console.log('NavBar photo updated successfully');
            }
        }
        
        // Actualizar foto de perfil en la vista de perfil
        if (window.profilePhoto && userData.image) {
            if (userData.image.startsWith('data:') || userData.image.startsWith('http')) {
                profilePhoto.src = userData.image;
                console.log('Profile photo updated successfully');
            }
        }
        
        // Actualizar fondo de perfil en la vista de perfil
        if (window.profileBackground && userData.background_image) {
            if (userData.background_image.startsWith('data:') || userData.background_image.startsWith('http')) {
                profileBackground.src = userData.background_image;
                console.log('Background image updated successfully');
            }
        }
    }
    
    // Llamar al cargar la página para actualizar elementos del navBar
    updateUserPhotoElements();

    // Función para comprimir imagen si es muy grande para sessionStorage
    function compressImageForStorage(imageData, maxSizeKB = 500) {
        return new Promise((resolve) => {
            if (!imageData || !imageData.startsWith('data:image/')) {
                resolve(imageData);
                return;
            }

            // Calcular tamaño aproximado en KB
            const sizeKB = (imageData.length * 3) / 4 / 1024; // base64 a bytes a KB
            
            if (sizeKB <= maxSizeKB) {
                resolve(imageData);
                return;
            }

            console.log(`Compressing image from ${sizeKB.toFixed(1)}KB to fit storage`);

            // Si es muy grande, crear canvas para compresión
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calcular nuevas dimensiones manteniendo proporción
                let { width, height } = this;
                const maxDimension = 800; // Máximo 800px en cualquier lado
                
                if (width > height && width > maxDimension) {
                    height = (height * maxDimension) / width;
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = (width * maxDimension) / height;
                    height = maxDimension;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Dibujar imagen redimensionada
                ctx.drawImage(this, 0, 0, width, height);
                
                // Convertir a base64 con compresión
                const compressedData = canvas.toDataURL('image/jpeg', 0.7);
                const newSizeKB = (compressedData.length * 3) / 4 / 1024;
                console.log(`Image compressed to ${newSizeKB.toFixed(1)}KB`);
                
                resolve(compressedData);
            };
            img.src = imageData;
        });
    }

    // mensaje de error en el form
    function showErrorText(message, success) {
        let feedback = document.getElementById('custom-alert-message');
        if (feedback) {
            feedback.textContent = message;

            if(success) {
                feedback.classList.remove('text-danger');
                feedback.classList.add('text-success');
            } else {
            feedback.classList.remove('text-success');
            feedback.classList.add('text-danger');
            }

            feedback.style.display = 'block';
            feedback.style.visibility = 'visible';
            feedback.style.opacity = '1';
            
            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                feedback.style.opacity = '0';
                setTimeout(() => {
                    feedback.style.display = 'none';
                }, 300);
            }, 5000);
        } else {
            // Fallback si no existe el elemento de feedback
            alert(message);
        }
    }

});