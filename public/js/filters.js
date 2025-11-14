// variables globales para filtros
let categoriesData = [];
let countriesData = [];
let worldCupYears = [];
let selectedCategories = [];
let filtersInitialized = false;

/**
 * Inicialización global (llamada desde fetchNavBar.js)
 */
window.initializeFilters = async function() {
    if (filtersInitialized) return;
    
    await loadFilterData();
    setupFilterEventListeners();
    populateFiltersFromURL();
    filtersInitialized = true;
};

////////////////////////////////////////////////////////////
// CARGA DE DATOS
////////////////////////////////////////////////////////////

/**
 * Cargar todos los datos necesarios para los filtros
 */
async function loadFilterData() {
    await Promise.all([
        loadCategories(),
        loadCountries(),
        loadWorldCupYears()
    ]);
}

/**
 * cargar categorías desde la BD
 */
async function loadCategories() {
    try {
        const response = await fetch('/categories');
        if (!response.ok) throw new Error('Error loading categories');
        
        const data = await response.json();
        categoriesData = data;
        populateCategorySelect();
        
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Cargar países desde la API
 */
async function loadCountries() {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,unicodeFlag,dialCode');
        if (!response.ok) throw new Error('Error loading countries');
        
        const result = await response.json();
        
        if (result && result.data) {
            countriesData = result.data
                .filter(country => country.name)
                .map(country => ({
                    name: country.name,
                    flag: country.flag,
                    unicodeFlag: country.unicodeFlag
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            populateCountrySelects();
        }
        
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

/**
 * cargar años de mundiales desde la BD
 */
async function loadWorldCupYears() {
    try {
        const response = await fetch('/worldcups/years');
        if (!response.ok) throw new Error('Error loading world cup years');
        
        const data = await response.json();
        worldCupYears = data;
        populateWorldCupSelect();
        
    } catch (error) {
        console.error('Error loading world cup years:', error);
    }
}

////////////////////////////////////////////////////////////
// POBLAR SELECTS
////////////////////////////////////////////////////////////

/**
 * Poblar select de categorías
 */
function populateCategorySelect() {
    const select = document.getElementById('tagSelected');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecciona una categoría</option>';
    
    categoriesData.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `#${category.name}`;
        option.dataset.name = category.name;
        select.appendChild(option);
    });
}

/**
 * Poblar selects de países (sede y selección)
 */
function populateCountrySelects() {
    populateHostCountrySelect();
    populateNationalTeamSelect();
}

/**
 * Poblar select de país sede
 */
function populateHostCountrySelect() {
    const select = document.getElementById('countrySelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecciona una sede</option>';
    
    countriesData.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = `${country.unicodeFlag || ''} ${country.name}`;
        option.dataset.flag = country.flag;
        option.dataset.unicodeFlag = country.unicodeFlag;
        select.appendChild(option);
    });
    
    select.addEventListener('change', function() {
        const selectedOption = this.selectedOptions[0];
        updateFlag('miniFlag', selectedOption?.dataset.flag);
    });
}

/**
 * Poblar select de selección nacional
 */
function populateNationalTeamSelect() {
    const select = document.getElementById('nationalitySelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecciona una selección</option>';
    
    countriesData.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = `${country.unicodeFlag || ''} ${country.name}`;
        option.dataset.flag = country.flag;
        option.dataset.unicodeFlag = country.unicodeFlag;
        select.appendChild(option);
    });
    
    select.addEventListener('change', function() {
        const selectedOption = this.selectedOptions[0];
        updateFlag('natFlag', selectedOption?.dataset.flag);
    });
}

/**
 * Poblar select de años de mundiales
 */
function populateWorldCupSelect() {
    const select = document.getElementById('selectYear');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecciona un mundial</option>';
    
    worldCupYears.forEach(worldCup => {
        const option = document.createElement('option');
        option.value = worldCup.id;
        option.textContent = `${worldCup.year} - ${worldCup.name}`;
        option.dataset.year = worldCup.year;
        select.appendChild(option);
    });
}

/**
 * Actualizar imagen de bandera
 */
function updateFlag(imgId, flagUrl) {
    const img = document.getElementById(imgId);
    if (!img) return;
    
    if (flagUrl) {
        img.src = flagUrl;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
}

////////////////////////////////////////////////////////////
// EVENT LISTENERS
////////////////////////////////////////////////////////////

/**
 * Configurar event listeners del modal
 */
function setupFilterEventListeners() {
    // botón cerrar modal
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeFiltersModal);
    }
    
    // botón agregar categoría
    const addCatBtn = document.querySelector('.addCatIcon');
    if (addCatBtn) {
        addCatBtn.addEventListener('click', addCategory);
    }
    
    // botón buscar (submit)
    const applyBtn = document.getElementById('applyFilters');
    if (applyBtn) {
        applyBtn.addEventListener('click', handleFilterSubmit);
    }
    
    // formulario
    const form = document.getElementById('filterForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFilterSubmit(e);
        });
    }
}

////////////////////////////////////////////////////////////
// MANEJO DE CATEGORÍAS
////////////////////////////////////////////////////////////

/**
 * Agregar categoría a la lista de seleccionadas
 */
function addCategory() {
    const select = document.getElementById('tagSelected');
    if (!select || !select.value) {
        alert('Por favor selecciona una categoría');
        return;
    }
    
    const categoryId = select.value;
    const categoryName = select.selectedOptions[0].dataset.name;
    
    // verificar que no esté duplicada
    if (selectedCategories.some(cat => cat.id === categoryId)) {
        alert('Esta categoría ya está agregada');
        return;
    }
    
    selectedCategories.push({ id: categoryId, name: categoryName });
    renderSelectedCategories();
    
    // resetear select
    select.value = '';
}

/**
 * Renderizar categorías seleccionadas
 */
function renderSelectedCategories() {
    const container = document.getElementById('listCategories');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (selectedCategories.length === 0) {
        container.innerHTML = '<p class="whiteGreyText smallerText text-center">No hay categorías seleccionadas</p>';
        return;
    }
    
    selectedCategories.forEach((category, index) => {
        const div = document.createElement('div');
        div.className = 'd-flex align-items-center height50x';
        div.innerHTML = `
            <p class="showListElement shadow smallerText">#${escapeHtml(category.name)}</p>
            <button type="button" class="addButton noBackground noBorder" data-index="${index}">
                <i class="bi bi-x-square deleteIcon"></i>
            </button>
        `;
        
        // agregar listener al botón de eliminar
        const deleteBtn = div.querySelector('button');
        deleteBtn.addEventListener('click', () => removeCategory(index));
        
        container.appendChild(div);
    });
}

/**
 * Remover categoría de la lista
 */
function removeCategory(index) {
    selectedCategories.splice(index, 1);
    renderSelectedCategories();
}

////////////////////////////////////////////////////////////
// SUBMIT Y NAVEGACIÓN
////////////////////////////////////////////////////////////

/**
 * Manejar envío del formulario de filtros
 */
function handleFilterSubmit(event) {
    if (event) event.preventDefault();
    
    const params = buildSearchParams();
    
    // cerrar modal
    closeFiltersModal();
    
    // redirigir a results con los parámetros
    const queryString = params.toString();
    window.location.href = queryString ? `/results?${queryString}` : '/results';
}

/**
 * Construir parámetros de búsqueda desde el formulario
 */
function buildSearchParams() {
    const params = new URLSearchParams();
    
    // texto de búsqueda del navbar (si existe)
    const searchInput = document.getElementById('searchThis');
    const searchText = searchInput?.value?.trim();
    if (searchText) {
        params.append('searchThis', searchText);
    } else if (window.currentSearchTerm) {
        // usar término guardado si el input está vacío
        params.append('searchThis', window.currentSearchTerm);
    }
    
    // categorías seleccionadas
    if (selectedCategories.length > 0) {
        const categoryIds = selectedCategories.map(cat => cat.id).join(',');
        params.append('category_ids_csv', categoryIds);
    }
    
    // rango de fechas
    const dateFrom = document.getElementById('sinceDate')?.value;
    const dateTo = document.getElementById('toDate')?.value;
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    
    // país sede
    const hostCountry = document.getElementById('countrySelect')?.value;
    if (hostCountry) params.append('host_country', hostCountry);
    
    // selección nacional (solo si el checkbox está marcado)
    const bySelectionCheck = document.getElementById('bySelectionCheck')?.checked;
    if (bySelectionCheck) {
        const nationalTeam = document.getElementById('nationalitySelect')?.value;
        if (nationalTeam) params.append('national_team', nationalTeam);
    }
    
    // mundial específico (solo si el checkbox está marcado)
    const byMundialCheck = document.getElementById('byMundialCheck')?.checked;
    if (byMundialCheck) {
        const worldCupId = document.getElementById('selectYear')?.value;
        if (worldCupId) params.append('worldcup_id', worldCupId);
    }
    
    // ordenamiento
    const orderSelect = document.getElementById('orderSelect');
    if (orderSelect?.value) {
        params.append('sort_by', orderSelect.value);
    }
    
    return params;
}

/**
 * Poblar formulario desde parámetros de URL (para página de resultados)
 */
function populateFiltersFromURL() {
    // solo ejecutar si estamos en la página de resultados
    if (!window.location.pathname.includes('/results')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    
    // categorías
    const categoryIdsStr = urlParams.get('category_ids_csv');
    if (categoryIdsStr && categoriesData.length > 0) {
        const categoryIds = categoryIdsStr.split(',');
        categoryIds.forEach(id => {
            const category = categoriesData.find(cat => cat.id === id);
            if (category && !selectedCategories.some(c => c.id === id)) {
                selectedCategories.push({ id: category.id, name: category.name });
            }
        });
        renderSelectedCategories();
    }
    
    // fechas
    const dateFrom = urlParams.get('date_from');
    const dateTo = urlParams.get('date_to');
    if (dateFrom) setInputValue('sinceDate', dateFrom);
    if (dateTo) setInputValue('toDate', dateTo);
    
    // país sede
    const hostCountry = urlParams.get('host_country');
    if (hostCountry) setInputValue('countrySelect', hostCountry);
    
    // selección nacional
    const nationalTeam = urlParams.get('national_team');
    if (nationalTeam) {
        setInputValue('bySelectionCheck', true, 'checkbox');
        setInputValue('nationalitySelect', nationalTeam);
    }
    
    // mundial
    const worldcupId = urlParams.get('worldcup_id');
    if (worldcupId) {
        setInputValue('byMundialCheck', true, 'checkbox');
        setInputValue('selectYear', worldcupId);
    }
    
    // ordenamiento
    const sortBy = urlParams.get('sort_by');
    if (sortBy) setInputValue('orderSelect', sortBy);
}

/**
 * Helper para setear valores de inputs
 */
function setInputValue(id, value, type = 'text') {
    const element = document.getElementById(id);
    if (!element) return;
    
    if (type === 'checkbox') {
        element.checked = value;
    } else {
        element.value = value;
    }
}

////////////////////////////////////////////////////////////
// UTILIDADES
////////////////////////////////////////////////////////////

/**
 * Cerrar modal de filtros
 */
function closeFiltersModal() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
