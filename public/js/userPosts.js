/**
 * Cargar posts del usuario actual
 */
async function loadUserPosts() {
    const container = document.getElementById('container4Post');
    if (!container) return;
    
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (!userData || !userData.id) {
        container.innerHTML = '<p class="text-center text-muted mt-5">No se pudo cargar el perfil del usuario</p>';
        return;
    }
    
    // Mostrar loading
    container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
    
    try {
        const response = await fetch(`/users/${userData.id}/posts?user_id=${userData.id}&page=1&page_size=50`);
        
        if (!response.ok) {
            throw new Error('Error al cargar posts del usuario');
        }
        
        const data = await response.json();
        
        if (!data.posts || data.posts.length === 0) {
            container.innerHTML = '<p class="text-center text-muted mt-5">Aún no tienes publicaciones</p>';
            return;
        }
        
        // Limpiar container
        container.innerHTML = '';
        
        // Usar PostsLoader para renderizar
        if (typeof PostsLoader !== 'undefined') {
            const loader = new PostsLoader();
            
            // Procesar cada post para agregar userPhoto
            data.posts.forEach(post => {
                // Agregar foto del usuario en base64 si existe
                if (post.image) {
                    post.userPhoto = `data:image/jpeg;base64,${post.image}`;
                } else {
                    post.userPhoto = '/media/userPhoto.png';
                }
                
                const postCard = loader.createPostCard(post);
                container.appendChild(postCard);
            });
        } else {
            console.error('PostsLoader no está disponible');
            // Fallback simple
            data.posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'card mb-3';
                postDiv.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${post.title}</h5>
                        <p class="card-text">${post.content ? post.content.substring(0, 100) + '...' : ''}</p>
                        <a href="/postDisplay?id=${post.postId}" class="btn btn-primary">Ver post</a>
                    </div>
                `;
                container.appendChild(postDiv);
            });
        }
    } catch (error) {
        console.error('Error al cargar posts del usuario:', error);
        container.innerHTML = '<p class="text-center text-danger mt-5">Error al cargar tus publicaciones</p>';
    }
}
