//// NOTA: Toogle de los ojos
function ClickEyeButton(pPass, pIcon)
{
    if( pPass.type === "password")
    {
        pPass.type = "text";
        pIcon.classList.remove("bi-eye");
        pIcon.classList.add("bi-eye-slash");
    }
    else
    {
        pPass.type = "password";
        pIcon.classList.remove("bi-eye-slash");
        pIcon.classList.add("bi-eye");
    }        
}
//// Mostrar mensaje de alerta principal
function DisplayCustomAlert(pMessage) 
{
    const alertElement = document.getElementById('custom-alert-message');
    if (alertElement) 
    {
        alertElement.textContent = pMessage;
        alertElement.style.display = 'block';
        setTimeout(() => 
        {
            alertElement.classList.add('show');
        }, 10);
    }
}

//// NOTA: Ocultar el mensaje
function HideCustomAlert() 
{
    const alertElement = document.getElementById('custom-alert-message');
    if (alertElement) 
    {
        alertElement.classList.remove("show");
        setTimeout(() => 
        {
            alertElement.style.display = 'none';
        }, 10000);
        alertElement.textContent = ''; 
    }
}

//// NOTA: Mostrar mensaje de error para los inputs
function ShowError(pInput, pMessage, pText, pAddClass)
{
    pInput.classList.add(pAddClass);
    if (pMessage) 
    {
        pMessage.textContent = pText;
        pMessage.style.display = 'block';
    }
    return false;
}

//// NOTA: Ocultar el mensaje de los inputs
function HideError(pInput, pMessage ,pQuitClass)
{
    pInput.classList.remove(pQuitClass);
    if (pMessage) 
    {
        pMessage.textContent = '';
        pMessage.style.display = 'none';
    }
    return true;
}

//// NOTA: Cambiar imagen
function ChangeImg(pFP, pFPbtn) 
{
    pFP.src = URL.createObjectURL(pFPbtn.files[0]);
    return true;
}

//// NOTA: Actualizar bandera del select
function UpdateFlag(pSelect, pFlag) 
{
  const selectedOption = pSelect.options[pSelect.selectedIndex];
  const imgSrc = selectedOption.getAttribute("data-image");
  pFlag.src = imgSrc;
}

//// NOTA: Validar edad
function CheckBirthday(pToday, pBirth, pMinDate, pMaxDate)
{
    console.log(pBirth);
    if (isNaN(pBirth.getTime()) || pBirth > pToday || pBirth < pMaxDate)
    {
        console.log("Edad inválida");
        return -1;
    }
    else
    {
        if(pBirth >= pMinDate)
        {
            console.log("Menor de edad");
            return 1;   
        }
        else
        {
            console.log("Todo bien");
            return 0;
        }
    }
}
function GetMinAge(pAge) 
{
  return new Date(pAge.getFullYear() - 12, pAge.getMonth(), pAge.getDate());
}
function GetMaxAge(pAge) 
{
  return new Date(pAge.getFullYear() - 130, pAge.getMonth(), pAge.getDate());
}

//// NOTA: Cambio de género
function SelectGenderById(pId, pGenderButtons, pGenderDisplay, pGenderLabels, pGenderInput, pClass) 
{
    pGenderButtons.forEach(b => b.classList.remove(pClass));
    const btn = document.getElementById(pId);
    if (btn) 
    {
        btn.classList.add(pClass);
        pGenderDisplay.textContent = pGenderLabels[pId];
        pGenderInput.value = pGenderLabels[pId];
    }
}

//// NOTA: Validar contraseña
function CheckPasswords(pPass1, pPass2, pErrorMsg1, pErrorMsg2)
{
    if(!CheckSecurityPass(pPass1, pErrorMsg1))
        return false;

    if (pPass1.value.trim() !== pPass2.value.trim()) 
    {
        console.log("Contraseñas incorrectas");
        ShowError(pPass1, pErrorMsg1,'[🔐] Las contraseñas no coinciden.', 'is-invalid');
        ShowError(pPass2, pErrorMsg2,'[🔐] Las contraseñas no coinciden.', 'is-invalid');
        return false;
    } 
    else 
    {
        HideError(pPass1, pErrorMsg1, 'is-invalid');
        HideError(pPass2, pErrorMsg2, 'is-invalid');
        return true;
    }
}
function CheckSecurityPass(pPass, pErrorMsg)
{
    const regexMayus = /[A-Z]/;
    const regexMinus = /[a-z]/;
    const regexNumber = /\d/;
    const regexPunct = /[^\w\s]/; //NOTA: Se supone que acepta esto: =)§)]€& 
    if(pPass.value.length < 8)
    {
        ShowError(pPass, pErrorMsg,'[❌] No se cumple con la longitud necesaria.', 'is-invalid');
        return false;
    }
    else
    {
        if(!regexMayus.test(pPass.value))
        {
            ShowError(pPass, pErrorMsg,'[❌] Incluya una mayúscula.', 'is-invalid');
            return false;
        }
        else if(!regexMinus.test(pPass.value))
        {
            ShowError(pPass, pErrorMsg,'[❌] Incluya una minúscula.', 'is-invalid');
            return false;
        } 
        else if(!regexNumber.test(pPass.value))
        {
            ShowError(pPass, pErrorMsg,'[❌] Incluya un número.', 'is-invalid');
            return false;
        } 
        else if(!regexPunct.test(pPass.value))
        {
            ShowError(pPass, pErrorMsg,'[❌] Incluya un signo de puntuación.', 'is-invalid');
            return false;
        } 
        else
        {
            HideError(pPass, pErrorMsg, 'is-invalid');  
            return true;
        }
    }
}

