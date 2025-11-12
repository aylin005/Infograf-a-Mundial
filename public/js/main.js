// Funciones globales para manejo de navBar y actualización de foto de usuario

document.addEventListener("DOMContentLoaded", function() {
  // Actualizar foto del usuario en el navBar al cargar la página
  updateNavBarUserPhoto();
  
  // Observer para detectar cuando se carga el navBar dinámicamente
  setupNavBarPhotoObserver();
  
  // Listener para actualizaciones de datos de usuario
  window.addEventListener('userDataUpdated', (event) => {
    console.log('User data updated event received, updating navbar photo');
    updateNavBarUserPhoto();
  });
});

// Función global para actualizar la foto del usuario en el navBar
function updateNavBarUserPhoto() {
  try {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const navPhoto = document.getElementById('photoUser');
    
    console.log('UpdateNavBarUserPhoto called');
    console.log('NavPhoto element found:', !!navPhoto);
    console.log('User has image:', !!userData.image);
    
    if (navPhoto) {
      let userImage = userData.image;
      
      // Si no hay imagen en userData, buscar en storage temporal
      if (!userImage) {
        userImage = sessionStorage.getItem('user_image_temp');
        console.log('Checking temp image storage:', !!userImage);
      }
      
      if (userImage && (userImage.startsWith('data:') || userImage.startsWith('http'))) {
        navPhoto.src = userImage;
        console.log('NavBar photo updated successfully with user image');
      } else {
        console.log('User has no image or invalid format, keeping default');
      }
    } else {
      console.log('NavPhoto element not found - navBar might not be loaded yet');
      // Reintentar después de un breve delay
      setTimeout(updateNavBarUserPhoto, 100);
    }
  } catch (error) {
    console.error('Error updating navbar photo:', error);
  }
}

// Función para observar cambios en el DOM y actualizar la foto cuando aparezca el navBar
function setupNavBarPhotoObserver() {
  // Intentar encontrar el contenedor del navBar
  const navBarContainer = document.getElementById('navBar-container');
  
  if (navBarContainer) {
    // Crear un observer para detectar cambios en el navBar
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Verificar si se agregó el elemento photoUser
          const navPhoto = document.getElementById('photoUser');
          if (navPhoto) {
            console.log('NavBar photoUser element detected via observer');
            updateNavBarUserPhoto();
          }
        }
      });
    });
    
    // Observar cambios en el contenedor del navBar
    observer.observe(navBarContainer, {
      childList: true,
      subtree: true
    });
    
    console.log('NavBar photo observer setup complete');
  } else {
    console.log('NavBar container not found for observer');
  }
}
