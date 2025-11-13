//globales
let countriesData = [];
let hostCountries = [];
let funFacts = [];
let cities = [];
let stadiums = [];
let attachments = [];

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
    
    //inicialización
    initializeElements();
    loadCountries();
    setupEventListeners();
    initializeCitySelect();
    loadWorldCupYears();
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

    // Botones de agregar
    setupAddButtons();
    
    // Previews de imágenes
    setupImagePreviews();
    
    // Validación en tiempo real
    setupValidation();
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
            countriesData = data.data;
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
    
    countriesData.forEach(country => {
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

/////////////////////////////////////////////
 // maneja el envío del formulario
 /////////////////////////////////////////
async function handleSubmit(e) {
    e.preventDefault();
    console.log('HandleSubmit ejecutándose...');
    
    if (!validateForm()) {
        console.log('Validación falló');
        showMessage('[❌] Por favor, complete todos los campos obligatorios', 'danger');
        return;
    }
    
    console.log('Validación pasó, enviando datos...');
    
    try {
        showSpinner('Guardando mundial...');
        
        const formData = new FormData();
        
        // datos básicos (nombres que espera el SP)
        formData.append('year', document.getElementById('mundialYear')?.value || '');
        formData.append('name', document.getElementById('mundialName')?.value || '');
        formData.append('slogan', document.getElementById('mundialSlogan')?.value || '');
        formData.append('description', document.getElementById('generalDescription')?.value || '');
        
        // logo del mundial 
        const logoPhoto = document.getElementById('mundialLogo');
        if (logoPhoto && logoPhoto.files[0]) {
            formData.append('logo', logoPhoto.files[0]);
        }
        
        // imagen principal 
        const principalPhoto = document.getElementById('mundialPrincipalPhoto');
        if (principalPhoto && principalPhoto.files[0]) {
            formData.append('image', principalPhoto.files[0]);
        }
        
        // descripción de la imagen principal
        const principalDescription = document.getElementById('imageDescription');
        if (principalDescription) {
            formData.append('image_description', principalDescription.value);
        }
        
        // países sede (JSON para el SP)
        formData.append('host_countries_json', JSON.stringify(hostCountries));
        
        // datos curiosos como texto separado por delimitadores
        const funFactsText = funFacts.join(' | '); // Separar con | 
        formData.append('fun_fact', funFactsText);
        
        // información extra (ciudades y estadios como JSON)
        const extraInfo = {
            cities: cities,
            stadiums: stadiums
        };
        formData.append('extra_info', JSON.stringify(extraInfo));
        
        // resultados de la final (campos que espera el SP)
        const team1 = document.getElementById('finalTeam1Select')?.value || '';
        const team2 = document.getElementById('finalTeam2Select')?.value || '';
        const goals1 = document.getElementById('finalGoalsTeam1')?.value || 0;
        const goals2 = document.getElementById('finalGoalsTeam2')?.value || 0;
        
        // determinar campeón y subcampeón
        let champion = '';
        let subchampion = '';
        
        // lógica para determinar ganador (se puede mejorar después)
        const winnerCountry = document.getElementById('winnerCountrySelect')?.value || '';
        if (winnerCountry === team1) {
            champion = team1;
            subchampion = team2;
        } else if (winnerCountry === team2) {
            champion = team2;
            subchampion = team1;
        } else {
            // si no coincide, usar el país ganador seleccionado
            champion = winnerCountry;
            subchampion = team1 || team2; // usar uno de los finalistas
        }
        
        formData.append('champion', champion);
        formData.append('subchampion', subchampion);
        formData.append('score', `${goals1}-${goals2}`);
        formData.append('overtime', document.getElementById('extraTime')?.value || 0);
        formData.append('penalties_champion', document.getElementById('penaltyGoalsTeam1')?.value || 0);
        formData.append('penalties_subchampion', document.getElementById('penaltyGoalsTeam2')?.value || 0);
        formData.append('leading_scorer', ''); // campo requerido por el SP, por ahora vacío
        
        // obtener admin_id de la sesión
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
        
        // debug: mostrar datos que se van a enviar
        console.log('Datos a enviar:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        
        // enviar datos AJAX
        console.log('Enviando petición a /worldcups...');
        const response = await fetch('/worldcups', {
            method: 'POST',
            body: formData
        });
        
        console.log('Respuesta recibida:', response.status, response.statusText);
        
        const result = await response.json();
        console.log('Resultado del servidor:', result);
        
        // El SP devuelve 'exito' (1 o 0) y 'mensaje'
        if (result.exito === 1 || result.exito === true) {
            showMessage('Mundial creado exitosamente', 'success');
            setTimeout(() => {
                window.location.href = '/adminMundials';
            }, 2000);
        } else {
            throw new Error(result.mensaje || 'Error al crear el mundial');
        }
        
    } catch (error) {
        console.error('Error al enviar formulario:', error);
        showMessage(`Error al crear el mundial: ${error.message}`, 'danger');
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
let worldCupYears = [];
let currentTimelineIndex = 0;
const VISIBLE_BUTTONS = 3; // Cantidad de botones visibles a la vez

///////////////////////////////////////
// Carga los años de mundiales desde la API
///////////////////////////////////////
async function loadWorldCupYears() {
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
            worldCupYears = data.sort((a, b) => parseInt(b.year) - parseInt(a.year));
            console.log('Años de mundiales cargados:', worldCupYears);
            
            // Renderizar timeline
            renderTimeline();
            setupTimelineEvents();
        } else {
            console.warn('No se encontraron años de mundiales');
            worldCupYears = [];
            renderTimeline();
        }
    } catch (error) {
        console.error('Error al cargar años de mundiales:', error);
        showMessage('Error al cargar los años de mundiales', 'danger');
        worldCupYears = [];
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

    if (worldCupYears.length === 0) {
        container.innerHTML = '<p class="text-white">No hay mundiales registrados</p>';
        updateArrowVisibility();
        return;
    }

    // Calcular el rango visible
    const startIndex = currentTimelineIndex;
    const endIndex = Math.min(startIndex + VISIBLE_BUTTONS, worldCupYears.length);
    const visibleYears = worldCupYears.slice(startIndex, endIndex);

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
        const hasMore = currentTimelineIndex + VISIBLE_BUTTONS < worldCupYears.length;
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
            if (currentTimelineIndex + VISIBLE_BUTTONS < worldCupYears.length) {
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
// Carga los datos de un mundial específico para edición
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
        console.log('Datos del mundial cargados:', data);
        
        // Asegurarse de que los países estén cargados antes de rellenar el formulario
        if (countriesData.length === 0) {
            console.log('Países no cargados, cargando primero...');
            await loadCountries();
        }
        
        // Rellenar el formulario con los datos del mundial
        await populateFormWithWorldCupData(data);
        
    } catch (error) {
        console.error('Error al cargar datos del mundial:', error);
        showMessage('Error al cargar los datos del mundial', 'danger');
    } finally {
        hideSpinner();
    }
}

///////////////////////////////////////
// Rellena el formulario con los datos del mundial
///////////////////////////////////////
async function populateFormWithWorldCupData(data) {
    // Limpiar formulario primero
    clearForm();
    
    // Los datos vienen directamente del modelo, no anidados en 'worldCup'
    console.log('Datos recibidos:', data);
    
    // Campos de texto básicos
    setInputValue('mundialYear', data.year);
    setInputValue('mundialName', data.name);
    setInputValue('mundialSlogan', data.slogan);
    setInputValue('generalDescription', data.description);
    setInputValue('imageDescription', data.image_description);  // Para descripción de imagen principal
    
    // Selects de países (los países ya están cargados en este punto)
    setSelectValue('winnerCountrySelect', data.champion);          // Ganador 
    setSelectValue('finalTeam1Select', data.champion);             // Equipo 1 final
    setSelectValue('finalTeam2Select', data.subchampion);          // Equipo 2 final
    setSelectValue('penaltyTeam1Select', data.champion);           // Equipo 1 penalties 
    setSelectValue('penaltyTeam2Select', data.subchampion);        // Equipo 2 penalties
    
    // Parseamos el score para obtener goles individuales
    if (data.score) {
        const scoreMatch = data.score.match(/(\d+)-(\d+)/);
        if (scoreMatch) {
            setInputValue('finalGoalsTeam1', scoreMatch[1]);      // Goles equipo 1
            setInputValue('finalGoalsTeam2', scoreMatch[2]);      // Goles equipo 2
        }
    }
    
    // Tiempo extra y penalties
    setInputValue('extraTime', data.overtime || 0);
    setInputValue('penaltyGoalsTeam1', data.penalties_champion || 0);
    setInputValue('penaltyGoalsTeam2', data.penalties_subchampion || 0);
    
    // Datos curiosos
    if (data.fun_fact) {
        funFacts = data.fun_fact.split(' | ').filter(fact => fact.trim());
        updateFunFactsList();
    }
    
    // Información extra (parsear JSON si existe)
    if (data.extra_info) {
        try {
            const extraInfo = JSON.parse(data.extra_info);
            if (extraInfo.cities && Array.isArray(extraInfo.cities)) {
                cities = extraInfo.cities.map(city => ({ name: city }));
                updateCitiesList();
            }
            if (extraInfo.stadiums && Array.isArray(extraInfo.stadiums)) {
                stadiums = extraInfo.stadiums;
                updateStadiumsList();
            }
        } catch (e) {
            console.warn('Error parsing extra_info JSON:', e);
        }
    }
    
    //host countries - limpiar primero para evitar duplicados
    if (data.host_countries && Array.isArray(data.host_countries)) {
        hostCountries = []; // Limpiar lista actual
        
        //set para evitar duplicados basado en el nombre del país
        const uniqueCountries = new Set();
        
        data.host_countries.forEach(hc => {
            if (!uniqueCountries.has(hc.country)) {
                uniqueCountries.add(hc.country);
                hostCountries.push({
                    name: hc.country,
                    city: hc.city,
                    stadium: hc.stadium
                });
            }
        });
        
        updateHostCountriesList();
        // Actualizar ciudades basado en hostq countries
        updateCitiesFromHostCountries();
    }
    
    // Attachments - cargar desde base64 y convertir a File objects
    if (data.attachments && Array.isArray(data.attachments)) {
        console.log(`Mundial tiene ${data.attachments.length} attachments`);
        loadAttachmentsFromData(data.attachments);
    }
    
    // Mostrar imágenes si existen (como preview) y convertir a archivos
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
// Muestra preview de imagen desde base64
///////////////////////////////////////
function showImagePreview(type, base64Data) {
    let previewId;
    
    // Mapear a los IDs del HTML
    if (type === 'image') {
        previewId = 'mundialPrincipalImage';  // Imagen principal
    } else if (type === 'logo') {
        previewId = 'logo';                   // Logo del mundial
    }
    
    const preview = document.getElementById(previewId);
    
    if (preview && base64Data) {
        // Verificar si es una URL válida o base64 (como en profile.js)
        if (base64Data.startsWith('data:') || base64Data.startsWith('http')) {
            preview.src = base64Data;
        } else {
            // Si es solo base64 sin prefijo, agregarlo
            preview.src = `data:image/jpeg;base64,${base64Data}`;
        }
        preview.style.display = 'block';
        
        console.log(`Preview cargado para ${type} en elemento ${previewId}`);
    } else {
        console.warn(`No se pudo cargar preview para ${type}:`, { preview: !!preview, hasData: !!base64Data });
    }
}

///////////////////////////////////////
// Funciones auxiliares para rellenar formulario
///////////////////////////////////////
function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element && value !== null && value !== undefined) {
        element.value = value;
        console.log(`input ${id} seteado a: ${value}`);
    } else {
        console.warn(`no se pudo setear ${id}:`, { element: !!element, value });
    }
}

function setSelectValue(id, value) {
    const element = document.getElementById(id);
    if (element && value !== null && value !== undefined && value !== '') {
        console.log(`Intentando setear ${id} con valor: ${value}`);
        
        // Buscar la opción que coincida con el valor
        let found = false;
        
        // Normalizar el valor de búsqueda
        const normalizedValue = value.toLowerCase().trim();
        
        for (let option of element.options) {
            const optionText = option.textContent.toLowerCase().trim();
            const optionValue = option.value.toLowerCase().trim();
            
            // Intentar múltiples tipos de coincidencia
            if (optionValue === normalizedValue || 
                optionText === normalizedValue ||
                optionText.includes(normalizedValue) || 
                normalizedValue.includes(optionText) ||
                // Coincidencia parcial para casos como "United States" vs "USA"
                (normalizedValue.length > 3 && optionText.includes(normalizedValue)) ||
                (optionText.length > 3 && normalizedValue.includes(optionText))) {
                
                element.value = option.value;
                console.log(` ${id} seteado a: ${option.value} (${option.textContent})`);
                
                // Disparar evento change para actualizar banderas si es necesario
                element.dispatchEvent(new Event('change'));
                found = true;
                break;
            }
        }
        
        if (!found) {
            console.warn(`No se encontró opción para ${id} con valor: "${value}"`);
            // Listar las primeras opciones disponibles para debug
            console.log(`Opciones disponibles (primeras 5):`, 
                Array.from(element.options).slice(0, 5).map(opt => opt.textContent));
            console.log('Opciones disponibles:', Array.from(element.options).map(opt => opt.value + ' -> ' + opt.textContent));
        }
    }
}

function clearForm() {
    // Limpiar arrays globales
    hostCountries = [];
    cities = [];
    stadiums = [];
    funFacts = [];
    attachments = [];
    
    // Limpiar listas visuales
    updateHostCountriesList();
    updateCitiesList();
    updateStadiumsList();
    updateFunFactsList();
    updateAttachmentsList();
    
    // Limpiar campos específicos del formulario
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
    
    // Resetear selects de países
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
    
    // Resetear imágenes a default
    const logo = document.getElementById('logo');
    const mainImage = document.getElementById('mundialPrincipalImage');
    
    if (logo) {
        logo.src = '/media/userPhoto.png';
    }
    if (mainImage) {
        mainImage.src = '/media/userPhoto.png';
    }
    
    // Limpiar inputs de archivos
    const fileInputs = ['mundialLogo', 'mundialPrincipalPhoto', 'mundialPhoto'];
    fileInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
        }
    });
}

///////////////////////////////////////
//funciones auxiliares para manejo de archivos desde base64
///////////////////////////////////////

//convierte base64 a archivo File
function base64ToFile(base64Data, filename, mimeType = 'image/jpeg') {
    try {
        // Remover el prefijo data: si existe
        let base64 = base64Data;
        if (base64Data.includes(',')) {
            base64 = base64Data.split(',')[1];
        } else if (base64Data.startsWith('data:')) {
            // Si empieza con data: pero no tiene coma, asumir que está malformado
            console.warn('Base64 data malformado, intentando usar sin prefijo');
            base64 = base64Data.substring(base64Data.indexOf(':') + 1);
        }
        
        // Limpiar espacios y caracteres no válidos
        base64 = base64.replace(/\s/g, '');
        
        // Convertir base64 a bytes
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Crear el archivo File
        return new File([byteArray], filename, { type: mimeType });
    } catch (error) {
        console.error('Error al convertir base64 a File:', error);
        console.log('Base64 data length:', base64Data?.length || 'N/A');
        console.log('Base64 starts with:', base64Data?.substring(0, 50) || 'N/A');
        return null;
    }
}

// Convierte base64 a File y lo asigna al input correspondiente
async function convertBase64ToFileInput(imageType, base64Data, inputId) {
    try {
        const input = document.getElementById(inputId);
        if (!input) {
            console.warn(`Input ${inputId} no encontrado`);
            return;
        }
        
        // Crear filename basado en el tipo
        const filename = imageType === 'logo' ? 'logo.jpg' : 'principal_image.jpg';
        
        // Convertir base64 a File
        const file = base64ToFile(base64Data, filename);
        
        if (file) {
            // Crear un DataTransfer para simular la selección de archivo
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            
            // Asignar el archivo al input
            input.files = dataTransfer.files;
            
            console.log(`Archivo ${filename} asignado a ${inputId}`);
        } else {
            console.warn(`No se pudo convertir imagen ${imageType} a archivo para ${inputId}`);
        }
        
    } catch (error) {
        console.error(`Error al convertir base64 a archivo para ${imageType}:`, error);
    }
}

// Carga anexos desde datos de la base de datos
async function loadAttachmentsFromData(attachmentsData) {
    try {
        console.log('Cargando anexos, datos recibidos:', attachmentsData);
        
        // Limpiar anexos actuales
        attachments = [];
        
        // Procesar cada anexo
        for (let i = 0; i < attachmentsData.length; i++) {
            const attachment = attachmentsData[i];
            console.log(`Procesando anexo ${i}:`, attachment);
            
            // Verificar diferentes posibles nombres de campo para la imagen
            const imageData = attachment.image || attachment.image_data || attachment.data;
            console.log('Imagen encontrada:', !!imageData, 'Tamaño aprox:', imageData ? imageData.length : 'N/A');
            
            if (imageData) {
                // Crear filename único
                const filename = `anexo_${i + 1}.jpg`;
                
                // Convertir base64 a File
                const file = base64ToFile(imageData, filename);
                
                if (file) {
                    // Agregar al array de anexos
                    attachments.push({
                        file: file,
                        description: attachment.description || `Anexo ${i + 1}`
                    });
                    console.log(`Anexo ${i + 1} convertido correctamente`);
                } else {
                    console.warn(`No se pudo convertir anexo ${i + 1} a archivo`);
                }
            }
        }
        
        // Actualizar la vista de anexos
        updateAttachmentsList();
        
        console.log(`${attachments.length} anexos cargados desde la base de datos`);
        
    } catch (error) {
        console.error('Error al cargar anexos:', error);
    }
}