/* global playerId socket player players params */
let whoIt = "";
let done = false;
let gameStarted = false;
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
  socket.emit("world", { world: "tag", id: playerId, name: name, room: "public" });
} else if(params.get("join") == "private") {
  if(params.get("privateroom") != "create") socket.emit("world", { world: "tag", id: playerId, name: name, room: "tag-private-"+params.get("privateroom")});
  if(params.get("privateroom") == "create") socket.emit("world", { world: "tag", id: playerId, name: name, room: "create", map: params.get("map"), time: params.get("time")});
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
      const targetElement = document.querySelector('body'); // Replace with the ID of the element where you want to insert the content
      targetElement.insertAdjacentHTML('beforeend', xhr.responseText); 
      sceneLoaded()
      sceneLoaded2()
      sceneLoaded3 = "done";
      player.addEventListener('collide', function (e) {
  if(gameStarted) {
    let otherDude = e.detail.body.el.id;
  if (otherDude === whoIt) {
    socket.emit("player tagged", playerId);
  } 
  else if (otherDude in players && playerId === whoIt) {
    socket.emit("player tagged", otherDude);
  }
  }
});
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
  if(world.map == "forest") {
    insertHTMLFromFile("/tag/treeHouse.html")
    setTimeout(()=>{
    let map = document.getElementById("map")
    world.random.forEach((r)=>{
      let rock = document.createElement("a-entity")
  rock.setAttribute("mixin", "rock")
       rock.setAttribute("position", {x: r.xp, y: 0, z: r.yp})
      rock.setAttribute("scale", {x: r.xs, y: r.ys, z: r.zs})
  map.appendChild(rock)
    })
  }, 5000)
  } else if(world.map == "city") {
    insertHTMLFromFile("/tag/city.html")
  }  else if(world.map == "cave") {
    insertHTMLFromFile("/tag/cave.html")
  }  else if(world.map == "school") {
    insertHTMLFromFile("/tag/school.html")
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