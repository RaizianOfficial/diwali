import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

// Configurable model path for drop-in 3D rigged character
export const PLAYER_MODEL_PATH = '/models/player.glb';

export const WORLD_BOUNDS = {
  minX: -26,
  maxX: 26,
  minZ: -26,
  maxZ: 26
};

/**
 * Upgraded Character Controller & Skeletal Animation Mixer
 * - Loads external rigged .glb model using useGLTF
 * - Extracts and transitions animations ('Idle', 'Walk', 'Action') with useAnimations
 * - Drei's KeyboardControls + Mobile Joystick dual input
 * - Vector-based forward movement and MathUtils.lerp smooth camera follow
 * - Smooth mesh yaw rotation facing movement direction
 */
export default function Player({ 
  onPositionChange, 
  joystickInput = { x: 0, y: 0, active: false },
  cameraYawOffset = 0
}) {
  const groupRef = useRef();
  const characterMeshRef = useRef();
  const { camera } = useThree();

  // Drei Keyboard Controls Hook
  const [, getKeyboard] = useKeyboardControls();

  // Load external .glb model and extract animations
  const { scene, animations } = useGLTF(PLAYER_MODEL_PATH);

  // Auto-normalize scale and center model so any .glb matches standard human scale (~1.75m)
  const { clonedScene, modelScale } = useMemo(() => {
    const clone = scene.clone();

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Target human/character height: ~1.75 meters (units)
    const targetHeight = 1.75;
    const factor = size.y > 0 ? targetHeight / size.y : 1;

    // Center horizontally and align base to ground (y = 0)
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.x = -center.x * factor;
    clone.position.y = -box.min.y * factor;
    clone.position.z = -center.z * factor;

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return { clonedScene: clone, modelScale: factor };
  }, [scene]);

  // Drei Animation Mixer Hook
  const { actions, names } = useAnimations(animations, groupRef);

  // Current active animation state: 'Idle' | 'Walk' | 'Action'
  const [activeAnim, setActiveAnim] = useState('Idle');
  const prevAnimRef = useRef('Idle');

  // Physics & movement state
  const velocity = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3(0, 0, 7));
  const targetRotationY = useRef(Math.PI);
  const currentRotationY = useRef(Math.PI);
  const currentCameraYaw = useRef(0);
  const walkTime = useRef(0);

  // Smooth Skeletal Animation Transitions with cross-fading
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    // Resolve corresponding animation clip in the loaded .glb
    const findAction = (name) => {
      const lower = name.toLowerCase();
      const match = Object.keys(actions).find((k) => k.toLowerCase().includes(lower));
      return match ? actions[match] : actions[name];
    };

    const currentAction = findAction(activeAnim) || Object.values(actions)[0];
    const prevAction = findAction(prevAnimRef.current);

    if (currentAction) {
      if (prevAction && prevAction !== currentAction) {
        prevAction.fadeOut(0.25);
      }
      currentAction.reset().fadeIn(0.25).play();
      prevAnimRef.current = activeAnim;
    }
  }, [activeAnim, actions]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Read Drei Keyboard Controls
    const keyboard = getKeyboard();
    let inputX = 0;
    let inputZ = 0;

    if (keyboard.forward) inputZ -= 1;
    if (keyboard.backward) inputZ += 1;
    if (keyboard.left) inputX -= 1;
    if (keyboard.right) inputX += 1;

    // Combine with mobile virtual joystick input
    if (joystickInput && (joystickInput.x !== 0 || joystickInput.y !== 0)) {
      inputX = joystickInput.x;
      inputZ = -joystickInput.y;
    }

    const inputLen = Math.hypot(inputX, inputZ);
    const isMoving = inputLen > 0.08;
    const isSprinting = keyboard.sprint || inputLen > 0.85;

    // Update Camera Yaw with touch offset
    currentCameraYaw.current = THREE.MathUtils.lerp(
      currentCameraYaw.current,
      currentCameraYaw.current + cameraYawOffset,
      0.15
    );

    // Determine target animation state
    if (keyboard.action) {
      if (activeAnim !== 'Action') setActiveAnim('Action');
    } else if (isMoving) {
      if (activeAnim !== 'Walk') setActiveAnim('Walk');
    } else {
      if (activeAnim !== 'Idle') setActiveAnim('Idle');
    }

    // Movement Vector Calculation
    const moveSpeed = isSprinting ? 8.5 : 5.0;

    if (isMoving) {
      const normX = inputX / inputLen;
      const normZ = inputZ / inputLen;

      // Calculate camera-relative forward vector
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), currentCameraYaw.current);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), currentCameraYaw.current);

      const moveDirection = new THREE.Vector3()
        .addScaledVector(right, normX)
        .addScaledVector(forward, -normZ)
        .normalize();

      targetRotationY.current = Math.atan2(moveDirection.x, moveDirection.z);

      velocity.current.x = moveDirection.x * moveSpeed * Math.min(inputLen, 1);
      velocity.current.z = moveDirection.z * moveSpeed * Math.min(inputLen, 1);

      walkTime.current += delta * (isSprinting ? 14 : 9.5);
    } else {
      // Damping deceleration
      velocity.current.x = THREE.MathUtils.damp(velocity.current.x, 0, 12, delta);
      velocity.current.z = THREE.MathUtils.damp(velocity.current.z, 0, 12, delta);
    }

    // Apply movement & invisible bounding box constraints
    position.current.x += velocity.current.x * delta;
    position.current.z += velocity.current.z * delta;

    position.current.x = THREE.MathUtils.clamp(position.current.x, WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX);
    position.current.z = THREE.MathUtils.clamp(position.current.z, WORLD_BOUNDS.minZ, WORLD_BOUNDS.maxZ);

    groupRef.current.position.set(position.current.x, 0, position.current.z);

    // Smooth mesh rotation facing direction of movement
    let angleDiff = targetRotationY.current - currentRotationY.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    currentRotationY.current += angleDiff * Math.min(delta * 14, 1);

    if (characterMeshRef.current) {
      characterMeshRef.current.rotation.y = currentRotationY.current;

      // If the loaded model doesn't have embedded bone animations (e.g. static mesh),
      // provide smooth procedural walk bobbing so it still animates with life!
      if (!animations || animations.length === 0) {
        if (isMoving) {
          characterMeshRef.current.position.y = Math.abs(Math.sin(walkTime.current)) * 0.12;
          characterMeshRef.current.rotation.z = Math.sin(walkTime.current * 0.5) * 0.05;
        } else {
          characterMeshRef.current.position.y = Math.sin(walkTime.current * 0.5) * 0.02;
          characterMeshRef.current.rotation.z = 0;
        }
      }
    }

    // Report position for firecracker proximity and billboard checks
    if (onPositionChange) {
      onPositionChange([position.current.x, 0, position.current.z]);
    }

    // Smooth Camera Follow using MathUtils.lerp (closer, optimized third-person view)
    const cameraDistance = 5.6;
    const cameraHeight = 2.8;

    const targetCamX = position.current.x + Math.sin(currentCameraYaw.current) * cameraDistance;
    const targetCamZ = position.current.z + Math.cos(currentCameraYaw.current) * cameraDistance;
    const targetCamY = position.current.y + cameraHeight;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.1);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);

    const lookTarget = new THREE.Vector3(
      position.current.x,
      position.current.y + 1.1,
      position.current.z
    );
    camera.lookAt(lookTarget);
  });

  return (
    <group ref={groupRef} position={[0, 0, 7]}>
      {/* Ground Contact Shadow scaled to character base */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* External Rigged/GLTF Character Model with Auto-Scaled Size */}
      <group ref={characterMeshRef}>
        <primitive 
          object={clonedScene} 
          scale={[modelScale, modelScale, modelScale]} 
        />
      </group>

      {/* Festive Diya Aura Glow */}
      <pointLight position={[0, 1.2, 0.4]} color="#FFA500" intensity={1.5} distance={4.5} />
    </group>
  );
}

useGLTF.preload(PLAYER_MODEL_PATH);
