document.addEventListener("DOMContentLoaded", () => {
  const discardBtn = document.getElementById("discardPost");
  if (discardBtn) {
    discardBtn.addEventListener("click", () => {
      const confirmDiscard = confirm("[⚠️] A T E N C I Ó N: ¿Seguro que quieres descartar esta publicación? Esta acción no se puede deshacer.");
      if (confirmDiscard) {
        // Aquí puedes limpiar el formulario, redirigir, o cerrar la modal
        location.href="index.html";
      }
    });
    const form = document.getElementById('addPostForm');
    if (!form) return;
    
    
    form.addEventListener('submit', event => {
      const title = document.getElementById('postTitle').value.trim();
      const description = document.getElementById('postContent').value.trim();
    
      if (!title || !description) 
      {
        event.preventDefault();
        alert("[⚠️] A T E N C I Ó N: Necesita proporcionar un título y una descripción");
        return;
      }
    });
  }
});
