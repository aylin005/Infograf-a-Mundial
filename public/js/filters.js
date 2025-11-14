// variables globales para filtros
let categoriesData = [];
let countriesData = [];
let worldCupYears = [];
let selectedCategories = [];
let filtersInitialized = false;

// función de inicialización que se llama externamente
window.initializeFilters = async function() {
    if (filtersInitialized) return;
    
    await loadFilterData();
    setupFilterEventListeners();
    filtersInitialized = true;
};

// cargar todos los datos necesarios
async function loadFilterData() {
    await Promise.all([
        loadCategories(),
        loadCountries(),
        loadWorldCupYears()
    ]);
}

// cargar categorías desde la BD
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

// cargar países desde la API
async function loadCountries() {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,unicodeFlag,dialCode');
        if (!response.ok) throw new Error('Error loading countries');
        
        const result = await response.json();
        
        if (result && result.data) {
            const data = result.data;
            
            // ordenar alfabéticamente por nombre
            countriesData = data
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

// cargar años de mundiales desde la BD
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

// poblar select de categorías
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

// poblar selects de países (sede y selección)
function populateCountrySelects() {
    // select de sede
    const hostSelect = document.getElementById('countrySelect');
    if (hostSelect) {
        hostSelect.innerHTML = '<option value="">Selecciona una sede</option>';
        
        countriesData.forEach(country => {
            const option = document.createElement('option');
            option.value = country.name;
            option.textContent = `${country.unicodeFlag || ''} ${country.name}`;
            option.dataset.flag = country.flag;
            option.dataset.unicodeFlag = country.unicodeFlag;
            hostSelect.appendChild(option);
        });
        
        // actualizar bandera al cambiar
        hostSelect.addEventListener('change', function() {
            const selectedOption = this.selectedOptions[0];
            updateFlag('miniFlag', selectedOption?.dataset.flag);
        });
    }
    
    // select de selección nacional
    const nationalitySelect = document.getElementById('nationalitySelect');
    if (nationalitySelect) {
        nationalitySelect.innerHTML = '<option value="">Selecciona una selección</option>';
        
        countriesData.forEach(country => {
            const option = document.createElement('option');
            option.value = country.name;
            option.textContent = `${country.unicodeFlag || ''} ${country.name}`;
            option.dataset.flag = country.flag;
            option.dataset.unicodeFlag = country.unicodeFlag;
            nationalitySelect.appendChild(option);
        });
        
        // actualizar bandera al cambiar
        nationalitySelect.addEventListener('change', function() {
            const selectedOption = this.selectedOptions[0];
            updateFlag('natFlag', selectedOption?.dataset.flag);
        });
    }
}

// poblar select de años de mundiales
function populateWorldCupSelect() {
    const select = document.getElementById('selectYear');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecciona un mundial</option>';
    
    worldCupYears.forEach(worldCup => {
        const option = document.createElement('option');
        option.value = worldCup.id;
        option.textContent = `${worldCup.year} - ${worldCup.name}`;
        select.appendChild(option);
    });
}

// actualizar imagen de bandera
function updateFlag(imgId, flagUrl) {
    const img = document.getElementById(imgId);
    if (img && flagUrl) {
        img.src = flagUrl;
        img.style.display = 'block';
    } else if (img) {
        img.style.display = 'none';
    }
}

// configurar event listeners
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
    
    // formulario
    const form = document.getElementById('filterForm');
    if (form) {
        form.addEventListener('submit', handleFilterSubmit);
    }
}

// agregar categoría a la lista
function addCategory() {
    const select = document.getElementById('tagSelected');
    if (!select || !select.value) return;
    
    const categoryId = select.value;
    const categoryName = select.selectedOptions[0].dataset.name;
    
    // verificar que no esté duplicada
    if (selectedCategories.some(cat => cat.id === categoryId)) {
        alert('Esta categoría ya está agregada');
        return;
    }
    
    selectedCategories.push({ id: categoryId, name: categoryName });
    renderSelectedCategories();
}

// renderizar categorías seleccionadas
function renderSelectedCategories() {
    const container = document.getElementById('listCategories');
    if (!container) return;
    
    container.innerHTML = '';
    
    selectedCategories.forEach((category, index) => {
        const div = document.createElement('div');
        div.className = 'd-flex align-items-center height50x';
        div.innerHTML = `
            <p class="showListElement shadow smallerText">#${category.name}</p>
            <button type="button" class="addButton noBackground noBorder" onclick="removeCategory(${index})">
                <i class="bi bi-x-square deleteIcon"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

// remover categoría
window.removeCategory = function(index) {
    selectedCategories.splice(index, 1);
    renderSelectedCategories();
};

// manejar envío del formulario de filtros
function handleFilterSubmit(event) {
    event.preventDefault();
    
    // construir query params para búsqueda
    const params = new URLSearchParams();
    
    // categorías
    if (selectedCategories.length > 0) {
        const categoryIds = selectedCategories.map(cat => cat.id).join(',');
        params.append('category_ids_csv', categoryIds);
    }
    
    // fechas
    const dateFrom = document.getElementById('sinceDate')?.value;
    const dateTo = document.getElementById('toDate')?.value;
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    
    // sede
    const hostCountry = document.getElementById('countrySelect')?.value;
    if (hostCountry) params.append('host_country', hostCountry);
    
    // selección nacional
    const bySelectionCheck = document.getElementById('bySelection')?.checked;
    if (bySelectionCheck) {
        const nationalTeam = document.getElementById('nationalitySelect')?.value;
        if (nationalTeam) params.append('national_team', nationalTeam);
    }
    
    // mundial
    const byMundialCheck = document.getElementById('byMundial')?.checked;
    if (byMundialCheck) {
        const worldCupId = document.getElementById('selectYear')?.value;
        if (worldCupId) params.append('worldcup_id', worldCupId);
    }
    
    // ordenamiento
    const orderSelect = document.getElementById('orderSelect');
    if (orderSelect && orderSelect.value) {
        params.append('sort_by', orderSelect.value);
    }
    
    // redirigir a results con los parámetros
    window.location.href = `/results?${params.toString()}`;
}

// cerrar modal de filtros
function closeFiltersModal() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}
