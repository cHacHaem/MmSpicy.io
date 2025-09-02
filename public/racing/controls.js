AFRAME.registerComponent('raycast-vehicle', {
  schema: {
    maxEngineForce: { type: 'number', default: 1500 },
    maxBrakeForce: { type: 'number', default: 600 },
    maxSteerAngle: { type: 'number', default: 0.35 },
    downforceCoefficient: { type: 'number', default: 5 },
    tractionControlGain: { type: 'number', default: 0.5 },
    steeringSensitivity: { type: 'number', default: 1.0 }
  },

  init() {
   this.raycaster = new THREE.Raycaster();
    this.down = new THREE.Vector3(0, -1, 0);
    this.car = this.el;
    this.scene = this.el.sceneEl.object3D;

this.camera = this.el.querySelector('a-camera');
this.targetOffset = new THREE.Vector3(0, 3, 6); // behind car if +Z is forward
this.smoothedLocalPos = new THREE.Vector3();
this.smoothedLookAt = new THREE.Vector3();
this.grassCooldown = true;
    //vehicle setup
    this.wheelVisuals = [];
    this.wheelSpin = [0, 0, 0, 0];
    this.input = { targetThrottle: 0, currentThrottle: 0, targetSteer: 0, currentSteer: 0, braking: false };
    this.tmpVec = new CANNON.Vec3();
    this.downforce = new CANNON.Vec3();

    let bodyReady = false;
    let modelReady = false;
    this.speedFactor = 1.0; // default speed factor
    let body, chassisMesh;
    const tryInitVehicle = () => {
      if (!bodyReady || !modelReady) return;

      const vehicle = new CANNON.RaycastVehicle({
        chassisBody: body,
        indexUpAxis: 1,
        indexRightAxis: 0,
        indexForwardAxis: 2
      });

      const wheelPositions = [
        [-0.7, 0, -1.2],
        [ 0.7, 0, -1.2],
        [-0.7, 0,  1.2],
        [ 0.7, 0,  1.2]
      ];

      const baseWheelOptions = {
        radius: 0.4,
        directionLocal: new CANNON.Vec3(0, -1, 0),
        suspensionStiffness: 45,
        suspensionRestLength: 0.2,
        frictionSlip: 4,
        dampingRelaxation: 2,
        dampingCompression: 3,
        maxSuspensionForce: 1e4,
        rollInfluence: 0.1,
        axleLocal: new CANNON.Vec3(-1, 0, 0),
        maxSuspensionTravel: 0.25,
        customSlidingRotationalSpeed: -30
      };

      console.log('Scene graph:');

      const wheelNames = ['Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR'];

      wheelPositions.forEach((pos, i) => {
        vehicle.addWheel({
          ...baseWheelOptions,
          chassisConnectionPointLocal: new CANNON.Vec3(...pos)
        });

        const mesh = chassisMesh.getObjectByName(wheelNames[i]);
        if (!mesh) console.warn(`Wheel "${wheelNames[i]}" not found`);

        this.wheelVisuals[i] = { mesh, wrapper: new THREE.Object3D() };
        this.el.sceneEl.object3D.add(this.wheelVisuals[i].wrapper);
      });

      this.vehicle = vehicle;
      const world = this.el.sceneEl.systems.physics.driver.world;
      vehicle.addToWorld(world);

      this.bindControls();
    };

    this.el.addEventListener('body-loaded', () => {
      body = this.el.body;
      bodyReady = true;
      tryInitVehicle();
    });

    this.el.addEventListener('model-loaded', () => {
      chassisMesh = this.el.getObject3D('mesh');
      modelReady = true;
      tryInitVehicle();
    });
  },

  bindControls() {
    window.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();
      if (key === 'w') this.input.targetThrottle = 1;
      if (key === 's') this.input.targetThrottle = -1;
      if (key === 'a') this.input.targetSteer = 1;
      if (key === 'd') this.input.targetSteer = -1;
    });
    window.addEventListener('keyup', e => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 's') this.input.targetThrottle = 0;
      if (key === 'a' || key === 'd') this.input.targetSteer = 0;
    });
  },

  tick(time, delta) {
    stabilizeCar(this.el);
  let pos = new THREE.Vector3();
    this.car.object3D.getWorldPosition(pos);

    this.raycaster.set(pos, this.down);

    let intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      let hit = intersects[0].object.el;
      if (hit && hit.classList.contains("grass") && intersects[0].distance < 0.8 ) {
        this.speedFactor = 0.5;
        this.grassCooldown = false;
        setTimeout(() => { this.grassCooldown = true; }, 100); //
      } else {
        if(this.grassCooldown) {
          this.speedFactor = 1.0;
      }
    }
  }
// inside tick()
if (!this.camera) return;
let dt = delta / 1000;
// desired local offset behind & above the car
const desiredLocalPos = new THREE.Vector3(0, 3, 6); // adjust Y=height, Z=behind

// smooth camera movement (lerp)
this.smoothedLocalPos.lerp(desiredLocalPos, 1.5 * delta / 1000); 
this.camera.object3D.position.copy(this.smoothedLocalPos);

// make the camera look forward relative to the car

    //vehicle control
    if (!this.vehicle) return;
    const v = this.vehicle;
    const body = this.el.body;
    const schema = this.data;

    const lerp = (a, b, t) => a + (b - a) * Math.min(t, 1);
    this.input.currentThrottle = lerp(this.input.currentThrottle, this.input.targetThrottle, 6 * dt);
    this.input.currentSteer = lerp(this.input.currentSteer, this.input.targetSteer, 6 * dt);

    body.vectorToWorldFrame(new CANNON.Vec3(0, 0, 1), this.tmpVec);
    const forwardSpeed = body.velocity.dot(this.tmpVec);
    const speedFactor = Math.max(0, 1 - Math.abs(forwardSpeed) / 60);
if(this.speedFactor != 1) this.el.body.velocity.scale(0.95, this.el.body.velocity);
    let engineForce = this.input.currentThrottle * schema.maxEngineForce * speedFactor;
    const averageSlip = v.wheelInfos.reduce((sum, w) => sum + Math.abs(w.sliding), 0) / v.wheelInfos.length;
    if (averageSlip > 0.5) {
      engineForce *= (1 - schema.tractionControlGain * Math.min(1, averageSlip));
    }

    if (this.input.braking) {
      [0, 1, 2, 3].forEach(i => v.setBrake(schema.maxBrakeForce, i));
      [2, 3].forEach(i => v.applyEngineForce(0, i));
    } else {
      [0, 1, 2, 3].forEach(i => v.setBrake(0, i));

      [2, 3].forEach(i => v.applyEngineForce(engineForce, i));
    }

    const steerAngle = Math.sin(this.input.currentSteer * schema.steeringSensitivity * Math.PI / 2) * schema.maxSteerAngle;
    v.setSteeringValue(steerAngle, 0);
    v.setSteeringValue(steerAngle, 1);

    const dfMagnitude = schema.downforceCoefficient * forwardSpeed * forwardSpeed * 0.01;
    this.downforce.set(0, -Math.abs(dfMagnitude), 0);
    body.applyForce(this.downforce, body.position);

    v.wheelInfos.forEach((wheelInfo, idx) => {
      v.updateWheelTransform(idx);
      const t = wheelInfo.worldTransform;
      const { wrapper, mesh } = this.wheelVisuals[idx];
    
      // Position & rotation from physics
      wrapper.position.copy(t.position);
      wrapper.quaternion.copy(t.quaternion);
    
      if (mesh) {
        // Reset local rotation
        mesh.rotation.set(0, 0, 0);
    
        // Spin around X
        mesh.rotateX(-this.wheelSpin[idx]);
    
        // Add steering yaw for the FRONT wheels (0 = FL, 1 = FR)
        if (idx === 0 || idx === 1) {
          mesh.rotateY(this.input.currentSteer * schema.maxSteerAngle);
        }
      }
    
      // Update spin amount from physics
      const forwardVel = wheelInfo.deltaRotation / dt;
      this.wheelSpin[idx] += forwardVel * dt;
    });
    this.el.wheelRotations = this.wheelSpin.slice();
    
  }
});
function stabilizeCar(car) {
  const up = new CANNON.Vec3(0, 1, 0);
  const carUp = new CANNON.Vec3();

  car.body.quaternion.vmult(up, carUp);

  // dot product: 1 = perfectly upright, < 0.9 means tilted
  const dot = carUp.dot(up);

  if (dot < 0.9) {
    // corrective torque
    const correction = new CANNON.Vec3().cross(carUp, up);
    correction.scale(5, correction); // adjust "5" for strength
    car.body.torque.vadd(correction, car.body.torque);
  }
}