let character =document.getElementById("character");

document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !event.repeat) {
        character.src = "john_gun_shoot.gif";
    }
});

document.addEventListener("keyup", (event) => {
    if (event.code === "Space") {
        character.src = "john_gun_idle.gif";
    }
});