import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Scene from './components/Scene';
import Player from './components/Player';
import Billboard from './components/Billboard';
import Firecracker from './components/Firecracker';
import UI from './components/UI';
import TouchCameraZone from './components/TouchCameraZone';
import { subscribeToTopContributors } from './firebase';
import { soundManager } from './utils/SoundManager';

// Drei KeyboardControls Keymap
const KEYBOARD_MAP = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'action', keys: ['KeyE'] },
];

export default function App() {
  // Firecracker placement & inventory state
  const [selectedFirecracker, setSelectedFirecracker] = useState('phuljhadi');
  const [placedFirecrackers, setPlacedFirecrackers] = useState([]);

  // Character position tracked in state for distance calculations
  const [playerPosition, setPlayerPosition] = useState([0, 0, 7]);

  // Mobile virtual joystick input state { x: [-1, 1], y: [-1, 1], active: boolean }
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0, active: false });

  // Camera yaw offset from right-side touch swipes
  const [cameraYawOffset, setCameraYawOffset] = useState(0);

  // Contributors for 3D Billboard Canvas Texture
  const [contributors, setContributors] = useState([]);

  // Proximity to Billboard triggers Razorpay modal (< 5 units)
  const [showContributeModal, setShowContributeModal] = useState(false);

  // Subscribe to Firestore Top 10 Contributors on mount
  useEffect(() => {
    const unsubscribe = subscribeToTopContributors((updatedList) => {
      setContributors(updatedList);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Check if player is near any unignited firecracker to show "Ignite" UI
  const nearestUnignitedFirecracker = useMemo(() => {
    for (const fc of placedFirecrackers) {
      if (!fc.isIgnited) {
        const dx = playerPosition[0] - fc.position[0];
        const dz = playerPosition[2] - fc.position[2];
        if (dx * dx + dz * dz < 3.2 * 3.2) {
          return fc;
        }
      }
    }
    return null;
  }, [placedFirecrackers, playerPosition]);

  // Handle Raycasted Click/Tap on Ground to place firecracker
  const handleGroundClick = useCallback((point) => {
    if (!selectedFirecracker) return;

    soundManager.playPlace();

    const newFirecracker = {
      id: 'fc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: selectedFirecracker,
      position: [point[0], 0, point[2]],
      isIgnited: false
    };

    setPlacedFirecrackers((prev) => [...prev, newFirecracker]);
  }, [selectedFirecracker]);

  // Mobile Friendly: Place directly in front of the player
  const handlePlaceAtPlayer = useCallback(() => {
    if (!selectedFirecracker) return;

    soundManager.playPlace();

    const newFirecracker = {
      id: 'fc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: selectedFirecracker,
      position: [playerPosition[0], 0, playerPosition[2] - 1.4],
      isIgnited: false
    };

    setPlacedFirecrackers((prev) => [...prev, newFirecracker]);
  }, [selectedFirecracker, playerPosition]);

  // Ignite firecracker
  const handleIgniteFirecracker = useCallback((id) => {
    setPlacedFirecrackers((prev) =>
      prev.map((fc) => (fc.id === id ? { ...fc, isIgnited: true } : fc))
    );
  }, []);

  // Ignite nearest from UI tap
  const handleIgniteNearest = useCallback(() => {
    if (nearestUnignitedFirecracker) {
      handleIgniteFirecracker(nearestUnignitedFirecracker.id);
    }
  }, [nearestUnignitedFirecracker, handleIgniteFirecracker]);

  // Remove finished firecracker
  const handleFirecrackerFinished = useCallback((id) => {
    setPlacedFirecrackers((prev) => prev.filter((fc) => fc.id !== id));
  }, []);

  // Billboard Proximity Change Callback
  const handleBillboardProximity = useCallback((isNear) => {
    setShowContributeModal(isNear);
  }, []);

  // Handle camera swipe rotation from right touch zone
  const handleCameraRotate = useCallback((deltaYaw) => {
    setCameraYawOffset(deltaYaw);
    setTimeout(() => setCameraYawOffset(0), 40);
  }, []);

  return (
    <KeyboardControls map={KEYBOARD_MAP}>
      <div className="relative w-full h-full bg-[#040714] select-none touch-none overflow-hidden">
        
        {/* 3D WebGL Canvas */}
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 4.5, 12], fov: 48, near: 0.1, far: 110 }}
          gl={{ 
            antialias: true, 
            alpha: false, 
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
          }}
        >
          <Suspense fallback={null}>
            {/* Environment, Ground, GLTF Houses, Diyas, Props */}
            <Scene
              onGroundClick={handleGroundClick}
              activeFirecrackerType={selectedFirecracker}
            />

            {/* Upgraded Skeletal Player Controller with useGLTF + useAnimations */}
            <Player 
              onPositionChange={setPlayerPosition} 
              joystickInput={joystickInput}
              cameraYawOffset={cameraYawOffset}
            />

            {/* Central 3D Billboard with 2D Canvas Leaderboard Texture */}
            <Billboard
              position={[0, 0, -2]}
              contributors={contributors}
              playerPosition={playerPosition}
              onProximityChange={handleBillboardProximity}
            />

            {/* Placed Firecrackers & Emissive Instanced Particles */}
            {placedFirecrackers.map((fc) => (
              <Firecracker
                key={fc.id}
                id={fc.id}
                type={fc.type}
                position={fc.position}
                playerPosition={playerPosition}
                isIgnited={fc.isIgnited}
                onIgnite={handleIgniteFirecracker}
                onFinished={handleFirecrackerFinished}
              />
            ))}

            {/* Post-Processing Pipeline: Bloom effect targeting high-emissive materials */}
            <EffectComposer disableNormalPass multisampling={0}>
              <Bloom
                luminanceThreshold={1.2}
                luminanceSmoothing={0.9}
                intensity={1.8}
                mipmapBlur
              />
            </EffectComposer>
          </Suspense>
        </Canvas>

        {/* Right-Side Touch Zone for 360° Camera Orbit on Mobile */}
        <TouchCameraZone onCameraRotate={handleCameraRotate} />

        {/* Modern Mobile Game HUD Overlays */}
        <UI
          activeFirecracker={selectedFirecracker}
          onSelectFirecracker={setSelectedFirecracker}
          showContributeModal={showContributeModal}
          onCloseContributeModal={() => setShowContributeModal(false)}
          nearFirecrackerToIgnite={!!nearestUnignitedFirecracker}
          onManualIgniteNearest={handleIgniteNearest}
          onPlaceAtPlayer={handlePlaceAtPlayer}
          onJoystickMove={setJoystickInput}
          onContributionSuccess={(newEntry) => {
            setContributors((prev) => {
              const updated = [...prev, { id: 'new-' + Date.now(), ...newEntry }];
              updated.sort((a, b) => b.amount - a.amount);
              return updated.slice(0, 10);
            });
          }}
        />
      </div>
    </KeyboardControls>
  );
}
