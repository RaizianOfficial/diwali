import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import MelaScene from './components/MelaScene';
import Player from './components/Player';
import UI from './components/UI';

/**
 * Lightweight, Ultra-Smooth 3D Diwali Mela Experience
 * - Pure Three.js procedural assets (0ms asset loading, zero heavy downloads)
 * - PC-First Third-Person Spring Camera with 360° Mouse Orbit & Scroll Zoom
 * - Decorated Indian Village Mela Square with Stalls, Rangoli, Deepstambha & Diyas
 */
export default function App() {
  const [playerPosition, setPlayerPosition] = useState([0, 0, 10]);

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
        {/* Festive Diwali Mela Decorated Environment */}
        <MelaScene />

        {/* Lightweight Pure Three.js Player with PC Camera Orbit Controls */}
        <Player onPositionChange={setPlayerPosition} />
      </Canvas>

      {/* Clean PC Controls Guide HUD */}
      <UI />
    </div>
  );
}
