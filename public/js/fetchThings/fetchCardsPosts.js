//NOTA: Información falsa para las publicaciones
const card =
[
    {
        background: "../../Design/media/Mundiales/1986/Publications/1.mp4",
        isVideo: true,
        username: "@itsie",
        comments: "9k",
        upvotes: "1M",
        title: "La mejor jugada de Maradona",
        mundialYear: "1986",
        mundialSelection: "Selección argentina",
        // NOTA: Este es un array, puede tener 0 o n datos
        tags: ["MejoresJugadas", "Campeón"] 
    },

    {
        background: "../../Design/media/Mundiales/1950/PageContent/2.jpg",
        isVideo: false,
        username: "@cocos",
        comments: "4M",
        upvotes: "100k",
        title: "Este logo es de los 50's",
        mundialYear: "1950",
        mundialSelection: "",
        // NOTA: Este es un array, puede tener 0 o n datos
        tags: ["CapsulaDelTiempo", "Brasil", "Mundial50", "DatoInteresante", "Opiniones", "LATAM"] 
    }
]

document.addEventListener("DOMContentLoaded", () => 
{
    const postList = document.getElementById("container4Post");
    card.forEach(post => 
    {
        postList.appendChild(createPostCard(post));
    });
});

function createPostCard(pCard) 
{
  const cardContainer = document.createElement("div");
  cardContainer.className = "d-flex";
  cardContainer.innerHTML = 
  `
    <div class="card cardSize borderDegraded" data-bs-theme="dark">
      <div class="card-body imageDegraded noMargin noPadding">
        ${pCard.isVideo
          ? `<video id="videoCard" src="${pCard.background}" class="backgroundCard" muted loop></video>`
          : `<img class="backgroundCard" src="${pCard.background}" alt="Post media">`
        }

        <div class="container-fluid">
          <div class="row">
            <div class="col-7 over">
              <a href="profile.html"><p class="userCard">${pCard.username}</p></a>
            </div>
            <div class="col-5 over">
              <div class="d-flex calificationCard align-items-center justify-content-center">
                <div class="d-flex align-items-center">
                  <a href="postDisplay.html"><i class="bi bi-chat-left-dots messageIcon"></i></a>
                  <p class="cantUpvotes noMargin">${pCard.comments}</p>
                </div>
                <div class="d-flex align-items-center">
                  <i class="bi bi-arrow-up-square-fill goodVoteIcon"></i>
                  <p class="cantUpvotes noMargin">${pCard.upvotes}</p>
                </div>
                <i class="bi bi-arrow-down-square-fill badVoteIcon"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="container-fluid">
          <div class="row">
            <div class="col-12 over">
              <a href="postDisplay.html" class="over"><h5 class="cardTitle over">${pCard.title}</h5></a>
            </div>
          </div>
        </div>
        <br>
        ${pCard.mundialYear || pCard.mundialSelection ? `
        <div class="container-fluid">
          <div class="row">
            <div class="col-12 over">
              <div class="d-flex over">
                ${pCard.mundialYear ? `<button id="postYear" type="button" onclick="location.href='results.html'" class="ticketsCard">${pCard.mundialYear}</button>` : ""}
                ${pCard.mundialSelection ? `<button id="postSelectio" type="button" onclick="location.href='results.html'" class="ticketsCard">${pCard.mundialSelection}</button>` : ""}
              </div>
            </div>
          </div>
        </div>` : ""}

        ${pCard.tags && pCard.tags.length > 0 ? `
        <div class="container-fluid">
          <div class="row">
            <div class="col-12 over">
              <div class="d-flex align-items-center tagContainer">
                ${pCard.tags.map(tag => `<button type="button" onclick="location.href='results.html'" class="tags">#${tag}</button>`).join("")}
              </div>
            </div>
          </div>
        </div>` : ""}
      </div>
    </div>
  `;
  return cardContainer;
}