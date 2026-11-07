import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import MelaScene from './components/MelaScene';
import Player from './components/Player';
import UI from './components/UI';

/**
 * 3D Diwali Mela Experience with Solid Collisions & Functional Interactive Jhula
 * High-performance 60fps loop with zero per-frame React state re-rendering
 */
export default function App() {
  const [isNearJhula, setIsNearJhula] = useState(false);
  const [isRidingJhula, setIsRidingJhula] = useState(false);

  // Shared mutable ref for 60fps swing physics (prevents 60Hz React re-render thrashing)
  const swingTransformRef = useRef({ x: -10, y: 1.1, z: 12, angle: 0 });

  const handleToggleJhula = useCallback((ride) => {
    setIsRidingJhula(ride);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#060817] select-none overflow-hidden">
      
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

        {/* Player with Wall-Sliding Collisions, Smooth Camera & Swing Mounting */}
        <Player 
          isRidingJhula={isRidingJhula}
          onToggleJhula={handleToggleJhula}
          swingTransformRef={swingTransformRef}
          onNearJhulaChange={setIsNearJhula}
        />
      </Canvas>

      {/* Clean PC HUD with Interactive Prompts */}
      <UI 
        isNearJhula={isNearJhula}
        isRidingJhula={isRidingJhula}
        onToggleJhula={handleToggleJhula}
      />
    </div>
  );
}
