/**
 * fetchPreviewPosts.js
 * Sistema modular para cargar y renderizar posts con paginación
 * Uso: cualquier página puede inicializar con PostsLoader
 */

class PostsLoader {
    constructor(config = {}) {
        this.containerId = config.containerId || 'container4Post';
        this.fetchUrl = config.fetchUrl || '/posts/search';
        this.fetchParams = config.fetchParams || { sort_by: 'newest' };
        this.pageSize = config.pageSize || 6;
        this.renderMode = config.renderMode || 'card'; // 'card' o 'preview'
        
        // estado de paginación
        this.currentPage = 1;
        this.isLoading = false;
        this.hasMorePosts = true;
        
        // callbacks opcionales
        this.onPostsLoaded = config.onPostsLoaded || null;
        this.onError = config.onError || null;
    }

    //////////
     // inicializar el cargador de posts
     ////////////////
    async init() {
        await this.loadPosts();
        if (this.renderMode === 'card') {
            this.setupInfiniteScroll();
        }
    }

    //////////
     // cargar posts desde el servidor
     ////////////////
    async loadPosts(append = false) {
        if (this.isLoading || (!this.hasMorePosts && append)) return;
        
        try {
            this.isLoading = true;
            if (append) this.showLoadingIndicator();
            
            // construir URL con parámetros
            const params = new URLSearchParams({
                ...this.fetchParams,
                page: this.currentPage,
                page_size: this.pageSize
            });
            
            const response = await fetch(`${this.fetchUrl}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.posts && data.posts.length > 0) {
                this.renderPosts(data.posts, append);
                
                // verificar si hay más posts
                this.hasMorePosts = data.posts.length === this.pageSize;
                
                if (this.hasMorePosts) {
                    this.currentPage++;
                }
                
                // callback opcional
                if (this.onPostsLoaded) {
                    this.onPostsLoaded(data.posts, append);
                }
            } else {
                if (!append) {
                    this.showEmptyState();
                }
                this.hasMorePosts = false;
            }
            
        } catch (error) {
            console.error('Error al cargar posts:', error);
            if (!append) {
                this.showErrorState();
            }
            
            // callback de error opcional
            if (this.onError) {
                this.onError(error);
            }
        } finally {
            this.isLoading = false;
            this.hideLoadingIndicator();
        }
    }

    //////////
    // formatear números (1000 -> 1K, 1000000 -> 1M)
    //////////
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    }

    //////////
     // renderizar posts en el contenedor
     ////////////////
    renderPosts(posts, append = false) {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        if (!append) {
            container.innerHTML = '';
        }
        
        posts.forEach(post => {
            if (this.renderMode === 'card') {
                container.appendChild(this.createPostCard(post));
            } else if (this.renderMode === 'preview') {
                container.appendChild(this.createPostPreview(post));
            }
        });
    }

    //////////
     // crear tarjeta de post (vista card)
     ////////////////
    createPostCard(post) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'd-flex';
        
        // obtener primer media
        const firstMedia = post.multimedia && post.multimedia.length > 0
            ? post.multimedia.find(m => m.type === 'image' || m.type === 'video')
            : null;
        
        const isVideo = firstMedia && firstMedia.type === 'video';
        let mediaUrl = '/media/userPhoto.png';
        
        if (firstMedia) {
            if (isVideo) {
                mediaUrl = firstMedia.path;
            } else if (firstMedia.image) {
                mediaUrl = `data:image/jpeg;base64,${firstMedia.image}`;
            }
        }
        
        const tags = post.categories || [];
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
                            <div class="col-7 over">
                                <a href="/profile" onclick="event.stopPropagation()"><p class="userCard">@${this.escapeHtml(post.username)}</p></a>
                            </div>
                            <div class="col-5 over">
                                <div class="d-flex calificationCard align-items-center justify-content-center">
                                    <div class="d-flex align-items-center">
                                        <a href="/postDisplay?id=${post.postId}" onclick="event.stopPropagation()"><i class="bi bi-chat-left-dots messageIcon"></i></a>
                                        <p class="cantUpvotes noMargin">${this.formatNumber(post.comments_count || 0)}</p>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-arrow-up-square-fill goodVoteIcon"></i>
                                        <p class="cantUpvotes noMargin">${this.formatNumber(post.upvotes || 0)}</p>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-arrow-down-square-fill badVoteIcon"></i>
                                        <p class="cantUpvotes noMargin">${this.formatNumber(post.downvotes || 0)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-12 over">
                                <a href="/postDisplay?id=${post.postId}" class="over">
                                    <h5 class="cardTitle over">${this.escapeHtml(post.title)}</h5>
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
                                        `<button type="button" onclick="event.stopPropagation(); location.href='/results'" class="ticketsCard">${this.escapeHtml(team.country)}</button>`
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
                                        `<button type="button" onclick="event.stopPropagation(); location.href='/results'" class="tags">#${this.escapeHtml(tag.name)}</button>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                    </div>` : ''}
                </div>
            </div>
        `;
        
        // agregar evento click a la tarjeta
        const card = cardContainer.querySelector('.card');
        if (card) {
            card.addEventListener('click', () => {
                window.location.href = `/postDisplay?id=${post.postId}`;
            });
        }
        
        // activar video hover
        const video = cardContainer.querySelector('video');
        if (video) {
            this.setupVideoHover(video);
        }
        
        return cardContainer;
    }

    //////////
    // crear preview de post (vista preview)
    //////////
    createPostPreview(post) {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'd-flex';
        
        // obtener primer media
        const firstMedia = post.multimedia && post.multimedia.length > 0
            ? post.multimedia.find(m => m.type === 'image' || m.type === 'video')
            : null;
        
        const isVideo = firstMedia && firstMedia.type === 'video';
        let mediaUrl = '/media/userPhoto.png';
        
        if (firstMedia) {
            if (isVideo) {
                mediaUrl = firstMedia.path;
            } else if (firstMedia.image) {
                mediaUrl = `data:image/jpeg;base64,${firstMedia.image}`;
            }
        }
        
        // formatear fecha
        const postDate = post.created_at ? new Date(post.created_at).toLocaleDateString('es-MX') : '';
        
        previewContainer.innerHTML = `
            <div class="previewPublication" style="cursor: pointer;" data-post-id="${post.postId}">
                <div class="d-flex align-items-center">
                    <a href="/profile" onclick="event.stopPropagation()"><img src="${post.userPhoto || '/media/userPhoto.png'}" class="userPhoto img-fluid" alt="User photo"></a>
                    <a href="/profile" onclick="event.stopPropagation()"><p class="username">@${this.escapeHtml(post.username)}</p></a>
                    <p class="username">| ${postDate}</p>
                </div>
                <div class="d-flex align-items-center">
                    <a href="/postDisplay?id=${post.postId}" class="noMargin noPadding"><p class="previewTitle">${this.escapeHtml(post.title)}</p></a>
                    ${isVideo
                        ? `<video src="${mediaUrl}" class="previewPhoto" muted loop></video>`
                        : `<img src="${mediaUrl}" class="previewPhoto img-fluid" alt="Post media" onerror="this.src='/media/userPhoto.png'">`
                    }
                </div>
                <div class="d-flex addGap10x addPading0x5x">
                    <div class="d-flex align-items-center">
                        <a href="/postDisplay?id=${post.postId}" onclick="event.stopPropagation()"><i class="bi bi-chat-left-dots messageIcon"></i></a>
                        <p class="cantUpvotes noMargin">${this.formatNumber(post.comments_count || 0)}</p>
                    </div>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-arrow-up-square-fill goodVoteIcon"></i>
                        <p class="cantUpvotes noMargin">${this.formatNumber(post.upvotes || 0)}</p>
                    </div>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-arrow-down-square-fill badVoteIcon"></i>
                        <p class="cantUpvotes noMargin">${this.formatNumber(post.downvotes || 0)}</p>
                    </div>
                </div>
            </div>
        `;
        
        // agregar evento click al preview completo
        const preview = previewContainer.querySelector('.previewPublication');
        if (preview) {
            preview.addEventListener('click', () => {
                window.location.href = `/postDisplay?id=${post.postId}`;
            });
        }
        
        return previewContainer;
    }

    //////////
    // configurar hover para videos
    //////////
    setupVideoHover(video) {
        video.addEventListener('mouseenter', () => {
            video.play().catch(err => console.log('Error playing video:', err));
        });
        
        video.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    }

    // configurar scroll infinito
    //////////
    setupInfiniteScroll() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (this.shouldLoadMore()) {
                    this.loadPosts(true);
                }
            }, 200);
        });
    }

    //////////
     // verificar si debe cargar más posts
     //////////
    shouldLoadMore() {
        if (this.isLoading || !this.hasMorePosts) return false;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        return (scrollTop + windowHeight) >= (documentHeight - 300);
    }

    //////////
     // mostrar indicador de carga
     //////////
    showLoadingIndicator() {
        const container = document.getElementById(this.containerId);
        if (!container || document.getElementById('loadingIndicator')) return;
        
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

    //////////
     // Ocultar indicador de carga
     //////////
    hideLoadingIndicator() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) indicator.remove();
    }

    //////////
     // Mostrar estado vacío
     //////////
    showEmptyState() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox display-1 text-muted"></i>
                <h3 class="aliceblueText mt-3">No hay publicaciones disponibles</h3>
                <p class="whiteGreyText">Sé el primero en publicar algo</p>
            </div>
        `;
    }

    //////////
     // Mostrar estado de error
     //////////
    showErrorState() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
                <h3 class="aliceblueText mt-3">Error al cargar publicaciones</h3>
                <p class="whiteGreyText">Por favor, intenta nuevamente más tarde</p>
            </div>
        `;
    }

    //////////
     // Escapar HTML para prevenir XSS
     //////////
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    //////////
     // resetear el loader ( para aplicar nuevos filtros)
     //////////
    reset() {
        this.currentPage = 1;
        this.hasMorePosts = true;
        this.isLoading = false;
        const container = document.getElementById(this.containerId);
        if (container) container.innerHTML = '';
    }

    //////////
     // actualizar parámetros de búsqueda y recargar
     //////////
    updateSearch(newParams) {
        this.fetchParams = { ...this.fetchParams, ...newParams };
        this.reset();
        this.loadPosts();
    }
}