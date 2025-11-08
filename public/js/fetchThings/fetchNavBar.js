document.addEventListener("DOMContentLoaded", () => {
  fetch("/modular/navBar")
    .then(response => response.text())
    .then(html => {
      document.getElementById("navBar-container").innerHTML = html;

      // Esperar a que el DOM se actualice con el nuevo HTML
      setTimeout(() => {
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
                  const select1 = document.getElementById("countrySelect");
                  const flagImg1 = document.getElementById("miniFlag");
                  const select2 = document.getElementById("nationalitySelect");
                  const flagImg2 = document.getElementById("natFlag");

                  select1.addEventListener('change', ()=>UpdateFlag(select1,flagImg1));
                  select2.addEventListener('change', ()=>UpdateFlag(select2,flagImg2));
                  UpdateFlag(select1, flagImg1); //NOTA: se cambia la bandera
                  UpdateFlag(select2, flagImg2);

                  function UpdateFlag(pSelect, pFlag) 
                  {
                    const selectedOption = pSelect.options[pSelect.selectedIndex];
                    const imgSrc = selectedOption.getAttribute("data-image");
                    pFlag.src = imgSrc;
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