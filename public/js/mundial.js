// variables globales
let currentWorldCup = null;
let worldCupId = null;
let worldCupYears = [];
let currentYearIndex = -1;

document.addEventListener("DOMContentLoaded", async () => {
    // obtener id del mundial desde la url
    worldCupId = getWorldCupIdFromURL();
    
    if (worldCupId) {
        // cargar años de mundiales y luego cargar el mundial actual
        await loadWorldCupYears();
        await loadWorldCupData(worldCupId);
        setupNavigationButtons();
    } else {
        console.error('No se encontro ID del mundial en la URL');
        showError('Mundial no encontrado');
    }
});

// extrae el id del mundial desde la url
function getWorldCupIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// carga los datos del mundial desde la base de datos
async function loadWorldCupData(id) {
    try {
        showLoadingSpinner();
        
        const response = await fetch(`/worldcups/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data) {
            currentWorldCup = data;
            populateWorldCupData(data);
        } else {
            throw new Error('No se encontraron datos del mundial');
        }
        
    } catch (error) {
        console.error('Error al cargar datos del mundial:', error);
        showError('Error al cargar los datos del mundial');
    } finally {
        hideLoadingSpinner();
    }
}

// rellena la pagina con los datos del mundial
function populateWorldCupData(data) {
    try {
        console.log('Datos del mundial recibidos:', data);
        
        // titulo de la pagina
        document.title = `Starmates | ${data.year}`;
        
        // datos basicos
        setElementText('mundialYear', data.year);
        setElementText('mundialSlogan', data.slogan || 'Mundial de futbol');
        setElementText('mundialDescription', data.description || 'Sin descripcion disponible');
        setElementText('mundialPrincipalSubtitle', data.image_description || 'Imagen del mundial');
        
        // imagenes principales - con mejor logging
        console.log('Procesando imagenes principales...');
        if (data.image) {
            console.log('Cargando imagen principal, tamaño base64:', data.image.length);
            // verificar si ya tiene el prefijo data:
            const imageSrc = data.image.startsWith('data:') ? data.image : `data:image/jpeg;base64,${data.image}`;
            setElementImage('mundialPrincipalImage', imageSrc, `Mundial ${data.year}`);
        } else {
            console.warn('No se encontró imagen principal');
        }
        
        if (data.logo) {
            console.log('Cargando logo, tamaño base64:', data.logo.length);
            // verificar si ya tiene el prefijo data:
            const logoSrc = data.logo.startsWith('data:') ? data.logo : `data:image/jpeg;base64,${data.logo}`;
            setElementImage('mundialLogo', logoSrc, `Logo Mundial ${data.year}`);
        } else {
            console.warn('No se encontró logo');
        }
        
        // paises sede
        console.log('Host countries recibidos:', data.host_countries);
        if (data.host_countries && data.host_countries.length > 0) {
            const firstHost = data.host_countries[0];
            setElementText('mundialCountries', firstHost.country);
            
            // combinar datos de host_countries con extra_info si está disponible
            let enrichedHostData = data.host_countries;
            if (data.extra_info) {
                try {
                    const extraInfo = JSON.parse(data.extra_info);
                    enrichedHostData = enrichHostCountriesWithExtraInfo(data.host_countries, extraInfo);
                } catch (e) {
                    console.warn('Error parsing extra_info:', e);
                }
            }
            
            populateHostCountriesTable(enrichedHostData);
        } else {
            console.warn('No se encontraron países sede');
            setElementText('mundialCountries', 'País no especificado');
        }
        
        // ganador del mundial
        setElementText('mundialWinnerName', data.champion);
        // NOTA: La bandera del ganador está comentada en el HTML - no se implementa por ahora
        
        // datos curiosos
        if (data.fun_fact) {
            populateFunFacts(data.fun_fact);
        }
        
        // informacion extra ya fue procesada con host_countries arriba
        
        // resultados de la final
        populateFinalResults(data);
        
        // anexos
        console.log('Attachments recibidos:', data.attachments);
        if (data.attachments && data.attachments.length > 0) {
            populateAttachments(data.attachments);
        } else {
            console.warn('No se encontraron anexos');
            // limpiar container de anexos
            const container = document.getElementById('mediaContainer');
            if (container) {
                container.innerHTML = '<p class="text-muted">No hay anexos disponibles</p>';
            }
        }
        
    } catch (error) {
        console.error('Error al rellenar datos:', error);
        showError('Error al mostrar los datos del mundial');
    }
}

// establecer texto en un elemento
function setElementText(id, text) {
    const element = document.getElementById(id);
    if (element && text !== null && text !== undefined) {
        element.textContent = text;
    }
}

// establecer imagen en un elemento
function setElementImage(id, src, alt = '') {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Elemento con ID '${id}' no encontrado`);
        return false;
    }
    
    if (!src) {
        console.warn(`No hay src para elemento '${id}'`);
        return false;
    }
    
    // configurar imagen con manejo de errores
    element.onerror = function() {
        console.error(`Error al cargar imagen para elemento '${id}'`);
        this.src = '/media/userPhoto.png'; // imagen de fallback
    };
    
    element.onload = function() {
        console.log(`Imagen cargada exitosamente para elemento '${id}'`);
    };
    
    element.src = src;
    element.alt = alt;
    
    return true;
}

// rellena la tabla de paises sede
function populateHostCountriesTable(hostCountries) {
    console.log('Populando tabla de países sede con:', hostCountries);
    
    const table = document.getElementById('MundialCitiesInfo');
    if (!table) {
        console.error('Tabla MundialCitiesInfo no encontrada');
        return;
    }
    
    if (!hostCountries || hostCountries.length === 0) {
        console.warn('No hay países sede para mostrar');
        return;
    }
    
    // limpiar filas existentes excepto el header
    const rows = table.querySelectorAll('tr:not(:first-child)');
    rows.forEach(row => row.remove());
    
    console.log('Datos de países antes de agrupar:', hostCountries);
    
    // crear nuevas filas directamente sin agrupar (cada fila es una ciudad/estadio)
    hostCountries.forEach((hostData, index) => {
        console.log(`Procesando host ${index}:`, hostData);
        
        const row = document.createElement('tr');
        
        // Si es la primera ciudad del país, añadir celda de país con rowspan
        if (index === 0 || hostCountries[index - 1].country !== hostData.country) {
            // Contar cuántas ciudades tiene este país para el rowspan
            const citiesCount = hostCountries.filter(h => h.country === hostData.country).length;
            
            const countryCell = document.createElement('td');
            countryCell.textContent = hostData.country || 'País no especificado';
            countryCell.className = 'worldcupHost';
            countryCell.rowSpan = citiesCount;
            row.appendChild(countryCell);
        }
        
        // celda de ciudad
        const cityCell = document.createElement('td');
        cityCell.textContent = hostData.city || 'Ciudad no especificada';
        row.appendChild(cityCell);
        
        // celda de estadio
        const stadiumCell = document.createElement('td');
        stadiumCell.textContent = hostData.stadium || 'Estadio no especificado';
        row.appendChild(stadiumCell);
        
        table.appendChild(row);
    });
    
    console.log(`Tabla actualizada con ${hostCountries.length} entradas`);
}

// enriquece los datos de host countries con información de extra_info
function enrichHostCountriesWithExtraInfo(hostCountries, extraInfo) {
    console.log('Enriqueciendo host countries con extra_info:', extraInfo);
    
    const enriched = [...hostCountries];
    
    // si hay cities en extra_info y los host_countries no tienen city/stadium
    if (extraInfo.cities && extraInfo.cities.length > 0) {
        const hasEmptyData = hostCountries.some(hc => !hc.city || !hc.stadium);
        
        if (hasEmptyData) {
            console.log('Usando datos de cities desde extra_info');
            
            // reemplazar con datos de extra_info
            enriched.length = 0; // limpiar array
            
            extraInfo.cities.forEach((city, index) => {
                // extraer nombre de la ciudad desde la estructura anidada
                let cityName = 'Ciudad no especificada';
                if (city && city.name) {
                    // navegar por la estructura anidada de name
                    let current = city.name;
                    while (current && typeof current === 'object' && current.name) {
                        current = current.name;
                    }
                    if (typeof current === 'string') {
                        cityName = current;
                    }
                }
                
                // usar el stadium de extra_info si está disponible
                const stadium = extraInfo.stadiums && extraInfo.stadiums[index] ? 
                    extraInfo.stadiums[index] : 'Estadio no especificado';
                
                // usar el país del primer host country
                const country = hostCountries[0] ? hostCountries[0].country : 'País no especificado';
                
                enriched.push({
                    country: country,
                    city: cityName,
                    stadium: stadium
                });
            });
        }
    }
    
    console.log('Host countries enriquecidos:', enriched);
    return enriched;
}

// agrupa los paises sede por pais
function groupHostCountriesByCountry(hostCountries) {
    const grouped = {};
    
    hostCountries.forEach(hc => {
        if (!grouped[hc.country]) {
            grouped[hc.country] = {
                country: hc.country,
                cities: []
            };
        }
        
        grouped[hc.country].cities.push({
            city: hc.city,
            stadium: hc.stadium
        });
    });
    
    return Object.values(grouped);
}

// actualiza info de sede con datos extra (función legacy - ya no se usa)
function updateHostInfoWithExtra(extraInfo, hostCountries) {
    // esta función ya no se usa - la lógica se movió a enrichHostCountriesWithExtraInfo
    console.log('Extra info disponible (legacy):', extraInfo);
}

// rellena datos curiosos
function populateFunFacts(funFactText) {
    // buscar todos los elementos con id mundialFunFact
    const funFactElements = document.querySelectorAll('#mundialFunFact');
    
    if (!funFactElements.length) return;
    
    // dividir los datos curiosos
    const facts = funFactText.split('|').map(fact => fact.trim()).filter(fact => fact);
    
    // rellenar elementos
    funFactElements.forEach((element, index) => {
        if (index < facts.length) {
            element.textContent = `⁕ ${facts[index]}`;
        } else {
            element.style.display = 'none';
        }
    });
}

// rellena resultados de la final
function populateFinalResults(data) {
    // parsear el score
    if (data.score) {
        const scoreMatch = data.score.match(/(\d+)-(\d+)/);
        if (scoreMatch) {
            setElementText('finalGoal1', `🥇${scoreMatch[1]}`);
            setElementText('finalGoal2', `🥈${scoreMatch[2]}`);
        }
    }
    
    // equipos finalistas
    setElementText('finalCountry1', data.champion);
    setElementText('finalCountry2', data.subchampion);
    
    // tiempo extra
    if (data.overtime && data.overtime > 0) {
        setElementText('extraTime', `${data.overtime} minutos`);
    } else {
        setElementText('extraTime', 'Sin tiempo extra');
    }
    
    // penales
    if (data.penalties_champion !== null && data.penalties_subchampion !== null) {
        setElementText('penality1', data.penalties_champion || '0');
        setElementText('penality2', data.penalties_subchampion || '0');
        setElementText('penaltiCountry1', data.champion);
        setElementText('penaltiCountry2', data.subchampion);
    } else {
        // ocultar seccion de penales si no hubo
        const penaltyElements = document.querySelectorAll('#penality1, #penality2, #penaltiCountry1, #penaltiCountry2');
        penaltyElements.forEach(el => {
            if (el) el.style.display = 'none';
        });
    }
}

// rellena anexos
function populateAttachments(attachments) {
    console.log('Procesando anexos:', attachments);
    
    const container = document.getElementById('mediaContainer');
    if (!container) {
        console.error('Container mediaContainer no encontrado');
        return;
    }
    
    // limpiar anexos existentes
    container.innerHTML = '';
    
    // asegurar que el container tenga las clases correctas para display horizontal
    container.className = 'mediaContainer';
    
    let validAttachments = 0;
    
    attachments.forEach((attachment, index) => {
        console.log(`Procesando attachment ${index}:`, attachment);
        
        if (attachment.image) {
            const img = document.createElement('img');
            
            // verificar si ya tiene el prefijo data:
            const imageSrc = attachment.image.startsWith('data:') ? 
                attachment.image : `data:image/jpeg;base64,${attachment.image}`;
            
            img.src = imageSrc;
            img.className = 'mundialMedia';
            img.alt = attachment.description || `Anexo ${index + 1}`;
            
            // manejo de errores de imagen
            img.onerror = function() {
                console.error(`Error al cargar attachment ${index}`);
                this.src = '/media/userPhoto.png';
            };
            
            img.onload = function() {
                console.log(`Attachment ${index} cargado exitosamente`);
            };
            
            // agregar tooltip
            img.setAttribute('data-bs-toggle', 'tooltip');
            img.setAttribute('data-bs-placement', 'bottom');
            img.setAttribute('data-bs-custom-class', 'custom-littleTooltip');
            img.setAttribute('title', attachment.description || `Anexo ${index + 1}`);
            
            container.appendChild(img);
            validAttachments++;
        } else {
            console.warn(`Attachment ${index} no tiene imagen`);
        }
    });
    
    // mensaje si no hay attachments válidos
    if (validAttachments === 0) {
        container.innerHTML = '<p class="text-muted">No hay anexos con imágenes disponibles</p>';
    } else {
        console.log(`${validAttachments} anexos cargados exitosamente`);
        
        // activar tooltips para los nuevos elementos
        const tooltipElements = container.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements.forEach(el => {
            try {
                new bootstrap.Tooltip(el);
            } catch (error) {
                console.warn('Error al inicializar tooltip:', error);
            }
        });
    }
}

// muestra mensaje de error
function showError(message) {
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 400px;">
                <div class="text-center text-white">
                    <h2>${message}</h2>
                    <button onclick="window.history.back()" class="btn btn-primary mt-3">Volver</button>
                </div>
            </div>
        `;
    }
}

// muestra spinner de carga
function showLoadingSpinner() {
    const main = document.querySelector('main');
    if (main) {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'd-flex justify-content-center align-items-center';
        spinner.style.height = '400px';
        spinner.innerHTML = `
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Cargando mundial...</span>
            </div>
        `;
        main.insertBefore(spinner, main.firstChild);
    }
}

// oculta spinner de carga
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

// carga los años de todos los mundiales
async function loadWorldCupYears() {
    try {
        console.log('Cargando años de mundiales...');
        
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
            // ordenar por año y extraer solo los años
            worldCupYears = data
                .map(item => ({ id: item.id, year: parseInt(item.year) }))
                .sort((a, b) => a.year - b.year);
            
            console.log('Años de mundiales cargados:', worldCupYears);
        } else {
            console.warn('No se encontraron años de mundiales');
            worldCupYears = [];
        }
        
    } catch (error) {
        console.error('Error al cargar años de mundiales:', error);
        worldCupYears = [];
    }
}

// configura los botones de navegación
function setupNavigationButtons() {
    if (!currentWorldCup || worldCupYears.length === 0) {
        console.warn('No se puede configurar navegación: faltan datos');
        return;
    }
    
    // encontrar el índice del mundial actual
    const currentYear = parseInt(currentWorldCup.year);
    currentYearIndex = worldCupYears.findIndex(wc => wc.year === currentYear);
    
    console.log(`Mundial actual: ${currentYear}, índice: ${currentYearIndex}`);
    
    // configurar botón anterior
    const beforeButton = document.getElementById('beforeMundial');
    const previousYearSpan = document.getElementById('previousYear');
    
    if (currentYearIndex > 0) {
        const previousWorldCup = worldCupYears[currentYearIndex - 1];
        previousYearSpan.textContent = previousWorldCup.year;
        beforeButton.disabled = false;
        beforeButton.classList.remove('disabled');
    } else {
        previousYearSpan.textContent = '----';
        beforeButton.disabled = true;
        beforeButton.classList.add('disabled');
    }
    
    // configurar botón siguiente
    const afterButton = document.getElementById('afterMundial');
    const nextYearSpan = document.getElementById('nextYear');
    
    if (currentYearIndex < worldCupYears.length - 1 && currentYearIndex !== -1) {
        const nextWorldCup = worldCupYears[currentYearIndex + 1];
        nextYearSpan.textContent = nextWorldCup.year;
        afterButton.disabled = false;
        afterButton.classList.remove('disabled');
    } else {
        nextYearSpan.textContent = '----';
        afterButton.disabled = true;
        afterButton.classList.add('disabled');
    }
}

// navega al mundial anterior
function goToPreviousWorldCup() {
    if (currentYearIndex > 0) {
        const previousWorldCup = worldCupYears[currentYearIndex - 1];
        console.log(`Navegando al mundial anterior: ${previousWorldCup.year} (ID: ${previousWorldCup.id})`);
        window.location.href = `/mundialDisplay?id=${previousWorldCup.id}`;
    }
}

// navega al siguiente mundial
function goToNextWorldCup() {
    if (currentYearIndex < worldCupYears.length - 1 && currentYearIndex !== -1) {
        const nextWorldCup = worldCupYears[currentYearIndex + 1];
        console.log(`Navegando al siguiente mundial: ${nextWorldCup.year} (ID: ${nextWorldCup.id})`);
        window.location.href = `/mundialDisplay?id=${nextWorldCup.id}`;
    }
}

// hacer las funciones disponibles globalmente
window.goToPreviousWorldCup = goToPreviousWorldCup;
window.goToNextWorldCup = goToNextWorldCup;