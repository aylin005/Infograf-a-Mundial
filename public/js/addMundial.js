//globales para admin de mundiales
let adminCountriesData = [];
let hostCountries = [];
let funFacts = [];
let cities = [];
let stadiums = [];
let attachments = [];
let currentWorldCupId = null; // ID del mundial en edición (null = modo inserción)

document.addEventListener("DOMContentLoaded", () => {
    // verificar que el admin esté logueado 
    if (!window.adminData || !window.adminData.username) {
        console.error('Error: No se encontraron datos de administrador');
        showMessage('Error de autenticación. Redirigiendo...', 'error');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }
    
    console.log('Admin autenticado:', window.adminData.username);
    
    // Revisar si hay logs de la operación anterior
    checkLastAction();
    
    //inicialización
    initializeElements();
    loadCountries();
    setupEventListeners();
    initializeCitySelect();
    loadAdminWorldCupYears();
});

///////////////////////////////////////
// inicializa elementos del DOM
///////////////////////////////////////
function initializeElements() {
    //elementos principales
    const form = document.getElementById('mundial-form');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    //verificar que existan
    if (!form || !submitBtn || !cancelBtn) {
        console.error('Elementos principales no encontrados');
        return;
    }
}

//////////////////////////////////////
//configura todos los event listeners
//////////////////////////////////////
function setupEventListeners() {
    // formulario principal
    const form = document.getElementById('mundial-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    //boton de cancelar
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancel);
    }
    
    // Botón de añadir nuevo mundial
    const addMundialBtn = document.getElementById('addMundialButton');
    if (addMundialBtn) {
        addMundialBtn.addEventListener('click', startNewWorldCup);
    }

    // Botones de agregar
    setupAddButtons();
    
    // Previews de imágenes
    setupImagePreviews();
    
    // Validación en tiempo real
    setupValidation();
}

///////////////////////////////////////
// Verifica logs de la operación anterior
///////////////////////////////////////
function checkLastAction() {
    const lastAction = localStorage.getItem('lastMundialAction');
    if (lastAction) {
        try {
            const actionData = JSON.parse(lastAction);
            console.log('LOGS DE OPERACIÓN ANTERIOR:');
            console.log(`Acción: ${actionData.action}`);
            console.log(`ID usado: ${actionData.worldCupId}`);
            console.log(`Timestamp: ${actionData.timestamp}`);
            console.log(`Resultado:`, actionData.result);
            
            // Limpiar para próxima vez
            localStorage.removeItem('lastMundialAction');
        } catch (e) {
            console.error('Error al leer logs anteriores:', e);
        }
    }
}

///////////////////////////////////////
// Inicia modo inserción (nuevo mundial)
///////////////////////////////////////
function startNewWorldCup() {
    console.log('iniciando nuevo mundial...');
    clearForm();
    
    // Cambiar texto del botón a modo inserción
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.textContent = 'Guardar';
    }
    
    showMessage('Formulario listo para crear un nuevo mundial', 'info');
}

///////////////////////////////////////
// carga los paises desde la API
///////////////////////////////////////
async function loadCountries() {
    try {
        showSpinner('Cargando países...');
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,unicodeFlag,dialCode');
        const data = await response.json();
        
        if (data.error === false && data.data) {
            adminCountriesData = data.data;
            populateCountrySelects();
        } else {
            throw new Error('Error en la respuesta de la API');
        }
    } catch (error) {
        console.error('Error al cargar países:', error);
        showMessage('Error al cargar los países. Recarga la página.', 'danger');
    } finally {
        hideSpinner();
    }
}

/////////////////////////////////////////////////
// llena todos los selectores de países
///////////////////////////////////////
function populateCountrySelects() {
    const selectors = [
        { select: 'hostCountrySelect', flag: 'hostFlag' },
        { select: 'winnerCountrySelect', flag: 'winnerFlag' },
        { select: 'finalTeam1Select', flag: null },
        { select: 'finalTeam2Select', flag: null },
        { select: 'penaltyTeam1Select', flag: null },
        { select: 'penaltyTeam2Select', flag: null }
    ];

    selectors.forEach(({ select, flag }) => {
        const selectElement = document.getElementById(select);
        const flagElement = flag ? document.getElementById(flag) : null;
        
        if (selectElement) {
            populateCountrySelect(selectElement, flagElement);
        }
    });
}

/////////////////////////////////////////////
// llena un selector especifico con paises
/////////////////////////////////////////////
function populateCountrySelect(selectElement, flagElement) {
    selectElement.innerHTML = '<option value="">Seleccione un país</option>';
    
    if (flagElement) {
        flagElement.style.display = 'none';
        flagElement.src = '';
    }
    
    adminCountriesData.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = country.name;
        option.dataset.flag = country.flag || '';
        selectElement.appendChild(option);
    });
    
    // Listener para actualizar bandera
    if (flagElement) {
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
}

//////////////////////////////////////////////////
 // configura los botones de agregar elementos
 /////////////////////////////////////////
function setupAddButtons() {
    // agregar país sede
    const addHostCountryBtn = document.querySelector('.addButton[data-type="host-country"]') || 
                              document.querySelectorAll('.addButton')[0];
    if (addHostCountryBtn) {
        addHostCountryBtn.addEventListener('click', addHostCountry);
    }

    // agregar dato curioso
    const addFunFactBtn = document.querySelector('.addButton[data-type="fun-fact"]') || 
                          document.querySelectorAll('.addButton')[1];
    if (addFunFactBtn) {
        addFunFactBtn.addEventListener('click', addFunFact);
    }

    // agregar ciudad
    const addCityBtn = document.querySelector('.addButton[data-type="city"]') || 
                       document.querySelectorAll('.addButton')[2];
    if (addCityBtn) {
        addCityBtn.addEventListener('click', addCity);
    }

    // agregar estadio
    const addStadiumBtn = document.querySelector('.addButton[data-type="stadium"]') || 
                          document.querySelectorAll('.addButton')[3];
    if (addStadiumBtn) {
        addStadiumBtn.addEventListener('click', addStadium);
    }

    // agregar anexo
    const addAttachmentBtn = document.querySelector('.addButton[data-type="attachment"]') || 
                             document.querySelectorAll('.addButton')[4];
    if (addAttachmentBtn) {
        addAttachmentBtn.addEventListener('click', addAttachment);
    }
}

///////////////////////////////////////
// agrega un país sede
///////////////////////////////////////
function addHostCountry() {
    const countrySelect = document.getElementById('hostCountrySelect') || 
                         document.getElementById('nationalitySelect');
    
    if (!countrySelect || !countrySelect.value) {
        showMessage('Selecciona un país primero', 'warning');
        return;
    }

    const selectedCountry = countrySelect.value;
    const selectedOption = countrySelect.options[countrySelect.selectedIndex];
    const flagUrl = selectedOption.dataset.flag;

    // Verificar si ya existe
    if (hostCountries.find(country => country.name === selectedCountry)) {
        showMessage('Este país ya está agregado como sede', 'warning');
        return;
    }

    hostCountries.push({
        name: selectedCountry,
        flag: flagUrl
    });

    updateHostCountriesList();
    countrySelect.value = '';
    
    const flagElement = document.getElementById('hostFlag') || 
                       document.getElementById('natFlag');
    if (flagElement) {
        flagElement.style.display = 'none';
    }

    // Actualizar ciudades cuando se agrega un país
    updateCitiesFromHostCountries();
}

////////////////////////////////////////////////////
 // actualiza la lista de países sede
 /////////////////////////////////////////
function updateHostCountriesList() {
    const container = document.getElementById('previewCountries');
    if (!container) return;

    container.innerHTML = '';
    
    hostCountries.forEach((country, index) => {
        const countryDiv = document.createElement('div');
        countryDiv.className = 'd-flex align-items-center height50x';
        countryDiv.innerHTML = `
            <p class="showListElement shadow">${country.name}</p>
            <button type="button" class="addButton" onclick="removeHostCountry(${index})">
                <i class="bi bi-x-square deleteIcon"></i>
            </button>
        `;
        container.appendChild(countryDiv);
    });
}

/////////////////////////////////////////////////
 // remueve un país sede
 /////////////////////////////////////////
function removeHostCountry(index) {
    hostCountries.splice(index, 1);
    updateHostCountriesList();
    // Actualizar ciudades cuando se remueve un país
    updateCitiesFromHostCountries();
}

///////////////////////////////////////
// Variables para manejo de ciudades
///////////////////////////////////////
let citiesCache = {}; // Cache para evitar llamadas repetidas a la API

///////////////////////////////////////
// Obtiene ciudades de un país específico
///////////////////////////////////////
async function getCitiesForCountry(countryName) {
    // Verificar cache primero
    if (citiesCache[countryName]) {
        return citiesCache[countryName];
    }

    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                country: countryName.toLowerCase()
            })
        });

        const data = await response.json();
        
        if (data.error === false && data.data) {
            // Guardar en cache
            citiesCache[countryName] = data.data;
            return data.data;
        } else {
            console.warn(`No se encontraron ciudades para ${countryName}`);
            return [];
        }
    } catch (error) {
        console.error(`Error al obtener ciudades para ${countryName}:`, error);
        return [];
    }
}

///////////////////////////////////////
// Actualiza el select de ciudades basado en los países sede
///////////////////////////////////////
async function updateCitiesFromHostCountries() {
    const citySelect = document.getElementById('citySelect');
    if (!citySelect) return;

    // Mostrar spinner mientras carga
    showSpinner('Cargando ciudades...');
    
    try {
        if (hostCountries.length === 0) {
            // No hay países sede, deshabilitar select
            citySelect.innerHTML = '<option value="">Primero agrega países sede</option>';
            citySelect.disabled = true;
            hideSpinner();
            return;
        }

        // Limpiar select y habilitar
        citySelect.innerHTML = '<option value="">Cargando ciudades...</option>';
        citySelect.disabled = false;

        // Obtener ciudades para todos los países sede
        const allCities = [];
        for (const country of hostCountries) {
            const cities = await getCitiesForCountry(country.name);
            
            // Agregar ciudades con información del país
            cities.forEach(city => {
                allCities.push({
                    name: city,
                    country: country.name,
                    flag: country.flag
                });
            });
        }

        // Ordenar ciudades alfabéticamente
        allCities.sort((a, b) => a.name.localeCompare(b.name));

        // Cambiar mensaje inicial
        citySelect.innerHTML = '<option value="">Seleccione una ciudad</option>';
        
        // Agregar ciudades al select
        allCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.name;
            option.textContent = `${city.name} (${city.country})`;
            option.dataset.country = city.country;
            option.dataset.flag = city.flag;
            citySelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error al actualizar ciudades:', error);
        showMessage('Error al cargar ciudades', 'danger');
    } finally {
        hideSpinner();
    }
}

///////////////////////////////////////
// Inicializa el select de ciudades vacío
///////////////////////////////////////
function initializeCitySelect() {
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
        citySelect.innerHTML = '<option value="">Primero agrega países sede</option>';
        citySelect.disabled = true;
    }
}

///////////////////////////////////////
// agrega un dato curioso
///////////////////////////////////////
function addFunFact() {
    const input = document.getElementById('funFact');
    if (!input || !input.value.trim()) {
        showMessage('Escribe un dato curioso primero', 'warning');
        return;
    }

    funFacts.push(input.value.trim());
    updateFunFactsList();
    input.value = '';
}

///////////////////////////////////////////
 // actualiza la lista de datos curiosos
 /////////////////////////////////////////
function updateFunFactsList() {
    const container = document.querySelector('#previewCountries.setHeight500px') || 
                     document.querySelectorAll('.previewList')[1];
    if (!container) return;

    container.innerHTML = '';
    
    funFacts.forEach((fact, index) => {
        const factDiv = document.createElement('div');
        factDiv.className = 'd-flex align-items-center';
        factDiv.innerHTML = `
            <p class="showListElement shadow">${fact}</p>
            <button type="button" class="addButton" onclick="editFunFact(${index})">
                <i class="bi bi-pencil-square deleteIcon"></i>
            </button>
            <button type="button" class="addButton" onclick="removeFunFact(${index})">
                <i class="bi bi-x-square deleteIcon"></i>
            </button>
        `;
        container.appendChild(factDiv);
    });
}

///////////////////////////////////////////
 // edita un dato curioso
 /////////////////////////////////////////
function editFunFact(index) {
    const newFact = prompt('Editar dato curioso:', funFacts[index]);
    if (newFact && newFact.trim()) {
        funFacts[index] = newFact.trim();
        updateFunFactsList();
    }
}

///////////////////////////////////////////
 // remueve un dato curioso
 /////////////////////////////////////////
function removeFunFact(index) {
    funFacts.splice(index, 1);
    updateFunFactsList();
}

///////////////////////////////////////
// agrega una ciudad
///////////////////////////////////////
function addCity() {
    const citySelect = document.getElementById('citySelect');
    if (!citySelect || !citySelect.value.trim()) {
        showMessage('Selecciona una ciudad primero', 'warning');
        return;
    }

    const selectedOption = citySelect.options[citySelect.selectedIndex];
    const cityName = citySelect.value.trim();
    const countryName = selectedOption.dataset.country || 'País desconocido';
    
    // Verificar si ya existe (buscar por nombre de ciudad)
    if (cities.some(city => typeof city === 'string' ? city === cityName : city.name === cityName)) {
        showMessage('Esta ciudad ya está agregada', 'warning');
        return;
    }

    // Agregar ciudad con información del país
    const cityData = {
        name: cityName,
        country: countryName,
        flag: selectedOption.dataset.flag
    };

    cities.push(cityData);
    updateCitiesList();
    citySelect.value = '';
}

///////////////////////////////////////
// actualiza la lista de ciudades
///////////////////////////////////////
function updateCitiesList() {
    const container = document.querySelector('.col-6.border-end .previewList');
    if (!container) return;

    container.innerHTML = '';
    
    cities.forEach((city, index) => {
        const cityDiv = document.createElement('div');
        cityDiv.className = 'd-flex align-items-center height50x activeCursor';
        
        // Manejar tanto strings simples como objetos
        const cityName = typeof city === 'string' ? city : city.name;
        const countryInfo = typeof city === 'object' && city.country ? ` (${city.country})` : '';
        
        cityDiv.innerHTML = `
            <p class="showListElement shadow">${cityName}${countryInfo}</p>
            <button type="button" class="addButton" onclick="removeCity(${index})">
                <i class="bi bi-x-square deleteIcon"></i>
            </button>
        `;
        container.appendChild(cityDiv);
    });
}

///////////////////////////////////////////
 // remueve una ciudad
 /////////////////////////////////////////
function removeCity(index) {
    cities.splice(index, 1);
    updateCitiesList();
}

///////////////////////////////////////////
 // agrega un estadio
 /////////////////////////////////////////
function addStadium() {
    const stadiumInput = document.getElementById('stadium');
    if (!stadiumInput || !stadiumInput.value.trim()) {
        showMessage('Escribe el nombre del estadio primero', 'warning');
        return;
    }

    const stadiumName = stadiumInput.value.trim();
    
    if (stadiums.includes(stadiumName)) {
        showMessage('Este estadio ya está agregado', 'warning');
        return;
    }

    stadiums.push(stadiumName);
    updateStadiumsList();
    stadiumInput.value = '';
}

///////////////////////////////////////////
 // actualiza la lista de estadios
 /////////////////////////////////////////
function updateStadiumsList() {
    const container = document.querySelector('.col-6:not(.border-end) .previewList');
    if (!container) return;

    container.innerHTML = '';
    
    stadiums.forEach((stadium, index) => {
        const stadiumDiv = document.createElement('div');
        stadiumDiv.className = 'd-flex align-items-center height50x';
        stadiumDiv.innerHTML = `
            <p class="showListElement shadow">${stadium}</p>
            <button type="button" class="addButton" onclick="removeStadium(${index})">
                <i class="bi bi-x-square deleteIcon"></i>
            </button>
        `;
        container.appendChild(stadiumDiv);
    });
}

///////////////////////////////////////////
 // remueve un estadio
 /////////////////////////////////////////
function removeStadium(index) {
    stadiums.splice(index, 1);
    updateStadiumsList();
}

///////////////////////////////////////////
 // agrega un anexo
 /////////////////////////////////////////
function addAttachment() {
    const fileInput = document.getElementById('mundialPhoto');
    const tooltipInput = document.getElementById('tooltip');
    
    if (!fileInput || !fileInput.files[0]) {
        showMessage('Selecciona una imagen primero', 'warning');
        return;
    }

    if (!tooltipInput || !tooltipInput.value.trim()) {
        showMessage('Escribe una descripción para el anexo', 'warning');
        return;
    }

    const file = fileInput.files[0];
    const description = tooltipInput.value.trim();

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
        showMessage('Solo se permiten archivos de imagen', 'danger');
        return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('El archivo es demasiado grande. Máximo 5MB', 'danger');
        return;
    }

    attachments.push({
        file: file,
        description: description
    });

    updateAttachmentsList();
    fileInput.value = '';
    tooltipInput.value = '';
    
    // limpiar el nombre del archivo mostrado
    const attachmentFileNameDisplay = document.getElementById('attachmentFileName');
    if (attachmentFileNameDisplay) {
        attachmentFileNameDisplay.style.display = 'none';
        attachmentFileNameDisplay.textContent = '';
    }
}

/////////////////////////////////////////////
 // actualiza la lista de anexos
 /////////////////////////////////////////
function updateAttachmentsList() {
    const container = document.querySelector('.imageContainer');
    if (!container) return;

    container.innerHTML = '';
    
    attachments.forEach((attachment, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const attachmentDiv = document.createElement('div');
            attachmentDiv.className = 'previewInfoImage';
            attachmentDiv.innerHTML = `
                <img src="${e.target.result}" class="img-fluid mundialImage shadow-lg" alt="${attachment.description}">
                <button type="button" class="noBackground noBorder" onclick="removeAttachment(${index})">
                    <i class="bi bi-x-square-fill quitIcon"></i>
                </button>
                <p class="text-center mt-2">${attachment.description}</p>
            `;
            container.appendChild(attachmentDiv);
        };
        reader.readAsDataURL(attachment.file);
    });
}

///////////////////////////////////////////
 // remueve un anexo
 /////////////////////////////////////////
function removeAttachment(index) {
    attachments.splice(index, 1);
    updateAttachmentsList();
}

///////////////////////////////////////////
 // configura las previsualizaciones de imágenes
 /////////////////////////////////////////
function setupImagePreviews() {
    // Logo del mundial
    const logoInput = document.getElementById('mundialLogo');
    const logoImg = document.getElementById('logo');
    
    if (logoInput && logoImg) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    showMessage('[❌] Solo se permiten archivos de imagen', 'danger');
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    showMessage('[❌] El archivo es demasiado grande. Máximo 5MB', 'danger');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    logoImg.src = e.target.result;
                    // mantener las clases originales para el estilo
                    logoImg.className = 'img-fluid formLogo shadow-lg';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Imagen principal del mundial
    const principalPhotoInput = document.getElementById('mundialPrincipalPhoto');
    const principalPhotoImg = document.getElementById('mundialPrincipalImage');
    
    if (principalPhotoInput && principalPhotoImg) {
        principalPhotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    showMessage('[❌] Solo se permiten archivos de imagen', 'danger');
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    showMessage('[❌] El archivo es demasiado grande. Máximo 5MB', 'danger');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    principalPhotoImg.src = e.target.result;
                    
                    // ajustar la imagen a sus dimensiones naturales manteniendo el estilo
                    const img = new Image();
                    img.onload = function() {
                        // calcular aspect ratio
                        const aspectRatio = this.naturalWidth / this.naturalHeight;
                        
                        // ajustar el estilo para mantener las proporciones
                        principalPhotoImg.style.width = 'auto';
                        principalPhotoImg.style.height = 'auto';
                        principalPhotoImg.style.maxWidth = '100%';
                        principalPhotoImg.style.maxHeight = '400px';
                        
                        // si la imagen es muy ancha, limitarla por ancho
                        if (aspectRatio > 1.5) {
                            principalPhotoImg.style.width = '100%';
                            principalPhotoImg.style.height = 'auto';
                        }
                        // si la imagen es muy alta, limitarla por altura
                        else if (aspectRatio < 0.7) {
                            principalPhotoImg.style.height = '300px';
                            principalPhotoImg.style.width = 'auto';
                        }
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Input de imagen para anexos
    const attachmentPhotoInput = document.getElementById('mundialPhoto');
    const attachmentFileNameDisplay = document.getElementById('attachmentFileName');
    
    if (attachmentPhotoInput && attachmentFileNameDisplay) {
        attachmentPhotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // mostrar el nombre del archivo
                attachmentFileNameDisplay.textContent = file.name;
                attachmentFileNameDisplay.style.display = 'block';
            } else {
                // ocultar si no hay archivo
                attachmentFileNameDisplay.style.display = 'none';
                attachmentFileNameDisplay.textContent = '';
            }
        });
    }
}

/////////////////////////////////////////////
 // configura la validación en tiempo real
 /////////////////////////////////////////
function setupValidation() {
    const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Remover clase de error si el campo tiene valor
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    });
}

/////////////////////////////////////////////
 // valida un campo específico
 /////////////////////////////////////////
function validateField(field) {
    const isValid = field.value.trim() !== '';
    
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
    }
    
    return isValid;
}

/////////////////////////////////////////////
 // valida todo el formulario
 /////////////////////////////////////////
function validateForm() {
    console.log('Iniciando validación del formulario...');
    const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    console.log('Campos requeridos encontrados:', requiredInputs.length);
    
    requiredInputs.forEach(input => {
        const fieldValid = validateField(input);
        console.log(`Campo ${input.id || input.name}: ${fieldValid ? 'válido' : 'inválido'}`);
        if (!fieldValid) {
            isValid = false;
        }
    });
    
    // validaciones específicas
    console.log('Países sede agregados:', hostCountries.length);
    if (hostCountries.length === 0) {
        console.log('Falla validación: sin países sede');
        showMessage('[❌] Debe agregar al menos un país sede', 'danger');
        isValid = false;
    }
    
    const logoPhoto = document.getElementById('mundialLogo');
    const hasLogo = logoPhoto && logoPhoto.files[0];
    console.log('Logo seleccionado:', hasLogo);
    if (!hasLogo) {
        console.log('Falla validación: sin logo');
        showMessage('[❌] Debe seleccionar un logo del mundial', 'danger');
        isValid = false;
    }
    
    const principalPhoto = document.getElementById('mundialPrincipalPhoto');
    const hasPrincipalPhoto = principalPhoto && principalPhoto.files[0];
    console.log('Imagen principal seleccionada:', hasPrincipalPhoto);
    if (!hasPrincipalPhoto) {
        console.log('Falla validación: sin imagen principal');
        showMessage('[❌] Debe seleccionar una imagen principal', 'danger');
        isValid = false;
    }
    
    console.log('Validación final:', isValid);
    
    return isValid;
}

//////////////////////////////////////////////
// maneja el envio del formulario
//////////////////////////////////////////////
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showMessage('[❌] Por favor, complete todos los campos obligatorios', 'danger');
        return;
    }
    
    try {
        showSpinner('Guardando mundial...');
        
        const formData = new FormData();
        
        // id del mundial para modo edicion
        if (currentWorldCupId !== null && currentWorldCupId !== undefined) {
            formData.append('id', currentWorldCupId);
        }
        
        // datos basicos
        formData.append('year', document.getElementById('mundialYear')?.value || '');
        formData.append('name', document.getElementById('mundialName')?.value || '');
        formData.append('slogan', document.getElementById('mundialSlogan')?.value || '');
        formData.append('description', document.getElementById('generalDescription')?.value || '');
        
        // imagenes
        const logoPhoto = document.getElementById('mundialLogo');
        if (logoPhoto && logoPhoto.files[0]) {
            formData.append('logo', logoPhoto.files[0]);
        }
        
        const principalPhoto = document.getElementById('mundialPrincipalPhoto');
        if (principalPhoto && principalPhoto.files[0]) {
            formData.append('image', principalPhoto.files[0]);
        }
        
        const principalDescription = document.getElementById('imageDescription');
        if (principalDescription) {
            formData.append('image_description', principalDescription.value);
        }
        
        // datos estructurados
        formData.append('host_countries_json', JSON.stringify(hostCountries));
        formData.append('fun_fact', funFacts.join(' | '));
        formData.append('extra_info', JSON.stringify({
            cities: cities,
            stadiums: stadiums
        }));
        
        // resultados de la final
        const team1 = document.getElementById('finalTeam1Select')?.value || '';
        const team2 = document.getElementById('finalTeam2Select')?.value || '';
        const goals1 = document.getElementById('finalGoalsTeam1')?.value || 0;
        const goals2 = document.getElementById('finalGoalsTeam2')?.value || 0;
        
        // determinar campeon y subcampeon
        const winnerCountry = document.getElementById('winnerCountrySelect')?.value || '';
        let champion = winnerCountry;
        let subchampion = '';
        
        if (winnerCountry === team1) {
            subchampion = team2;
        } else if (winnerCountry === team2) {
            subchampion = team1;
        } else {
            subchampion = team1 || team2;
        }
        
        formData.append('champion', champion);
        formData.append('subchampion', subchampion);
        formData.append('score', `${goals1}-${goals2}`);
        formData.append('overtime', document.getElementById('extraTime')?.value || 0);
        formData.append('penalties_champion', document.getElementById('penaltyGoalsTeam1')?.value || 0);
        formData.append('penalties_subchampion', document.getElementById('penaltyGoalsTeam2')?.value || 0);
        formData.append('leading_scorer', '');
        
        // admin id de la sesion
        const adminUsername = window.adminData?.username || '';
        if (!adminUsername) {
            showMessage('Error: No se pudo obtener la información del administrador', 'error');
            return;
        }
        formData.append('admin_id', adminUsername);
        
        // anexos
        attachments.forEach((attachment, index) => {
            formData.append(`attachment_${index}`, attachment.file);
            formData.append(`attachment_${index}_description`, attachment.description);
        });
        formData.append('attachments_count', attachments.length.toString());
        
        // enviar datos FETCH
        const response = await fetch('/worldcups', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.exito === 1 || result.exito === true) {
            showMessage(`Mundial ${currentWorldCupId ? 'actualizado' : 'creado'} exitosamente`, 'success');
            setTimeout(() => {
                window.location.href = '/adminMundials';
            }, 2000);
        } else {
            throw new Error(result.mensaje || `Error al ${currentWorldCupId ? 'actualizar' : 'crear'} el mundial`);
        }
        
    } catch (error) {
        console.error('Error en handleSubmit:', error);
        showMessage(`Error al ${currentWorldCupId ? 'actualizar' : 'crear'} el mundial: ${error.message}`, 'danger');
    } finally {
        hideSpinner();
    }
}

////////////////////////////////////////////
//maneja la cancelación
 ////////////////////////////////////////////
function handleCancel() {
    const confirmDiscard = confirm("[⚠️] A T E N C I Ó N. Hay cambios pendientes, si continua, los datos se borrarán ¿Continuar?");
    if (confirmDiscard) {
        window.location.href = "/adminMundials";
    }
}

////////////////////////////////////////////
//muestra un mensaje al usuario
 ////////////////////////////////////////////
function showMessage(message, type = 'info') {
    // usar el mismo estilo que signUp
    DisplayCustomAlert(message);
    
    // hacer scroll hacia el mensaje
    const alertElement = document.getElementById('custom-alert-message');
    if (alertElement) {
        alertElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
}

////////////////////////////////////////////
//muestra el spinner
 ////////////////////////////////////////////
function showSpinner(message = 'Cargando...') {
    const existingSpinner = document.querySelector('.spinner-overlay');
    if (existingSpinner) return;

    const spinnerOverlay = document.createElement('div');
    spinnerOverlay.className = 'spinner-overlay';
    spinnerOverlay.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
            <p class="spinner-text">${message}</p>
        </div>
    `;
    document.body.appendChild(spinnerOverlay);
}

////////////////////////////////////////////
//oculta el spinner
 ////////////////////////////////////////////
function hideSpinner() {
    const spinner = document.querySelector('.spinner-overlay');
    if (spinner) {
        spinner.remove();
    }
}

///////////////////////////////////////
// Variables para timeline de años
///////////////////////////////////////
let adminWorldCupYears = [];
let currentTimelineIndex = 0;
const VISIBLE_BUTTONS = 3; // Cantidad de botones visibles a la vez

///////////////////////////////////////
// Carga los años de mundiales desde la API
///////////////////////////////////////
async function loadAdminWorldCupYears() {
    try {
        showSpinner('Cargando años de mundiales...');
        
        const response = await fetch('/worldcups/years', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            // Ordenar por año (más reciente primero)
            adminWorldCupYears = data.sort((a, b) => parseInt(b.year) - parseInt(a.year));
            console.log('Años de mundiales cargados:', adminWorldCupYears);
            
            // Renderizar timeline
            renderTimeline();
            setupTimelineEvents();
        } else {
            console.warn('No se encontraron años de mundiales');
            adminWorldCupYears = [];
            renderTimeline();
        }
    } catch (error) {
        console.error('Error al cargar años de mundiales:', error);
        showMessage('Error al cargar los años de mundiales', 'danger');
        adminWorldCupYears = [];
        renderTimeline();
    } finally {
        hideSpinner();
    }
}

///////////////////////////////////////
// Renderiza los botones de timeline
///////////////////////////////////////
function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    container.innerHTML = '';

    if (adminWorldCupYears.length === 0) {
        container.innerHTML = '<p class="text-white">No hay mundiales registrados</p>';
        updateArrowVisibility();
        return;
    }

    // Calcular el rango visible
    const startIndex = currentTimelineIndex;
    const endIndex = Math.min(startIndex + VISIBLE_BUTTONS, adminWorldCupYears.length);
    const visibleYears = adminWorldCupYears.slice(startIndex, endIndex);

    // Crear botones
    visibleYears.forEach((worldCup, index) => {
        const button = document.createElement('button');
        button.className = 'timelineButton shadow';
        button.textContent = worldCup.year;
        button.dataset.worldcupId = worldCup.id;
        button.dataset.year = worldCup.year;
        
        // Event listener para seleccionar mundial
        button.addEventListener('click', () => selectWorldCup(worldCup.id, worldCup.year));
        
        container.appendChild(button);
    });

    updateArrowVisibility();
}

///////////////////////////////////////
// Actualiza la visibilidad de las flechas
///////////////////////////////////////
function updateArrowVisibility() {
    const moveLeft = document.getElementById('moveLeft');
    const moveRight = document.getElementById('moveRight');
    
    if (moveLeft && moveRight) {
        // Flecha izquierda: visible si no estamos en el inicio
        moveLeft.style.opacity = currentTimelineIndex > 0 ? '1' : '0.3';
        moveLeft.style.cursor = currentTimelineIndex > 0 ? 'pointer' : 'default';
        
        // Flecha derecha: visible si hay más elementos a la derecha
        const hasMore = currentTimelineIndex + VISIBLE_BUTTONS < adminWorldCupYears.length;
        moveRight.style.opacity = hasMore ? '1' : '0.3';
        moveRight.style.cursor = hasMore ? 'pointer' : 'default';
    }
}

///////////////////////////////////////
// Configura los event listeners de timeline
///////////////////////////////////////
function setupTimelineEvents() {
    const moveLeft = document.getElementById('moveLeft');
    const moveRight = document.getElementById('moveRight');

    if (moveLeft) {
        moveLeft.addEventListener('click', () => {
            if (currentTimelineIndex > 0) {
                currentTimelineIndex--;
                renderTimeline();
            }
        });
    }

    if (moveRight) {
        moveRight.addEventListener('click', () => {
            if (currentTimelineIndex + VISIBLE_BUTTONS < adminWorldCupYears.length) {
                currentTimelineIndex++;
                renderTimeline();
            }
        });
    }
}

///////////////////////////////////////
// Selecciona un mundial específico
///////////////////////////////////////
function selectWorldCup(worldCupId, year) {
    console.log(`Mundial seleccionado: ${year} (ID: ${worldCupId})`);
    
    // Destacar botón seleccionado
    document.querySelectorAll('.timelineButton').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    const selectedButton = document.querySelector(`[data-worldcup-id="${worldCupId}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
    
    // Cargar datos del mundial para edición
    loadWorldCupData(worldCupId);
}

///////////////////////////////////////
// carga los datos de un mundial especifico para edicion
///////////////////////////////////////
async function loadWorldCupData(worldCupId) {
    try {
        showSpinner('Cargando datos del mundial...');
        
        const response = await fetch(`/worldcups/${worldCupId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // almacenar el id del mundial para modo edicion
        currentWorldCupId = worldCupId;
        
        // cambiar texto del boton
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.textContent = 'Actualizar';
        }
        
        // asegurarse de que los paises esten cargados antes de rellenar el formulario
        if (adminCountriesData.length === 0) {
            await loadCountries();
        }
        
        // rellenar el formulario con los datos del mundial
        await populateFormWithWorldCupData(data);
        
    } catch (error) {
        console.error('Error al cargar datos del mundial:', error);
        showMessage('Error al cargar los datos del mundial', 'danger');
    } finally {
        hideSpinner();
    }
}

///////////////////////////////////////
// rellena el formulario con los datos del mundial
///////////////////////////////////////
async function populateFormWithWorldCupData(data) {
    // limpiar datos del formulario (preservando el modo edicion)
    clearFormData();
    
    // campos de texto basicos
    setInputValue('mundialYear', data.year);
    setInputValue('mundialName', data.name);
    setInputValue('mundialSlogan', data.slogan);
    setInputValue('generalDescription', data.description);
    setInputValue('imageDescription', data.image_description);
    
    // selects de paises
    setSelectValue('winnerCountrySelect', data.champion);
    setSelectValue('finalTeam1Select', data.champion);
    setSelectValue('finalTeam2Select', data.subchampion);
    setSelectValue('penaltyTeam1Select', data.champion);
    setSelectValue('penaltyTeam2Select', data.subchampion);
    
    // parsear el score para obtener goles individuales
    if (data.score) {
        const scoreMatch = data.score.match(/(\d+)-(\d+)/);
        if (scoreMatch) {
            setInputValue('finalGoalsTeam1', scoreMatch[1]);      // Goles equipo 1
            setInputValue('finalGoalsTeam2', scoreMatch[2]);      // Goles equipo 2
        }
    }
    
    // tiempo extra y penalties
    setInputValue('extraTime', data.overtime || 0);
    setInputValue('penaltyGoalsTeam1', data.penalties_champion || 0);
    setInputValue('penaltyGoalsTeam2', data.penalties_subchampion || 0);
    
    // datos curiosos
    if (data.fun_fact) {
        funFacts = data.fun_fact.split(' | ').filter(fact => fact.trim());
        updateFunFactsList();
    }
    
    // informacion extra
    if (data.extra_info) {
        try {
            const extraInfo = typeof data.extra_info === 'string' ? JSON.parse(data.extra_info) : data.extra_info;
            console.log('Extra info parsed:', extraInfo);
            
            if (extraInfo.cities && Array.isArray(extraInfo.cities)) {
                // Cities ya vienen como objetos con {name, country, flag}
                cities = extraInfo.cities.map(city => ({
                    name: city.name || city,
                    country: city.country || 'Unknown',
                    flag: city.flag || ''
                }));
                console.log('Cities loaded from extra_info:', cities);
                updateCitiesList();
            }
            
            if (extraInfo.stadiums && Array.isArray(extraInfo.stadiums)) {
                stadiums = [...extraInfo.stadiums]; // clonar array
                console.log('Stadiums loaded from extra_info:', stadiums);
                updateStadiumsList();
            }
        } catch (e) {
            console.warn('Error parsing extra_info JSON:', e);
        }
    }
    
    // paises sede - evitar duplicados y extraer ciudades/estadios
    if (data.host_countries && Array.isArray(data.host_countries)) {
        hostCountries = [];
        const uniqueCountries = new Set();
        const uniqueCitiesFromHC = new Set();
        const uniqueStadiumsFromHC = new Set();
        
        // Set para ciudades y estadios únicos
        const uniqueCities = new Set();
        const uniqueStadiums = new Set();
        
        data.host_countries.forEach(hc => {
            // Agregar países únicos
            if (!uniqueCountries.has(hc.country)) {
                uniqueCountries.add(hc.country);
                hostCountries.push({
                    name: hc.country,
                    flag: '' // Se llenará posteriormente
                });
            }
            
            // Extraer ciudades únicas de host_countries (si no vinieron de extra_info)
            if (hc.city && hc.city !== 'Unknown' && !uniqueCities.has(hc.city)) {
                uniqueCities.add(hc.city);
                // Solo agregar si no hay ciudades de extra_info
                if (cities.length === 0) {
                    cities.push({
                        name: hc.city,
                        country: hc.country,
                        flag: ''
                    });
                }
            }
            
            // Extraer estadios únicos de host_countries (si no vinieron de extra_info)
            if (hc.stadium && hc.stadium !== 'Unknown' && !uniqueStadiums.has(hc.stadium)) {
                uniqueStadiums.add(hc.stadium);
                // Solo agregar si no hay estadios de extra_info
                if (stadiums.length === 0) {
                    stadiums.push(hc.stadium);
                }
            }
        });
        
        console.log('Final data loaded:');
        console.log('- Host countries:', hostCountries);
        console.log('- Cities:', cities);
        console.log('- Stadiums:', stadiums);
        
        updateHostCountriesList();
        updateCitiesList();
        updateStadiumsList();
        updateCitiesFromHostCountries(); // Para habilitar el selector de ciudades
    }
    
    // attachments - cargar desde base64
    if (data.attachments && Array.isArray(data.attachments)) {
        loadAttachmentsFromData(data.attachments);
    }
    
    // mostrar imagenes como preview y convertir a archivos
    if (data.image) {
        showImagePreview('image', data.image);
        await convertBase64ToFileInput('image', data.image, 'mundialPrincipalPhoto');
    }
    if (data.logo) {
        showImagePreview('logo', data.logo);
        await convertBase64ToFileInput('logo', data.logo, 'mundialLogo');
    }
}

///////////////////////////////////////
// muestra preview de imagen desde base64
///////////////////////////////////////
function showImagePreview(type, base64Data) {
    let previewId;
    
    // mapear a los ids del html
    if (type === 'image') {
        previewId = 'mundialPrincipalImage';
    } else if (type === 'logo') {
        previewId = 'logo';
    }
    
    const preview = document.getElementById(previewId);
    
    if (preview && base64Data) {
        // verificar si es una url valida o base64
        if (base64Data.startsWith('data:') || base64Data.startsWith('http')) {
            preview.src = base64Data;
        } else {
            // si es solo base64 sin prefijo, agregarlo
            preview.src = `data:image/jpeg;base64,${base64Data}`;
        }
        preview.style.display = 'block';
    }
}

///////////////////////////////////////
// funciones auxiliares para rellenar formulario
///////////////////////////////////////
function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element && value !== null && value !== undefined) {
        element.value = value;
    }
}

function setSelectValue(id, value) {
    const element = document.getElementById(id);
    if (element && value !== null && value !== undefined && value !== '') {
        const normalizedValue = value.toLowerCase().trim();
        let found = false;
        
        for (let option of element.options) {
            const optionText = option.textContent.toLowerCase().trim();
            const optionValue = option.value.toLowerCase().trim();
            
            // buscar coincidencia exacta o parcial
            if (optionValue === normalizedValue || 
                optionText === normalizedValue ||
                optionText.includes(normalizedValue) || 
                normalizedValue.includes(optionText)) {
                
                element.value = option.value;
                element.dispatchEvent(new Event('change'));
                found = true;
                break;
            }
        }
        
        if (!found) {
            console.warn(`No se encontro opcion para ${id} con valor: "${value}"`);
        }
    }
}

// limpia solo los datos del formulario sin afectar el modo edicion
function clearFormData() {
    // limpiar arrays globales
    hostCountries = [];
    cities = [];
    stadiums = [];
    funFacts = [];
    attachments = [];
    
    // limpiar listas visuales
    updateHostCountriesList();
    updateCitiesList();
    updateStadiumsList();
    updateFunFactsList();
    updateAttachmentsList();
    
    // limpiar campos especificos del formulario
    const fieldsToReset = [
        'mundialYear', 'mundialName', 'mundialSlogan', 'generalDescription',
        'imageDescription', 'tooltip', 'finalGoalsTeam1', 'finalGoalsTeam2', 'extraTime',
        'penaltyGoalsTeam1', 'penaltyGoalsTeam2', 'funFact', 'stadium'
    ];
    
    fieldsToReset.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = '';
        }
    });
    
    // resetear selects de paises
    const selectsToReset = [
        'winnerCountrySelect', 'finalTeam1Select', 'finalTeam2Select',
        'penaltyTeam1Select', 'penaltyTeam2Select', 'hostCountrySelect',
        'citySelect'
    ];
    
    selectsToReset.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.selectedIndex = 0;
        }
    });
    
    // resetear imagenes a default
    const logo = document.getElementById('logo');
    const mainImage = document.getElementById('mundialPrincipalImage');
    
    if (logo) {
        logo.src = '/media/userPhoto.png';
    }
    if (mainImage) {
        mainImage.src = '/media/userPhoto.png';
    }
    
    // limpiar inputs de archivos
    const fileInputs = ['mundialLogo', 'mundialPrincipalPhoto', 'mundialPhoto'];
    fileInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
        }
    });
}

// limpia completamente el formulario y resetea el modo edicion
function clearForm() {
    // limpiar datos del formulario
    clearFormData();
    
    // resetear modo edicion
    currentWorldCupId = null;
}

///////////////////////////////////////
// funciones auxiliares para manejo de archivos desde base64
///////////////////////////////////////

// convierte base64 a archivo file
function base64ToFile(base64Data, filename, mimeType = 'image/jpeg') {
    try {
        // remover el prefijo data: si existe
        let base64 = base64Data;
        if (base64Data.includes(',')) {
            base64 = base64Data.split(',')[1];
        } else if (base64Data.startsWith('data:')) {
            base64 = base64Data.substring(base64Data.indexOf(':') + 1);
        }
        
        // limpiar espacios y caracteres no validos
        base64 = base64.replace(/\s/g, '');
        
        // convertir base64 a bytes
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // crear el archivo file
        return new File([byteArray], filename, { type: mimeType });
    } catch (error) {
        console.error('Error al convertir base64 a File:', error);
        return null;
    }
}

// convierte base64 a file y lo asigna al input correspondiente
async function convertBase64ToFileInput(imageType, base64Data, inputId) {
    try {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        // crear filename basado en el tipo
        const filename = imageType === 'logo' ? 'logo.jpg' : 'principal_image.jpg';
        
        // convertir base64 a file
        const file = base64ToFile(base64Data, filename);
        
        if (file) {
            // crear un datatransfer para simular la seleccion de archivo
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            
            // asignar el archivo al input
            input.files = dataTransfer.files;
        }
        
    } catch (error) {
        console.error(`Error al convertir base64 a archivo para ${imageType}:`, error);
    }
}

// carga anexos desde datos de la base de datos
async function loadAttachmentsFromData(attachmentsData) {
    try {
        // limpiar anexos actuales
        attachments = [];
        
        // procesar cada anexo
        for (let i = 0; i < attachmentsData.length; i++) {
            const attachment = attachmentsData[i];
            
            // verificar diferentes posibles nombres de campo para la imagen
            const imageData = attachment.image || attachment.image_data || attachment.data;
            
            if (imageData) {
                // crear filename unico
                const filename = `anexo_${i + 1}.jpg`;
                
                // convertir base64 a file
                const file = base64ToFile(imageData, filename);
                
                if (file) {
                    // agregar al array de anexos
                    attachments.push({
                        file: file,
                        description: attachment.description || `Anexo ${i + 1}`
                    });
                }
            }
        }
        
        // actualizar la vista de anexos
        updateAttachmentsList();
        
    } catch (error) {
        console.error('Error al cargar anexos:', error);
    }
}