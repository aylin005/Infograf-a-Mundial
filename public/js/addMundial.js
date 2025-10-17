document.addEventListener("DOMContentLoaded", () => 
{
  const discardBtn = document.getElementById("addMundialButton");
  if (discardBtn) {
    discardBtn.addEventListener("click", () => {
      const confirmDiscard = confirm("[⚠️] A T E N C I Ó N. Hay cambios pendientes, si continua, los datos se borrarán ¿Continuar?");
      if (confirmDiscard) {
        location.href="adminMundials.html";
      }
    });
  }
});