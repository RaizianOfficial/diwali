import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import MelaScene from './components/MelaScene';
import Player from './components/Player';
import UI from './components/UI';

/**
 * 3D Diwali Mela Experience with Solid Collisions & Functional Interactive Jhula
 */
export default function App() {
  const [playerPosition, setPlayerPosition] = useState([0, 0, 10]);
  const [isNearJhula, setIsNearJhula] = useState(false);
  const [isRidingJhula, setIsRidingJhula] = useState(false);
  const [swingTransform, setSwingTransform] = useState(null);

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
          onSwingTransformUpdate={setSwingTransform}
        />

        {/* Player with Wall-Sliding Collisions & Swing Mounting */}
        <Player 
          onPositionChange={setPlayerPosition}
          isRidingJhula={isRidingJhula}
          onToggleJhula={handleToggleJhula}
          swingTransform={swingTransform}
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
