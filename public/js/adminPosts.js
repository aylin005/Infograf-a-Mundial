// variables globales para admin posts
let currentPage = 1;
let isLoading = false;
let hasMorePosts = true;
const pageSize = 10;

document.addEventListener("DOMContentLoaded", async () => {
    console.log('admin posts - inicializando pagina');
    
    // cargar posts pendientes
    await loadPendingPosts();
    
    // configurar scroll infinito
    setupInfiniteScroll();
});

// configurar la pagina de admin
function setupAdminPage() {
    // mostrar loading inicial
    showLoadingSpinner();
}

// cargar posts pendientes
async function loadPendingPosts(page = 1) {
    if (isLoading) return;
    
    isLoading = true;
    showLoadingSpinner();
    
    try {
        const response = await fetch(`/pendingPosts?page=${page}&page_size=${pageSize}`);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`http error! status: ${response.status}`);
        }
        
        // verificar que la respuesta tenga contenido
        const text = await response.text();
        console.log('Response text length:', text.length);
        console.log('Response text preview:', text.substring(0, 200));
        
        if (!text || text.trim().length === 0) {
            throw new Error('Empty response from server');
        }
        
        const data = JSON.parse(text);
        console.log(`loaded ${data.posts?.length || 0} posts. total: ${data.total_records || 0}. has more: ${data.has_more || false}`);
        
        if (data.posts && data.posts.length > 0) {
            renderPosts(data.posts);
            currentPage = data.current_page;
            hasMorePosts = data.has_more;
        } else {
            hasMorePosts = false;
            if (currentPage === 1) {
                showEmptyState();
            }
        }
        
    } catch (error) {
        console.error('error loading pending posts:', error);
        showErrorMessage('error al cargar los posts pendientes');
    } finally {
        isLoading = false;
        hideLoadingSpinner();
    }
}

// renderizar posts en el dom
function renderPosts(posts) {
    const container = getPostsContainer();
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

// crear elemento html para un post
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'publication';
    postDiv.dataset.postId = post.postId;
    
    // procesar etiquetas de mundial y equipos
    const mundialTags = createMundialAndTeamTags(post);
    
    // procesar categorias
    const categoryTags = createCategoryTags(post);
    
    // procesar multimedia
    const multimediaHTML = createMultimediaHTML(post.multimedia);
    
    // procesar imagen del usuario
    console.log('Post data for user image:', {
        username: post.username,
        image: post.image,
        imageType: typeof post.image,
        imageLength: post.image?.length
    });
    const userImageSrc = getUserImageSrc(post.image);
    
    postDiv.innerHTML = `
        <div class="container-fluid noPadding">
            <div class="row w-100">
                <div class="col-1">
                    <img class="postUserPhoto img-fluid" src="${userImageSrc}">
                </div>
                <div class="col-7">
                    <p class="postUsername">@${escapeHtml(post.username)}</p>
                    <p class="postData"><i class="bi bi-clock"></i> ${formatDate(post.created_at)}</p>
                </div>
                <div class="col-4">
                    <div class="d-flex align-items-center justify-content-center">
                        <button type="button" class="noBorder noBackground adjustButton" onclick="approvePost(${post.postId})">
                            <i class="bi bi-check-square"></i>
                        </button>
                        <button type="button" class="noBorder noBackground adjustButton denied" onclick="rejectPost(${post.postId})">
                            <i class="bi bi-x-square"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <hr class="whiteGreyText">
        ${mundialTags}
        <h1 class="postTitle">${escapeHtml(post.title)}</h1>
        <p class="postDescription">${escapeHtml(post.content)}</p>
        <hr class="whiteGreyText noMargin">
        ${multimediaHTML}
        <div class="categoryContainer">
            ${categoryTags}
        </div>
    `;
    
    return postDiv;
}

// crear etiquetas de mundial y equipos (tipo tarjetas)
function createMundialAndTeamTags(post) {
    let tags = [];
    
    // mundial
    if (post.name && post.year) {
        tags.push(`<button onClick="location.href='/results'" class="posTickets">Mundial ${escapeHtml(post.name)} ${post.year}</button>`);
    }
    
    // equipos nacionales
    if (post.national_teams && post.national_teams.length > 0) {
        post.national_teams.forEach(team => {
            tags.push(`<button onClick="location.href='/results'" class="posTickets">${escapeHtml(team.country)}</button>`);
        });
    }
    
    return tags.join('\n        ');
}

// crear etiquetas de categorias (con #)
function createCategoryTags(post) {
    if (!post.categories || post.categories.length === 0) return '';
    
    return post.categories.map(cat => 
        `<button onClick="location.href='/results'" class="postTagButton">#${escapeHtml(cat.name)}</button>`
    ).join('\n            ');
}

// crear html para multimedia
function createMultimediaHTML(multimedia) {
    if (!multimedia || multimedia.length === 0) return '';
    
    const mediaItems = multimedia.map(media => {
        if (media.type === 'image') {
            const imageData = processImageData(media.image);
            
            if (!imageData) {
                console.warn('could not process image data for media:', media);
                return '';
            }
            
            return `            <div class="displayMediaImg">
                <img src="${imageData}" class="showImage">
                <i class="bi bi-zoom-in zoomIcon"></i>
            </div>`;
        } else if (media.type === 'video') {
            // videos tienen ruta de archivo - verificar si la ruta es correcta
            let videoSrc = media.path;
            
            // si la ruta no empieza con /, agregarla
            if (videoSrc && !videoSrc.startsWith('/')) {
                videoSrc = `/${media.path}`;
            }
            
            // console.log('video path:', videoSrc);
            
            return `            <div class="displayMediaVideo">
                <video src="${videoSrc}" class="showVideo" controls>
                <i class="bi bi-zoom-in"></i>
            </div>`;
        }
        return '';
    }).join('\n');
    
    return `        <div class="mediaContainer">
${mediaItems}
        </div>`;
}

// configurar scroll infinito
function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if (hasMorePosts && !isLoading) {
                loadPendingPosts(currentPage + 1);
            }
        }
    });
}



// obtener contenedor de posts
function getPostsContainer() {
    let container = document.getElementById('postsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'postsContainer';
        const main = document.querySelector('main.col-10');
        if (main) {
            main.appendChild(container);
        }
    }
    return container;
}

function showLoadingSpinner() {
    if (document.getElementById('loadingSpinner')) return;
    
    const container = getPostsContainer();
    const spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.className = 'd-flex justify-content-center my-4';
    spinner.innerHTML = `
        <div class="spinner-border text-light">
            <span class="visually-hidden">cargando...</span>
        </div>
    `;
    container.appendChild(spinner);
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.remove();
    }
}

function showEmptyState() {
    const container = getPostsContainer();
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-inbox display-1 text-muted"></i>
            <h3 class="aliceblueText mt-3">no hay posts pendientes</h3>
            <p class="whiteGreyText">todos los posts han sido revisados.</p>
        </div>
    `;
}

function showErrorMessage(message) {
    const container = getPostsContainer();
    container.innerHTML += `
        <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ${escapeHtml(message)}
        </div>
    `;
}

// funciones para aprobar/rechazar posts
async function approvePost(postId) {
    if (!confirm('¿estas seguro de que quieres aprobar este post?')) return;
    
    try {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            postElement.style.opacity = '0.5';
            postElement.style.pointerEvents = 'none';
        }
        
        const response = await fetch('/pendingPosts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: postId,
                approve: true
            })
        });
        
        const result = await response.json();
        
        if (result.exito) {
            // mostrar mensaje de exito
            if (postElement) {
                postElement.innerHTML = `
                    <div class="alert alert-success text-center py-4">
                        <i class="bi bi-check-circle-fill display-4"></i>
                        <h4 class="mt-3">Post aprobado exitosamente</h4>
                        <p>${escapeHtml(result.mensaje)}</p>
                    </div>
                `;
                
                // remover el elemento despues de 2 segundos
                setTimeout(() => {
                    postElement.remove();
                }, 2000);
            }
        } else {
            throw new Error(result.mensaje || 'Error al aprobar el post');
        }
        
    } catch (error) {
        console.error('error approving post:', error);
        alert('Error al aprobar el post: ' + error.message);
        
        // restaurar el elemento
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            postElement.style.opacity = '1';
            postElement.style.pointerEvents = 'auto';
        }
    }
}

async function rejectPost(postId) {
    const reason = prompt('¿por que rechazas este post? (opcional)');
    if (reason === null) return; // usuario canceló
    
    if (!confirm('¿estas seguro de que quieres rechazar este post?')) return;
    
    try {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            postElement.style.opacity = '0.5';
            postElement.style.pointerEvents = 'none';
        }
        
        const response = await fetch('/pendingPosts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: postId,
                approve: false
            })
        });
        
        const result = await response.json();
        
        if (result.exito) {
            // mostrar mensaje de rechazo
            if (postElement) {
                postElement.innerHTML = `
                    <div class="alert alert-danger text-center py-4">
                        <i class="bi bi-x-circle-fill display-4"></i>
                        <h4 class="mt-3">Post rechazado</h4>
                        <p>${escapeHtml(result.mensaje)}</p>
                        ${reason ? `<small>Razón: ${escapeHtml(reason)}</small>` : ''}
                    </div>
                `;
                
                // remover el elemento despues de 2 segundos
                setTimeout(() => {
                    postElement.remove();
                }, 2000);
            }
        } else {
            throw new Error(result.mensaje || 'Error al rechazar el post');
        }
        
    } catch (error) {
        console.error('error rejecting post:', error);
        alert('Error al rechazar el post: ' + error.message);
        
        // restaurar el elemento
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            postElement.style.opacity = '1';
            postElement.style.pointerEvents = 'auto';
        }
    }
}

// funciones de utilidad
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// procesar datos de imagen - basado en mundial.js
function processImageData(imageData) {
    try {
        // console.log('processing image data:', typeof imageData, imageData?.substring?.(0, 50) + '...');
        
        if (!imageData || typeof imageData !== 'string') {
            console.log('no valid image data provided');
            return null;
        }
        
        // si ya tiene prefijo data: usar directamente
        if (imageData.startsWith('data:')) {
            return imageData;
        }
        
        // si tiene formato "base64:typeXXX:" extraer solo la parte base64
        if (imageData.startsWith('base64:type')) {
            // encontrar el segundo ":"
            const secondColonIndex = imageData.indexOf(':', 7); // buscar despues de "base64:"
            if (secondColonIndex !== -1) {
                const base64Part = imageData.substring(secondColonIndex + 1);
                return `data:image/jpeg;base64,${base64Part}`;
            }
        }
        
        // si es base64 puro, agregar prefijo
        return `data:image/jpeg;base64,${imageData}`;
        
    } catch (error) {
        console.error('error processing image data:', error);
        return null;
    }
}

// procesar imagen del usuario
function getUserImageSrc(userImage) {
    try {
        console.log('getUserImageSrc called with:', {
            userImage: userImage,
            type: typeof userImage,
            length: userImage?.length,
            sample: userImage?.substring?.(0, 50)
        });
        
        // si no hay imagen del usuario, usar default
        if (!userImage) {
            return '/media/userPhoto.png';
        }
        
        // procesar imagen usando la misma lógica que las imágenes de posts
        const processedImage = processImageData(userImage);
        console.log('Processed user image result:', processedImage?.substring?.(0, 50));
        
        // si no se pudo procesar, usar default
        return processedImage || '/media/userPhoto.png';
        
    } catch (error) {
        console.error('error processing user image:', error);
        return '/media/userPhoto.png';
    }
}