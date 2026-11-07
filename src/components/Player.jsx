import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { resolveMelaCollision } from '../utils/Collisions';
import { JHULA_CENTER } from './MelaScene';

export const MELA_BOUNDS = {
  minX: -28,
  maxX: 28,
  minZ: -28,
  maxZ: 28
};

/**
 * Procedural Festive Indian Character with Solid Collisions & Interactive Swing
 * - Real Collision Resolution: Character cannot clip through stalls, pillars, or monuments!
 * - Functional Interactive Swing (Jhula): Press [E] when near to sit and swing!
 * - WASD Movement + Shift Sprint + Space Jump
 * - 360° Mouse Orbit Camera + Scroll Wheel Zoom
 */
export default function Player({ 
  onPositionChange, 
  isRidingJhula = false, 
  onToggleJhula, 
  swingTransform,
  swingTransformRef,
  onNearJhulaChange,
  joystickInputRef,
  touchCameraRef,
  jumpSignalRef,
  sprintSignalRef
}) {
  const playerRef = useRef();
  const characterMeshRef = useRef();
  const torsoRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const headRef = useRef();
  const diyaFlameRef = useRef();

  const { camera, gl } = useThree();

  // Keyboard input state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false
  });

  // Movement & physics state
  const position = useRef(new THREE.Vector3(0, 0, 10));
  const velocity = useRef(new THREE.Vector3());
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(true);
  const targetRotationY = useRef(Math.PI);
  const currentRotationY = useRef(Math.PI);
  const walkCycle = useRef(0);
  const idleCycle = useRef(0);
  const isNearJhulaRef = useRef(false);

  // Orbit Camera State
  const cameraYaw = useRef(0);
  const cameraPitch = useRef(0.28);
  const cameraDistance = useRef(5.8);
  const targetCameraDistance = useRef(5.8);
  const cameraTarget = useRef(new THREE.Vector3(0, 1.25, 10)); // Ultra-smooth lookAt target anchor
  const isDraggingMouse = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Keyboard listeners for PC Players
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // [E] Key: Mount / Dismount Swing
      if (e.code === 'KeyE') {
        if (isRidingJhula) {
          // Dismount
          if (onToggleJhula) onToggleJhula(false);
          position.current.set(JHULA_CENTER[0], 0, JHULA_CENTER[2] - 1.8);
        } else if (isNearJhulaRef.current) {
          // Mount
          if (onToggleJhula) onToggleJhula(true);
        }
        return;
      }

      // [Space] Key: Jump OR Dismount if riding swing
      if (e.code === 'Space') {
        if (isRidingJhula) {
          if (onToggleJhula) onToggleJhula(false);
          position.current.set(JHULA_CENTER[0], 0, JHULA_CENTER[2] - 1.8);
          verticalVelocity.current = 3.5;
          isGrounded.current = false;
          return;
        }
        if (isGrounded.current) {
          verticalVelocity.current = 6.2;
          isGrounded.current = false;
        }
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRidingJhula, onToggleJhula]);

  // Mouse Orbit & Scroll Zoom Controls
  useEffect(() => {
    const dom = gl.domElement;

    const handleMouseDown = (e) => {
      if (e.button === 0 || e.button === 2) {
        isDraggingMouse.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e) => {
      if (!isDraggingMouse.current) return;
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      cameraYaw.current -= deltaX * 0.005;
      cameraPitch.current = THREE.MathUtils.clamp(
        cameraPitch.current + deltaY * 0.004,
        0.05,
        1.15
      );
    };

    const handleMouseUp = () => {
      isDraggingMouse.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      targetCameraDistance.current = THREE.MathUtils.clamp(
        targetCameraDistance.current + e.deltaY * 0.005,
        3.2,
        11.0
      );
    };

    const handleContextMenu = (e) => e.preventDefault();

    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('contextmenu', handleContextMenu);

    return () => {
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gl]);

  // Main Physics, Collision & Animation Loop
  useFrame((_, delta) => {
    if (!playerRef.current) return;

    // 1. Consume Mobile Touch Camera Orbit & Pinch Zoom
    if (touchCameraRef && touchCameraRef.current) {
      if (touchCameraRef.current.yaw !== 0) {
        cameraYaw.current += touchCameraRef.current.yaw;
        touchCameraRef.current.yaw = 0;
      }
      if (touchCameraRef.current.pitch !== 0) {
        cameraPitch.current = THREE.MathUtils.clamp(
          cameraPitch.current + touchCameraRef.current.pitch,
          0.05,
          1.15
        );
        touchCameraRef.current.pitch = 0;
      }
      if (touchCameraRef.current.zoom !== 0) {
        targetCameraDistance.current = THREE.MathUtils.clamp(
          targetCameraDistance.current + touchCameraRef.current.zoom,
          3.2,
          11.0
        );
        touchCameraRef.current.zoom = 0;
      }
    }

    // 2. Consume Mobile Touch Jump Trigger
    if (jumpSignalRef && jumpSignalRef.current) {
      jumpSignalRef.current = false;
      if (isRidingJhula) {
        if (onToggleJhula) onToggleJhula(false);
        position.current.set(JHULA_CENTER[0], 0, JHULA_CENTER[2] - 1.8);
        verticalVelocity.current = 3.5;
        isGrounded.current = false;
      } else if (isGrounded.current) {
        verticalVelocity.current = 6.2;
        isGrounded.current = false;
      }
    }

    // Resolve swing transform reference (ref takes precedence to avoid React state re-renders)
    const currentSwing = (swingTransformRef && swingTransformRef.current) ? swingTransformRef.current : swingTransform;

    // ==========================================
    // CASE A: PLAYER RIDING THE SWING (JHULA)
    // ==========================================
    if (isRidingJhula && currentSwing) {
      // Snap player to swing seat position
      position.current.x = currentSwing.x;
      position.current.y = currentSwing.y + 0.15; // Seat elevation
      position.current.z = currentSwing.z;

      playerRef.current.position.set(position.current.x, position.current.y, position.current.z);

      if (characterMeshRef.current) {
        // Face forward on swing + tilt with pendulum swing angle
        characterMeshRef.current.rotation.y = 0;
        characterMeshRef.current.rotation.x = currentSwing.angle * 0.85;
      }

      // Sitting Pose: Legs dangling forward with inertia
      if (leftLegRef.current && rightLegRef.current) {
        const legSway = 1.35 - currentSwing.angle * 0.9;
        leftLegRef.current.rotation.x = legSway;
        rightLegRef.current.rotation.x = legSway;
      }

      // Hands holding swing chains
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -1.15;
        rightArmRef.current.rotation.x = -1.15;
      }

      // Smooth Camera tracking while on swing
      const swingTargetY = position.current.y + 1.1;
      const smoothLookAlpha = 1 - Math.exp(-12 * delta);
      cameraTarget.current.x = THREE.MathUtils.lerp(cameraTarget.current.x, position.current.x, smoothLookAlpha);
      cameraTarget.current.y = THREE.MathUtils.lerp(cameraTarget.current.y, swingTargetY, smoothLookAlpha);
      cameraTarget.current.z = THREE.MathUtils.lerp(cameraTarget.current.z, position.current.z, smoothLookAlpha);

      cameraDistance.current = THREE.MathUtils.damp(cameraDistance.current, 5.2, 8, delta);
      const dist = cameraDistance.current;
      const pitch = cameraPitch.current;
      const yaw = cameraYaw.current;

      const offsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
      const offsetY = Math.sin(pitch) * dist;
      const offsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;

      const desiredCamPos = new THREE.Vector3(
        cameraTarget.current.x + offsetX,
        cameraTarget.current.y + offsetY,
        cameraTarget.current.z + offsetZ
      );
      camera.position.lerp(desiredCamPos, 1 - Math.exp(-14 * delta));
      camera.lookAt(cameraTarget.current);

      if (onPositionChange) {
        onPositionChange([position.current.x, position.current.y, position.current.z]);
      }
      return;
    }

    // ==========================================
    // CASE B: NORMAL GROUND WALKING & RUNNING
    // ==========================================
    let inputX = 0;
    let inputZ = 0;

    // Keyboard Input (PC)
    if (keys.current.forward) inputZ -= 1;
    if (keys.current.backward) inputZ += 1;
    if (keys.current.left) inputX -= 1;
    if (keys.current.right) inputX += 1;

    // Mobile Virtual Joystick Input (Phones & Tablets)
    let isJoystickSprint = false;
    if (joystickInputRef && joystickInputRef.current && joystickInputRef.current.active) {
      inputX += joystickInputRef.current.x;
      inputZ -= joystickInputRef.current.y; // Inverted because joystick Y up is forward (-Z)
      if (joystickInputRef.current.sprint) {
        isJoystickSprint = true;
      }
    }

    const inputLen = Math.hypot(inputX, inputZ);
    const isMoving = inputLen > 0.08;
    const isSprinting = keys.current.sprint || (sprintSignalRef && sprintSignalRef.current) || isJoystickSprint;
    const moveSpeed = isSprinting ? 8.5 : 5.0;

    if (isMoving) {
      const normX = inputX / inputLen;
      const normZ = inputZ / inputLen;

      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw.current);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw.current);

      const moveDir = new THREE.Vector3()
        .addScaledVector(right, normX)
        .addScaledVector(forward, -normZ)
        .normalize();

      targetRotationY.current = Math.atan2(moveDir.x, moveDir.z);

      velocity.current.x = moveDir.x * moveSpeed;
      velocity.current.z = moveDir.z * moveSpeed;

      walkCycle.current += delta * (isSprinting ? 14 : 9.5);
    } else {
      velocity.current.x = THREE.MathUtils.damp(velocity.current.x, 0, 12, delta);
      velocity.current.z = THREE.MathUtils.damp(velocity.current.z, 0, 12, delta);
      idleCycle.current += delta * 2.2;
    }

    // Gravity & Jump Physics
    if (!isGrounded.current) {
      verticalVelocity.current -= 17.5 * delta;
      position.current.y += verticalVelocity.current * delta;

      if (position.current.y <= 0) {
        position.current.y = 0;
        verticalVelocity.current = 0;
        isGrounded.current = true;
      }
    }

    // Candidate next position
    const nextX = position.current.x + velocity.current.x * delta;
    const nextZ = position.current.z + velocity.current.z * delta;

    // ==========================================
    // SOLID OBJECT COLLISIONS (Wall-Sliding)
    // ==========================================
    const resolved = resolveMelaCollision(nextX, nextZ, 0.44);

    // Mela outer perimeter clamp
    position.current.x = THREE.MathUtils.clamp(resolved.x, MELA_BOUNDS.minX, MELA_BOUNDS.maxX);
    position.current.z = THREE.MathUtils.clamp(resolved.z, MELA_BOUNDS.minZ, MELA_BOUNDS.maxZ);

    playerRef.current.position.set(position.current.x, position.current.y, position.current.z);

    // Smooth character rotation towards movement direction
    let angleDiff = targetRotationY.current - currentRotationY.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    currentRotationY.current += angleDiff * Math.min(delta * 14, 1);

    if (characterMeshRef.current) {
      characterMeshRef.current.rotation.y = currentRotationY.current;
      characterMeshRef.current.rotation.x = 0;
    }

    // Procedural Walking / Running Animations (Smoothed, jitter-free bounce)
    if (isMoving) {
      const walk = walkCycle.current;
      const legAmp = isSprinting ? 0.72 : 0.52;
      const armAmp = isSprinting ? 0.65 : 0.45;

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(walk) * legAmp;
        rightLegRef.current.rotation.x = -Math.sin(walk) * legAmp;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(walk) * armAmp;
        rightArmRef.current.rotation.x = (Math.sin(walk) * armAmp * 0.3) - 0.22;
      }
      if (torsoRef.current) {
        const bounce = Math.abs(Math.sin(walk * 2)) * (isSprinting ? 0.045 : 0.025);
        torsoRef.current.position.y = 0.65 + bounce;
        torsoRef.current.rotation.x = isSprinting ? 0.10 : 0.04;
        torsoRef.current.rotation.z = -velocity.current.x * 0.01;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(walk * 2) * 0.02;
      }
    } else {
      // Idle Breathing
      const breath = Math.sin(idleCycle.current);
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.65 + breath * 0.015;
        torsoRef.current.rotation.x = 0;
        torsoRef.current.rotation.z = 0;
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.2);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.2);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, breath * 0.04, 0.1);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.22, 0.1);
      }
      if (headRef.current) {
        headRef.current.rotation.x = breath * 0.025;
      }
    }

    // Diya Flame Flicker
    if (diyaFlameRef.current) {
      const flicker = 0.9 + Math.random() * 0.25;
      diyaFlameRef.current.scale.set(flicker, flicker * 1.15, flicker);
    }

    // Check Jhula proximity
    const dxJhula = position.current.x - JHULA_CENTER[0];
    const dzJhula = position.current.z - JHULA_CENTER[2];
    const distJhula = Math.hypot(dxJhula, dzJhula);
    const nearJhula = distJhula < 2.8;

    if (nearJhula !== isNearJhulaRef.current) {
      isNearJhulaRef.current = nearJhula;
      if (onNearJhulaChange) {
        onNearJhulaChange(nearJhula);
      }
    }

    if (onPositionChange) {
      onPositionChange([position.current.x, position.current.y, position.current.z]);
    }

    // ==========================================
    // BUTTER-SMOOTH THIRD-PERSON ORBIT CAMERA
    // ==========================================
    // 1. Smoothly interpolate the anchor look-at target to eliminate rotational micro-stutters
    const targetLookY = position.current.y + 1.25;
    const lookAlpha = 1 - Math.exp(-14 * delta);
    cameraTarget.current.x = THREE.MathUtils.lerp(cameraTarget.current.x, position.current.x, lookAlpha);
    cameraTarget.current.y = THREE.MathUtils.lerp(cameraTarget.current.y, targetLookY, lookAlpha);
    cameraTarget.current.z = THREE.MathUtils.lerp(cameraTarget.current.z, position.current.z, lookAlpha);

    // 2. Framerate-independent zoom damping
    cameraDistance.current = THREE.MathUtils.damp(cameraDistance.current, targetCameraDistance.current, 10, delta);
    const dist = cameraDistance.current;
    const pitch = cameraPitch.current;
    const yaw = cameraYaw.current;

    const offsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
    const offsetY = Math.sin(pitch) * dist;
    const offsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;

    // 3. Anchor camera position directly to the smoothed cameraTarget
    const desiredCameraPos = new THREE.Vector3(
      cameraTarget.current.x + offsetX,
      cameraTarget.current.y + offsetY,
      cameraTarget.current.z + offsetZ
    );

    // 4. Smooth camera positional interpolation
    const camAlpha = 1 - Math.exp(-14 * delta);
    camera.position.lerp(desiredCameraPos, camAlpha);
    camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={playerRef} position={[0, 0, 10]}>
      {/* Contact Shadow (hidden while in air or riding swing) */}
      {!isRidingJhula && isGrounded.current && (
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 24]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>
      )}

      {/* Main Articulated Indian Character Avatar */}
      <group ref={characterMeshRef}>

        {/* Torso & Hip Assembly */}
        <group ref={torsoRef} position={[0, 0.65, 0]}>
          
          {/* Festive Saffron Kurta Body */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.34, 0.68, 14]} />
            <meshStandardMaterial color="#E65100" roughness={0.65} />
          </mesh>

          {/* Kurta Lower Flairs */}
          <mesh position={[0, 0.04, 0]} castShadow>
            <coneGeometry args={[0.38, 0.3, 14]} rotation={[Math.PI, 0, 0]} />
            <meshStandardMaterial color="#E65100" roughness={0.65} />
          </mesh>

          {/* Royal Golden Dupatta / Scarf */}
          <mesh position={[0, 0.62, 0.02]} rotation={[0.2, 0, 0]}>
            <torusGeometry args={[0.22, 0.06, 10, 20]} />
            <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Head & Pagri (Turban) Assembly */}
          <group ref={headRef} position={[0, 0.88, 0]}>
            {/* Friendly Chibi Head */}
            <mesh castShadow>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#F5CBA7" roughness={0.8} />
            </mesh>

            {/* Expressive Cartoon Eyes */}
            {[-0.07, 0.07].map((x, i) => (
              <group key={i} position={[x, 0.02, 0.17]}>
                <mesh>
                  <sphereGeometry args={[0.038, 10, 10]} />
                  <meshBasicMaterial color="#1E1E1E" />
                </mesh>
                <mesh position={[0.012, 0.012, 0.025]}>
                  <sphereGeometry args={[0.012, 8, 8]} />
                  <meshBasicMaterial color="#FFFFFF" />
                </mesh>
              </group>
            ))}

            {/* Royal Rajasthani Festive Pagri / Turban */}
            <group position={[0, 0.12, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.26, 0.22, 0.18, 16]} />
                <meshStandardMaterial color="#FFB703" roughness={0.5} />
              </mesh>
              <mesh position={[0, -0.04, 0]}>
                <torusGeometry args={[0.23, 0.05, 10, 20]} />
                <meshStandardMaterial color="#F77F00" roughness={0.5} />
              </mesh>
              {/* Golden Kalangi (Feather crest) */}
              <mesh position={[0, 0.16, 0.18]} rotation={[0.25, 0, 0]}>
                <coneGeometry args={[0.06, 0.2, 8]} />
                <meshStandardMaterial color="#D90429" metalness={0.7} roughness={0.2} />
              </mesh>
            </group>
          </group>

          {/* Left Arm (Pivots at shoulder) */}
          <group ref={leftArmRef} position={[-0.34, 0.62, 0]}>
            <mesh position={[0, -0.22, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.32, 8, 12]} />
              <meshStandardMaterial color="#E65100" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.42, 0]} castShadow>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color="#F5CBA7" />
            </mesh>
          </group>

          {/* Right Arm (Carries glowing Diya) */}
          <group ref={rightArmRef} position={[0.34, 0.62, 0]}>
            <mesh position={[0, -0.22, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.32, 8, 12]} />
              <meshStandardMaterial color="#E65100" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.42, 0]} castShadow>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color="#F5CBA7" />
            </mesh>

            {/* Glowing Earthen Diya in Hand */}
            <group position={[0, -0.44, 0.14]}>
              <mesh>
                <cylinderGeometry args={[0.08, 0.04, 0.05, 10]} />
                <meshStandardMaterial color="#8B4513" roughness={0.8} />
              </mesh>
              <mesh ref={diyaFlameRef} position={[0, 0.06, 0]}>
                <coneGeometry args={[0.03, 0.08, 8]} />
                <meshBasicMaterial color="#FFDD00" />
              </mesh>
              <pointLight position={[0, 0.1, 0]} color="#FFA500" intensity={1.8} distance={5} />
            </group>
          </group>

        </group>

        {/* Left Leg (Hip Pivot) */}
        <group ref={leftLegRef} position={[-0.14, 0.55, 0]}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.34, 8, 12]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.48, 0.05]} castShadow>
            <boxGeometry args={[0.13, 0.09, 0.22]} />
            <meshStandardMaterial color="#B8860B" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>

        {/* Right Leg (Hip Pivot) */}
        <group ref={rightLegRef} position={[0.14, 0.55, 0]}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.34, 8, 12]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.48, 0.05]} castShadow>
            <boxGeometry args={[0.13, 0.09, 0.22]} />
            <meshStandardMaterial color="#B8860B" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>

      </group>
    </group>
  );
}
