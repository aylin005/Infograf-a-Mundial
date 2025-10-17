document.addEventListener("DOMContentLoaded", () => 
{
  const discardBtn = document.getElementById("deletePost");
  if (discardBtn) {
    discardBtn.addEventListener("click", () => {
      const confirmDiscard = confirm("[⚠️] A T E N C I Ó N: ¿Seguro que quieres eliminar esta publicación? Esta acción no se puede deshacer.");
      if (confirmDiscard) {

        location.href="/profile";
      }
    });
  }
});