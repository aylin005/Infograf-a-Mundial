document.addEventListener("DOMContentLoaded", () => {
  const discardBtn = document.getElementById("discardPost");
  if (discardBtn) {
    discardBtn.addEventListener("click", () => {
      const confirmDiscard = confirm("[⚠️] A T E N C I Ó N: ¿Seguro que quieres descartar esta publicación? Esta acción no se puede deshacer.");
      if (confirmDiscard) {
        // Aquí puedes limpiar el formulario, redirigir, o cerrar la modal
        location.href="/";
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
      
      //spinner cuando se envíe el form
      showNewPostSpinner();
    });
  }
});

//manejar spinner de nuevo post
function showNewPostSpinner() {
  const spinner = document.getElementById('newpost-spinner');
  const button = document.getElementById('postPost');
  if (spinner && button) {
    spinner.style.display = 'block';
    button.disabled = true;
    button.textContent = 'Publicando...';
  }
}

function hideNewPostSpinner() {
  const spinner = document.getElementById('newpost-spinner');
  const button = document.getElementById('postPost');
  if (spinner && button) {
    spinner.style.display = 'none';
    button.disabled = false;
    button.textContent = 'Publicar';
  }
}
