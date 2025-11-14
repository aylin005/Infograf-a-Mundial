/**
 *
 * página de resultados de búsqueda con filtros
 */

let resultsLoader;
let topPostsLoader;

document.addEventListener("DOMContentLoaded", async () => {
    await initializeResultsPage();
});

///////////////////////////
 // inicializar página de resultados
///////////////////////////
async function initializeResultsPage() {
    const searchParams = getSearchParamsFromURL();
    
    // inicializar loader principal con los filtros
    resultsLoader = new PostsLoader({
        containerId: 'container4Post',
        fetchUrl: '/posts/search',
        fetchParams: searchParams,
        pageSize: 9,
        renderMode: 'card'
    });
    
    await resultsLoader.init();
    updateResultsCount();
    
    // inicializar loader de top posts en el aside
    topPostsLoader = new PostsLoader({
        containerId: 'previewContainer',
        fetchUrl: '/posts/search',
        fetchParams: { sort_by: 'popular' },
        pageSize: 5,
        renderMode: 'preview'
    });
    
    await topPostsLoader.loadPosts();
}

///////////////////////////
 // Obtener parámetros de búsqueda desde la URL
///////////////////////////
function getSearchParamsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    
    // búsqueda por texto (term/search/searchThis)
    const searchText = urlParams.get('searchThis') || urlParams.get('search') || urlParams.get('term');
    if (searchText) {
        params.term = searchText;
    }
    
    // categorías (multiple IDs separados por coma)
    const categoryIds = urlParams.get('category_ids_csv');
    if (categoryIds) {
        params.category_ids_csv = categoryIds;
    }
    
    // fechas
    const dateFrom = urlParams.get('date_from');
    if (dateFrom) {
        params.date_from = dateFrom;
    }
    
    const dateTo = urlParams.get('date_to');
    if (dateTo) {
        params.date_to = dateTo;
    }
    
    // sede (país anfitrión)
    const hostCountry = urlParams.get('host_country');
    if (hostCountry) {
        params.host_country = hostCountry;
    }
    
    // selección nacional
    const nationalTeam = urlParams.get('national_team');
    if (nationalTeam) {
        params.national_team = nationalTeam;
    }
    
    // mundial específico
    const worldcupId = urlParams.get('worldcup_id');
    if (worldcupId) {
        params.worldcup_id = worldcupId;
    }
    
    // ordenamiento
    const sortBy = urlParams.get('sort_by');
    params.sort_by = sortBy || 'newest';
    
    return params;
}

///////////////////////////
 // Actualizar contador de resultados
///////////////////////////
function updateResultsCount() {
    const resultsText = document.getElementById('totalResults');
    if (!resultsText) return;
    
    // obtener el contenedor de posts
    const container = document.getElementById('container4Post');
    if (!container) return;
    
    // obtener término de búsqueda para el mensaje
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('searchThis') || urlParams.get('search') || urlParams.get('term');
    
    // esperar a que se carguen los posts
    setTimeout(() => {
        const postCards = container.querySelectorAll('.card');
        const count = postCards.length;
        
        let message = '';
        if (count > 0) {
            message = `Se encontraron ${count}${resultsLoader.hasMorePosts ? '+' : ''} resultados`;
            if (searchTerm) {
                message += ` para "${escapeHtml(searchTerm)}"`;
            } else {
                message += ' relacionados a tu búsqueda';
            }
        } else {
            message = 'No se encontraron resultados';
            if (searchTerm) {
                message += ` para "${escapeHtml(searchTerm)}"`;
            } else {
                message += ' para tu búsqueda';
            }
        }
        
        resultsText.textContent = message;
    }, 500);
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

///////////////////////////
 // Aplicar nuevos filtros (llamado desde el modal de filtros)
///////////////////////////
window.applySearchFilters = function(filterParams) {
    // actualizar URL con los nuevos parámetros
    const newUrl = `/results?${new URLSearchParams(filterParams).toString()}`;
    window.location.href = newUrl;
};
