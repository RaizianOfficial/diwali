class MockFileReader {
  constructor() {
    this.result = null;
    this.onloadend = null;
  }
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = 'data:application/octet-stream;base64,' + Buffer.from(buf).toString('base64');
      if (this.onloadend) this.onloadend();
    });
  }
}
globalThis.FileReader = MockFileReader;

const THREE = await import('three');
const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
const fs = await import('fs');

function exportGLB(object, animations, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object,
      (gltf) => {
        fs.writeFileSync(filename, Buffer.from(gltf));
        console.log(`Saved ${filename} (${gltf.byteLength} bytes)`);
        resolve();
      },
      (error) => reject(error),
      { binary: true, animations: animations || [] }
    );
  });
}

// 1. Create Rigged/Animated Player Model with 'Idle', 'Walk', 'Action'
async function createPlayerModel() {
  const root = new THREE.Group();
  root.name = 'player';

  // Body mesh
  const bodyGeo = new THREE.CylinderGeometry(0.26, 0.34, 0.85, 14);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.6 });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.name = 'Torso';
  bodyMesh.position.y = 0.95;
  bodyMesh.castShadow = true;
  root.add(bodyMesh);

  // Head mesh
  const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.8 });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.name = 'Head';
  headMesh.position.y = 1.62;
  headMesh.castShadow = true;
  root.add(headMesh);

  // Turban
  const turbanGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.22, 16);
  const turbanMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.5 });
  const turbanMesh = new THREE.Mesh(turbanGeo, turbanMat);
  turbanMesh.name = 'Turban';
  turbanMesh.position.y = 1.76;
  root.add(turbanMesh);

  // Left Leg
  const legGeo = new THREE.CapsuleGeometry(0.09, 0.4, 8, 12);
  const legMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.8 });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.name = 'LeftLeg';
  leftLeg.position.set(-0.15, 0.35, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.name = 'RightLeg';
  rightLeg.position.set(0.15, 0.35, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);

  // Left Arm
  const armGeo = new THREE.CapsuleGeometry(0.07, 0.38, 8, 12);
  const armMat = new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.6 });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.name = 'LeftArm';
  leftArm.position.set(-0.35, 1.1, 0);
  leftArm.castShadow = true;
  root.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.name = 'RightArm';
  rightArm.position.set(0.35, 1.1, 0);
  rightArm.castShadow = true;
  root.add(rightArm);

  // Golden Diya held in hand (Emissive for Bloom!)
  const diyaGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.06, 12);
  const diyaMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff7700,
    emissiveIntensity: 2.5,
    roughness: 0.3
  });
  const diya = new THREE.Mesh(diyaGeo, diyaMat);
  diya.name = 'Diya';
  diya.position.set(0.35, 0.82, 0.15);
  root.add(diya);

  // 1. Idle animation (gentle breathing & head bob)
  const idleTrackTorso = new THREE.VectorKeyframeTrack('Torso.position', [0, 1, 2], [
    0, 0.95, 0,
    0, 0.98, 0,
    0, 0.95, 0
  ]);
  const idleTrackHead = new THREE.VectorKeyframeTrack('Head.position', [0, 1, 2], [
    0, 1.62, 0,
    0, 1.65, 0,
    0, 1.62, 0
  ]);
  const idleClip = new THREE.AnimationClip('Idle', 2, [idleTrackTorso, idleTrackHead]);

  // 2. Walk animation (alternating leg and arm swing)
  const walkTimes = [0, 0.25, 0.5, 0.75, 1.0];
  const qLL = new THREE.Quaternion();
  const qRL = new THREE.Quaternion();
  const qLA = new THREE.Quaternion();
  const qRA = new THREE.Quaternion();

  const leftLegRotations = [];
  const rightLegRotations = [];
  const leftArmRotations = [];
  const rightArmRotations = [];

  for (let t of walkTimes) {
    const angle = Math.sin(t * Math.PI * 2) * 0.45;
    qLL.setFromAxisAngle(new THREE.Vector3(1, 0, 0), angle);
    qRL.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -angle);
    qLA.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -angle * 0.8);
    qRA.setFromAxisAngle(new THREE.Vector3(1, 0, 0), angle * 0.5);

    leftLegRotations.push(qLL.x, qLL.y, qLL.z, qLL.w);
    rightLegRotations.push(qRL.x, qRL.y, qRL.z, qRL.w);
    leftArmRotations.push(qLA.x, qLA.y, qLA.z, qLA.w);
    rightArmRotations.push(qRA.x, qRA.y, qRA.z, qRA.w);
  }

  const walkTrackLL = new THREE.QuaternionKeyframeTrack('LeftLeg.quaternion', walkTimes, leftLegRotations);
  const walkTrackRL = new THREE.QuaternionKeyframeTrack('RightLeg.quaternion', walkTimes, rightLegRotations);
  const walkTrackLA = new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', walkTimes, leftArmRotations);
  const walkTrackRA = new THREE.QuaternionKeyframeTrack('RightArm.quaternion', walkTimes, rightArmRotations);
  const walkClip = new THREE.AnimationClip('Walk', 1.0, [walkTrackLL, walkTrackRL, walkTrackLA, walkTrackRA]);

  // 3. Action animation (cheering and raising diya)
  const actionTimes = [0, 0.4, 0.8, 1.2];
  const actionLA = [];
  const actionRA = [];
  for (let t of actionTimes) {
    const armRaise = Math.sin((t / 1.2) * Math.PI) * 1.2;
    qLA.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -armRaise);
    qRA.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -armRaise);
    actionLA.push(qLA.x, qLA.y, qLA.z, qLA.w);
    actionRA.push(qRA.x, qRA.y, qRA.z, qRA.w);
  }
  const actionTrackLA = new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', actionTimes, actionLA);
  const actionTrackRA = new THREE.QuaternionKeyframeTrack('RightArm.quaternion', actionTimes, actionRA);
  const actionClip = new THREE.AnimationClip('Action', 1.2, [actionTrackLA, actionTrackRA]);

  await exportGLB(root, [idleClip, walkClip, actionClip], 'public/models/player.glb');
}

// 2. Create House Model (Low-poly Indian Haveli/Cottage)
async function createHouseModel() {
  const root = new THREE.Group();
  root.name = 'house';

  const wallMesh = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 3.6, 4),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
  );
  wallMesh.position.set(0, 1.8, -2.5);
  root.add(wallMesh);

  const roofMesh = new THREE.Mesh(
    new THREE.ConeGeometry(4.8, 1.8, 4),
    new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.8 })
  );
  roofMesh.position.set(0, 4.2, -2.5);
  roofMesh.rotation.y = Math.PI / 4;
  root.add(roofMesh);

  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.18, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 })
  );
  awning.position.set(0, 2.9, 0.7);
  awning.rotation.x = 0.2;
  root.add(awning);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.4, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 })
  );
  door.position.set(0, 1.3, -0.48);
  root.add(door);

  // Emissive Glowing Windows (Triggers Bloom)
  [-1.9, 1.9].forEach(x => {
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 1.1),
      new THREE.MeshStandardMaterial({
        color: 0xffb703,
        emissive: 0xffaa00,
        emissiveIntensity: 2.5,
        roughness: 0.2
      })
    );
    win.position.set(x, 1.6, -0.46);
    root.add(win);
  });

  await exportGLB(root, [], 'public/models/house.glb');
}

// 3. Create NPC Model with Idle Animation
async function createNPCModel() {
  const root = new THREE.Group();
  root.name = 'npc';

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.38, 1.3, 12),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7 })
  );
  body.name = 'NPCBody';
  body.position.set(0, 0.65, 0);
  root.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xedc4b3, roughness: 0.8 })
  );
  head.name = 'NPCHead';
  head.position.set(0, 1.72, 0);
  root.add(head);

  // Emissive Diya
  const diya = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.05, 0.06, 10),
    new THREE.MeshStandardMaterial({
      color: 0xff9900,
      emissive: 0xff7700,
      emissiveIntensity: 3.0
    })
  );
  diya.position.set(0.3, 1.15, 0.2);
  root.add(diya);

  const tTrack = new THREE.VectorKeyframeTrack('NPCBody.position', [0, 1.5, 3], [
    0, 0.65, 0,
    0, 0.68, 0,
    0, 0.65, 0
  ]);
  const npcIdle = new THREE.AnimationClip('Idle', 3, [tTrack]);

  await exportGLB(root, [npcIdle], 'public/models/npc.glb');
}

// 4. Create Swing Model (Jhula)
async function createJhulaModel() {
  const root = new THREE.Group();
  root.name = 'jhula';

  const crossBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3.8, 12),
    new THREE.MeshStandardMaterial({ color: 0x5c2405, roughness: 0.6 })
  );
  crossBeam.position.set(0, 3.6, 0);
  crossBeam.rotation.z = Math.PI / 2;
  root.add(crossBeam);

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.12, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.7 })
  );
  seat.position.set(0, 0.85, 0);
  root.add(seat);

  const cushion = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.08, 0.82),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 })
  );
  cushion.position.set(0, 0.93, 0);
  root.add(cushion);

  await exportGLB(root, [], 'public/models/jhula.glb');
}

async function main() {
  console.log('Generating GLTF / GLB models...');
  await createPlayerModel();
  await createHouseModel();
  await createNPCModel();
  await createJhulaModel();
  console.log('Successfully generated all GLB models in public/models/ !');
}

main().catch(err => console.error(err));
