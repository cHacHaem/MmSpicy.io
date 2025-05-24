AFRAME.registerComponent('blaster', {
  schema: {
    maxOffset: { type: 'number', default: 0.2 },
    followStrength: { type: 'number', default: 0.1 },
    returnSpeed: { type: 'number', default: 0.05 }
  },

  init: function () {
    this.cam = document.querySelector('#cam').object3D;
    this.lastCamPos = new THREE.Vector3();
    this.cam.getWorldPosition(this.lastCamPos);

    this.offset = new THREE.Vector3();
    this.originalLocalPos = new THREE.Vector3(0.4, -0.5, -1);
  },

  tick: function () {
    const currentCamPos = new THREE.Vector3();
    this.cam.getWorldPosition(currentCamPos);

    const velocity = new THREE.Vector3().subVectors(currentCamPos, this.lastCamPos);
    this.lastCamPos.copy(currentCamPos);
    this.offset.x -= velocity.x * this.data.followStrength;
    this.offset.y -= velocity.y * this.data.followStrength;
    this.offset.z -= velocity.z * this.data.followStrength;

    // Clamp sway range
    this.offset.clamp(
      new THREE.Vector3(-this.data.maxOffset, -this.data.maxOffset, -this.data.maxOffset),
      new THREE.Vector3(this.data.maxOffset, this.data.maxOffset, this.data.maxOffset)
    );

    // Smoothly return to neutral
    this.offset.lerp(new THREE.Vector3(0, 0, 0), this.data.returnSpeed);

    // Final position = original + sway
    const finalPos = new THREE.Vector3().addVectors(this.originalLocalPos, this.offset);
    this.el.object3D.position.copy(finalPos);
  }
});
