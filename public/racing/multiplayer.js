/* global io map playerId whoIt gameStarted skin showMessage */
const socket = io();

let players = {};
let smoothness = 0.1; 
function sceneLoaded() {
let cam = document.querySelector("#cam");
let scene = document.querySelector("a-scene");
let player = document.querySelector("#car");
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
const car = player;

// check if car is flipped
function checkFlipped() {
  if (!car.object3D) return false;

  // car's local up vector
  const carUp = new THREE.Vector3(0, 1, 0);
  carUp.applyQuaternion(car.object3D.quaternion);

  // world up
  const worldUp = new THREE.Vector3(0, 1, 0);

  // dot product (1 = upright, -1 = flipped upside down)
  const dot = carUp.dot(worldUp);

  return dot < 0; // true if flipped
}

// example: run every second
setInterval(() => {
  if (checkFlipped()) {
    console.log("flipped");
    setTimeout(() => {
      if(checkFlipped()) {
        car.setAttribute("dynamic-body", "mass", 0); 
    let pos = car.getAttribute("position");
    pos.y += 1;
    car.setAttribute("position", pos);
    car.setAttribute("rotation", {x: 0, y: car.getAttribute("rotation").y, z: 0});
    setTimeout(() => {  
car.setAttribute("dynamic-body", "mass", 800);
    }, 100);
      }
    }, 1000); // wait 3 seconds before resetting
  }
}, 1000);

function sendUpdate() {
  if (player.body && player.body.velocity) {
    const position = player.getAttribute("position");
    const rotation = player.getAttribute("rotation");
    position.y += 1; // Adjust for the car's height
    let updateObject = {
      id: playerId,
      position: position,
      rotation: rotation,
      wheels: player.wheelRotations,
    }
    if(!gameStarted) updateObject.skin = skin
    socket.emit("player update", updateObject);
  }
}
socket.emit("name", playerId)
  socket.on("name", (name1)=>{
    name = name1
  })
socket.on("player update", (stuff) => {
  if (stuff.id !== playerId && !(stuff.id in players)) {
    let newPlayer = document.createElement("a-entity");
    let newPlayerName = document.createElement("a-text")
    let newPlayerHitbox = document.createElement("a-box");
    newPlayerName.setAttribute("value", stuff.name)
    newPlayerName.setAttribute("align", "center")
    newPlayerName.setAttribute("position", {x: 0, y: 1.3, z: 0})
    newPlayerName.setAttribute("look-at", "#cam")
    newPlayer.setAttribute("gltf-model", "#marioCart");
    newPlayer.setAttribute("visible", "true");
    newPlayer.setAttribute("rotation", stuff.rotation);

    // if ghost, set transparent
    if(stuff.name.toLowerCase().includes("ghost")) {
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

    // Hitbox
    newPlayerHitbox.setAttribute("static-body", "true");
    newPlayerHitbox.setAttribute("visible", "false");
    newPlayerHitbox.setAttribute("scale", "1.5 0.4 3");
    newPlayerHitbox.setAttribute("position", "0 0.2 0");

    newPlayer.appendChild(newPlayerName)
    newPlayer.appendChild(newPlayerHitbox);

    players[stuff.id] = {
      entity: newPlayer,
      targetPosition: stuff.position,
      previousPosition: { ...stuff.position },
      targetRotation: stuff.rotation,
      currentModel: "#idleSweater",
      movementState: stuff.movementState,
      wheels: stuff.wheels || [0,0,0,0],   // wheel rotations
      wheelMeshes: []                      // store references later
    };

    // once model is loaded, grab wheel meshes
    newPlayer.addEventListener("model-loaded", () => {
      const mesh = newPlayer.getObject3D("mesh");
      if (mesh) {
        const wheelNames = ["Wheel_FL", "Wheel_FR", "Wheel_RL", "Wheel_RR"];
        wheelNames.forEach((name, i) => {
          const wheel = mesh.getObjectByName(name);
          if (wheel) {
            players[stuff.id].wheelMeshes[i] = wheel;
          }
        });
      }
    });

    scene.appendChild(newPlayer);
  } else if (stuff.id in players) {
    let player = players[stuff.id];
    player.targetPosition = stuff.position;
    player.targetRotation = stuff.rotation;
    player.wheels = stuff.wheels || player.wheels;

  }
});

function animatePlayers() {
  Object.keys(players).forEach((id) => {
    let player = players[id];
    let currentPosition = player.entity.getAttribute("position");
    let currentRotation = player.entity.getAttribute("rotation");
    // interpolate pos/rot
    currentPosition.x += (player.targetPosition.x - currentPosition.x) * smoothness;
    currentPosition.y += (player.targetPosition.y - currentPosition.y - 1) * smoothness;
    currentPosition.z += (player.targetPosition.z - currentPosition.z) * smoothness;
    currentRotation.x += (player.targetRotation.x - currentRotation.x) * smoothness;
    currentRotation.y += (player.targetRotation.y - currentRotation.y) * smoothness;
    currentRotation.z += (player.targetRotation.z - currentRotation.z) * smoothness;

    player.entity.setAttribute("position", currentPosition);
    player.entity.setAttribute("rotation", currentRotation);

    // update wheel visuals
    if (player.wheelMeshes && player.wheels) {
      player.wheelMeshes.forEach((wheel, i) => {
        if (!wheel) return;
        // reset local rotation
        wheel.rotation.set(0,0,0);
        // apply spin (around X)
        wheel.rotateX(-player.wheels[i]);
        // steering for front wheels
        if (i === 0 || i === 1) {
          // this is approximate, you can also send steer value from server if needed
          let steerAngle = (player.targetRotation.y - currentRotation.y) * 0.01;
          wheel.rotateY(steerAngle);
        }
      });
    }

    player.previousPosition = { ...player.targetPosition };
  });
  requestAnimationFrame(animatePlayers);
}

animatePlayers();
}
socket.on("kick", ()=>{
  showMessage({message: "You are currently on the game in another tab. Close that tab then join again.", id: "server", name: "server"})
    timeLeftEl.innerHTML = "";
  it.setAttribute("class", "it");
  it.innerHTML = "Try Again";
  setTimeout(()=>{
    window.location.href = "/play"
  }, 20000)
})
socket.emit("getName", playerId);
socket.on("getName", (name1) => {
  if (name1.name) {
    name = name1.name;
  } else {
    name = "";
  }
})
socket.on("banned", (banMes)=>{
    showMessage({message: banMes, id: "server", name: "server"})
    timeLeftEl.innerHTML = "";
  it.setAttribute("class", "it");
  it.innerHTML = "YOU ARE BANNED";
  setTimeout(()=>{
    window.location.href = "/play"
  }, 20000)
  })