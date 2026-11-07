import React from 'react';
import * as THREE from 'three';
import { Stars, Environment, SoftShadows } from '@react-three/drei';
import House from './House';
import NPC from './NPC';
import Jhula from './Jhula';
import { StreetDog, Diya, FestiveStringLights } from './Props';
import { WORLD_BOUNDS } from './Player';

/**
 * 3D Diwali Mela Environment & Scene
 * - Overhauled Lighting: Environment (preset="night") for ambient bounce lighting
 * - SoftShadows enabled + high-res moonlight directional shadows
 * - Refactored modular GLTF loaders for Houses, Swing, and NPCs
 * - Raycasted ground pointer handler for firecracker placement
 */
export default function Scene({ onGroundClick, activeFirecrackerType }) {
  const handleGroundPointerDown = (e) => {
    // Only capture ground clicks if a firecracker is selected
    if (!activeFirecrackerType) return;
    
    // Stop propagation so multiple raycasts don't trigger
    e.stopPropagation();
    
    const point = e.point;
    if (onGroundClick) {
      onGroundClick([point.x, 0, point.z]);
    }
  };

  return (
    <>
      {/* 1. Global Illumination & Ambient Bounce Lighting via Night Environment */}
      <Environment preset="night" background={false} environmentIntensity={0.4} />

      {/* 2. Soft Shadows Engine */}
      <SoftShadows size={20} samples={16} focus={0.5} />

      {/* Night Atmosphere, Celestial Stars & Fog */}
      <color attach="background" args={['#040714']} />
      <fog attach="fog" args={['#060919', 25, 70]} />
      
      <Stars 
        radius={70} 
        depth={40} 
        count={3500} 
        factor={5} 
        saturation={0.8} 
        fade 
        speed={1.5} 
      />

      {/* 3. Main Directional Moonlight casting high-resolution shadows */}
      <directionalLight
        position={[18, 32, 18]}
        intensity={1.1}
        color="#BFDBFE"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0004}
      />

      {/* Warm Golden Center Glow from Mela Celebrations */}
      <pointLight position={[0, 4, 0]} intensity={1.6} color="#FFA500" distance={24} />

      {/* Ground (Mela Earth Floor) - with Raycasting pointer handler */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onPointerDown={handleGroundPointerDown}
      >
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial 
          color="#1F1610" 
          roughness={0.95} 
          metalness={0.05}
        />
      </mesh>

      {/* Central Festive Cobblestone / Paver Circle under Billboard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -2]} receiveShadow>
        <ringGeometry args={[0, 7.5, 36]} />
        <meshStandardMaterial color="#291E14" roughness={0.85} />
      </mesh>

      {/* Refactored Houses using GLTF Loader (House.jsx) */}
      <House position={[-16, 0, -14]} rotation={[0, 0.6, 0]} />
      <House position={[16, 0, -14]} rotation={[0, -0.6, 0]} />
      <House position={[-17, 0, 12]} rotation={[0, 2.2, 0]} />
      <House position={[17, 0, 12]} rotation={[0, -2.2, 0]} />

      {/* Refactored Traditional Village Swing using GLTF Loader (Jhula.jsx) */}
      <Jhula position={[-9, 0, 3]} rotation={[0, 0.4, 0]} />

      {/* Resting Indian Street Dogs */}
      <StreetDog position={[-6.5, 0, 2.8]} rotation={[0, 0.8, 0]} />
      <StreetDog position={[11, 0, -5]} rotation={[0, -1.2, 0]} />

      {/* Refactored NPCs in Festive Traditional Clothing with Animations (NPC.jsx) */}
      <NPC position={[-4.5, 0, -6]} rotation={[0, 0.8, 0]} animationName="Idle" />
      <NPC position={[6.5, 0, -5]} rotation={[0, -0.9, 0]} animationName="Idle" />
      <NPC position={[-8, 0, 9]} rotation={[0, 0.2, 0]} animationName="Idle" />
      <NPC position={[8.5, 0, 6]} rotation={[0, -0.5, 0]} animationName="Idle" />

      {/* Decorative Pathway Diya Rows with Emissive Bloom */}
      {[-12, -8, -4, 4, 8, 12].map((x, idx) => (
        <React.Fragment key={idx}>
          <Diya position={[x, 0.05, 17]} />
          <Diya position={[x, 0.05, -19]} />
        </React.Fragment>
      ))}

      {/* Hanging Festive String Lights (Garlands) */}
      <FestiveStringLights start={[-14, 5.2, -10]} end={[0, 7, -2]} count={10} />
      <FestiveStringLights start={[14, 5.2, -10]} end={[0, 7, -2]} count={10} />
      <FestiveStringLights start={[-14, 5.2, 8]} end={[-9, 4.2, 3]} count={6} />
      <FestiveStringLights start={[14, 5.2, 8]} end={[0, 7, -2]} count={10} />

      {/* Mela Ground Invisible / Boundary Walls */}
      <mesh position={[0, 0.4, WORLD_BOUNDS.minZ - 0.2]} receiveShadow>
        <boxGeometry args={[WORLD_BOUNDS.maxX * 2 + 1, 0.8, 0.4]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.4, WORLD_BOUNDS.maxZ + 0.2]} receiveShadow>
        <boxGeometry args={[WORLD_BOUNDS.maxX * 2 + 1, 0.8, 0.4]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      <mesh position={[WORLD_BOUNDS.minX - 0.2, 0.4, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.8, WORLD_BOUNDS.maxZ * 2 + 1]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      <mesh position={[WORLD_BOUNDS.maxX + 0.2, 0.4, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.8, WORLD_BOUNDS.maxZ * 2 + 1]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
    </>
  );
}
