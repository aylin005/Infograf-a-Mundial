const userData = 
{
  name: "@itsie",
  email: "itsie-mora@gmail.com",
    photo: "/media/pruebas/270 sin título_20240830204638.png",
    background: "/media/pruebas/b.png",
    nationality: "/media/Flags/Mexico-Emoji.png",
  gender: "Femenino"
};

document.addEventListener("DOMContentLoaded", function() 
{
    const fileInput = document.getElementById("backgroundPhoto");
    const fileLabel = document.querySelector("label[for='backgroundPhoto']");

    //NOTA: este es un ejemplo, no sé si sirva de algo pero pues ahí está 😔
    profileBackground.src = userData.background;
    profilePhoto.src = userData.photo;
    profileName.textContent = userData.name;
    profileMail.textContent = userData.email;
    profileNationality.src = userData.nationality;
    
    let gender;
    if(userData.gender === 'Masculino')
        gender = '🚹';
    else
    {
        if(userData.gender === 'Femenino')
            gender = '🚺';
        else
            gender = '❎';
    }
    profileGender.textContent = `| ` + gender;
    
    fileInput.addEventListener("change", () => 
    {
        if (fileInput.files.length > 0) 
        {
            const fileName = fileInput.files[0].name;
            fileLabel.textContent = `${fileName}`;
        } 
        else 
        {
            fileLabel.textContent = "Subir foto de fondo";
        }
    });
})