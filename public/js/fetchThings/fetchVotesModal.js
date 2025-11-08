document.getElementById("votesContainer").innerHTML = "";
const goodVoteButton = document.getElementById("goodVoteButton");

goodVoteButton.addEventListener("click", ()=>
{
    fetch("/modular/likes")
    .then(response => response.text())
    .then(html => 
    {
        document.getElementById("filterContainer").innerHTML = "";
        const likesDisplay = document.getElementById("votesContainer");
        likesDisplay.innerHTML = html;
        const votesContainer = document.querySelector(".overlay");
        if (votesContainer) 
        {
            main?.classList.add("blurBackground");
            votesContainer.style.display = "block";
            votesContainer.style.opacity = "1";
            document.body.style.overflow = "hidden";
        }


        const closeModal = document.getElementById("closeModal");
        closeModal.addEventListener("click", ()=>
        { 
            votesContainer.style.opacity = "0";
            main.classList.remove("blurBackground");
            setTimeout(() => 
            {
                votesContainer.style.display = "none";
            }, 50);
        })   
    })
    .catch(error => console.error("(!) Error cargando los likes:", error));
});