/* global skin */
    let scene = document.querySelector("a-scene")
      let model = document.createElement("a-gltf-model")
      model.setAttribute("move", "clip: NONE")
    scene.appendChild(model)
    let rotation = -90
    setInterval(()=>{
      rotation+=0.5
      if(rotation > 180) rotation = -180
      model.setAttribute("rotation", "y", rotation)
    }, 10)
function setSkin() {
  localStorage.setItem("skin", skin)
    model.setAttribute("src", skin)
}
function cowboySkin() {
  skin = "https://cdn.jsdelivr.net/gh/cHacHaem/mmspicyassets@main/cowboyAnimated.glb"
 setSkin()
}
function sweaterSkin() {
  skin = "https://cdn.jsdelivr.net/gh/cHacHaem/mmspicyassets@main/SweatshirtAnimated.glb"
 setSkin()
}
function knightSkin() {
  skin = "https://cdn.jsdelivr.net/gh/cHacHaem/mmspicyassets@main/KnightAnimated.glb"
  setSkin()
}
function pjSkin() {
  skin = "https://cdn.jsdelivr.net/gh/cHacHaem/mmspicyassets@main/pjAnimated.glb"
setSkin()
}
function soccerSkin() {
  skin = "https://cdn.jsdelivr.net/gh/cHacHaem/mmspicyassets@main/soccerPlayerAnimated.glb"
setSkin()
}
function astronautSkin() {
  skin = "https://cdn.jsdelivr.net/gh/cHacHaem/mmspicyassets@main/astronautAnimated.glb"
  setSkin()
}
function pencilSkin() {
  skin = "https://cdn.jsdelivr.net/gh/cHacHaem/mmspicyassets@main/pencilAnimated.glb"
  setSkin()
}
function pirateSkin() {
  skin = "https://cdn.jsdelivr.net/gh/cHacHaem/mmspicyassets@main/pirateAnimated.glb"
  setSkin()
}
setTimeout(()=>{
  setSkin()
}, 500)