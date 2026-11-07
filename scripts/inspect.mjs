import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';

const buffer = fs.readFileSync('public/models/3b0x59dn.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  console.log('--- 3b0x59dn.glb Details ---');
  console.log('Scene children count:', gltf.scene.children.length);
  console.log('Animations count:', gltf.animations.length);
  gltf.animations.forEach((anim, i) => {
    console.log(`Animation [${i}]: "${anim.name}" (duration: ${anim.duration.toFixed(2)}s, tracks: ${anim.tracks.length})`);
  });
  let meshes = 0;
  let bones = 0;
  gltf.scene.traverse((child) => {
    if (child.isMesh || child.isSkinnedMesh) meshes++;
    if (child.isBone) bones++;
  });
  console.log(`Meshes: ${meshes}, Bones: ${bones}`);
}, (err) => console.error('Parse error:', err));
