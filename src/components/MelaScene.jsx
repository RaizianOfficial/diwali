import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Stars } from '@react-three/drei';
import { MELA_BOUNDS } from './Player';

export const JHULA_CENTER = [-10, 0, 12];

/**
 * Functional Interactive Swing (Jhula)
 * - Harmonic physics-like pendulum oscillation
 * - Real wooden A-frame, brass chains, and embroidered velvet seat
 * - Supports mounting / sitting
 */
export function FunctionalJhula({ isPlayerRiding = false, onSwingTransformUpdate, swingTransformRef }) {
  const pivotRef = useRef();
  const seatRef = useRef();
  const worldPos = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!pivotRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Natural pendulum harmonic oscillation (swings higher if player is riding)
    const amplitude = isPlayerRiding ? 0.44 : 0.28;
    const frequency = 1.9;
    const angle = Math.sin(time * frequency) * amplitude;

    pivotRef.current.rotation.x = angle;
    // Force immediate world matrix update to ensure exact synchronous seat tracking
    pivotRef.current.updateMatrixWorld(true);

    if (seatRef.current) {
      seatRef.current.getWorldPosition(worldPos.current);
    }

    // Direct update to mutable ref (prevents React 60fps re-render storms)
    if (swingTransformRef && swingTransformRef.current) {
      swingTransformRef.current.x = worldPos.current.x;
      swingTransformRef.current.y = worldPos.current.y + 0.1; // Top of cushion
      swingTransformRef.current.z = worldPos.current.z;
      swingTransformRef.current.angle = angle;
    }

    // Optional callback for external listeners
    if (onSwingTransformUpdate) {
      onSwingTransformUpdate({
        x: worldPos.current.x,
        y: worldPos.current.y + 0.1,
        z: worldPos.current.z,
        angle: angle
      });
    }
  });

  return (
    <group position={JHULA_CENTER}>
      {/* Heavy Wooden A-Frame Left Supports */}
      <group position={[-2.1, 1.8, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, -0.16]} castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.16, 3.9, 12]} />
          <meshStandardMaterial color="#3E2723" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0.18, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.14, 3.9, 12]} />
          <meshStandardMaterial color="#3E2723" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[-0.18, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.14, 3.9, 12]} />
          <meshStandardMaterial color="#3E2723" roughness={0.7} />
        </mesh>
      </group>

      {/* Heavy Wooden A-Frame Right Supports */}
      <group position={[2.1, 1.8, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0.16]} castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.16, 3.9, 12]} />
          <meshStandardMaterial color="#3E2723" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0.18, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.14, 3.9, 12]} />
          <meshStandardMaterial color="#3E2723" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[-0.18, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.14, 3.9, 12]} />
          <meshStandardMaterial color="#3E2723" roughness={0.7} />
        </mesh>
      </group>

      {/* Overhead Carved Crossbeam */}
      <mesh position={[0, 3.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 4.8, 16]} />
        <meshStandardMaterial color="#4E2712" roughness={0.65} />
      </mesh>

      {/* Golden Floral Toran across top beam */}
      <mesh position={[0, 3.75, 0]}>
        <boxGeometry args={[4.2, 0.18, 0.18]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* PIVOT GROUP: Swaying chains & Seat */}
      <group ref={pivotRef} position={[0, 3.6, 0]}>
        {/* Brass Chains */}
        {[-1.0, 1.0].map((x, i) => (
          <group key={i} position={[x, -1.25, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.025, 0.025, 2.5, 8]} />
              <meshStandardMaterial color="#DAA520" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Chain links decoration */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((ly, j) => (
              <mesh key={j} position={[0, ly, 0]}>
                <torusGeometry args={[0.045, 0.015, 8, 12]} />
                <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Velvet & Carved Wood Swing Seat (Tracked precisely via seatRef) */}
        <group ref={seatRef} position={[0, -2.5, 0]}>
          {/* Wooden Bench Base */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.3, 0.14, 0.95]} />
            <meshStandardMaterial color="#3E2723" roughness={0.6} />
          </mesh>

          {/* Embroidered Royal Red Velvet Cushion */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[2.2, 0.1, 0.88]} />
            <meshStandardMaterial color="#881337" roughness={0.5} />
          </mesh>

          {/* Golden Brocade Border around cushion */}
          <mesh position={[0, 0.11, 0]}>
            <boxGeometry args={[2.24, 0.03, 0.92]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Ornate Backrest */}
          <mesh position={[0, 0.45, -0.44]} castShadow>
            <boxGeometry args={[2.2, 0.7, 0.08]} />
            <meshStandardMaterial color="#4E2712" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* Decorative Hanging Fairy Lights on Swing Frame */}
      <pointLight position={[0, 3.4, 0.3]} color="#FFA500" intensity={2.0} distance={6} />
    </group>
  );
}

/**
 * Highly Detailed Festive Indian Mela Stall (Dukaan)
 */
function DetailedMelaStall({ position = [0, 0, 0], rotation = [0, 0, 0], title = "Mithai", canopyColor = "#DC2626", stallType = "sweets" }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wooden Shop Counter with carved paneling */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.0, 1.8]} />
        <meshStandardMaterial color="#451A03" roughness={0.7} />
      </mesh>

      {/* Countertop Table */}
      <mesh position={[0, 1.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 0.1, 2.0]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>

      {/* 4 Sturdy Pillars */}
      {[-1.8, 1.8].map((x, i) =>
        [-0.8, 0.8].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 1.8, z]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 1.6, 10]} />
            <meshStandardMaterial color="#291206" roughness={0.8} />
          </mesh>
        ))
      )}

      {/* Fabric Striped Canopy Roof */}
      <mesh position={[0, 2.7, 0]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[4.2, 0.4, 2.4]} />
        <meshStandardMaterial color={canopyColor} roughness={0.5} />
      </mesh>

      {/* Scalloped Fabric Valance Fringe */}
      <mesh position={[0, 2.45, 1.15]}>
        <boxGeometry args={[4.2, 0.18, 0.04]} />
        <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Signboard Banner */}
      <mesh position={[0, 3.05, 1.15]} castShadow>
        <boxGeometry args={[3.0, 0.45, 0.08]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Overhead Warm Stall Chandelier Glow */}
      <pointLight position={[0, 2.3, 0]} color="#FFB703" intensity={2.2} distance={6} />

      {/* Detailed Stock Items */}
      {stallType === 'sweets' && (
        <group position={[0, 1.12, 0]}>
          {/* 3 Brass Trays */}
          {[-1.1, 0, 1.1].map((tx, idx) => (
            <group key={idx} position={[tx, 0, 0.1]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.42, 0.38, 0.05, 16]} />
                <meshStandardMaterial color="#DAA520" metalness={0.85} roughness={0.25} />
              </mesh>
              {/* Pyramid of Sweets (Laddoo / Kaju Katli) */}
              {[
                [-0.12, 0.08, -0.1], [0.12, 0.08, -0.1],
                [-0.12, 0.08, 0.1], [0.12, 0.08, 0.1],
                [0, 0.18, 0]
              ].map(([sx, sy, sz], sIdx) => (
                <mesh key={sIdx} position={[sx, sy, sz]} castShadow>
                  <sphereGeometry args={[0.065, 10, 10]} />
                  <meshStandardMaterial 
                    color={idx === 0 ? '#FF9900' : idx === 1 ? '#FFF8DC' : '#E11D48'} 
                    roughness={0.4} 
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {stallType === 'diyas' && (
        <group position={[0, 1.12, 0]}>
          {/* Terracotta Diya clusters & Rangoli pigment pots */}
          {[-1.2, -0.4, 0.4, 1.2].map((x, idx) => (
            <group key={idx} position={[x, 0, 0.1]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.2, 0.12, 0.14, 12]} />
                <meshStandardMaterial color="#8B4513" roughness={0.8} />
              </mesh>
              {/* Flame */}
              <mesh position={[0, 0.14, 0]}>
                <coneGeometry args={[0.05, 0.16, 8]} />
                <meshBasicMaterial color="#FFEA00" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {stallType === 'lanterns' && (
        <group position={[0, 2.2, 0.9]}>
          {/* Swaying Hanging Kandils */}
          {[-1.3, -0.45, 0.45, 1.3].map((x, idx) => (
            <group key={idx} position={[x, -0.25, 0]}>
              <mesh castShadow>
                <octahedronGeometry args={[0.24, 0]} />
                <meshStandardMaterial 
                  color={idx % 2 === 0 ? '#E11D48' : '#F59E0B'} 
                  emissive={idx % 2 === 0 ? '#BE123C' : '#D97706'} 
                  emissiveIntensity={1.4}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}

/**
 * Grand Royal Entrance Gate (Pravesh Dwar)
 */
function GrandEntranceGate({ position = [0, 0, 22] }) {
  return (
    <group position={position}>
      {/* Left Heavy Stone Carved Pillar */}
      <group position={[-4.2, 3.2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 6.4, 1.5]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} />
        </mesh>
        {/* Carved Toran Bracket */}
        <mesh position={[0.7, 2.5, 0]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[0.3, 1.4, 0.6]} />
          <meshStandardMaterial color="#991B1B" />
        </mesh>
        {/* Golden Kalash on top of pillar */}
        <mesh position={[0, 3.6, 0]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Right Heavy Stone Carved Pillar */}
      <group position={[4.2, 3.2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 6.4, 1.5]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} />
        </mesh>
        <mesh position={[-0.7, 2.5, 0]} rotation={[0, 0, -0.7]}>
          <boxGeometry args={[0.3, 1.4, 0.6]} />
          <meshStandardMaterial color="#991B1B" />
        </mesh>
        <mesh position={[0, 3.6, 0]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Overhead Royal Arch Beam */}
      <mesh position={[0, 6.0, 0]} castShadow>
        <boxGeometry args={[9.8, 1.2, 1.6]} />
        <meshStandardMaterial color="#991B1B" roughness={0.6} />
      </mesh>

      {/* Golden Welcome Signboard */}
      <mesh position={[0, 6.0, 0.84]} castShadow>
        <boxGeometry args={[7.6, 0.85, 0.08]} />
        <meshStandardMaterial color="#FFD700" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Hanging Golden Marigold Garlands */}
      <mesh position={[0, 5.2, 0.85]}>
        <torusGeometry args={[3.6, 0.1, 8, 24, Math.PI]} rotation={[0, 0, Math.PI]} />
        <meshStandardMaterial color="#FF9900" roughness={0.5} />
      </mesh>

      {/* Huge Welcoming Brass Diyas on stone pedestals */}
      {[-4.2, 4.2].map((x, i) => (
        <group key={i} position={[x, 0.4, 1.4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.5, 0.25, 0.35, 16]} />
            <meshStandardMaterial color="#DAA520" metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <coneGeometry args={[0.18, 0.48, 10]} />
            <meshBasicMaterial color="#FFDD00" />
          </mesh>
          <pointLight position={[0, 0.7, 0]} color="#FF9900" intensity={3.0} distance={8} />
        </group>
      ))}
    </group>
  );
}

/**
 * Grand Central Deepstambha (Tower of Light)
 */
function GrandDeepstambha({ position = [0, 0, 0] }) {
  const tiers = [
    { y: 0.6, radius: 2.3, count: 12 },
    { y: 1.6, radius: 1.9, count: 10 },
    { y: 2.6, radius: 1.5, count: 8 },
    { y: 3.6, radius: 1.1, count: 6 },
    { y: 4.6, radius: 0.7, count: 4 },
  ];

  return (
    <group position={position}>
      {/* Stepped Octagonal Stone Plinth */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.6, 0.4, 8]} />
        <meshStandardMaterial color="#2E1C12" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[2.7, 3.0, 0.4, 8]} />
        <meshStandardMaterial color="#3E2723" roughness={0.85} />
      </mesh>

      {/* Central Brass Carved Column */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.65, 5.8, 16]} />
        <meshStandardMaterial color="#B8860B" metalness={0.65} roughness={0.35} />
      </mesh>

      {/* Tiered Brass Rings with 108 Sacred Lamps */}
      {tiers.map((tier, idx) => (
        <group key={idx} position={[0, tier.y, 0]}>
          <mesh castShadow>
            <torusGeometry args={[tier.radius, 0.09, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.25} />
          </mesh>
          {Array.from({ length: tier.count }).map((_, dIdx) => {
            const angle = (dIdx / tier.count) * Math.PI * 2;
            const dx = Math.cos(angle) * tier.radius;
            const dz = Math.sin(angle) * tier.radius;
            return (
              <mesh key={dIdx} position={[dx, 0.12, dz]}>
                <coneGeometry args={[0.07, 0.18, 6]} />
                <meshBasicMaterial color="#FFDD00" />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Top Golden Kalash */}
      <mesh position={[0, 6.3, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Deepstambha Warm Sacred Glow */}
      <pointLight position={[0, 3.6, 0]} color="#FF9900" intensity={3.5} distance={18} />
    </group>
  );
}

/**
 * Overhead Hanging Fairy Light Garlands
 */
function OverheadGarlands() {
  const spans = [
    { start: [-12, 3.4, -6], end: [0, 6.2, 0], count: 8 },
    { start: [12, 3.4, -6], end: [0, 6.2, 0], count: 8 },
    { start: [-14, 3.4, 2], end: [0, 6.2, 0], count: 8 },
    { start: [14, 3.4, 2], end: [0, 6.2, 0], count: 8 },
    { start: [-4.2, 6.0, 22], end: [-10, 3.6, 12], count: 7 },
    { start: [4.2, 6.0, 22], end: [12, 3.4, 10], count: 7 },
  ];

  const colors = ['#FFD700', '#FF4500', '#00E5FF', '#FF007F', '#39FF14'];

  return (
    <group>
      {spans.map((span, sIdx) => {
        const p1 = new THREE.Vector3(...span.start);
        const p2 = new THREE.Vector3(...span.end);
        const bulbs = [];

        for (let i = 0; i <= span.count; i++) {
          const t = i / span.count;
          const sag = Math.sin(t * Math.PI) * 1.1;
          const pos = new THREE.Vector3().lerpVectors(p1, p2, t);
          pos.y -= sag;
          bulbs.push({ pos: [pos.x, pos.y, pos.z], color: colors[(sIdx + i) % colors.length] });
        }

        return (
          <group key={sIdx}>
            {bulbs.map((b, bIdx) => (
              <group key={bIdx} position={b.pos}>
                <mesh>
                  <sphereGeometry args={[0.11, 8, 8]} />
                  <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={2.5} />
                </mesh>
                <pointLight color={b.color} intensity={0.65} distance={3.5} />
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}

/**
 * Main Mela Scene Export
 */
export default function MelaScene({ 
  isPlayerRidingJhula = false, 
  onSwingTransformUpdate,
  swingTransformRef 
}) {
  return (
    <>
      {/* Sky & Atmosphere */}
      <color attach="background" args={['#060817']} />
      <fog attach="fog" args={['#070a1c', 22, 68]} />
      
      <Stars 
        radius={60} 
        depth={35} 
        count={3200} 
        factor={4} 
        saturation={0.8} 
        fade 
        speed={1.5} 
      />

      {/* Lighting Architecture */}
      <ambientLight intensity={0.35} color="#4F46E5" />

      {/* Main Moonlight with shadows */}
      <directionalLight
        position={[16, 28, 16]}
        intensity={1.1}
        color="#C7D2FE"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={70}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0004}
      />

      {/* Warm Plaza Light */}
      <pointLight position={[0, 4.5, 0]} intensity={1.8} color="#FF9900" distance={25} />

      {/* Mela Ground Plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[65, 65]} />
        <meshStandardMaterial color="#1E140C" roughness={0.92} />
      </mesh>

      {/* Cobblestone Circle around Central Deepstambha */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <ringGeometry args={[0, 8.5, 36]} />
        <meshStandardMaterial color="#2B1D12" roughness={0.8} />
      </mesh>

      {/* Concentric Floral Rangoli Mandala */}
      <group position={[0, 0.012, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 4.5, 36]} />
          <meshBasicMaterial color="#FFB703" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.5, 5.8, 36]} />
          <meshBasicMaterial color="#DC2626" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.8, 6.8, 36]} />
          <meshBasicMaterial color="#7C3AED" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Central Deepstambha */}
      <GrandDeepstambha position={[0, 0, 0]} />

      {/* Grand Entrance Gate */}
      <GrandEntranceGate position={[0, 0, 22]} />

      {/* Detailed Mela Stalls (West Side) */}
      <DetailedMelaStall position={[-12, 0, -6]} rotation={[0, 1.2, 0]} title="Mithai" canopyColor="#DC2626" stallType="sweets" />
      <DetailedMelaStall position={[-14, 0, 2]} rotation={[0, 1.4, 0]} title="Diyas" canopyColor="#F59E0B" stallType="diyas" />

      {/* Detailed Mela Stalls (East Side) */}
      <DetailedMelaStall position={[12, 0, -6]} rotation={[0, -1.2, 0]} title="Kandil" canopyColor="#7C3AED" stallType="lanterns" />
      <DetailedMelaStall position={[14, 0, 2]} rotation={[0, -1.4, 0]} title="Puja" canopyColor="#059669" stallType="diyas" />

      {/* Functional Interactive Swing (Jhula) */}
      <FunctionalJhula 
        isPlayerRiding={isPlayerRidingJhula} 
        onSwingTransformUpdate={onSwingTransformUpdate}
        swingTransformRef={swingTransformRef} 
      />

      {/* Overhead Garlands */}
      <OverheadGarlands />

      {/* Boundary Fences */}
      <mesh position={[0, 0.4, MELA_BOUNDS.minZ - 0.2]} receiveShadow>
        <boxGeometry args={[MELA_BOUNDS.maxX * 2 + 1, 0.8, 0.35]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.4, MELA_BOUNDS.maxZ + 0.2]} receiveShadow>
        <boxGeometry args={[MELA_BOUNDS.maxX * 2 + 1, 0.8, 0.35]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      <mesh position={[MELA_BOUNDS.minX - 0.2, 0.4, 0]} receiveShadow>
        <boxGeometry args={[0.35, 0.8, MELA_BOUNDS.maxZ * 2 + 1]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      <mesh position={[MELA_BOUNDS.maxX + 0.2, 0.4, 0]} receiveShadow>
        <boxGeometry args={[0.35, 0.8, MELA_BOUNDS.maxZ * 2 + 1]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
    </>
  );
}
