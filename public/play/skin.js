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
  skin = "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/cowboyAnimated.glb?v=1740935685550"
 setSkin()
}
function sweaterSkin() {
  skin = "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/Sweatshirt.glb?v=1725725228968"
 setSkin()
}
function knightSkin() {
  skin = "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/KnightAnimated.glb?v=1741303386909"
  setSkin()
}
function pjSkin() {
  skin = "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/pjAnimated.glb?v=1743804546505"
setSkin()
}
function soccerSkin() {
  skin = "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/soccerPlayerAnimated.glb?v=1745542998381"
setSkin()
}
function astronautSkin() {
  skin = "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/astronautAnimated.glb?v=1745702217861"
  setSkin()
}
setTimeout(()=>{
  setSkin()
}, 500)