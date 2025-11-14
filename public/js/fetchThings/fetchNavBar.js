document.addEventListener("DOMContentLoaded", () => {
  fetch("/modular/navBar")
    .then(response => response.text())
    .then(html => {
      document.getElementById("navBar-container").innerHTML = html;

      // Esperar a que el DOM se actualice con el nuevo HTML
      setTimeout(() => {
        // Actualizar foto del usuario en el navBar recién cargado
        console.log('NavBar loaded, updating user photo...');
        if (typeof updateNavBarUserPhoto === 'function') {
          updateNavBarUserPhoto();
        } else {
          console.log('updateNavBarUserPhoto function not available, calling directly');
          // Función local como fallback
          try {
            const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
            const navPhoto = document.getElementById('photoUser');
            if (navPhoto && userData.image && (userData.image.startsWith('data:') || userData.image.startsWith('http'))) {
              navPhoto.src = userData.image;
              console.log('NavBar photo updated via fallback function');
            }
          } catch (error) {
            console.error('Error in fallback photo update:', error);
          }
        }
        
        const advSearch = document.getElementById("advSearchIcon");
        const main = document.getElementById("main");

        if (advSearch) 
        {
          advSearch.addEventListener("click", () => 
          {
              fetch("/modular/filters")
              .then(response => response.text())
              .then(html => {
                const container = document.getElementById("filterContainer");
                if (container) {
                  container.innerHTML = html;
                  const filterMenu = document.querySelector(".overlay");
                  if (filterMenu) 
                  {
                    main?.classList.add("blurBackground");
                    filterMenu.style.display = "block";
                    filterMenu.style.opacity = "1";
                    document.body.style.overflow = "hidden";
                  }
                  
                  // inicializar filtros dinámicos
                  if (window.initializeFilters) {
                    window.initializeFilters();
                  }

                  const closeModal = document.getElementById("closeModal");
                  if (closeModal) 
                  {
                      closeModal.addEventListener("click", () => 
                      {
                        main.classList.remove("blurBackground");
                        filterMenu.style.opacity = "0";
                        setTimeout(() => {
                          filterMenu.style.display = "none";
                          document.body.style.overflow = "auto";
                        }, 300);
                      });
                  }
                } else 
                {
                  console.error("(!)Error: No se encontró el contenedor #filterContainer en el DOM.");
                }
              })
              .catch(error => console.error("(!)Error cargando filtros:", error));
          });
        } else {
          console.error("(!)Error: No se encontró el ícono #advSearchIcon en el DOM.");
        }
      }, 0);
    })
    .catch(error => console.error("(!)Error cargando el navBar:", error));
});