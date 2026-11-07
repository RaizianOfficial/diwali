import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const MELA_BOUNDS = {
  minX: -28,
  maxX: 28,
  minZ: -28,
  maxZ: 28
};

/**
 * Pure Three.js Procedural Festive Character with PC Camera Controller
 * - Zero external .glb downloads (0 ms load time, super lightweight!)
 * - Articulated procedural limbs (legs, arms, torso, head, turban, diya)
 * - WASD / Arrow Keys + Shift (Sprint) + Space (Jump/Hop)
 * - Mouse Drag to Orbit Camera 360° + Mouse Wheel Zoom
 * - Smooth camera spring follow with directional look-ahead
 */
export default function Player({ onPositionChange }) {
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

  // Physics & movement state
  const position = useRef(new THREE.Vector3(0, 0, 10)); // Start in mela entrance avenue
  const velocity = useRef(new THREE.Vector3());
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(true);
  const targetRotationY = useRef(Math.PI);
  const currentRotationY = useRef(Math.PI);
  const walkCycle = useRef(0);
  const idleCycle = useRef(0);

  // Orbit Camera State (Mouse drag & wheel zoom)
  const cameraYaw = useRef(0); // Horizontal orbit angle (radians)
  const cameraPitch = useRef(0.28); // Vertical pitch angle (radians)
  const cameraDistance = useRef(5.8); // Distance from player (units)
  const targetCameraDistance = useRef(5.8);
  const isDraggingMouse = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Keyboard listeners for PC players
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent scrolling on space / arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
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
        case 'Space':
          if (isGrounded.current) {
            verticalVelocity.current = 6.2;
            isGrounded.current = false;
          }
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
  }, []);

  // Mouse Orbit & Zoom Controls for PC Players
  useEffect(() => {
    const dom = gl.domElement;

    const handleMouseDown = (e) => {
      // Left or Right Click Drag to Orbit
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

      // Orbit sensitivity
      cameraYaw.current -= deltaX * 0.005;
      cameraPitch.current = THREE.MathUtils.clamp(
        cameraPitch.current + deltaY * 0.004,
        0.05, // Minimum pitch (ground angle)
        1.15  // Maximum pitch (top-down view)
      );
    };

    const handleMouseUp = () => {
      isDraggingMouse.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      // Zoom in/out smoothly with scroll wheel
      targetCameraDistance.current = THREE.MathUtils.clamp(
        targetCameraDistance.current + e.deltaY * 0.005,
        3.2, // Close up third person
        11.0 // Wide mela view
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

  // Frame animation & physics loop
  useFrame((_, delta) => {
    if (!playerRef.current) return;

    // Movement calculation
    let inputX = 0;
    let inputZ = 0;

    if (keys.current.forward) inputZ -= 1;
    if (keys.current.backward) inputZ += 1;
    if (keys.current.left) inputX -= 1;
    if (keys.current.right) inputX += 1;

    const inputLen = Math.hypot(inputX, inputZ);
    const isMoving = inputLen > 0.1;
    const isSprinting = keys.current.sprint;
    const moveSpeed = isSprinting ? 8.5 : 5.0;

    if (isMoving) {
      const normX = inputX / inputLen;
      const normZ = inputZ / inputLen;

      // Calculate camera-relative movement direction
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw.current);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw.current);

      const moveDir = new THREE.Vector3()
        .addScaledVector(right, normX)
        .addScaledVector(forward, -normZ)
        .normalize();

      targetRotationY.current = Math.atan2(moveDir.x, moveDir.z);

      velocity.current.x = moveDir.x * moveSpeed;
      velocity.current.z = moveDir.z * moveSpeed;

      // Advance walk cycle
      walkCycle.current += delta * (isSprinting ? 14 : 9.5);
    } else {
      // Smooth deceleration
      velocity.current.x = THREE.MathUtils.damp(velocity.current.x, 0, 12, delta);
      velocity.current.z = THREE.MathUtils.damp(velocity.current.z, 0, 12, delta);
      idleCycle.current += delta * 2.2;
    }

    // Gravity & Jump Physics
    if (!isGrounded.current) {
      verticalVelocity.current -= 17.5 * delta; // Gravity
      position.current.y += verticalVelocity.current * delta;

      if (position.current.y <= 0) {
        position.current.y = 0;
        verticalVelocity.current = 0;
        isGrounded.current = true;
      }
    }

    // Apply horizontal position
    position.current.x += velocity.current.x * delta;
    position.current.z += velocity.current.z * delta;

    // Constrain player within Mela boundaries
    position.current.x = THREE.MathUtils.clamp(position.current.x, MELA_BOUNDS.minX, MELA_BOUNDS.maxX);
    position.current.z = THREE.MathUtils.clamp(position.current.z, MELA_BOUNDS.minZ, MELA_BOUNDS.maxZ);

    playerRef.current.position.set(position.current.x, position.current.y, position.current.z);

    // Smoothly rotate character towards movement direction
    let angleDiff = targetRotationY.current - currentRotationY.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    currentRotationY.current += angleDiff * Math.min(delta * 14, 1);

    if (characterMeshRef.current) {
      characterMeshRef.current.rotation.y = currentRotationY.current;
    }

    // ==========================================
    // PROCEDURAL SKELETAL CHARACTER ANIMATIONS
    // ==========================================
    if (isMoving) {
      const walk = walkCycle.current;
      const legAmp = isSprinting ? 0.72 : 0.52;
      const armAmp = isSprinting ? 0.65 : 0.45;

      // Legs swing (hip pivots)
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(walk) * legAmp;
        rightLegRef.current.rotation.x = -Math.sin(walk) * legAmp;
      }

      // Arms counter-swing
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(walk) * armAmp;
        // Right hand carries the diya gently
        rightArmRef.current.rotation.x = (Math.sin(walk) * armAmp * 0.3) - 0.22;
      }

      // Torso step bounce & sprint lean
      if (torsoRef.current) {
        const bounce = Math.abs(Math.sin(walk * 2)) * (isSprinting ? 0.12 : 0.08);
        torsoRef.current.position.y = 0.65 + bounce;
        torsoRef.current.rotation.x = isSprinting ? 0.14 : 0.06;
        torsoRef.current.rotation.z = -velocity.current.x * 0.015; // Banking
      }

      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(walk * 2) * 0.04;
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

    if (onPositionChange) {
      onPositionChange([position.current.x, position.current.y, position.current.z]);
    }

    // ==========================================
    // CINEMATIC THIRD-PERSON SPRING CAMERA
    // ==========================================
    // Smooth camera distance interpolation (Zoom)
    cameraDistance.current = THREE.MathUtils.lerp(cameraDistance.current, targetCameraDistance.current, 0.1);

    // Compute spherical camera position based on yaw, pitch, distance
    const dist = cameraDistance.current;
    const pitch = cameraPitch.current;
    const yaw = cameraYaw.current;

    const offsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
    const offsetY = Math.sin(pitch) * dist + 1.2;
    const offsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;

    const targetCameraPos = new THREE.Vector3(
      position.current.x + offsetX,
      position.current.y + offsetY,
      position.current.z + offsetZ
    );

    // Smooth spring follow
    camera.position.lerp(targetCameraPos, 0.1);

    // Look at player torso/head
    const lookTarget = new THREE.Vector3(
      position.current.x,
      position.current.y + 1.25,
      position.current.z
    );
    camera.lookAt(lookTarget);
  });

  return (
    <group ref={playerRef} position={[0, 0, 10]}>
      {/* Soft Contact Shadow on Ground */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

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
