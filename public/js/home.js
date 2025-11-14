// array de mundiales - se carga desde la base de datos
let mundials = [];

// instancia del cargador de posts
let postsLoader;

document.addEventListener("DOMContentLoaded", async () => 
{
    await loadWorldCupsForSlider();
    showCarousel(mundials);
    
    // inicializar cargador de posts con scroll infinito
    postsLoader = new PostsLoader({
        containerId: 'container4Post',
        fetchUrl: '/posts/search',
        fetchParams: { sort_by: 'newest' },
        pageSize: 6,
        renderMode: 'card'
    });
    
    await postsLoader.init();
});

////////////////////////////////////////////////////////////
// SLIDER DE MUNDIALES
////////////////////////////////////////////////////////////

// carga los mundiales desde la base de datos para el slider
async function loadWorldCupsForSlider() {
    try {
        showLoadingSpinner();
        
        const response = await fetch('/worldcups/slider', {
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
            // procesar los datos para convertir las imagenes base64 a urls
            mundials = data.map(mundial => ({
                id: mundial.id,
                image: mundial.image ? `data:image/jpeg;base64,${mundial.image}` : '/media/userPhoto.png',
                year: mundial.year,
                slogan: mundial.slogan || 'Mundial de fútbol',
                name: mundial.name || `Mundial ${mundial.year}`
            }));
            
            console.log(`${mundials.length} mundiales cargados para el slider`);
        } else {
            console.warn('No se encontraron mundiales para el slider');
            // usar datos de fallback si no hay mundiales
            mundials = [{
                image: '/media/userPhoto.png',
                year: '2024',
                slogan: 'No hay mundiales disponibles',
                name: 'Sin datos'
            }];
        }
        
    } catch (error) {
        console.error('Error al cargar mundiales:', error);
        // usar datos de fallback en caso de error
        mundials = [{
            image: '/media/userPhoto.png',
            year: '2024',
            slogan: 'Error al cargar mundiales',
            name: 'Error de conexion'
        }];
    } finally {
        hideLoadingSpinner();
    }
}

function showCarousel(pMundiales) 
{
    const inner = document.getElementById("carousel-inner");
    const indicators = document.getElementById("carousel-indicators");

    if (!inner || !indicators) {
        console.error('No se encontraron los elementos del carousel');
        return;
    }

    // limpiar contenido anterior
    inner.innerHTML = '';
    indicators.innerHTML = '';

    if (!pMundiales || pMundiales.length === 0) {
        inner.innerHTML = '<div class="carousel-item active"><div class="d-flex justify-content-center align-items-center" style="height: 400px;"><p class="text-white">No hay mundiales disponibles</p></div></div>';
        return;
    }

    // crear cada uno de los mundiales
    pMundiales.forEach((mundial, i) => 
    {
        const item = document.createElement("div");

        if(i === 0)
            item.className = "carousel-item active";
        else
            item.className = "carousel-item";

        item.setAttribute("data-bs-interval", "5000");
        
        // crear imagen con lazy loading y fallback
        const imgSrc = i === 0 ? mundial.image : ''; // solo cargar la primera imagen inmediatamente
        const lazyLoad = i === 0 ? '' : `data-src="${mundial.image}" loading="lazy"`;
        
        item.innerHTML = `
            <div class="imageDegraded" style="cursor: pointer;" onclick="goToMundial(${mundial.id})">
                <a>
                    <img ${imgSrc ? `src="${imgSrc}"` : ''} 
                         ${lazyLoad} 
                         class="d-block carouselImg img-fluid carousel-image" 
                         alt="Mundial ${mundial.year}"
                         onerror="this.src='/media/userPhoto.png'">
                </a>
            </div>
            <div class="carousel-caption d-md-block mb-4">
                <a href="/mundialDisplay?id=${mundial.id}">
                    <h1 class="pageTitle rem2size textShadow">Mundial ${mundial.year}</h1>
                </a>
                <h2 class="mundialSlogan textShadow">${mundial.slogan}</h2>
            </div>
        `;
        inner.appendChild(item);

        // crear el boton indicador
        const indicatorHtml = `
            <button type="button" 
                    data-bs-target="#mundialSlider" 
                    data-bs-slide-to="${i}" 
                    data-bs-toggle="tooltip" 
                    data-bs-placement="bottom" 
                    data-bs-custom-class="custom-tooltip" 
                    title="${mundial.year}" 
                    aria-label="Slide ${i + 1}" 
                    ${i === 0 ? 'class="active" aria-current="true"' : ''}></button>
        `;
        const tmp = document.createElement('div');
        tmp.innerHTML = indicatorHtml.trim();
        indicators.appendChild(tmp.firstChild);
    });

    // activar tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
    
    // configurar lazy loading para imagenes del carousel
    setupCarouselLazyLoading();
}

// configura el lazy loading para las imagenes del carousel
function setupCarouselLazyLoading() {
    const carousel = document.getElementById('mundialSlider');
    if (!carousel) return;

    carousel.addEventListener('slide.bs.carousel', function (event) {
        // cargar la imagen del slide siguiente
        const nextSlide = event.relatedTarget;
        const img = nextSlide.querySelector('img[data-src]');
        
        if (img && img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    });
}

// muestra spinner de carga
function showLoadingSpinner() {
    const inner = document.getElementById("carousel-inner");
    if (inner) {
        inner.innerHTML = `
            <div class="carousel-item active">
                <div class="d-flex justify-content-center align-items-center" style="height: 400px;">
                    <div class="spinner-border text-light" role="status">
                        <span class="visually-hidden">Cargando mundiales...</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// oculta spinner de carga
function hideLoadingSpinner() {
    // el spinner se oculta automaticamente cuando se cargan los datos del carousel
}

// navega al mundial especificado
function goToMundial(worldCupId) {
    if (worldCupId) {
        window.location.href = `/mundialDisplay?id=${worldCupId}`;
    }
}

////////////////////////////////////////////////////////////
// POSTS MAS RECIENTES
////////////////////////////////////////////////////////////
// La lógica de posts se maneja ahora en fetchPreviewPosts.js
// Se usa la clase PostsLoader para cargar y renderizar posts

