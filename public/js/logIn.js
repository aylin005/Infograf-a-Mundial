window.addEventListener("load", () => 
{
  document.getElementById("formLogo").classList.add("show");
  document.getElementById("formContainer").classList.add("show");
});

document.addEventListener("DOMContentLoaded", function()
{
  'use strict'
  const form = document.getElementById('logInForm');
  const passIcon = document.getElementById('passwordIcon');
  if (passIcon) 
  {
    let pass = document.getElementById('password');
    passIcon.onclick = function(){ClickEyeButton(pass, passIcon);}
  }
    
    
    form.addEventListener('submit', event => 
    {
      HideCustomAlert();
      form.classList.add('was-validated');
      if (!form.checkValidity()) 
      {
        event.preventDefault()
        event.stopPropagation()
        return;
      }
      let user = document.getElementById('username').value.trim();
      let pass = document.getElementById('password').value.trim();
      if (user === " " || pass === " ") 
      {
        event.preventDefault();
        DisplayCustomAlert("[⚠️] ATENCIÓN: Por favor, ingrese caracteres válidos en todos los campos.");
        return;
      }
      // Real login: POST to /login
      event.preventDefault();
      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: user, password: pass })
      })
      .then(response => response.json().then(data => ({ status: response.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200 && body.exito) {
          // Admin vs User redirect
          if (body.role === 'admin') {
            sessionStorage.setItem('admin', JSON.stringify({ username: body.username }));
            window.location.href = '/adminMundials';
          } else {
            // Normalize image in frontend just in case
            if (body.image && typeof body.image === 'string') {
              if (!body.image.startsWith('data:') && !body.image.startsWith('http')) {
                // assume PNG
                body.image = 'data:image/png;base64,' + body.image;
              }
            }
            sessionStorage.setItem('user', JSON.stringify(body));
            window.location.href = '/profile';
          }
        } else {
          DisplayCustomAlert(`[❌] E R R O R: ${body.mensaje || 'Usuario o contraseña incorrectos'}`);
        }
      })
      .catch(() => {
        DisplayCustomAlert('[❌] Error de conexión con el servidor');
      });
        }, false)
      });