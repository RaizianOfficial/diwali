import React from 'react';
import * as THREE from 'three';
import { Stars } from '@react-three/drei';
import { MELA_BOUNDS } from './Player';

/**
 * Diwali Mela Stall (Dukaan) Component
 * Stylized wooden shop with striped awning canopy, lights, and items
 */
function MelaStall({ position = [0, 0, 0], rotation = [0, 0, 0], title = "Mithai", canopyColor = "#D90429", itemType = "sweets" }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wooden Shop Counter */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.0, 1.6]} />
        <meshStandardMaterial color="#5C2405" roughness={0.8} />
      </mesh>

      {/* Countertop Table */}
      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.08, 1.8]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.7} />
      </mesh>

      {/* 4 Wooden Support Canopy Posts */}
      {[-1.6, 1.6].map((x, i) =>
        [-0.7, 0.7].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 1.7, z]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 1.5, 8]} />
            <meshStandardMaterial color="#3E2723" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Striped Festive Canopy Awning */}
      <mesh position={[0, 2.6, 0]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[3.8, 0.35, 2.2]} />
        <meshStandardMaterial color={canopyColor} roughness={0.6} />
      </mesh>

      {/* Overhead Stall Light */}
      <pointLight position={[0, 2.2, 0]} color="#FFD700" intensity={1.8} distance={6} />

      {/* Stall Items / Merchandise */}
      {itemType === "sweets" && (
        <group position={[0, 1.1, 0]}>
          {/* Sweet Trays */}
          {[-1.0, 0, 1.0].map((x, idx) => (
            <group key={idx} position={[x, 0, 0.1]}>
              <mesh castShadow>
                <boxGeometry args={[0.7, 0.06, 0.5]} />
                <meshStandardMaterial color="#B8860B" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Sweets: Golden Laddoos / Barfi */}
              {[-0.18, 0, 0.18].map((sx, sIdx) => (
                <mesh key={sIdx} position={[sx, 0.07, 0]}>
                  <sphereGeometry args={[0.06, 8, 8]} />
                  <meshStandardMaterial color={idx === 1 ? '#FFF8DC' : '#FF9900'} roughness={0.4} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {itemType === "diyas" && (
        <group position={[0, 1.1, 0]}>
          {[-1.1, -0.4, 0.4, 1.1].map((x, idx) => (
            <group key={idx} position={[x, 0, 0.1]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.15, 0.08, 0.1, 10]} />
                <meshStandardMaterial color="#A0522D" roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.1, 0]}>
                <coneGeometry args={[0.04, 0.12, 8]} />
                <meshBasicMaterial color="#FFDD00" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {itemType === "lanterns" && (
        <group position={[0, 2.1, 0.8]}>
          {[-1.2, -0.4, 0.4, 1.2].map((x, idx) => (
            <group key={idx} position={[x, -0.2, 0]}>
              <mesh castShadow>
                <octahedronGeometry args={[0.2, 0]} />
                <meshStandardMaterial 
                  color={idx % 2 === 0 ? '#E11D48' : '#F59E0B'} 
                  emissive={idx % 2 === 0 ? '#BE123C' : '#D97706'} 
                  emissiveIntensity={1.2}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Stall Name Board */}
      <mesh position={[0, 2.9, 1.05]}>
        <boxGeometry args={[2.8, 0.4, 0.08]} />
        <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Grand Diwali Mela Entrance Arch (Pravesh Dwar)
 */
function MelaEntranceGate({ position = [0, 0, 24] }) {
  return (
    <group position={position}>
      {/* Left Pillar */}
      <group position={[-4, 3, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 6, 1.2]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3.4, 0]}>
          <coneGeometry args={[0.9, 1.0, 4]} rotation={[0, Math.PI / 4, 0]} />
          <meshStandardMaterial color="#7F1D1D" roughness={0.7} />
        </mesh>
      </group>

      {/* Right Pillar */}
      <group position={[4, 3, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 6, 1.2]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3.4, 0]}>
          <coneGeometry args={[0.9, 1.0, 4]} rotation={[0, Math.PI / 4, 0]} />
          <meshStandardMaterial color="#7F1D1D" roughness={0.7} />
        </mesh>
      </group>

      {/* Overhead Toran Arch Beam */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <boxGeometry args={[9.4, 1.0, 1.4]} />
        <meshStandardMaterial color="#991B1B" roughness={0.6} />
      </mesh>

      {/* Golden Banner Signboard */}
      <mesh position={[0, 5.5, 0.72]}>
        <boxGeometry args={[7.2, 0.7, 0.08]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Marigold Toran / Garland Hanging */}
      <mesh position={[0, 4.8, 0.75]}>
        <torusGeometry args={[3.2, 0.08, 8, 24, Math.PI]} rotation={[0, 0, Math.PI]} />
        <meshStandardMaterial color="#FF9900" roughness={0.5} />
      </mesh>

      {/* Grand Earthen Diyas flanking entrance */}
      {[-4, 4].map((x, i) => (
        <group key={i} position={[x, 0.3, 1.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.45, 0.2, 0.3, 16]} />
            <meshStandardMaterial color="#78350F" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <coneGeometry args={[0.16, 0.45, 10]} />
            <meshBasicMaterial color="#FFDD00" />
          </mesh>
          <pointLight position={[0, 0.6, 0]} color="#FFA500" intensity={2.5} distance={7} />
        </group>
      ))}
    </group>
  );
}

/**
 * Central Deepstambha (Tower of 108 Sacred Diwali Lamps)
 */
function Deepstambha({ position = [0, 0, 0] }) {
  const tiers = [
    { y: 0.5, radius: 2.2, diyas: 12 },
    { y: 1.5, radius: 1.8, diyas: 10 },
    { y: 2.5, radius: 1.4, diyas: 8 },
    { y: 3.5, radius: 1.0, diyas: 6 },
    { y: 4.5, radius: 0.6, diyas: 4 },
  ];

  return (
    <group position={position}>
      {/* Stone Base */}
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <cylinderGeometry args={[2.8, 3.2, 0.6, 24]} />
        <meshStandardMaterial color="#3E2723" roughness={0.85} />
      </mesh>

      {/* Central Carved Stone Pillar */}
      <mesh position={[0, 3.0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.6, 5.5, 16]} />
        <meshStandardMaterial color="#B8860B" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Tiered Brass Lamp Rings with Flickering Diyas */}
      {tiers.map((tier, idx) => (
        <group key={idx} position={[0, tier.y, 0]}>
          <mesh castShadow>
            <torusGeometry args={[tier.radius, 0.08, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Diyas on the ring perimeter */}
          {Array.from({ length: tier.diyas }).map((_, dIdx) => {
            const angle = (dIdx / tier.diyas) * Math.PI * 2;
            const dx = Math.cos(angle) * tier.radius;
            const dz = Math.sin(angle) * tier.radius;
            return (
              <mesh key={dIdx} position={[dx, 0.12, dz]}>
                <coneGeometry args={[0.06, 0.15, 6]} />
                <meshBasicMaterial color="#FFDD00" />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Top Golden Kalash Finial */}
      <mesh position={[0, 6.0, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Tower Radiance Glow */}
      <pointLight position={[0, 3.5, 0]} color="#FF9900" intensity={3.5} distance={16} />
    </group>
  );
}

/**
 * Traditional Decorated Indian Jhula (Swing)
 */
function FestiveJhula({ position = [-12, 0, 8], rotation = [0, 0.5, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* A-Frame Wooden Pillars */}
      {[-1.8, 1.8].map((x, i) => (
        <group key={i} position={[x, 1.8, 0]}>
          <mesh rotation={[0, 0, i === 0 ? -0.15 : 0.15]} castShadow>
            <cylinderGeometry args={[0.1, 0.14, 3.8, 10]} />
            <meshStandardMaterial color="#451A03" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Overhead Beam */}
      <mesh position={[0, 3.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 4.2, 12]} />
        <meshStandardMaterial color="#451A03" roughness={0.8} />
      </mesh>

      {/* Suspension Chains */}
      {[-0.9, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 2.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2.6, 8]} />
          <meshStandardMaterial color="#DAA520" metalness={0.8} />
        </mesh>
      ))}

      {/* Velvet Cushion Bench */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.15, 0.9]} />
        <meshStandardMaterial color="#991B1B" roughness={0.6} />
      </mesh>

      {/* Marigold Garland wrapped on frame */}
      <mesh position={[0, 3.6, 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 3.8, 8]} />
        <meshStandardMaterial color="#FF9900" roughness={0.5} />
      </mesh>

      {/* Warm Jhula Diya */}
      <pointLight position={[0, 3.2, 0.3]} color="#FFA500" intensity={1.5} distance={5} />
    </group>
  );
}

/**
 * Hanging String Fairy Lights (Overhead crisscrossing canopy)
 */
function FestiveGarland({ start, end, count = 7 }) {
  const p1 = new THREE.Vector3(...start);
  const p2 = new THREE.Vector3(...end);
  const colors = ['#FFD700', '#FF4500', '#00E5FF', '#FF007F', '#39FF14'];

  const lights = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const sag = Math.sin(t * Math.PI) * 1.1;
    const pos = new THREE.Vector3().lerpVectors(p1, p2, t);
    pos.y -= sag;
    lights.push({ pos: [pos.x, pos.y, pos.z], color: colors[i % colors.length] });
  }

  return (
    <group>
      {lights.map((l, idx) => (
        <group key={idx} position={l.pos}>
          <mesh>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshStandardMaterial 
              color={l.color} 
              emissive={l.color} 
              emissiveIntensity={2.5} 
            />
          </mesh>
          <pointLight color={l.color} intensity={0.65} distance={3.5} />
        </group>
      ))}
    </group>
  );
}

/**
 * Complete Diwali Mela Scene
 */
export default function MelaScene() {
  return (
    <>
      {/* Atmospheric Night Sky & Twinkling Stars */}
      <color attach="background" args={['#060817']} />
      <fog attach="fog" args={['#070a1c', 22, 65]} />
      
      <Stars 
        radius={60} 
        depth={35} 
        count={3000} 
        factor={4} 
        saturation={0.8} 
        fade 
        speed={1.5} 
      />

      {/* Lighting Architecture */}
      {/* 1. Ambient Moonlight / Night Radiance */}
      <ambientLight intensity={0.35} color="#4F46E5" />

      {/* 2. Main Directional Moonlight */}
      <directionalLight
        position={[16, 28, 16]}
        intensity={1.0}
        color="#C7D2FE"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={70}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0005}
      />

      {/* Warm Plaza Glow */}
      <pointLight position={[0, 4.5, 0]} intensity={1.8} color="#FF9900" distance={25} />

      {/* Mela Ground (Earthen / Terracotta Plaza) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[65, 65]} />
        <meshStandardMaterial color="#1E140C" roughness={0.92} />
      </mesh>

      {/* Central Cobblestone Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <ringGeometry args={[0, 8.5, 36]} />
        <meshStandardMaterial color="#2B1D12" roughness={0.8} />
      </mesh>

      {/* Giant Floor Rangoli Mandala */}
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

      {/* Central Deepstambha (Tower of Light) */}
      <Deepstambha position={[0, 0, 0]} />

      {/* Grand Entrance Gate */}
      <MelaEntranceGate position={[0, 0, 22]} />

      {/* Mela Stalls (West Side) */}
      <MelaStall position={[-12, 0, -6]} rotation={[0, 1.2, 0]} title="Mithai" canopyColor="#D90429" itemType="sweets" />
      <MelaStall position={[-14, 0, 2]} rotation={[0, 1.4, 0]} title="Diyas" canopyColor="#F59E0B" itemType="diyas" />

      {/* Mela Stalls (East Side) */}
      <MelaStall position={[12, 0, -6]} rotation={[0, -1.2, 0]} title="Kandil" canopyColor="#7C3AED" itemType="lanterns" />
      <MelaStall position={[14, 0, 2]} rotation={[0, -1.4, 0]} title="Puja" canopyColor="#059669" itemType="diyas" />

      {/* Festive Swing (Jhula) */}
      <FestiveJhula position={[-10, 0, 12]} rotation={[0, 0.4, 0]} />

      {/* Overhead Fairy Lights Garlands spanning the square */}
      <FestiveGarland start={[-12, 3.2, -6]} end={[0, 6.0, 0]} count={8} />
      <FestiveGarland start={[12, 3.2, -6]} end={[0, 6.0, 0]} count={8} />
      <FestiveGarland start={[-14, 3.2, 2]} end={[0, 6.0, 0]} count={8} />
      <FestiveGarland start={[14, 3.2, 2]} end={[0, 6.0, 0]} count={8} />
      <FestiveGarland start={[-4, 5.5, 22]} end={[-10, 3.2, 12]} count={7} />
      <FestiveGarland start={[4, 5.5, 22]} end={[12, 3.2, 10]} count={7} />

      {/* Festive Pathway Diya Clusters along entrance road */}
      {[-8, -4, 0, 4, 8].map((z, idx) => (
        <React.Fragment key={idx}>
          <group position={[-2.8, 0.05, 12 + z]}>
            <mesh>
              <cylinderGeometry args={[0.16, 0.08, 0.1, 10]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <coneGeometry args={[0.05, 0.14, 8]} />
              <meshBasicMaterial color="#FFDD00" />
            </mesh>
            <pointLight position={[0, 0.2, 0]} color="#FF9900" intensity={0.9} distance={3} />
          </group>
          <group position={[2.8, 0.05, 12 + z]}>
            <mesh>
              <cylinderGeometry args={[0.16, 0.08, 0.1, 10]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <coneGeometry args={[0.05, 0.14, 8]} />
              <meshBasicMaterial color="#FFDD00" />
            </mesh>
            <pointLight position={[0, 0.2, 0]} color="#FF9900" intensity={0.9} distance={3} />
          </group>
        </React.Fragment>
      ))}

      {/* Outer Boundary Wooden Fence */}
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
