import React from 'react';
import * as THREE from 'three';

/**
 * Traditional Village House with Courtyard ("Dura" / "Aangan")
 * Designed with low-poly geometries and structured for drop-in .glb replacement
 */
export function VillageHouse({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] }) {
  // To replace with GLTF:
  // const { scene } = useGLTF('/models/village_house.glb');
  // return <primitive object={scene.clone()} position={position} rotation={rotation} scale={scale} />;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main House Mud-Brick Structure */}
      <mesh position={[0, 1.8, -2.5]} castShadow receiveShadow>
        <boxGeometry args={[6.5, 3.6, 4]} />
        <meshStandardMaterial color="#B45309" roughness={0.9} />
      </mesh>

      {/* Terracotta Sloped Roof */}
      <mesh position={[0, 4.2, -2.5]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[4.8, 1.8, 4]} rotation={[0, Math.PI / 4, 0]} />
        <meshStandardMaterial color="#7F1D1D" roughness={0.8} />
      </mesh>

      {/* House Front Verandah (Ota / Dalan) */}
      <mesh position={[0, 0.2, 0.5]} receiveShadow>
        <boxGeometry args={[6.5, 0.4, 2.2]} />
        <meshStandardMaterial color="#92400E" roughness={0.95} />
      </mesh>

      {/* Verandah Pillars */}
      {[-2.8, -0.9, 0.9, 2.8].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 1.4]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 2.6, 12]} />
          <meshStandardMaterial color="#451A03" roughness={0.7} />
        </mesh>
      ))}

      {/* Verandah Awning Roof */}
      <mesh position={[0, 2.9, 0.7]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[6.8, 0.18, 2.2]} />
        <meshStandardMaterial color="#991B1B" roughness={0.75} />
      </mesh>

      {/* Front Entrance Wooden Door */}
      <mesh position={[0, 1.3, -0.48]}>
        <boxGeometry args={[1.4, 2.4, 0.08]} />
        <meshStandardMaterial color="#3E2723" roughness={0.8} />
      </mesh>

      {/* Warm Glowing Windows (Left & Right) */}
      {[-1.9, 1.9].map((x, i) => (
        <group key={i} position={[x, 1.6, -0.47]}>
          <mesh>
            <planeGeometry args={[1.0, 1.1]} />
            <meshBasicMaterial color="#FFB703" />
          </mesh>
          {/* Wooden Window Frame Grid */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[1.04, 0.06, 0.02]} />
            <meshStandardMaterial color="#3E2723" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.06, 1.14, 0.02]} />
            <meshStandardMaterial color="#3E2723" />
          </mesh>
        </group>
      ))}

      {/* Festive Marigold Toran over doorway */}
      <mesh position={[0, 2.48, -0.44]}>
        <boxGeometry args={[1.6, 0.15, 0.08]} />
        <meshStandardMaterial color="#FF9900" roughness={0.5} />
      </mesh>

      {/* Courtyard ("Dura" / Aangan) Boundary Low Mud Walls */}
      <mesh position={[-3.3, 0.4, 1.8]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.8, 4.5]} />
        <meshStandardMaterial color="#B45309" roughness={0.95} />
      </mesh>
      <mesh position={[3.3, 0.4, 1.8]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.8, 4.5]} />
        <meshStandardMaterial color="#B45309" roughness={0.95} />
      </mesh>

      {/* Courtyard Floor with Rangoli */}
      <group position={[0, 0.02, 2.5]}>
        {/* Rangoli base ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 1.4, 24]} />
          <meshBasicMaterial color="#FFB703" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.4, 1.8, 24]} />
          <meshBasicMaterial color="#DC2626" side={THREE.DoubleSide} />
        </mesh>
        {/* Diya at the center of courtyard rangoli */}
        <Diya position={[0, 0.05, 0]} />
      </group>

      {/* Diyas on the verandah steps */}
      <Diya position={[-2.4, 0.45, 1.4]} />
      <Diya position={[2.4, 0.45, 1.4]} />
    </group>
  );
}

/**
 * Traditional Indian Village Swing (Jhula)
 * Decorated with marigolds and fairy lights
 */
export function Jhula({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  // To replace with GLTF:
  // const { scene } = useGLTF('/models/jhula.glb');
  // return <primitive object={scene.clone()} position={position} rotation={rotation} />;

  return (
    <group position={position} rotation={rotation}>
      {/* Left A-Frame Pillars */}
      <mesh position={[-1.6, 1.8, 0]} rotation={[0, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 3.8, 12]} />
        <meshStandardMaterial color="#451A03" roughness={0.7} />
      </mesh>
      <mesh position={[-1.6, 1.8, 0]} rotation={[0, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 3.8, 12]} />
        <meshStandardMaterial color="#451A03" roughness={0.7} />
      </mesh>

      {/* Right A-Frame Pillars */}
      <mesh position={[1.6, 1.8, 0]} rotation={[0, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 3.8, 12]} />
        <meshStandardMaterial color="#451A03" roughness={0.7} />
      </mesh>
      <mesh position={[1.6, 1.8, 0]} rotation={[0, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 3.8, 12]} />
        <meshStandardMaterial color="#451A03" roughness={0.7} />
      </mesh>

      {/* Overhead Cross Beam */}
      <mesh position={[0, 3.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 3.8, 12]} />
        <meshStandardMaterial color="#5C2405" roughness={0.6} />
      </mesh>

      {/* Decorative Golden Arch / Carving */}
      <mesh position={[0, 3.75, 0]}>
        <boxGeometry args={[3.2, 0.15, 0.1]} />
        <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Brass Suspension Chains */}
      {[-0.9, 0.9].map((x, i) => (
        <group key={i} position={[x, 2.2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 2.6, 8]} />
            <meshStandardMaterial color="#DAA520" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Wooden Hanging Seat with Cushion */}
      <group position={[0, 0.85, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.12, 0.9]} />
          <meshStandardMaterial color="#3E2723" roughness={0.7} />
        </mesh>
        {/* Festive Red & Gold Velvet Cushion */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[1.9, 0.08, 0.82]} />
          <meshStandardMaterial color="#991B1B" roughness={0.5} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.45, -0.4]}>
          <boxGeometry args={[1.9, 0.7, 0.08]} />
          <meshStandardMaterial color="#3E2723" roughness={0.7} />
        </mesh>
      </group>

      {/* Small fairy lights strung on crossbeam */}
      <pointLight position={[0, 3.4, 0.2]} color="#FFA500" intensity={1.2} distance={4} />
    </group>
  );
}

/**
 * NPC Placeholder (Festive Villager / Devotee)
 * Structured for drop-in useGLTF('/models/npc.glb') replacement
 */
export function NPC({ position = [0, 0, 0], rotation = [0, 0, 0], role = 'villager', sariColor = '#E11D48' }) {
  // To replace with GLTF:
  // const { scene } = useGLTF(`/models/npc_${role}.glb`);
  // return <primitive object={scene.clone()} position={position} rotation={rotation} />;

  return (
    <group position={position} rotation={rotation}>
      {/* Lower Body / Sari / Kurta */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.38, 1.3, 12]} />
        <meshStandardMaterial color={sariColor} roughness={0.7} />
      </mesh>

      {/* Upper Torso */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.6, 12]} />
        <meshStandardMaterial color={sariColor} roughness={0.7} />
      </mesh>

      {/* Golden border pallu / scarf */}
      <mesh position={[0, 1.32, 0.08]} rotation={[0.3, 0, 0.2]}>
        <torusGeometry args={[0.24, 0.06, 8, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#EDC4B3" roughness={0.8} />
      </mesh>

      {/* Hair bun */}
      <mesh position={[0, 1.82, -0.1]}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
      </mesh>

      {/* Earthen diya in hand */}
      <group position={[0.28, 1.15, 0.24]}>
        <Diya position={[0, 0, 0]} scale={0.7} />
      </group>
    </group>
  );
}

/**
 * Street Dog Placeholder (Cute Indian indie dog resting near warmth)
 * Structured for drop-in useGLTF('/models/street_dog.glb') replacement
 */
export function StreetDog({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  // To replace with GLTF:
  // const { scene } = useGLTF('/models/street_dog.glb');
  // return <primitive object={scene.clone()} position={position} rotation={rotation} />;

  return (
    <group position={position} rotation={rotation}>
      {/* Torso (curled resting) */}
      <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.18, 0.5, 8, 16]} />
        <meshStandardMaterial color="#C28448" roughness={0.85} /> {/* Golden-brown Indian indie dog */}
      </mesh>

      {/* Head */}
      <mesh position={[0.38, 0.26, 0.08]} castShadow>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#A6672E" roughness={0.85} />
      </mesh>

      {/* Snout */}
      <mesh position={[0.5, 0.22, 0.12]} rotation={[0, -0.2, 0]}>
        <coneGeometry args={[0.07, 0.16, 8]} rotation={[0, 0, -Math.PI / 2]} />
        <meshStandardMaterial color="#804A1B" />
      </mesh>

      {/* Flop Ears */}
      <mesh position={[0.34, 0.36, 0.2]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.06, 0.14, 0.04]} />
        <meshStandardMaterial color="#663A13" />
      </mesh>
      <mesh position={[0.34, 0.36, -0.04]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.06, 0.14, 0.04]} />
        <meshStandardMaterial color="#663A13" />
      </mesh>

      {/* Curled Tail */}
      <mesh position={[-0.38, 0.2, -0.1]} rotation={[0.5, 0, 0.6]}>
        <cylinderGeometry args={[0.035, 0.045, 0.35, 8]} />
        <meshStandardMaterial color="#C28448" />
      </mesh>
    </group>
  );
}

/**
 * Earthen Diya (Earthen Lamp with glowing flickering flame)
 */
export function Diya({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Terracotta Clay Base */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.08, 0.1, 12]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* Diya Rim */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.15, 0.025, 8, 16]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </mesh>
      {/* Mustard Oil inside */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 12]} />
        <meshStandardMaterial color="#B8860B" roughness={0.3} />
      </mesh>
      {/* Glowing Teardrop Flame with Emissive Intensity for Bloom */}
      <mesh position={[0, 0.14, 0.04]}>
        <coneGeometry args={[0.05, 0.14, 8]} />
        <meshStandardMaterial 
          color="#FFEA00" 
          emissive="#FF7700" 
          emissiveIntensity={3.5} 
          toneMapped={false} 
        />
      </mesh>
      {/* Warm Point Light */}
      <pointLight position={[0, 0.22, 0.04]} color="#FF9900" intensity={1.2} distance={3.5} />
    </group>
  );
}

/**
 * Hanging String Lights (Kandil / Fairy Lights Garland)
 */
export function FestiveStringLights({ start = [-10, 5, -10], end = [10, 5, -10], count = 8 }) {
  const pStart = new THREE.Vector3(...start);
  const pEnd = new THREE.Vector3(...end);
  const lights = [];

  const colors = ['#FFD700', '#FF4500', '#00E5FF', '#FF007F', '#39FF14'];

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    // Catro-sag curve
    const sag = Math.sin(t * Math.PI) * 1.1;
    const pos = new THREE.Vector3().lerpVectors(pStart, pEnd, t);
    pos.y -= sag;
    lights.push({
      pos: [pos.x, pos.y, pos.z],
      color: colors[i % colors.length]
    });
  }

  return (
    <group>
      {lights.map((l, idx) => (
        <group key={idx} position={l.pos}>
          <mesh>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial 
              color={l.color} 
              emissive={l.color} 
              emissiveIntensity={3.0} 
              toneMapped={false} 
            />
          </mesh>
          <pointLight color={l.color} intensity={0.8} distance={3.5} />
        </group>
      ))}
    </group>
  );
}
