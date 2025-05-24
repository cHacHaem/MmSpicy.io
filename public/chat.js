let chatInput = document.getElementById("chat-input")
let chatContent = document.getElementById("chat-content")
let chatVisible = true;
let overlay = document.getElementById("overlay")
var params = new URLSearchParams(window.location.search);
if (typeof params.get("devtools") == "string") {
  window.addEventListener("DOMContentLoaded", (event) => {
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    document.body.appendChild(script);
    script.onload = function () {
      eruda.init();
    };
  });
}
document.addEventListener("keydown", (event)=>{
  if(event.key == "c" && chatVisible) {
    overlay.setAttribute("class", "overlayunder");
    chatVisible = false;
  } else if(event.key == "c") {
    overlay.setAttribute("class", "overlay");
    chatVisible = true;
  }
})
chatInput.addEventListener('keydown', function(event) {
    if(event.keyCode == 13) {
      sendMessage();
    }
    event.stopPropagation(); 
});
function sendMessage(server) {
  if(server) {
    socket.emit("chat message", {message: server, time: Date.now(), id: "server", name: "server"}) 
  } else if(chatInput.value != "") {
    socket.emit("chat message", {message: chatInput.value, time: Date.now(), id: playerId}) 
    chatInput.value = "";
  }
}
socket.on("chat message", (message)=>{
  showMessage(message)
  })
function showMessage(message) {
    let newMes = document.createElement("div");
    let newMesText = document.createElement("h2");
    let newMesPerson = document.createElement("h3");
    if(message.name == "server" && message.id != "server") message.name = "Imposter"
    if(!message.name || message.name == "") message.name = "Imposter"
    if(message.id == playerId) {
      newMesText.setAttribute("class", "messageme")
      newMesPerson.innerHTML = "me"
      newMesText.setAttribute("align", "right")
    } else {
      newMesText.setAttribute("class", "message")
      newMesPerson.textContent = message.name;
    }
    newMesText.textContent = message.message;
    newMes.appendChild(newMesPerson);
    newMes.appendChild(newMesText);
    chatContent.appendChild(newMes)
 // Or whatever method to get the element, again

// To set the scroll
chatContent.scrollTo(chatContent.height, chatContent.scrollHeight);
}