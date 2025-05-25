/* global playerId socket player players params reSpawn */
let whoIt = "";
let done = false;
let health = 90;
let gameStarted = false;
let it = document.getElementById("it")
let map;
let cooldown;
let ring = document.getElementById("ring")
let healthEl = document.getElementById("health")
let sceneLoaded3 = false;
let timeLeftEl = document.getElementById("timeleft")
console.log("Hello! Please don't do any naughty stuff. I'm not going to try and stop you but I will remind you that if your cheating on a game like this it's just sad.")
socket.on("game start", (itFirst)=>{
  gameStarted = true;
})
if(params.get("join") == "random"){
  socket.emit("world", { world: "laser tag", id: playerId, name: name, room: "public" });
} else if(params.get("join") == "private") {
  if(params.get("privateroom") != "create") socket.emit("world", { world: "laser tag", id: playerId, name: name, room: "laserTag-private-"+params.get("privateroom")});
  if(params.get("privateroom") == "create") socket.emit("world", { world: "laser tag", id: playerId, name: name, room: "create", map: params.get("map"), time: params.get("time")});
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
    } else {
      console.error('Error loading file:', xhr.status);
    }
    //laser tag stuff
    AFRAME.registerComponent('shape-to-shootable', {
      init: function () {
        const el = this.el;
        console.log("shape-to-shootable initializing on:", el.id || el.tagName);
        
        // Check if the entity has attributes
        console.log("Entity attributes count:", el.attributes ? el.attributes.length : 0);
        
        // Loop through all attributes of the entity
        let shapesFound = 0;
        for (let key in el.attributes) {
          console.log("Checking attribute:", key);
          if (key.startsWith('shape__')) {
            shapesFound++;
            console.log("Found shape attribute:", key);
            const shapeData = el.getAttribute(key);
            console.log("Shape data:", shapeData);
            const shapeParams = this.parseShapeData(shapeData);
            console.log("Parsed shape params:", shapeParams);

            // Create a new entity based on the shape type
            let childEl;
            if (shapeParams.shape === 'box' && shapeParams.halfExtents) {
              console.log("Creating box with half extents:", shapeParams.halfExtents);
              childEl = document.createElement('a-box');
              childEl.setAttribute('width', shapeParams.halfExtents[0] * 2);
              childEl.setAttribute('height', shapeParams.halfExtents[1] * 2);
              childEl.setAttribute('depth', shapeParams.halfExtents[2] * 2);
            } else if (shapeParams.shape === 'sphere' && shapeParams.radius) {
              console.log("Creating sphere with radius:", shapeParams.radius);
              childEl = document.createElement('a-sphere');
              childEl.setAttribute('radius', shapeParams.radius);
            }

            if (childEl) {
              console.log("Adding shootable child element");
              childEl.setAttribute('class', 'shootable');
              childEl.setAttribute('material', 'opacity: 0.2; transparent: true');
              el.appendChild(childEl);
            } else {
              console.log("Failed to create child element for shape:", key);
            }
          }
        }
        console.log("Total shapes found:", shapesFound);
        if (shapesFound === 0) {
          console.log("No shape__ attributes found on this entity");
        }
      },

      parseShapeData: function (shapeData) {
        console.log("Parsing shape data:", shapeData);
        const shapeInfo = {};
        
        if (!shapeData) {
          console.log("Warning: shapeData is undefined or empty");
          return shapeInfo;
        }
        
        const params = shapeData.split(';');
        console.log("Split params:", params);
        
        params.forEach(param => {
          if (!param.includes(':')) {
            console.log("Warning: malformed parameter (no colon):", param);
            return;
          }
          
          const [key, value] = param.split(':').map(str => str.trim());
          console.log("Parsed key/value:", key, value);
          
          if (key === 'shape') {
            shapeInfo.shape = value;
          } else if (key === 'halfExtents') {
            const numbers = value.split(' ').map(Number);
            if (numbers.some(isNaN)) {
              console.log("Warning: invalid halfExtents values:", value);
            }
            shapeInfo.halfExtents = numbers;
          } else if (key === 'radius') {
            const radius = Number(value);
            if (isNaN(radius)) {
              console.log("Warning: invalid radius value:", value);
            }
            shapeInfo.radius = radius;
          }
        });
        
        console.log("Final shape info:", shapeInfo);
        return shapeInfo;
      }
    });


   AFRAME.registerComponent('raycaster-logger', {
  init: function () {
    const el = this.el;
    const sceneEl = el.sceneEl;
    const pointer = new THREE.Vector2(0, 0);

    window.addEventListener('click', () => {
      const raycaster = el.components.raycaster;
      if (!raycaster) return;

      // Get all meshes including instanced ones
      const objects = Array.from(document.querySelectorAll('.shootable')).map(el => {
        const mesh = el.getObject3D('mesh');
        if (mesh) {
          // Ensure mesh has reference to its element
          mesh.el = el;
          return mesh;
        }
        return null;
      }).filter(Boolean);

      raycaster.raycaster.setFromCamera(pointer, sceneEl.camera);
      const allIntersections = raycaster.raycaster.intersectObjects(objects, true);
      const intersects = allIntersections.filter(intersection => {
        const obj = intersection.object;
        while (obj && !obj.el) {
          obj.el = obj.parent ? obj.parent.el : null;
          if (!obj.parent) break;
          obj = obj.parent;
        }
        return obj && obj.el && (obj.el.classList.contains('shootable') || obj.el.classList.contains('player'));
      });

      if (intersects.length > 0) {
        const worldPos2 = new THREE.Vector3();
        el.object3D.getWorldPosition(worldPos2);

        socket.emit("zap", {end: intersects[0].point, start: worldPos2});
        const firstEl = intersects[0].object.el;
        if (firstEl && firstEl.classList.contains('player')) {
          socket.emit("player zapped", {zapper: playerId, zapped: firstEl.getAttribute("id")});
        }
      }
    });
  }
});


        document.querySelector('#shootRay').setAttribute('raycaster-logger', '');
    document.querySelector('#playerRay').setAttribute('raycaster-logger', '');
  };

  xhr.onerror = function() {
    console.error('Network error');
  };

  xhr.send();
}
socket.on("world", (world)=>{
  map = world.map;
  if(world.map == "forest") {
    insertHTMLFromFile("/laserTag/treeHouse.html")
    setTimeout(()=>{
    let map = document.getElementById("map")
    world.random.forEach((r)=>{
      let rock = document.createElement("a-entity")
  rock.setAttribute("mixin", "rock")
       rock.setAttribute("position", {x: r.xp, y: 0, z: r.yp})
      rock.setAttribute("scale", {x: r.xs, y: r.ys, z: r.zs})
      rock.setAttribute("class", "shootable")
  map.appendChild(rock)
    })
  }, 5000)
  } else if(world.map == "city") {
    insertHTMLFromFile("/laserTag/city.html")
  }  else if(world.map == "cave") {
    insertHTMLFromFile("/laserTag/cave.html")
  }  else if(world.map == "school") {
    insertHTMLFromFile("/laserTag/school.html")
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
socket.on("zap", (evt)=>{
  const line = document.createElement('a-entity');
    line.setAttribute('line', {
      start: `${evt.start.x} ${evt.start.y-0.01} ${evt.start.z}`,
      end: `${evt.end.x} ${evt.end.y} ${evt.end.z}`,
      color: 'red'
    });
    document.querySelector("a-scene").appendChild(line);
  setTimeout(()=>{
    document.querySelector("a-scene").removeChild(line);
  }, 250)
})
socket.on("player zapped", (evt) => {
  console.log(evt)
  if(playerId === evt.zapped && !cooldown) {
    health = health-10
    cooldown = true;
    setTimeout(()=>{
      cooldown = false;
    }, 1000)
    if(health < 51) ring.setAttribute("style", "stroke: yellow")
    if(health < 21) ring.setAttribute("style", "stroke: red")
   healthEl.setAttribute("style", "--percent: " + (-(1 - (health / 100))) + ";");
    if(health < 1) {
      reSpawn()
      socket.emit("player zapped out", evt)
      ring.setAttribute("style", "stroke: lime")
      health = 100;
      healthEl.setAttribute("style", "--percent: " + (-(1 - (health / 100))) + ";");

    }
  }
});