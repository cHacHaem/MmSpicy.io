/* global playerId socket player players params */
let whoIt = "";
let done = false;
let gameStarted = false;
const gameMode = "tag";
let it = document.getElementById("it")
let map;
let sceneLoaded3 = false;
let timeLeftEl = document.getElementById("timeleft")
console.log("Hello! Please don't do any naughty stuff. I'm not going to try and stop you but I will remind you that if your cheating on a game like this it's just sad.")
socket.on("game start", (itFirst)=>{
  setTimeout(()=>{
     tagPlayer(itFirst)
  gameStarted = true;
  }, 2000)
})
if(params.get("join") == "random"){
  socket.emit("world", { world: "racing", id: playerId, name: name, room: "public" });
} else if(params.get("join") == "private") {
  if(params.get("privateroom") != "create") socket.emit("world", { world: "racing", id: playerId, name: name, room: "racing-private-"+params.get("privateroom")});
  if(params.get("privateroom") == "create") socket.emit("world", { world: "racing", id: playerId, name: name, room: "create", map: params.get("map"), time: params.get("time")});
socket.on("not found", ()=>{
          it.innerHTML = "Game Not Found"
  setTimeout(()=>{
    window.location.href = "/play"
  }, 3000)
          })
}
function insertHTMLFromFile(filePath) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', filePath, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      const targetElement = document.querySelector('body'); 
      targetElement.insertAdjacentHTML('beforeend', xhr.responseText); 
      sceneLoaded()
      sceneLoaded3 = "done";
    } else {
      console.error('Error loading file:', xhr.status);
    }
  };

  xhr.onerror = function() {
    console.error('Network error');
  };

  xhr.send();
}
socket.on("world", (world)=>{
  map = world.map;
  name = world.name
  if(world.map == "test") {
    insertHTMLFromFile("/racing/test.html")
  }
  if(world.world.includes("tag-private")) it.innerHTML = "game code: " + world.world.split("-")[2];
  it.innerHTML ="world: " + world.world


})
socket.on("game over", (game)=>{
  gameStarted = false;
  timeLeftEl.innerHTML = "";
  it.setAttribute("class", "it");
  it.innerHTML = "Game Over";
  setTimeout(()=>{
    window.location.href = "/play"
  }, 5000)
})
socket.on("time to start", (time)=>{
  if(time == "waiting for players...") {
    timeLeftEl.innerHTML = time;
  } else {
    timeLeftEl.innerHTML = "Time To Start: " + formatTime(time)
  }
})
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const paddedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
  return minutes + ':' + paddedSeconds;
}
socket.on("time left", (left)=>{
  timeLeftEl.innerHTML = formatTime(left)
})

socket.on("player tagged", (evt) => {
  tagPlayer(evt)
});

// Function to handle tagging logic
function tagPlayer(taggedPlayer) {
  // Remove the marker from the current "it" player
  if (whoIt && whoIt !== playerId) {
    const currentMarker = document.getElementById("marker" + whoIt);
    if (currentMarker) {
      currentMarker.setAttribute("visible", "false");
    }
  }

  // If the current player is not the one tagged
  if (playerId !== taggedPlayer) {
    it.innerHTML = "Run Away!";
    it.setAttribute("class", "notit");
  }

  // If the current player is tagged
  if (playerId === taggedPlayer) {
    it.innerHTML = "You're It!";
    it.setAttribute("class", "it");
  } else {
    // Ensure the tagged player exists in the game
    const newMarker = document.getElementById("marker" + taggedPlayer);
    if (newMarker) {
      newMarker.setAttribute("visible", "true");  // Add the marker to the tagged player
    }
  }

  whoIt = taggedPlayer;  // Update who is "it"
}
function gt() {
  console.log(player.getAttribute("position"))
}