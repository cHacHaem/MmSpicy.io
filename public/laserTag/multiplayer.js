const socket = io();

let players = {};
let smoothness = 0.1; 
function sceneLoaded() {
let cam = document.querySelector("#cam");
let scene = document.querySelector("a-scene");
let player = document.querySelector("#player");
  function checkPlayerBody() {
  if (!player || !player.body) {
    setTimeout(checkPlayerBody, 100);
  } else {
    setInterval(sendUpdate, 60); 
  }
}
checkPlayerBody();
socket.on("player left", (evt) => {
  if (players[evt]) {
    players[evt].entity.parentNode.removeChild(players[evt].entity);
    delete players[evt];
  }
});

function sendUpdate() {
  if (player.body && player.body.velocity) {
    const position = player.getAttribute("position");
    const rotation = cam.getAttribute("rotation");
    const velocity = player.body.velocity;
    let movementState = 'idle';
    function degToRad(degrees) {
      return degrees * (Math.PI / 180);
    }
    const rad = degToRad(rotation.y);
    const forwardVector = {
      x: -Math.sin(rad),
      z: -Math.cos(rad)
    };
    const velocityMagnitude = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
    const velocityDir = {
      x: velocity.x / velocityMagnitude,
      z: velocity.z / velocityMagnitude
    };

    // Calculate dot product to determine movement direction relative to the camera
    const dotProduct = forwardVector.x * velocityDir.x + forwardVector.z * velocityDir.z;
    const angle = Math.acos(dotProduct) * (180 / Math.PI);

    // Detect if the player is in the air (jumping or falling)
    const isJumping = Math.abs(velocity.y) > 0.1;

    if (isJumping) {
      movementState = 'jumping';
    } else if (velocityMagnitude > 2) {
      if (angle < 30) {
        movementState = 'running_forward';
      } else if (angle > 150) {
        movementState = 'running_back';
      } else if (velocityDir.x * forwardVector.z - velocityDir.z * forwardVector.x > 0) {
        movementState = 'running_left';
      } else if (velocityDir.x * forwardVector.z - velocityDir.z * forwardVector.x < 0) {
        movementState = 'running_right';
      }
    } else if (velocityMagnitude > 0.1) {
      movementState = 'walking';
    }
    let updateObject = {
      id: playerId,
      position: position,
      rotation: rotation,
      movementState: movementState,
    }
    if(!gameStarted) updateObject.name = name
    if(!gameStarted) updateObject.skin = skin
    if(gameStarted) updateObject.health = health
    socket.emit("player update", updateObject);
  }
}

socket.on("player update", (stuff) => {
  if (stuff.id !== playerId && !(stuff.id in players)) {
    let newPlayer = document.createElement("a-entity");
    let newPlayerHitbox = document.createElement("a-cylinder");
    let newPlayerName = document.createElement("a-text")
    let newPlayerBlaster = document.createElement("a-entity");
    newPlayerName.setAttribute("value", stuff.name)
    newPlayerName.setAttribute("align", "center")
    newPlayerName.setAttribute("position", {x: 0, y: 1.3, z: 0})
    newPlayerName.setAttribute("look-at", "#cam")
    newPlayer.setAttribute("gltf-model", stuff.skin);
    newPlayer.setAttribute("scale", "3 3 3");
    newPlayer.setAttribute("visible", "true");
    newPlayer.setAttribute("move", "clip: Idle");
    newPlayer.setAttribute("rotation", `0 ${stuff.rotation.y} 0`);
    newPlayerBlaster.setAttribute("gltf-model", "#blasterModel")
  newPlayerBlaster.setAttribute("position", {x: -0.2, y: 0.5, z: 0.2})
     newPlayerBlaster.setAttribute("rotation", {x: 0, y: 90, z: 0})
    newPlayerBlaster.setAttribute("scale", {x: 0.8, y: 0.8, z: 0.8})

// Box for raycasting
let raycastHitbox = document.createElement("a-box");
raycastHitbox.setAttribute("width", "0.2");
raycastHitbox.setAttribute("height", "1");
raycastHitbox.setAttribute("depth", "0.2");
raycastHitbox.setAttribute("position", "0 0.5 0");
raycastHitbox.setAttribute("visible", "false");
raycastHitbox.setAttribute("id", stuff.id);
raycastHitbox.setAttribute("class", "player shootable");



    if(stuff.name == "ghost") {
      newPlayer.addEventListener('model-loaded', () => {
  const mesh = newPlayer.getObject3D('mesh');
  mesh.traverse((node) => {
    if (node.isMesh) {
      node.material.transparent = true;
      node.material.opacity = 0.3;
    }
  });
});
    }
   

    newPlayerHitbox.setAttribute("static-body", { shape: "cylinder" });
    newPlayerHitbox.setAttribute("visible", "false");
    newPlayerHitbox.setAttribute("position", "0 0.5 0");
    newPlayerHitbox.setAttribute("height", "3.1");
    newPlayer.appendChild(newPlayerName)
    newPlayer.appendChild(newPlayerHitbox);
    newPlayer.appendChild(raycastHitbox);
    newPlayer.appendChild(newPlayerBlaster);
    players[stuff.id] = {
      entity: newPlayer,
      nameEntity: newPlayerName,
      name: stuff.name,
      targetPosition: stuff.position,
      previousPosition: { ...stuff.position },
      targetRotationY: stuff.rotation.y + 180,
      currentModel: "#idleSweater",
      movementState: stuff.movementState,
    };

    scene.appendChild(newPlayer);
  } else if (stuff.id in players) {
    let player = players[stuff.id];
    player.targetPosition = stuff.position;
    player.targetRotationY = stuff.rotation.y + 180;
    if(gameStarted && stuff.health) {
      if(stuff.health < 51) {
        player.nameEntity.setAttribute("color", "yellow")
      } else if(stuff.health < 21) {
        player.nameEntity.setAttribute("color", "red")
      } else {
        player.nameEntity.setAttribute("color", "lime")
      }
      player.nameEntity.setAttribute("value", player.name+" health: "+stuff.health)
    }
    if (player.movementState !== stuff.movementState) {
      player.movementState = stuff.movementState;

      if (player.movementState === 'jumping' && player.currentModel !== "#jumpingSweater") {
        player.entity.setAttribute("move", "clip: Jumping");
        player.currentModel = "#jumpingSweater";
      } else if (player.movementState === 'running_forward' && player.currentModel !== "#runningSweater") {
        player.entity.setAttribute("move", "clip: Running");
        player.currentModel = "#runningSweater";
      } else if (player.movementState === 'running_left' && player.currentModel !== "#runningSweaterLeft") {
        player.entity.setAttribute("move", "clip: LeftRun");
        player.currentModel = "#runningSweaterLeft";
      } else if (player.movementState === 'running_right' && player.currentModel !== "#runningSweaterRight") {
        player.entity.setAttribute("move", "clip: RightRun");
        player.currentModel = "#runningSweaterRight";
      } else if (player.movementState === 'running_back' && player.currentModel !== "#runningSweaterBack") {
        player.entity.setAttribute("move", "clip: BackRun");
        player.currentModel = "#runningSweaterBack";
      } else if (player.movementState === 'walking' && player.currentModel !== "#walkingSweater") {
        player.entity.setAttribute("move", "clip: Idle");
        player.currentModel = "#walkingSweater";
      } else if (player.movementState === 'idle' && player.currentModel !== "#idleSweater") {
        player.entity.setAttribute("move", "clip: Idle");
        player.currentModel = "#idleSweater";
      }
    }
  }
});


function animatePlayers() {
  Object.keys(players).forEach((id) => {
    let player = players[id];
    let currentPosition = player.entity.getAttribute("position");
    let currentRotation = player.entity.getAttribute("rotation");

    currentPosition.x += (player.targetPosition.x - currentPosition.x) * smoothness;
    currentPosition.y += (player.targetPosition.y - currentPosition.y - 1) * smoothness;
    currentPosition.z += (player.targetPosition.z - currentPosition.z) * smoothness;

    currentRotation.y += (player.targetRotationY - currentRotation.y) * smoothness;

    player.entity.setAttribute("position", currentPosition);
    player.entity.setAttribute("rotation", currentRotation);

    player.previousPosition = { ...player.targetPosition };
  });
  requestAnimationFrame(animatePlayers);
}

animatePlayers();
}
socket.on("change id", ()=>{
  localStorage.setItem("playerId", generateRandomString(20))
  alert("An error occurred, try joining the game again.")
  window.location.href = "/play"
})
socket.on("kick", ()=>{
  window.location.href = "/play"
})