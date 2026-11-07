import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import MelaScene from './components/MelaScene';
import Player from './components/Player';
import UI from './components/UI';
import TouchCameraZone from './components/TouchCameraZone';

/**
 * 3D Diwali Mela Experience with Mobile-First Controls, Solid Collisions & Functional Jhula
 * High-performance 60fps loop with zero per-frame React state re-rendering
 */
export default function App() {
  const [isNearJhula, setIsNearJhula] = useState(false);
  const [isRidingJhula, setIsRidingJhula] = useState(false);
  const [isSprintActive, setIsSprintActive] = useState(false);

  // Shared mutable refs for 60fps inputs & physics (0 React re-renders)
  const swingTransformRef = useRef({ x: -10, y: 1.1, z: 12, angle: 0 });
  const joystickInputRef = useRef({ x: 0, y: 0, active: false, sprint: false });
  const touchCameraRef = useRef({ yaw: 0, pitch: 0, zoom: 0 });
  const jumpSignalRef = useRef(false);
  const sprintSignalRef = useRef(false);

  const handleToggleJhula = useCallback((ride) => {
    setIsRidingJhula(ride);
  }, []);

  const handleJump = useCallback(() => {
    jumpSignalRef.current = true;
  }, []);

  const handleToggleSprint = useCallback(() => {
    setIsSprintActive((prev) => {
      const next = !prev;
      sprintSignalRef.current = next;
      return next;
    });
  }, []);

  return (
    <div className="relative w-full h-full bg-[#060817] select-none overflow-hidden touch-none">
      
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 4.5, 16], fov: 48, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        {/* Festive Diwali Mela Scene with Functional Jhula */}
        <MelaScene 
          isPlayerRidingJhula={isRidingJhula}
          swingTransformRef={swingTransformRef}
        />

        {/* Player with Wall-Sliding Collisions, Smooth Camera & Mobile Joystick/Touch */}
        <Player 
          isRidingJhula={isRidingJhula}
          onToggleJhula={handleToggleJhula}
          swingTransformRef={swingTransformRef}
          onNearJhulaChange={setIsNearJhula}
          joystickInputRef={joystickInputRef}
          touchCameraRef={touchCameraRef}
          jumpSignalRef={jumpSignalRef}
          sprintSignalRef={sprintSignalRef}
        />
      </Canvas>

      {/* Invisible Touch Zone on Screen for 360° Camera Swipe & Pinch Zoom */}
      <TouchCameraZone touchCameraRef={touchCameraRef} />

      {/* Mobile-First Responsive HUD with Joystick, Action Buttons & Interactive Prompts */}
      <UI 
        isNearJhula={isNearJhula}
        isRidingJhula={isRidingJhula}
        onToggleJhula={handleToggleJhula}
        onJump={handleJump}
        isSprintActive={isSprintActive}
        onToggleSprint={handleToggleSprint}
        joystickInputRef={joystickInputRef}
      />
    </div>
  );
}
