// variables globales
let worldCupYears = [];
let selectedWorldCup = null;
let countriesData = [];
let categoriesData = [];
let selectedSelections = [];
let selectedCategories = [];

document.addEventListener("DOMContentLoaded", async () => {
    // cargar datos necesarios
    await loadWorldCupYears();
    await loadCountries();
    await loadCategories();
    setupEventListeners();
});

// configurar event listeners
function setupEventListeners() {
    // boton descartar
    const discardBtn = document.getElementById("discardPost");
    if (discardBtn) {
        discardBtn.addEventListener("click", () => {
            const confirmDiscard = confirm("[⚠️] A T E N C I Ó N: ¿Seguro que quieres descartar esta publicación? Esta acción no se puede deshacer.");
            if (confirmDiscard) {
                location.href = "/";
            }
        });
    }

    // formulario
    const form = document.getElementById('addPostForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // select de años
    const selectYear = document.getElementById('selectYear');
    if (selectYear) {
        selectYear.addEventListener('change', handleYearChange);
    }

    // boton añadir seleccion
    const addSelectionBtn = document.getElementById('addSelection');
    if (addSelectionBtn) {
        addSelectionBtn.addEventListener('click', addSelection);
    }

    // boton añadir categoria
    const addCategoryBtn = document.getElementById('addCategory');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addCategory);
    }
}

// manejar envio del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const yearSelect = document.getElementById('selectYear');
    const selectedWorldCupId = yearSelect.value;

    // validar campos requeridos
    if (!title || !content || !selectedWorldCupId) {
        alert("[⚠️] A T E N C I Ó N: Necesita proporcionar un título, descripción y seleccionar un mundial");
        return;
    }

    try {
        showNewPostSpinner();
        
        // crear FormData
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('worldcup_id', selectedWorldCupId);
        
        // agregar selecciones si las hay
        if (selectedSelections.length > 0) {
            console.log('Selecciones seleccionadas:', selectedSelections);
            
            // extraer los nombres de los objetos de selecciones y enviar como CSV
            const selectionNames = selectedSelections
                .filter(selection => selection && selection.name && selection.name.trim()) // solo objetos con nombre válido
                .map(selection => selection.name.trim());
            
            console.log('Nombres de selecciones filtrados:', selectionNames);
            
            if (selectionNames.length > 0) {
                const csvSelections = selectionNames.join(',');
                formData.append('selections', csvSelections);
                console.log('CSV de selecciones enviado:', csvSelections);
            } else {
                console.warn('No se encontraron selecciones válidas');
            }
        } else {
            console.log('No hay selecciones seleccionadas');
        }
        
        // agregar categorias si las hay
        if (selectedCategories.length > 0) {
            console.log('Categorías seleccionadas:', selectedCategories);
            
            // enviar los IDs como CSV directamente
            const categoryIds = selectedCategories
                .filter(cat => cat.id) // solo categorias con ID válido
                .map(cat => cat.id);
            
            console.log('IDs de categorías filtrados:', categoryIds);
            
            if (categoryIds.length > 0) {
                const csvIds = categoryIds.join(',');
                formData.append('category_ids', csvIds);
                console.log('CSV de categorías enviado:', csvIds);
            } else {
                console.warn('No se encontraron categorías con IDs válidos');
            }
        } else {
            console.log('No hay categorías seleccionadas');
        }
        
        console.log('Enviando post:', { 
            title, 
            content, 
            worldcup_id: selectedWorldCupId,
            selections: selectedSelections,
            categories: selectedCategories,
            category_ids: selectedCategories.filter(cat => cat.id).map(cat => cat.id).join(','),
            selections_csv: selectedSelections.filter(s => s && s.name && s.name.trim()).map(s => s.name.trim()).join(',')
        });

        // enviar datos
        const response = await fetch('/posts', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log('Respuesta del servidor:', result);

        if (result.exito) {
            showErrorText('✅ Post creado exitosamente y enviado a revisión', true);
            alert('✅ Post creado exitosamente y enviado a revisión');
            location.href = '/';
        } else {
            showErrorText('❌ Error: ' + result.mensaje, false);
        }

    } catch (error) {
        console.error('Error enviando post:', error);
        showErrorText('❌ Error de conexión', false);
    } finally {
        hideNewPostSpinner();
    }
}

// cargar años de mundiales
async function loadWorldCupYears() {
    try {
        console.log('Cargando años de mundiales para newPost...');
        
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
            worldCupYears = data.sort((a, b) => a.year - b.year);
            populateYearSelect();
            console.log('Años de mundiales cargados:', worldCupYears);
        } else {
            console.warn('No se encontraron años de mundiales');
        }
        
    } catch (error) {
        console.error('Error al cargar años de mundiales:', error);
    }
}

// llenar el select de años
function populateYearSelect() {
    const selectYear = document.getElementById('selectYear');
    if (!selectYear) return;

    // limpiar opciones existentes
    selectYear.innerHTML = '<option value="">Selecciona un mundial</option>';

    // agregar opciones de mundiales
    worldCupYears.forEach(worldCup => {
        const option = document.createElement('option');
        option.value = worldCup.id;
        option.textContent = worldCup.year;
        option.dataset.name = worldCup.name;
        selectYear.appendChild(option);
    });
}

// manejar cambio en select de año
function handleYearChange(event) {
    const selectedId = event.target.value;
    const selectedOption = event.target.selectedOptions[0];
    const countryDisplay = document.getElementById('showCountries');

    if (selectedId && selectedOption) {
        // encontrar el mundial seleccionado
        selectedWorldCup = worldCupYears.find(wc => wc.id == selectedId);
        
        if (selectedWorldCup && countryDisplay) {
            countryDisplay.textContent = selectedWorldCup.name || `Mundial ${selectedWorldCup.year}`;
            console.log('Mundial seleccionado:', selectedWorldCup);
        }
    } else if (countryDisplay) {
        countryDisplay.textContent = 'Selecciona un mundial';
        selectedWorldCup = null;
    }
}

// manejar spinner de nuevo post
function showNewPostSpinner() {
    const spinner = document.getElementById('newpost-spinner');
    const button = document.getElementById('postPost');
    if (spinner && button) {
        spinner.style.display = 'block';
        button.disabled = true;
        button.textContent = 'Publicando...';
    }
}

function hideNewPostSpinner() {
    const spinner = document.getElementById('newpost-spinner');
    const button = document.getElementById('postPost');
    if (spinner && button) {
        spinner.style.display = 'none';
        button.disabled = false;
        button.textContent = 'Publicar';
    }
}

// cargar paises desde api externa
async function loadCountries() {
    try {
        console.log('Cargando países para selecciones...');
        
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,unicodeFlag,dialCode');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.data) {
            countriesData = data.data;
            populateCountriesSelect();
            console.log(`${countriesData.length} países cargados`);
        } else {
            console.warn('No se encontraron países');
        }
        
    } catch (error) {
        console.error('Error al cargar países:', error);
    }
}

// llenar el select de selecciones (países)
function populateCountriesSelect() {
    const selectCountry = document.getElementById('selectionSelected');
    if (!selectCountry) return;

    // limpiar opciones existentes
    selectCountry.innerHTML = '<option value="">Selecciona una selección</option>';

    // agregar opciones de países
    countriesData
        .filter(country => country.name) // filtrar países sin nombre
        .sort((a, b) => a.name.localeCompare(b.name)) // ordenar alfabéticamente
        .forEach(country => {
            const option = document.createElement('option');
            option.value = country.name;
            option.textContent = country.name;
            option.dataset.flag = country.flag;
            option.dataset.unicodeFlag = country.unicodeFlag;
            selectCountry.appendChild(option);
        });
}

// cargar categorías desde el backend
async function loadCategories() {
    try {
        console.log('Cargando categorías desde backend...');
        
        const response = await fetch('/categories', {
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
            categoriesData = data;
            populateCategoriesSelect();
            console.log(`${categoriesData.length} categorías cargadas desde BD`);
        } else {
            console.warn('No se encontraron categorías');
        }
        
    } catch (error) {
        console.error('Error al cargar categorías desde BD:', error);
    }
}

// llenar el select de categorías
function populateCategoriesSelect() {
    const selectCategory = document.getElementById('tagSelected');
    if (!selectCategory) return;

    // limpiar opciones existentes
    selectCategory.innerHTML = '<option value="">Selecciona una categoría</option>';

    // agregar opciones de categorías
    categoriesData
        .sort((a, b) => a.name.localeCompare(b.name)) // ordenar alfabéticamente
        .forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = `#${category.name}`;
            selectCategory.appendChild(option);
        });
}

// agregar seleccion al listbox
function addSelection() {
    const selectCountry = document.getElementById('selectionSelected');
    if (!selectCountry || !selectCountry.value) {
        alert('Por favor selecciona una selección');
        return;
    }

    const selectedCountry = selectCountry.value;
    const selectedOption = selectCountry.options[selectCountry.selectedIndex];
    const flagUrl = selectedOption.dataset.flag;
    const unicodeFlag = selectedOption.dataset.unicodeFlag;

    // verificar si ya existe
    if (selectedSelections.find(selection => selection.name === selectedCountry)) {
        alert('Esta selección ya está agregada');
        return;
    }

    // agregar a la lista
    selectedSelections.push({
        name: selectedCountry,
        flag: flagUrl,
        unicodeFlag: unicodeFlag
    });

    updateSelectionsList();
    selectCountry.value = '';
    console.log('Selección agregada:', selectedCountry);
}

// actualizar lista de selecciones
function updateSelectionsList() {
    const container = document.getElementById('listSelections');
    if (!container) return;

    container.innerHTML = '';
    
    selectedSelections.forEach((selection, index) => {
        const selectionDiv = document.createElement('div');
        selectionDiv.className = 'd-flex align-items-center height50x';
        selectionDiv.innerHTML = `
            <p class="showListElement shadow">
                ${selection.unicodeFlag ? selection.unicodeFlag + ' ' : ''}${selection.name}
            </p>
            <button type="button" class="addButton noBackground noBorder" onclick="removeSelection(${index})">
                <i class="bi bi-x-square deleteIcon"></i>
            </button>
        `;
        container.appendChild(selectionDiv);
    });
}

// remover seleccion
function removeSelection(index) {
    if (index >= 0 && index < selectedSelections.length) {
        console.log('Removiendo selección:', selectedSelections[index].name);
        selectedSelections.splice(index, 1);
        updateSelectionsList();
    }
}

// agregar categoria al listbox
function addCategory() {
    const selectCategory = document.getElementById('tagSelected');
    if (!selectCategory || !selectCategory.value) {
        alert('Por favor selecciona una categoría');
        return;
    }

    const selectedCategory = selectCategory.value;
    const selectedOption = selectCategory.options[selectCategory.selectedIndex];
    
    // buscar la categoria completa para obtener el id si es necesario
    const fullCategory = categoriesData.find(cat => cat.name === selectedCategory);
    
    console.log('Categoría seleccionada:', selectedCategory);
    console.log('Categoría encontrada en datos:', fullCategory);
    console.log('Datos de categorías disponibles:', categoriesData);

    // verificar si ya existe
    if (selectedCategories.find(category => category.name === selectedCategory)) {
        alert('Esta categoría ya está agregada');
        return;
    }

    // agregar a la lista con toda la info
    const newCategory = {
        name: selectedCategory,
        id: fullCategory ? fullCategory.id : null,
        displayText: selectedOption.textContent // incluye el #
    };
    
    selectedCategories.push(newCategory);
    
    console.log('Categoría agregada a la lista:', newCategory);
    console.log('Lista completa de categorías seleccionadas:', selectedCategories);
    
    updateCategoriesList();
    selectCategory.value = '';
}

// actualizar lista de categorias
function updateCategoriesList() {
    const container = document.getElementById('listCategories');
    if (!container) return;

    container.innerHTML = '';
    
    selectedCategories.forEach((category, index) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'd-flex align-items-center height50x';
        categoryDiv.innerHTML = `
            <p class="showListElement shadow">${category.displayText || '#' + category.name}</p>
            <button type="button" class="addButton noBackground noBorder" onclick="removeCategory(${index})">
                <i class="bi bi-x-square deleteIcon"></i>
            </button>
        `;
        container.appendChild(categoryDiv);
    });
}

// remover categoria
function removeCategory(index) {
    if (index >= 0 && index < selectedCategories.length) {
        console.log('Removiendo categoría:', selectedCategories[index].name || selectedCategories[index]);
        selectedCategories.splice(index, 1);
        updateCategoriesList();
    }
}

// hacer las funciones disponibles globalmente
window.removeSelection = removeSelection;
window.removeCategory = removeCategory;

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
