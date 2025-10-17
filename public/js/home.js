//NOTA: Información falsa para los mundiales
const mundials=
[   
    {
    image:"/media/Mundiales/1930/PageContent/1.jpg",
        year: "1930",
        slogan: "El inicio de la tradición futbolística"
    },

    {
    image:"/media/Mundiales/1934/PageContent/1.jpg",
        year: "1934",
        slogan: "El trofeo bajo la sombra de un ideal"
    },

    {
    image:"/media/Mundiales/1938/PageContent/1.jpg",
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
                <a href="/mundialDisplay"><h1 class="pageTitle rem2size textShadow">Mundial ${mundial.year}</h1></a>
                <h2 class="mundialSlogan textShadow">${mundial.slogan}</h2>
            </div>
        `;
    inner.appendChild(item);

    //NOTA: se crea el botón inferior -> el que sirve para moverse rápidamente entre mundiales
    // Create indicator via HTML to ensure attributes are parsed as in static markup
    const indicatorHtml = `
      <button type="button" data-bs-target="#mundialSlider" data-bs-slide-to="${i}" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-custom-class="custom-tooltip" title="${mundial.year}" aria-label="Slide ${i + 1}" ${i === 0 ? 'class="active" aria-current="true"' : ''}></button>
    `;
    const tmp = document.createElement('div');
    tmp.innerHTML = indicatorHtml.trim();
    indicators.appendChild(tmp.firstChild);
  });

  // NOTA: Se activan los tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
}
