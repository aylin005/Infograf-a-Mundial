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
      //NOTA: Simulación de usuario válido
      if (user !== "admin" || pass !== "123") 
      {
        event.preventDefault();
        DisplayCustomAlert("[❌] E R R O R: Usuario no encontrado");
        return;
      }
        }, false)
      });