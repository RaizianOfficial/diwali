import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { soundManager } from '../utils/SoundManager';

const MAX_PARTICLES = 360; // Strictly under 500 limit for silky 60fps performance

/**
 * Individual Firecracker Component
 * Handles 3D Model, Fuse Countdown, Ignition, and Instanced Particle System
 */
export default function Firecracker({
  id,
  type = 'phuljhadi', // 'phuljhadi' | 'anaar' | 'chakri' | 'rocket'
  position = [0, 0, 0],
  playerPosition = [0, 0, 0],
  isIgnited = false,
  onIgnite,
  onFinished
}) {
  const groupRef = useRef();
  const instancedMeshRef = useRef();
  const lightRef = useRef();

  const [state, setState] = useState('placed'); // 'placed' | 'fusing' | 'active' | 'finished'
  const fuseProgress = useRef(0);
  const activeTime = useRef(0);
  const rocketAltitude = useRef(0);
  const rocketExploded = useRef(false);

  // Check if player is near to show "Press E" prompt
  const isPlayerNear = useMemo(() => {
    if (!playerPosition || state !== 'placed') return false;
    const dx = playerPosition[0] - position[0];
    const dz = playerPosition[2] - position[2];
    return dx * dx + dz * dz < 3.2 * 3.2;
  }, [playerPosition, position, state]);

  // Particles state storage
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particleColors = useMemo(() => {
    return [
      new THREE.Color('#FFD700'), // Gold
      new THREE.Color('#FF7700'), // Orange Saffron
      new THREE.Color('#FF2200'), // Fiery Red
      new THREE.Color('#FFF8DC'), // White-gold sparkle
      new THREE.Color('#00E5FF'), // Festive Cyan (for rocket)
      new THREE.Color('#FF007F'), // Magenta (for rocket)
    ];
  }, []);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      arr.push({
        pos: new THREE.Vector3(0, 0, 0),
        vel: new THREE.Vector3(0, 0, 0),
        life: 0,
        maxLife: 1.0,
        size: 0.1,
        colorIndex: Math.floor(Math.random() * particleColors.length)
      });
    }
    return arr;
  }, [particleColors]);

  // Handle External or Manual Ignition
  useEffect(() => {
    if (isIgnited && state === 'placed') {
      startIgnition();
    }
  }, [isIgnited]);

  const startIgnition = () => {
    if (state !== 'placed') return;
    setState('fusing');
    soundManager.playPlace(); // Click/fuse sound
  };

  // Keyboard 'E' listener when near
  useEffect(() => {
    if (!isPlayerNear || state !== 'placed') return;

    const handleKeyDown = (e) => {
      if (e.code === 'KeyE') {
        startIgnition();
        if (onIgnite) onIgnite(id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerNear, state, id, onIgnite]);

  // Update Animation & Particles
  useFrame((_, delta) => {
    if (state === 'fusing') {
      fuseProgress.current += delta;
      if (fuseProgress.current > 0.8) {
        // Fuse done, explode into action
        setState('active');
        activeTime.current = 0;
        
        // Trigger specific sound
        if (type === 'phuljhadi') soundManager.playPhuljhadi();
        if (type === 'anaar') soundManager.playAnaar();
        if (type === 'chakri') soundManager.playChakri();
        if (type === 'rocket') soundManager.playRocket();
      }
    }

    if (state === 'active') {
      activeTime.current += delta;

      // Handle Firecracker Duration & Finished State
      const maxDuration = type === 'rocket' ? 3.0 : 4.5;
      if (activeTime.current > maxDuration) {
        setState('finished');
        if (onFinished) onFinished(id);
        return;
      }

      // Dynamic Light Pulse / Bloom
      if (lightRef.current) {
        const pulse = 2.0 + Math.random() * 4.0;
        lightRef.current.intensity = pulse;
      }

      // Handle Chakri Rotation
      if (type === 'chakri' && groupRef.current) {
        groupRef.current.rotation.y += delta * 24;
      }

      // Handle Rocket Ascent
      if (type === 'rocket') {
        if (activeTime.current < 1.25) {
          // Ascending
          rocketAltitude.current += delta * 15;
          if (groupRef.current) {
            groupRef.current.position.y = position[1] + rocketAltitude.current;
          }
        } else {
          // Apex reached - rocket explodes
          rocketExploded.current = true;
          if (groupRef.current) {
            groupRef.current.visible = false; // Hide body on burst
          }
        }
      }

      // Update Instanced Particles
      if (instancedMeshRef.current) {
        const mesh = instancedMeshRef.current;
        let pCount = 0;

        for (let i = 0; i < MAX_PARTICLES; i++) {
          const p = particles[i];

          // Respawn or update particle
          if (p.life <= 0) {
            // Spawn condition based on type
            p.pos.set(0, 0, 0);

            if (type === 'phuljhadi') {
              // Omnidirectional spherical burst
              const theta = Math.random() * Math.PI * 2;
              const phi = Math.acos(Math.random() * 2 - 1);
              const speed = 1.5 + Math.random() * 3.5;
              p.vel.set(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.cos(phi) * speed,
                Math.sin(phi) * Math.sin(theta) * speed
              );
              p.pos.set(0, 0.45, 0);
              p.maxLife = 0.35 + Math.random() * 0.45;
              p.size = 0.08 + Math.random() * 0.08;
            } else if (type === 'anaar') {
              // Upward fountain spray
              const spread = 0.45;
              p.vel.set(
                (Math.random() - 0.5) * spread * 6.5,
                4.0 + Math.random() * 5.0,
                (Math.random() - 0.5) * spread * 6.5
              );
              p.pos.set((Math.random() - 0.5) * 0.1, 0.3, (Math.random() - 0.5) * 0.1);
              p.maxLife = 0.7 + Math.random() * 0.6;
              p.size = 0.09 + Math.random() * 0.1;
            } else if (type === 'chakri') {
              // Horizontal spinning vortex
              const angle = Math.random() * Math.PI * 2;
              const speed = 3.5 + Math.random() * 4.0;
              p.vel.set(Math.cos(angle) * speed, 0.2 + Math.random() * 0.4, Math.sin(angle) * speed);
              p.pos.set(0, 0.08, 0);
              p.maxLife = 0.35 + Math.random() * 0.4;
              p.size = 0.09;
            } else if (type === 'rocket') {
              if (!rocketExploded.current) {
                // Rocket tail trail
                p.vel.set((Math.random() - 0.5) * 0.8, -3.5 - Math.random() * 2, (Math.random() - 0.5) * 0.8);
                p.pos.set(0, rocketAltitude.current, 0);
                p.maxLife = 0.25;
                p.size = 0.08;
              } else {
                // Rocket Apex Grand Burst
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                const burstSpeed = 4.0 + Math.random() * 6.0;
                p.vel.set(
                  Math.sin(phi) * Math.cos(theta) * burstSpeed,
                  Math.cos(phi) * burstSpeed,
                  Math.sin(phi) * Math.sin(theta) * burstSpeed
                );
                p.pos.set(0, rocketAltitude.current, 0);
                p.maxLife = 0.8 + Math.random() * 0.6;
                p.size = 0.14 + Math.random() * 0.1;
              }
            }

            p.life = p.maxLife;
          } else {
            // Advance particle
            p.life -= delta;
            
            // Gravity
            if (type === 'anaar' || (type === 'rocket' && rocketExploded.current)) {
              p.vel.y -= 7.5 * delta;
            } else if (type === 'phuljhadi') {
              p.vel.y -= 2.0 * delta;
            }

            p.pos.addScaledVector(p.vel, delta);
          }

          // Transform instanced mesh matrix
          const lifeRatio = Math.max(0, p.life / p.maxLife);
          const currentScale = p.size * lifeRatio;

          dummy.position.copy(p.pos);
          dummy.scale.set(currentScale, currentScale, currentScale);
          dummy.updateMatrix();

          mesh.setMatrixAt(i, dummy.matrix);
          pCount++;
        }

        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group position={position}>
      {/* 3D Model of the Firecracker */}
      <group ref={groupRef}>
        {/* PHULJHADI (Sparkler) */}
        {type === 'phuljhadi' && (
          <group>
            {/* Metal handle wire */}
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* Pyrotechnic sparkler coating */}
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 0.35, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.9} />
            </mesh>
          </group>
        )}

        {/* ANAAR (Flowerpot) */}
        {type === 'anaar' && (
          <group>
            {/* Terracotta conical body */}
            <mesh position={[0, 0.2, 0]} castShadow>
              <coneGeometry args={[0.22, 0.42, 16]} />
              <meshStandardMaterial color="#B45309" roughness={0.7} />
            </mesh>
            {/* Decorative Gold foil label */}
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.16, 0.18, 0.18, 16]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Top Fuse */}
            <mesh position={[0, 0.42, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.08, 6]} />
              <meshStandardMaterial color="#F5F5DC" />
            </mesh>
          </group>
        )}

        {/* CHAKRI (Ground Wheel) */}
        {type === 'chakri' && (
          <group position={[0, 0.04, 0]}>
            {/* Spiral Disc */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.28, 0.28, 0.06, 24]} />
              <meshStandardMaterial color="#DC2626" roughness={0.5} />
            </mesh>
            {/* Inner Spiral Ring */}
            <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.08, 0.22, 16]} />
              <meshStandardMaterial color="#FFD700" metalness={0.7} />
            </mesh>
            {/* Center Pin */}
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#1E293B" metalness={0.9} />
            </mesh>
          </group>
        )}

        {/* ROCKET */}
        {type === 'rocket' && (
          <group>
            {/* Launcher stick */}
            <mesh position={[0.04, 0.4, 0]} rotation={[0, 0, -0.08]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.85, 8]} />
              <meshStandardMaterial color="#D2B48C" roughness={0.8} />
            </mesh>
            {/* Rocket cylinder payload */}
            <mesh position={[0, 0.65, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.26, 12]} />
              <meshStandardMaterial color="#D90429" roughness={0.4} />
            </mesh>
            {/* Rocket Nose Cone */}
            <mesh position={[0, 0.82, 0]} castShadow>
              <coneGeometry args={[0.055, 0.12, 12]} />
              <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Rocket bottle / earthen stand */}
            <mesh position={[0.04, 0.1, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 0.2, 12]} />
              <meshStandardMaterial color="#78350F" roughness={0.8} />
            </mesh>
          </group>
        )}

        {/* Sparking Fuse when fusing */}
        {state === 'fusing' && (
          <group position={[0, 0.45, 0]}>
            <mesh>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial 
                color="#FF5500" 
                emissive="#FF3300" 
                emissiveIntensity={3.5} 
                toneMapped={false} 
              />
            </mesh>
            <pointLight color="#FF6600" intensity={2.0} distance={2} />
          </group>
        )}
      </group>

      {/* Instanced Particle System for Sparks & VFX (< 500 instances) */}
      {state === 'active' && (
        <instancedMesh
          ref={instancedMeshRef}
          args={[null, null, MAX_PARTICLES]}
        >
          <sphereGeometry args={[1, 6, 6]} />
          {/* Emissive Yellow/Orange Material triggering Post-Processing Bloom */}
          <meshStandardMaterial
            color={
              type === 'anaar'
                ? '#FFB703'
                : type === 'chakri'
                ? '#FF7700'
                : type === 'rocket'
                ? '#00F0FF'
                : '#FFE066'
            }
            emissive={
              type === 'anaar'
                ? '#FFA500'
                : type === 'chakri'
                ? '#FF5500'
                : type === 'rocket'
                ? '#00D5FF'
                : '#FFB700'
            }
            emissiveIntensity={4.0}
            toneMapped={false}
            roughness={0.2}
          />
        </instancedMesh>
      )}

      {/* Dynamic Glow Bloom PointLight during burning */}
      {state === 'active' && (
        <pointLight
          ref={lightRef}
          position={[0, type === 'rocket' ? rocketAltitude.current + 0.5 : 0.6, 0]}
          color={
            type === 'anaar'
              ? '#FFB703'
              : type === 'chakri'
              ? '#FF4500'
              : type === 'rocket'
              ? '#FF0055'
              : '#FFD700'
          }
          intensity={4.0}
          distance={10}
          castShadow
        />
      )}

      {/* Floating 3D Interaction Prompt when player is near */}
      {isPlayerNear && state === 'placed' && (
        <group position={[0, 1.1, 0]}>
          {/* Billboard-style prompt */}
          <mesh>
            <planeGeometry args={[1.5, 0.45]} />
            <meshBasicMaterial color="#0B0D1B" transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
          {/* Glowing border */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.55, 0.5]} />
            <meshBasicMaterial color="#FFB703" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}
