document.addEventListener("DOMContentLoaded", async () => {
    const postId = getPostIdFromURL();
    
    if (!postId) {
        showErrorState('No se especificó un ID de publicación');
        return;
    }
    
    await loadPost(postId);
});

// obtener el ID del post desde la URL
function getPostIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// cargar datos del post
async function loadPost(postId) {
    try {
        showLoadingSpinner();
        
        const response = await fetch(`/posts/${postId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                showErrorState('Publicación no encontrada');
            } else {
                showErrorState('Error al cargar la publicación');
            }
            return;
        }
        
        const post = await response.json();
        
        // primero restaurar el HTML completo, luego renderizar
        restorePostHTML();
        renderPost(post);
        
    } catch (error) {
        console.error('Error loading post:', error);
        showErrorState('Error al cargar la publicación');
    }
}

// restaurar estructura HTML del post
function restorePostHTML() {
    const publication = document.getElementById('publication');
    publication.innerHTML = `
        <div class="container-fluid noPadding">
            <div class="row w-100">
                <div class="col-1 col-sm-2">
                    <img id="postUserPhoto" class="postUserPhoto img-fluid" src="/media/userPhoto.png">
                </div>
                <div class="col-4 col-sm-7">
                    <p id="postUsername" class="postUsername img-fluid">@usuario</p>
                    <p id="datePosted" class="postData"><i class="bi bi-clock"></i> --/--/--</p>
                    <p id="dateEdited" class="postData"><i class="bi bi-pencil-square"></i> --/--/--</p>
                </div>
                <div class="col-7 col-sm-3">
                    <div class="d-flex align-items-center justify-content-center">
                        <div id="goodVoteButton" class="d-flex showCalif">
                            <button class="noBackground noBorder transparentButton"><i class="bi bi-arrow-up-square m-1 goodVoteIcon"></i></button> 
                            <p id="goodVote" class="syncopate-regular m-2">0</p>
                        </div>
                        <div class="d-flex showCalif">
                            <button id="badVoteButton" class="noBackground noBorder transparentButton"><i class="bi bi-arrow-down-square m-1 badVoteIcon"></i></button>
                            <p id="badVote" class="syncopate-regular m-2">0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <hr class="whiteGreyText m-1">
        <h1 id="postTitle" class="postTitle">Cargando...</h1>
        <p id="postDescription" class="postDescription">Cargando contenido...</p>
        <hr class="whiteGreyText noMargin">
        <div id="mediaContainer" class="mediaContainer"></div>
        <div class="row">
            <div class="col-10">
                <div id="categoryContainer" class="categoryContainer"></div>
            </div>
            <div class="col-2">
                <div class="d-flex align-items-center justify-content-center">
                    <button id="sharePost" class="noBackground noBorder transparentButton margin7x"><i class="bi bi-share postOptions"></i></button>
                    <button id="editPost" onclick="location.href='/newPost'" class="noBackground noBorder transparentButton margin7x" style="display: none;"><i class="bi bi-pencil-square postOptions"></i></button>
                    <button id="deletePost" class="noBackground noBorder transparentButton margin7x" style="display: none;"><i class="bi bi-trash postOptions"></i></button>
                </div>
            </div>
        </div>
    `;
}

// renderizar el post en la página
function renderPost(post) {
    // información del usuario
    renderUserInfo(post);
    
    // información del mundial y equipos
    renderWorldCupAndTeams(post);
    
    // título y descripción
    const titleElement = document.getElementById('postTitle');
    const descriptionElement = document.getElementById('postDescription');
    
    if (titleElement) {
        titleElement.textContent = post.title || 'Sin título';
    }
    
    if (descriptionElement) {
        descriptionElement.textContent = post.content || 'Sin contenido';
    }
    
    // multimedia
    renderMultimedia(post.multimedia || []);
    
    // categorías
    renderCategories(post.categories || []);
}

// renderizar información del usuario
function renderUserInfo(post) {
    const username = post.username || 'Anónimo';
    const userImage = post.image 
        ? `data:image/jpeg;base64,${post.image}`
        : '/media/userPhoto.png';
    
    const userPhotoElement = document.getElementById('postUserPhoto');
    const usernameElement = document.getElementById('postUsername');
    const datePostedElement = document.getElementById('datePosted');
    const dateEditedElement = document.getElementById('dateEdited');
    
    if (userPhotoElement) {
        userPhotoElement.src = userImage;
    }
    
    if (usernameElement) {
        usernameElement.textContent = `@${username}`;
    }
    
    // fechas
    if (datePostedElement && post.created_at) {
        const createdDate = formatDate(post.created_at);
        datePostedElement.innerHTML = `<i class="bi bi-clock"></i> ${createdDate}`;
    }
    
    if (dateEditedElement && post.modified_at) {
        const modifiedDate = formatDate(post.modified_at);
        dateEditedElement.innerHTML = `<i class="bi bi-pencil-square"></i> ${modifiedDate}`;
    }
}

// renderizar mundial y equipos nacionales
function renderWorldCupAndTeams(post) {
    // buscar el contenedor donde están los botones
    const hr = document.querySelector('#publication hr.whiteGreyText.m-1');
    if (!hr) return;
    
    // eliminar botones existentes de mundial y selecciones
    let nextElement = hr.nextElementSibling;
    while (nextElement && (nextElement.id === 'mundialPost' || nextElement.id === 'selectionPost' || nextElement.classList.contains('selectionPost'))) {
        const toRemove = nextElement;
        nextElement = nextElement.nextElementSibling;
        toRemove.remove();
    }
    
    // agregar año del mundial si existe
    if (post.year) {
        const mundialButton = document.createElement('button');
        mundialButton.id = 'mundialPost';
        mundialButton.className = 'posTickets';
        mundialButton.textContent = post.year;
        mundialButton.onclick = () => location.href = '/results';
        hr.insertAdjacentElement('afterend', mundialButton);
    }
    
    // agregar todas las selecciones nacionales
    if (post.national_teams && post.national_teams.length > 0) {
        const lastButton = post.year ? document.getElementById('mundialPost') : hr;
        
        post.national_teams.forEach((team, index) => {
            const selectionButton = document.createElement('button');
            selectionButton.className = 'posTickets selectionPost';
            if (index === 0 && !post.year) {
                selectionButton.id = 'selectionPost';
            }
            selectionButton.textContent = `Selección ${team.country}`;
            selectionButton.onclick = () => location.href = '/results';
            
            if (lastButton === hr) {
                hr.insertAdjacentElement('afterend', selectionButton);
            } else {
                const previousButton = document.querySelector('.posTickets:last-of-type') || lastButton;
                previousButton.insertAdjacentElement('afterend', selectionButton);
            }
        });
    }
}

// renderizar multimedia
function renderMultimedia(multimedia) {
    const container = document.getElementById('mediaContainer');
    container.innerHTML = '';
    
    if (!multimedia || multimedia.length === 0) {
        return;
    }
    
    multimedia.forEach(media => {
        if (media.type === 'video' && media.path) {
            const videoDiv = document.createElement('div');
            videoDiv.className = 'displaySmallMediaVideo';
            videoDiv.innerHTML = `
                <video src="${media.path}" class="showVideo" controls></video>
            `;
            container.appendChild(videoDiv);
        } else if (media.type === 'image' && media.image) {
            const imgDiv = document.createElement('div');
            imgDiv.className = 'displaySmallMediaVideo';
            imgDiv.innerHTML = `
                <img src="data:image/jpeg;base64,${media.image}" class="showImage" alt="Post image">
                <i class="bi bi-zoom-in zoomIcon"></i>
            `;
            container.appendChild(imgDiv);
        }
    });
}

// renderizar categorías
function renderCategories(categories) {
    const container = document.getElementById('categoryContainer');
    container.innerHTML = '';
    
    if (!categories || categories.length === 0) {
        return;
    }
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'postTagButton';
        button.textContent = `#${category.name}`;
        button.onclick = () => location.href = '/results';
        container.appendChild(button);
    });
}

// formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// mostrar spinner de carga
function showLoadingSpinner() {
    const publication = document.getElementById('publication');
    publication.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Cargando publicación...</span>
            </div>
        </div>
    `;
}

// ocultar spinner de carga
function hideLoadingSpinner() {
    // el spinner se reemplaza cuando se carga el contenido
}

// mostrar estado de error
function showErrorState(message) {
    const publication = document.getElementById('publication');
    publication.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
            <h3 class="aliceblueText mt-3">${message}</h3>
            <button onclick="location.href='/'" class="btn btn-primary mt-3">
                <i class="bi bi-house-door"></i> Volver al inicio
            </button>
        </div>
    `;
}

// función global para navegar a postDisplay con ID
window.goToPost = function(postId) {
    if (postId) {
        window.location.href = `/postDisplay?id=${postId}`;
    }
};
