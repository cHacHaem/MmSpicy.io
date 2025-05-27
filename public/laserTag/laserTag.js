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
        
        let shapesFound = 0;
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
        
          if (attr.name && attr.name.startsWith('shape__')) {
            shapesFound++;
            const shapeData = el.getAttribute(attr.name);
            const shapeParams = shapeData;

            // Create a new entity based on the shape type
            let childEl;
            if (shapeParams.shape === 'box' && shapeParams.halfExtents) {
              childEl = document.createElement('a-box');
              childEl.setAttribute('width', shapeParams.halfExtents.x * 2);
              childEl.setAttribute('height', shapeParams.halfExtents.y * 2);
              childEl.setAttribute('depth', shapeParams.halfExtents.z * 2);
              if (shapeParams.offset) {
                childEl.setAttribute('position', shapeParams.offset);
              }
              if (shapeParams.orientation) {
                // Convert radians to degrees
                const rotation = {
                  x: -shapeParams.orientation.x * (180 / Math.PI),
                  y: -shapeParams.orientation.y * (180 / Math.PI),
                  z: -shapeParams.orientation.z * (180 / Math.PI)
                };
                childEl.setAttribute('rotation', rotation);
              }
            } else if (shapeParams.shape === 'sphere' && shapeParams.radius) {
              childEl = document.createElement('a-sphere');
              childEl.setAttribute('radius', shapeParams.radius);
              if (shapeParams.offset) {
                childEl.setAttribute('position', shapeParams.offset);
              }
               if (shapeParams.orientation) {
                // Convert radians to degrees
                const rotation = {
                  x: shapeParams.orientation.x * (180 / Math.PI),
                  y: shapeParams.orientation.y * (180 / Math.PI),
                  z: shapeParams.orientation.z * (180 / Math.PI)
                };
                childEl.setAttribute('rotation', rotation);
              }
            } else if (shapeParams.shape === 'cylinder' && shapeParams.radius && shapeParams.height) {
              childEl = document.createElement('a-cylinder');
              childEl.setAttribute('radius', shapeParams.radius);
              childEl.setAttribute('height', shapeParams.height);
              if (shapeParams.offset) {
                childEl.setAttribute('position', shapeParams.offset);
              }
              if (shapeParams.orientation) {
                // Convert radians to degrees
                const rotation = {
                  x: shapeParams.orientation.x * (180 / Math.PI),
                  y: shapeParams.orientation.y * (180 / Math.PI),
                  z: shapeParams.orientation.z * (180 / Math.PI)
                };
                childEl.setAttribute('rotation', rotation);
              }
            }

            if (childEl) {
              childEl.setAttribute('class', 'shootable');
              childEl.setAttribute('visible', false);
              el.appendChild(childEl);
            }
          }
        }
        if (shapesFound === 0) {
        }
      },

    });
   const entities = document.querySelectorAll('a-entity');

    entities.forEach(entity => {
      if (entity.hasAttribute('mixin')) {
        entity.setAttribute('shape-to-shootable', '');
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
        socket.emit("zap", {end: intersects[0].point, start: worldPos2, who: playerId});
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
  if(evt.who === playerId) {
    line.setAttribute('line', {
      start: `${evt.start.x} ${evt.start.y-0.01} ${evt.start.z}`,
      end: `${evt.end.x} ${evt.end.y} ${evt.end.z}`,
      color: 'red'
    });
  } else {
    line.setAttribute('line', {
      start: `${evt.start.x} ${evt.start.y-0.7} ${evt.start.z}`,
      end: `${evt.end.x} ${evt.end.y} ${evt.end.z}`,
      color: 'red'
    });
  }
    
    document.querySelector("a-scene").appendChild(line);
  setTimeout(()=>{
    document.querySelector("a-scene").removeChild(line);
  }, 250)
})
socket.on("player zapped", (evt) => {
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
      console.log("zapped out")
      socket.emit("player zapped out", evt)
      ring.setAttribute("style", "stroke: lime")
      health = 100;
      healthEl.setAttribute("style", "--percent: " + (-(1 - (health / 100))) + ";");

    }
  }
});