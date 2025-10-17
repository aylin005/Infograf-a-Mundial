//NOTA: Este se puede mejorar para indivualizar cada los obj
document.addEventListener("DOMContentLoaded", function()
{
    const select1 = document.getElementById("countrySelect");
    const flagImg1 = document.getElementById("miniFlag");
    const select2 = document.getElementById("nationalitySelect");
    const flagImg2 = document.getElementById("natFlag");

    select1.addEventListener('change', ()=>UpdateFlag(select1,flagImg1));
    select2.addEventListener('change', ()=>UpdateFlag(select2,flagImg2));
    UpdateFlag(select1, flagImg1); //NOTA: se cambia la bandera
    UpdateFlag(select2, flagImg2);
});