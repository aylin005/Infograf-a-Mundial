/**
 * Sistema para mostrar usuarios que votaron en un post
 */

let currentPostIdForVotes = null;

/**
 * Abrir modal de votos para un post específico
 */
async function openVotesModal(postId, voteType = 'upvote') {
    currentPostIdForVotes = postId;
    
    const overlay = document.querySelector('.overlay');
    if (!overlay) {
        console.error('Modal overlay no encontrado');
        return;
    }
    
    // Mostrar modal
    overlay.style.display = 'block';
    
    // Activar el tab correcto
    setTimeout(() => {
        if (voteType === 'downvote') {
            const downvotesTab = document.querySelector('a[href="#downVotesContainer"]');
            if (downvotesTab && typeof bootstrap !== 'undefined' && bootstrap.Tab) {
                const tab = new bootstrap.Tab(downvotesTab);
                tab.show();
            }
        } else {
            const upvotesTab = document.querySelector('a[href="#upvotesContainer"]');
            if (upvotesTab && typeof bootstrap !== 'undefined' && bootstrap.Tab) {
                const tab = new bootstrap.Tab(upvotesTab);
                tab.show();
            }
        }
    }, 50);
    
    // Cargar usuarios
    await loadVoteUsers(postId);
}

/**
 * Cerrar modal de votos
 */
function closeVotesModal() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    currentPostIdForVotes = null;
}

/**
 * Cargar usuarios que votaron
 */
async function loadVoteUsers(postId) {
    const upvotesContainer = document.getElementById('upvotesListContainer');
    const downvotesContainer = document.getElementById('downvotesListContainer');
    const upVoteCount = document.getElementById('upVote');
    const downVoteCount = document.getElementById('downVote');
    
    if (!upvotesContainer || !downvotesContainer) {
        console.error('Contenedores de votos no encontrados');
        return;
    }
    
    // Mostrar loading
    upvotesContainer.innerHTML = '<div class="text-center p-3"><div class="spinner-border spinner-border-sm" role="status"></div></div>';
    downvotesContainer.innerHTML = '<div class="text-center p-3"><div class="spinner-border spinner-border-sm" role="status"></div></div>';
    
    try {
        const response = await fetch(`/posts/${postId}/vote-users`);
        
        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }
        
        const data = await response.json();
        
        // Actualizar contadores
        if (upVoteCount) {
            upVoteCount.textContent = formatNumber(data.upvotes.length);
        }
        if (downVoteCount) {
            downVoteCount.textContent = formatNumber(data.downvotes.length);
        }
        
        // Renderizar upvotes
        if (data.upvotes.length === 0) {
            upvotesContainer.innerHTML = '<p class="text-center text-muted p-3">No hay usuarios que hayan dado upvote</p>';
        } else {
            upvotesContainer.innerHTML = '';
            data.upvotes.forEach(user => {
                upvotesContainer.appendChild(createUserItem(user));
            });
        }
        
        // Renderizar downvotes
        if (data.downvotes.length === 0) {
            downvotesContainer.innerHTML = '<p class="text-center text-muted p-3">No hay usuarios que hayan dado downvote</p>';
        } else {
            downvotesContainer.innerHTML = '';
            data.downvotes.forEach(user => {
                downvotesContainer.appendChild(createUserItem(user));
            });
        }
        
    } catch (error) {
        console.error('Error al cargar usuarios de votos:', error);
        upvotesContainer.innerHTML = '<p class="text-center text-danger p-3">Error al cargar usuarios</p>';
        downvotesContainer.innerHTML = '<p class="text-center text-danger p-3">Error al cargar usuarios</p>';
    }
}

/**
 * Crear elemento de usuario
 */
function createUserItem(user) {
    const userDiv = document.createElement('a');
    userDiv.href = '/profile';
    userDiv.onclick = (e) => {
        e.stopPropagation();
        closeVotesModal();
    };
    
    const userPhoto = user.image 
        ? `data:image/jpeg;base64,${user.image}`
        : '/media/userPhoto.png';
    
    userDiv.innerHTML = `
        <div class="d-flex align-items-center p-3 hover-highlight">
            <img class="navPhoto img-fluid m-0" src="${userPhoto}" alt="Foto de usuario" onerror="this.src='/media/userPhoto.png'">
            <p class="my-0 mx-2">@${escapeHtml(user.username)}</p>
        </div>
    `;
    
    return userDiv;
}

/**
 * Formatear números
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Escapar HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal
    const closeButton = document.getElementById('closeModal');
    if (closeButton) {
        closeButton.addEventListener('click', closeVotesModal);
    }
    
    // Cerrar al hacer click fuera del modal
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeVotesModal();
            }
        });
    }
});

// Exportar funciones para uso externo
window.openVotesModal = openVotesModal;
window.closeVotesModal = closeVotesModal;
