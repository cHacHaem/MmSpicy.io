AFRAME.registerComponent('player-controls', {
  init: function () {
    this.keys = {};
    this.baseForceAmount = 200;
    this.forceAmount = this.baseForceAmount;
    this.jumpForce = this.baseForceAmount;
    this.baseSpeedLimit = 7;
    this.speedLimit = this.baseSpeedLimit;
    this.canJump = false;
    this.touchingGround = false;

    this.boostDuration = 3000; // 2 seconds
    this.boostCooldown = 10000; // 5 seconds
    this.lastBoostTime = 0;
    this.boostActive = false;

    this.el.id = 'player';

    this.el.addEventListener('body-loaded', () => {
      const el = this.el;
      el.body.angularFactor.set(0, 0, 0);

      el.body.addEventListener('collide', (event) => {
        const contact = event.contact;
        const collidedEl = event.body.el;
        const contactNormal = new CANNON.Vec3();

        if (contact.bi.id === el.body.id) {
          contact.ni.negate(contactNormal);
        } else {
          contactNormal.copy(contact.ni);
        }

        const isGround = contactNormal.dot(new CANNON.Vec3(0, 1, 0)) > 0.5;
        if (isGround && collidedEl.className !== 'sphere') {
          this.touchingGround = true;
        }
      });
    });

    document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  this.keys[key] = true;

  if (key === 'shift') {
    const now = performance.now();
    const canBoost = now - this.lastBoostTime >= this.boostCooldown;

    if (canBoost && !this.boostActive) {
      this.forceAmount = this.baseForceAmount * 2.5;
      this.speedLimit = this.baseSpeedLimit * 2.5;
      this.boostActive = true;
      this.lastBoostTime = now;

      setTimeout(() => {
        this.forceAmount = this.baseForceAmount;
        this.speedLimit = this.baseSpeedLimit;
        this.boostActive = false;
      }, this.boostDuration);
    }
  }
});

document.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  this.keys[key] = false;
});

  },
  tick: function () {
    if (!this.el.body) return;

    const el = this.el;
    const camera = el.querySelector('#cam');
    const cameraWorldDirection = new THREE.Vector3();
    camera.object3D.getWorldDirection(cameraWorldDirection);
    cameraWorldDirection.y = 0;
    cameraWorldDirection.normalize();

    const force = new CANNON.Vec3();
    let movingSome = false;

    if (sceneLoaded3 === "done") {
      sceneLoaded3 = false;
      setTimeout(() => {
        sceneLoaded3 = true;
      }, 500);
    }

    if (sceneLoaded3) {
      if (this.keys['w'] || this.keys['arrowup']) {

        force.x -= cameraWorldDirection.x * this.forceAmount;
        force.z -= cameraWorldDirection.z * this.forceAmount;
        movingSome = true;
      }

      if (this.keys['s'] || this.keys['arrowdown']) {
        force.x += cameraWorldDirection.x * this.forceAmount;
        force.z += cameraWorldDirection.z * this.forceAmount;
        movingSome = true;
      }

      if (this.keys['a'] || this.keys['arrowleft']) {
        force.x -= cameraWorldDirection.z * this.forceAmount;
        force.z += cameraWorldDirection.x * this.forceAmount;
        movingSome = true;
      }

      if (this.keys['d'] || this.keys['arrowright']) {
        force.x += cameraWorldDirection.z * this.forceAmount;
        force.z -= cameraWorldDirection.x * this.forceAmount;
        movingSome = true;
      }

      if (this.keys[' '] && this.touchingGround) {
        force.y += this.jumpForce * 20;
        this.touchingGround = false;
      }

      if (!movingSome) {
        el.body.velocity.x = 0;
        el.body.velocity.z = 0;
      }

      if (!force.almostZero()) {
        el.body.applyForce(force, el.body.position);
        el.body.velocity.x = Math.min(el.body.velocity.x, this.speedLimit);
        el.body.velocity.z = Math.min(el.body.velocity.z, this.speedLimit);
      }
    }
  }
});
