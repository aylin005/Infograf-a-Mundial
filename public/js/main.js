//NOTA: NO LE HAGAS CASO A LO DE ESTE ARCHIVO, solo para una preview del funcionamiento

document.addEventListener("DOMContentLoaded", function()
{
  const select1 = document.getElementById("originCountrySelect");
  const flagImg1 = document.getElementById("countryDisplay");
  const select2 = document.getElementById("nationalitySelect");
  const flagImg2 = document.getElementById("nationalityDisplay");
  const genderButtons = document.querySelectorAll(".genderSelectBtn");
  const genderDisplay = document.getElementById("genderDisplay");
  const genderInput=document.getElementById("genderInput");
  const genderLabels= { gender1: "Masculino", gender2: "Femenino", gender3: "Otro", gender4: "Prefiero no especificar"}
  //NOTA: se controla el género
  genderButtons.forEach(btn=>
    {
      btn.addEventListener("click", ()=>
      {
        genderButtons.forEach(b=>b.classList.remove("selectedGender"));
        btn.classList.add("selectedGender");
        genderDisplay.textContent=genderLabels[btn.id];
        genderInput.value = genderLabels[btn.id];
      })
    })


  select1.addEventListener("change", ()=>updateFlag(select1,flagImg1));
  select2.addEventListener("change", ()=>updateFlag(select2,flagImg2));
  updateFlag(select1, flagImg1); //NOTA: se cambia la bandera
  updateFlag(select2, flagImg2);
});
