//NOTA: Información falsa para los mundiales
const mundials=
[   
    {
        image:"../../Design/media/Mundiales/1930/PageContent/1.jpg",
        year: "1930",
        slogan: "El inicio de la tradición futbolística"
    },

    {
        image:"../../Design/media/Mundiales/1934/PageContent/1.jpg",
        year: "1934",
        slogan: "El trofeo bajo la sombra de un ideal"
    },

    {
        image:"../../Design/media/Mundiales/1938/PageContent/1.jpg",
        year: "1938",
        slogan: "El juego previo a la guerra"
    }
]
document.addEventListener("DOMContentLoaded", () => 
{
  showCarousel(mundials);
});

function showCarousel(pMundiales) 
{
    const inner = document.getElementById("carousel-inner");
    const indicators = document.getElementById("carousel-indicators");

    //NOTA: se crea cada uno de los mundiales
    pMundiales.forEach((mundial, i) => 
    {
        const item = document.createElement("div");

        if(i===0)
            item.className = "carousel-item active"
        else
            item.className = "carousel-item";

        item.setAttribute("data-bs-interval", "5000");
        item.innerHTML = `
            <div class="imageDegraded">
                <a><img src="${mundial.image}" class="d-block carouselImg img-fluid" alt="Mundial ${mundial.year}"></a>
            </div>
            <div class="carousel-caption d-md-block mb-4">
                <a href="mundialDisplay.html"><h1 class="pageTitle rem2size textShadow">Mundial ${mundial.year}</h1></a>
                <h2 class="mundialSlogan textShadow">${mundial.slogan}</h2>
            </div>
        `;
    inner.appendChild(item);

    //NOTA: se crea el botón inferior -> el que sirve para moverse rápidamente entre mundiales
    const indicator = document.createElement("button");
    indicator.type = "button";
    indicator.setAttribute("data-bs-target", "#mundialSlider");
    indicator.setAttribute("data-bs-slide-to", i);
    indicator.setAttribute("data-bs-toggle", "tooltip");
    indicator.setAttribute("data-bs-placement", "bottom");
    indicator.setAttribute("data-bs-custom-class", "custom-tooltip");
    indicator.setAttribute("title", mundial.year);

    if(i === 0)
        indicator.className = "active";

    if (i === 0)
        indicator.setAttribute("aria-current", "true");
    
    indicator.setAttribute("aria-label", `Slide ${i + 1}`);
    indicators.appendChild(indicator);
  });

  // NOTA: Se activan los tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
}
