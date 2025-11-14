// array de mundiales - se carga desde la base de datos
let mundials = [];

// paginación de posts
let currentPage = 1;
const pageSize = 6;
let isLoading = false;
let hasMorePosts = true;

document.addEventListener("DOMContentLoaded", async () => 
{
    await loadWorldCupsForSlider();
    showCarousel(mundials);
    await loadRecentPosts();
    setupInfiniteScroll();
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

// cargar posts mas recientes
async function loadRecentPosts(append = false) {
    if (isLoading || (!hasMorePosts && append)) return;
    
    try {
        isLoading = true;
        if (append) showLoadingIndicator();
        
        const response = await fetch(`/posts/search?sort_by=newest&page=${currentPage}&page_size=${pageSize}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.posts && data.posts.length > 0) {
            renderPosts(data.posts, append);
            
            // verificar si hay mas posts
            hasMorePosts = data.posts.length === pageSize;
            
            if (hasMorePosts) {
                currentPage++;
            }
        } else {
            if (!append) {
                showEmptyState();
            }
            hasMorePosts = false;
        }
        
    } catch (error) {
        console.error('Error al cargar posts recientes:', error);
        if (!append) {
            showErrorState();
        }
    } finally {
        isLoading = false;
        hideLoadingIndicator();
    }
}

// renderizar posts en el contenedor
function renderPosts(posts, append = false) {
    const container = document.getElementById('container4Post');
    if (!container) return;
    
    if (!append) {
        container.innerHTML = '';
    }
    
    posts.forEach(post => {
        container.appendChild(createPostCard(post));
    });
}

// crear tarjeta de post
function createPostCard(post) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'd-flex';
    
    // obtener primera imagen/video
    const firstMedia = post.multimedia && post.multimedia.length > 0
        ? post.multimedia.find(m => m.type === 'image' || m.type === 'video')
        : null;
    
    const isVideo = firstMedia && firstMedia.type === 'video';
    let mediaUrl = '/media/userPhoto.png'; // default
    
    if (firstMedia) {
        if (isVideo) {
            mediaUrl = firstMedia.path;
        } else if (firstMedia.image) {
            // La imagen ya viene procesada desde el backend, lista para usar
            mediaUrl = `data:image/jpeg;base64,${firstMedia.image}`;
        }
    }
    
    // procesar categorias (tags)
    const tags = post.categories || [];
    
    // procesar selecciones nacionales
    const nationalTeams = post.national_teams || [];
    
    cardContainer.innerHTML = `
        <div class="card cardSize borderDegraded" data-bs-theme="dark" style="cursor: pointer;" data-post-id="${post.postId}">
            <div class="card-body imageDegraded noMargin noPadding">
                ${isVideo
                    ? `<video src="${mediaUrl}" class="backgroundCard" muted loop></video>`
                    : `<img class="backgroundCard" src="${mediaUrl}" alt="Post media" onerror="this.src='/media/userPhoto.png'">`
                }

                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12 over">
                            <a href="/profile" onclick="event.stopPropagation()"><p class="userCard">@${escapeHtml(post.username)}</p></a>
                        </div>
                    </div>
                </div>

                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12 over">
                            <a href="/postDisplay?id=${post.postId}" class="over">
                                <h5 class="cardTitle over">${escapeHtml(post.title)}</h5>
                            </a>
                        </div>
                    </div>
                </div>
                <br>
                
                ${post.year || nationalTeams.length > 0 ? `
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12 over">
                            <div class="d-flex over">
                                ${post.year ? `<button type="button" onclick="event.stopPropagation(); location.href='/results'" class="ticketsCard">${post.year}</button>` : ''}
                                ${nationalTeams.map(team => 
                                    `<button type="button" onclick="event.stopPropagation(); location.href='/results'" class="ticketsCard">${escapeHtml(team.country)}</button>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>` : ''}

                ${tags.length > 0 ? `
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12 over">
                            <div class="d-flex align-items-center tagContainer">
                                ${tags.map(tag => 
                                    `<button type="button" onclick="event.stopPropagation(); location.href='/results'" class="tags">#${escapeHtml(tag.name)}</button>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>` : ''}
            </div>
        </div>
    `;
    
    // agregar evento click a la tarjeta completa
    const card = cardContainer.querySelector('.card');
    if (card) {
        card.addEventListener('click', () => {
            window.location.href = `/postDisplay?id=${post.postId}`;
        });
    }
    
    // activar video hover
    const video = cardContainer.querySelector('video');
    if (video) {
        setupVideoHover(video);
    }
    
    return cardContainer;
}

// configurar hover para videos
function setupVideoHover(video) {
    video.addEventListener('mouseenter', () => {
        video.play().catch(err => console.log('Error playing video:', err));
    });
    
    video.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
    });
}

// mostrar estado vacio
function showEmptyState() {
    const container = document.getElementById('container4Post');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-inbox display-1 text-muted"></i>
            <h3 class="aliceblueText mt-3">No hay publicaciones disponibles</h3>
            <p class="whiteGreyText">Sé el primero en publicar algo</p>
        </div>
    `;
}

// mostrar estado de error
function showErrorState() {
    const container = document.getElementById('container4Post');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
            <h3 class="aliceblueText mt-3">Error al cargar publicaciones</h3>
            <p class="whiteGreyText">Por favor, intenta nuevamente más tarde</p>
        </div>
    `;
}

// escapar HTML para prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

////////////////////////////////////////////////////////////
// SCROLL INFINITO
////////////////////////////////////////////////////////////

// configurar scroll infinito
function setupInfiniteScroll() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
        // debounce para evitar multiples llamadas
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (shouldLoadMore()) {
                loadRecentPosts(true);
            }
        }, 200);
    });
}

// verificar si debe cargar mas posts
function shouldLoadMore() {
    if (isLoading || !hasMorePosts) return false;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // cargar cuando el usuario esta a 300px del final
    return (scrollTop + windowHeight) >= (documentHeight - 300);
}

// mostrar indicador de carga
function showLoadingIndicator() {
    const container = document.getElementById('container4Post');
    if (!container) return;
    
    // verificar si ya existe el indicador
    if (document.getElementById('loadingIndicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'loadingIndicator';
    indicator.className = 'text-center py-4';
    indicator.innerHTML = `
        <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Cargando más posts...</span>
        </div>
        <p class="whiteGreyText mt-2">Cargando más publicaciones...</p>
    `;
    
    container.appendChild(indicator);
}

// ocultar indicador de carga
function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

