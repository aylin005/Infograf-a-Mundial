const previewCard =
[
    {
        userPhoto: "../../Design/media/userPhoto.png",
        user: "amloLover500",
        date: "28/08/2025",
        title: "Esta deberia de ser la mascota del mundial",
        media: "https://www.tabascohoy.com/wp-content/uploads/2025/04/016-OBRAGOL-MUNDIAL-MEX-2026-1024x656.jpg",
        isVideo: false,
        upvotes: "4M",
        comments: "4M",
    },

    {
        userPhoto: "../../Design/media/pruebas/270 sin título_20240830204638.png",
        user: "itsie",
        date: "01/09/2025",
        title: "Que opinan del logo del FIFA 2026?",
        media: "https://ibero.mx/sites/default/files/prensaymultimedios/logo_fifa_2026_0.png",
        isVideo: false,
        upvotes: "4.8M",
        comments: "500k",
    },

    {
        userPhoto: "../../Design/media/pruebas/momazo.jpg",
        user: "x",
        date: "03/09/2025",
        title: "Quien va a cantar en el proximo mundial?",
        media: "https://pbs.twimg.com/media/E4eSe2-VkAMg8HL.jpg",
        isVideo: false,
        upvotes: "3.9M",
        comments: "450k",
    },

    {
        userPhoto: "../../Design/media/userPhoto.png",
        user: "queVin",
        date: "06/08/2025",
        title: "Tremenda jugada de la URSS",
        media: "../../Design/media/Mundiales/1982/Publications/Eder Brazil vs USSR 2-1 First Round World Cup 1982.mp4",
        isVideo: true,
        upvotes: "9M",
        comments: "123",
    }
]

document.addEventListener("DOMContentLoaded", () => 
{
    const postPreview = document.getElementById("previewContainer"); 
    previewCard.forEach(i => 
    {   postPreview.appendChild(createPreviewPost(i));});
});

function createPreviewPost(pPost) 
{
  const postContainer = document.createElement("div");
  postContainer.className = "d-flex";
  postContainer.innerHTML = 
  `
    <div id="previewPublication" class="previewPublication">
    <div class="d-flex align-items-center">
        <a href="profile.html"><img id="previewUserPhoto" src="${pPost.userPhoto}" class="userPhoto img-fluid"></a>
        <a href="profile.html"><p id="previewUsername" class="username">${pPost.user}</p></a>
        <p id="previewDate" class="username">| ${pPost.date}</p>
    </div>
    <div class="d-flex align-items-center">
        <a href="postDisplay.html" class="noMargin noPadding"><p id="previewTitle" class="previewTitle">${pPost.title}</p></a>
        ${pPost.isVideo
          ? `<video id="previewMedia" src="${pPost.media}" class="previewPhoto" muted loop></video>`
          : `<img id="previewMedia" src="${pPost.media}" class="previewPhoto img-fluid">`
        }

    </div>
    <div class="d-flex addGap10x addPading0x5x">
        <div class="d-flex align-items-center">
            <i id="goodVoteIcon" class="bi bi-arrow-up-square-fill goodVoteIcon"></i>
            <p id="previewUpvotes" class="cantUpvotes noMargin">${pPost.upvotes}</p>
        </div>
        <div class="d-flex align-items-center">
            <a href="postDisplay.html"><i id="goToComments" class="bi bi-chat-left-dots messageIcon"></i></a>
            <p id="previewComments" class="cantUpvotes noMargin">${pPost.comments}</p>
        </div>
    </div>
</div> 
  `;
  return postContainer;
}