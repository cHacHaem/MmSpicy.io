let sceneLoaded3;
AFRAME.registerComponent('player-controls', {
  init: function () {
    this.keys = {};
    this.forceAmount = 200; // Movement speed
    this.canJump = false;
    this.touchingGround = false;

    this.el.id = 'player'; // Ensure player ID is unique

    this.el.addEventListener('body-loaded', () => {
      const el = this.el;

      // Prevent rotation
      el.body.angularFactor.set(0, 0, 0);

      // Set up collision tracking
      this.collidingObjects = new Set(); // Track active collisions

     el.body.addEventListener('collide', (event) => {
  const contact = event.contact;
  const collidedEl = event.body.el;

  // Contact normal should point *away* from the other body
  const contactNormal = new CANNON.Vec3();
  if (contact.bi.id === el.body.id) {
    contact.ni.negate(contactNormal); // We're body A
  } else {
    contactNormal.copy(contact.ni); // We're body B
  }

  // If the normal points mostly *upward*, it's ground
  const isGround = contactNormal.dot(new CANNON.Vec3(0, 1, 0)) > 0.5;

  if (isGround && collidedEl.className !== 'sphere') {
    this.touchingGround = true;
  }
});

    });

    document.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
    });
  },
  tick: function () {
  if (!this.el.body) return;
    const el = this.el;
    const camera = el.querySelector('#cam'); // Camera element
    const cameraWorldDirection = new THREE.Vector3();
    camera.object3D.getWorldDirection(cameraWorldDirection); // Camera's forward direction
    cameraWorldDirection.y = 0; // Ignore vertical direction
    cameraWorldDirection.normalize();
    const force = new CANNON.Vec3();
    const forceAmount = this.forceAmount;
    let movingSome = false;
    if(sceneLoaded3 == "done") {
      sceneLoaded3 = false;
      setTimeout(()=>{
        sceneLoaded3 = true;
      }, 500)
    }
    if(sceneLoaded3) {
      if (this.keys['w'] || this.keys['ArrowUp']) {
        force.x -= cameraWorldDirection.x * forceAmount;
        force.z -= cameraWorldDirection.z * forceAmount;
      movingSome = true;
    }

    if (this.keys['s'] || this.keys['ArrowDown']) {
      force.x += cameraWorldDirection.x * forceAmount;
      force.z += cameraWorldDirection.z * forceAmount;
      movingSome = true;
    }

    if (this.keys['a'] || this.keys['ArrowLeft']) {
      force.x -= cameraWorldDirection.z * forceAmount;
      force.z += cameraWorldDirection.x * forceAmount;
      movingSome = true;
    }

    if (this.keys['d'] || this.keys['ArrowRight']) {
      force.x += cameraWorldDirection.z * forceAmount;
      force.z -= cameraWorldDirection.x * forceAmount;
      movingSome = true;
    }

    if (this.keys[' '] && this.touchingGround) {
      force.y += forceAmount * 20;
      this.touchingGround = false;
    }

    if (!movingSome) {
      el.body.velocity.x = 0;
      el.body.velocity.z = 0;
    }
    if (!force.almostZero()) {
      el.body.applyForce(force, el.body.position);
      const speedLimit = 7;
      el.body.velocity.x = Math.min(el.body.velocity.x, speedLimit);
      el.body.velocity.z = Math.min(el.body.velocity.z, speedLimit);
    }
    }
  },
});
function spawn() {
  let player = document.getElementById("player");

  function reSpawn() { 
      player.setAttribute("position", {x: 0, y: 5, z: 0});

    player.setAttribute("dynamic-body", {
      shape: "sphere",
      linearDamping: 0.9,
      angularDamping: 0.9
    });
  }

  reSpawn()

  setInterval(() => {
    if (player.getAttribute("position").y < -10) {
      player.removeAttribute("dynamic-body");
      reSpawn();
}})
  sceneLoaded3 = "done";
  }
setTimeout(spawn, 500)