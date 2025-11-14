/**
 * navBar.js
 * Manejo de búsqueda y navegación del navbar
 */

document.addEventListener("DOMContentLoaded", () => {
    setupSearchForm();
    setupAdvancedSearchButton();
    populateSearchInput();
});

/**
 * Configurar formulario de búsqueda simple
 */
function setupSearchForm() {
    const searchForm = document.getElementById('searchForm');
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
    });
}

/**
 * Configurar botón de búsqueda avanzada (filtros)
 */
function setupAdvancedSearchButton() {
    const advSearchBtn = document.getElementById('advSearchIcon');
    if (!advSearchBtn) return;
    
    advSearchBtn.addEventListener('click', () => {
        openFiltersModal();
    });
}

/**
 * Realizar búsqueda simple por texto
 */
function performSearch() {
    const searchInput = document.getElementById('searchThis');
    if (!searchInput) return;
    
    const searchText = searchInput.value.trim();
    
    if (searchText) {
        // Redirigir a results con el término de búsqueda
        window.location.href = `/results?searchThis=${encodeURIComponent(searchText)}`;
    } else {
        // Si está vacío, redirigir a results sin filtros
        window.location.href = '/results';
    }
}

/**
 * Abrir modal de filtros avanzados
 */
function openFiltersModal() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        
        // Pre-llenar con texto de búsqueda actual si existe
        const searchInput = document.getElementById('searchThis');
        if (searchInput && searchInput.value.trim()) {
            // Guardar el texto de búsqueda para usarlo en los filtros
            window.currentSearchTerm = searchInput.value.trim();
        }
    }
}

/**
 * Poblar input de búsqueda desde URL (para página de resultados)
 */
function populateSearchInput() {
    if (!window.location.pathname.includes('/results')) return;
    
    const searchInput = document.getElementById('searchThis');
    if (!searchInput) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchText = urlParams.get('searchThis') || urlParams.get('search') || urlParams.get('term');
    
    if (searchText) {
        searchInput.value = searchText;
    }
}
