document.addEventListener("DOMContentLoaded", async () => {
    const postId = getPostIdFromURL();
    
    if (!postId) {
        showErrorState('No se especificó un ID de publicación');
        return;
    }
    
    await loadPost(postId);
    await loadComments(postId);
    await loadUserVote(postId);
    setupCommentForm(postId);
    setupVoteButtons(postId);
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
    
    // actualizar contadores de votos
    updateVoteCounts(post.upvotes || 0, post.downvotes || 0);
    
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

// ============================================================
// FUNCIONES DE COMENTARIOS
// ============================================================

// cargar comentarios del post
async function loadComments(postId) {
    try {
        console.log('Cargando comentarios para post:', postId);
        const response = await fetch(`/posts/comments?post_id=${postId}`);
        
        if (!response.ok) {
            console.error('Error loading comments:', response.status);
            showCommentsError('Error al cargar comentarios');
            return;
        }
        
        const data = await response.json();
        console.log('Datos de comentarios recibidos:', data);
        
        if (data.success && data.comments) {
            console.log('Renderizando', data.comments.length, 'comentarios');
            renderComments(data.comments);
        } else {
            console.log('No hay comentarios o success=false');
            renderComments([]);
        }
        
    } catch (error) {
        console.error('Error loading comments:', error);
        showCommentsError('Error al cargar comentarios');
    }
}

// renderizar comentarios en el DOM
function renderComments(comments) {
    const container = document.getElementById('commentsContainer');
    
    if (!comments || comments.length === 0) {
        container.innerHTML = '<p class="text-center whiteGreyText py-3">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        container.appendChild(commentElement);
    });
}

// crear elemento HTML de un comentario
function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comments quitMarginBottom';
    commentDiv.dataset.commentId = comment.id;
    
    const userImage = comment.user_image 
        ? `data:image/jpeg;base64,${comment.user_image}`
        : '/media/userPhoto.png';
    
    const formattedDate = formatDate(comment.created_at);
    
    commentDiv.innerHTML = `
        <div class="container-fluid noPadding">
            <div class="row w-100">
                <div class="col-1">
                    <img class="commentUserPhoto img-fluid" src="${userImage}" alt="User photo">
                </div>
                <div class="col-9">
                    <p class="commentUsername">@${comment.username}</p>
                    <p class="commentData"><i class="bi bi-clock"></i> ${formattedDate}</p>
                </div>
                <div class="col-2">
                    <div class="d-flex align-items-center justify-content-center">
                        <button class="noBackground transparentButton margin7xLnR noBorder likeCommentBtn" data-comment-id="${comment.id}">
                            <i class="bi bi-hand-thumbs-up postOptions"></i>
                        </button>
                        <p class="my-auto p-0 small whiteGreyText likeCount">${comment.likes || 0}</p>
                    </div>
                </div>
            </div>
            <hr class="whiteGreyText m-1">
            <p class="commentDescription">${escapeHtml(comment.content)}</p>
            <hr class="whiteGreyText noMargin">
            <div class="row">
                <div class="col-11">
                    <button class="noBackground noBorder transparentButton" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-littleTooltip" title="Reportar"><i class="bi bi-flag postOptions"></i></button>
                </div>
                <div class="col-1">
                    <div class="d-flex align-items-center justify-content-center">
                        <button class="noBackground noBorder transparentButton margin7xLnR deleteCommentBtn" data-comment-id="${comment.id}" data-user-id="${comment.user_id}" style="display: none;"><i class="bi bi-trash postOptions"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // configurar like button
    const likeBtn = commentDiv.querySelector('.likeCommentBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', () => handleCommentLike(comment.id, commentDiv));
    }
    
    // cargar estado del like del usuario
    loadUserCommentLike(comment.id, commentDiv);
    
    // mostrar botón de eliminar solo si es el autor del comentario
    checkCommentOwnership(commentDiv, comment.user_id);
    
    return commentDiv;
}

// verificar si el usuario actual es dueño del comentario
async function checkCommentOwnership(commentElement, commentUserId) {
    try {
        // obtener info del usuario actual desde la sesión
        const response = await fetch('/users/current');
        if (response.ok) {
            const data = await response.json();
            
            // mostrar botón si es admin o si es el autor del comentario
            if (data.authenticated && (data.is_admin || (data.user_id && data.user_id === commentUserId))) {
                const deleteBtn = commentElement.querySelector('.deleteCommentBtn');
                if (deleteBtn) {
                    deleteBtn.style.display = 'block';
                    deleteBtn.addEventListener('click', () => handleDeleteComment(commentElement.dataset.commentId));
                }
            }
        }
    } catch (error) {
        console.log('No se pudo verificar propiedad del comentario');
    }
}

// configurar formulario de comentarios
function setupCommentForm(postId) {
    const form = document.getElementById('addCommentForm');
    const textarea = document.getElementById('commentSomething');
    
    if (!form || !textarea) {
        console.error('Form or textarea not found');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const content = textarea.value.trim();
        
        if (!content) {
            alert('Por favor escribe un comentario');
            return;
        }
        
        if (content.length > 1000) {
            alert('El comentario es demasiado largo (máximo 1000 caracteres)');
            return;
        }
        
        await submitComment(postId, content);
    });
}

// enviar comentario al servidor
async function submitComment(postId, content) {
    try {
        const response = await fetch('/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post_id: parseInt(postId),
                content: content
            })
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
            // usuario no autenticado, redirigir a login
            if (confirm('Debes iniciar sesión para comentar. ¿Deseas ir a la página de inicio de sesión?')) {
                window.location.href = '/login';
            }
            return;
        }
        
        if (!response.ok) {
            alert(data.message || 'Error al publicar comentario');
            return;
        }
        
        // limpiar textarea
        document.getElementById('commentSomething').value = '';
        
        // recargar comentarios
        await loadComments(postId);
        
        // scroll al final de los comentarios
        const commentsContainer = document.getElementById('commentsContainer');
        if (commentsContainer) {
            commentsContainer.scrollTop = commentsContainer.scrollHeight;
        }
        
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Error al publicar comentario. Por favor intenta de nuevo.');
    }
}

// eliminar comentario
async function handleDeleteComment(commentId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
        return;
    }
    
    try {
        const response = await fetch(`/comments/${commentId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            alert(data.message || 'Error al eliminar comentario');
            return;
        }
        
        // eliminar del DOM
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (commentElement) {
            commentElement.remove();
        }
        
        // si no quedan comentarios, mostrar mensaje
        const container = document.getElementById('commentsContainer');
        if (container && container.children.length === 0) {
            container.innerHTML = '<p class="text-center whiteGreyText py-3">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
        }
        
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Error al eliminar comentario. Por favor intenta de nuevo.');
    }
}

// mostrar error en la sección de comentarios
function showCommentsError(message) {
    const container = document.getElementById('commentsContainer');
    container.innerHTML = `<p class="text-center text-warning py-3">${message}</p>`;
}

// escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== FUNCIONALIDAD DE VOTOS ====================

// configurar botones de voto
function setupVoteButtons(postId) {
    const upvoteBtn = document.querySelector('#goodVoteButton button');
    const downvoteBtn = document.querySelector('#badVoteButton');
    
    if (upvoteBtn) {
        upvoteBtn.addEventListener('click', () => handleVote(postId, 'upvote'));
    }
    
    if (downvoteBtn) {
        downvoteBtn.addEventListener('click', () => handleVote(postId, 'downvote'));
    }
}

// cargar voto actual del usuario
async function loadUserVote(postId) {
    try {
        const response = await fetch(`/posts/${postId}/user-vote`);
        if (response.ok) {
            const data = await response.json();
            // siempre actualizar el estado, incluso si es null (sin voto)
            updateVoteButtonState(data.vote);
        }
    } catch (error) {
        console.log('No se pudo cargar el voto del usuario');
    }
}

// manejar voto (upvote o downvote)
async function handleVote(postId, voteType) {
    try {
        const response = await fetch('/posts/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post_id: parseInt(postId),
                vote_type: voteType
            })
        });
        
        if (response.status === 401) {
            if (confirm('Debes iniciar sesión para votar. ¿Deseas ir a la página de inicio de sesión?')) {
                window.location.href = '/login';
            }
            return;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            alert(data.message || 'Error al registrar voto');
            return;
        }
        
        // actualizar contadores sin recargar todo
        await updatePostVoteCounts(postId);
        await loadUserVote(postId);
        
    } catch (error) {
        console.error('Error voting:', error);
        alert('Error al registrar voto. Por favor intenta de nuevo.');
    }
}

// actualizar solo los contadores de votos desde el servidor
async function updatePostVoteCounts(postId) {
    try {
        const response = await fetch(`/posts/${postId}`);
        if (response.ok) {
            const post = await response.json();
            updateVoteCounts(post.upvotes || 0, post.downvotes || 0);
        }
    } catch (error) {
        console.log('No se pudieron actualizar los contadores');
    }
}

// actualizar estado visual de los botones de voto
function updateVoteButtonState(currentVote) {
    const upvoteBtn = document.querySelector('#goodVoteButton button');
    const downvoteBtn = document.querySelector('#badVoteButton');
    const upvoteIcon = upvoteBtn?.querySelector('i');
    const downvoteIcon = downvoteBtn?.querySelector('i');
    
    // resetear estados
    if (upvoteIcon) {
        upvoteIcon.classList.remove('bi-arrow-up-square-fill');
        upvoteIcon.classList.add('bi-arrow-up-square');
    }
    if (downvoteIcon) {
        downvoteIcon.classList.remove('bi-arrow-down-square-fill');
        downvoteIcon.classList.add('bi-arrow-down-square');
    }
    
    // aplicar estado activo
    if (currentVote === 'upvote' && upvoteIcon) {
        upvoteIcon.classList.remove('bi-arrow-up-square');
        upvoteIcon.classList.add('bi-arrow-up-square-fill');
    } else if (currentVote === 'downvote' && downvoteIcon) {
        downvoteIcon.classList.remove('bi-arrow-down-square');
        downvoteIcon.classList.add('bi-arrow-down-square-fill');
    }
}

// actualizar contadores de votos
function updateVoteCounts(upvotes, downvotes) {
    const upvoteCount = document.getElementById('goodVote');
    const downvoteCount = document.getElementById('badVote');
    
    if (upvoteCount) {
        upvoteCount.textContent = upvotes;
    }
    if (downvoteCount) {
        downvoteCount.textContent = downvotes;
    }
}

// ==================== FUNCIONALIDAD DE LIKES EN COMENTARIOS ====================

// manejar like en comentario
async function handleCommentLike(commentId, commentElement) {
    try {
        const response = await fetch('/comments/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                comment_id: parseInt(commentId)
            })
        });
        
        if (response.status === 401) {
            if (confirm('Debes iniciar sesión para dar like. ¿Deseas ir a la página de inicio de sesión?')) {
                window.location.href = '/login';
            }
            return;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            alert(data.message || 'Error al dar like');
            return;
        }
        
        // actualizar contador y estado visual
        const likeCountElement = commentElement.querySelector('.likeCount');
        const likeBtn = commentElement.querySelector('.likeCommentBtn i');
        
        if (data.likes !== undefined && likeCountElement) {
            likeCountElement.textContent = data.likes;
        }
        
        // toggle icono filled/unfilled
        if (likeBtn) {
            if (likeBtn.classList.contains('bi-hand-thumbs-up-fill')) {
                likeBtn.classList.remove('bi-hand-thumbs-up-fill');
                likeBtn.classList.add('bi-hand-thumbs-up');
            } else {
                likeBtn.classList.remove('bi-hand-thumbs-up');
                likeBtn.classList.add('bi-hand-thumbs-up-fill');
            }
        }
        
    } catch (error) {
        console.error('Error liking comment:', error);
        alert('Error al dar like. Por favor intenta de nuevo.');
    }
}

// cargar estado del like del usuario para un comentario
async function loadUserCommentLike(commentId, commentElement) {
    try {
        const response = await fetch(`/comments/${commentId}/user-like`);
        if (response.ok) {
            const data = await response.json();
            const likeBtn = commentElement.querySelector('.likeCommentBtn i');
            
            if (data.hasLiked && likeBtn) {
                likeBtn.classList.remove('bi-hand-thumbs-up');
                likeBtn.classList.add('bi-hand-thumbs-up-fill');
            }
        }
    } catch (error) {
        console.log('No se pudo cargar el estado del like');
    }
}
