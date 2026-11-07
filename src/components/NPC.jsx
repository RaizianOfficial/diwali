import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Configurable model path for drop-in NPC assets
export const NPC_MODEL_PATH = '/models/npc.glb';

/**
 * NPC Component (Mela Devotee / Villager)
 * Loads external .glb file with skeletal animations via useAnimations
 */
export default function NPC({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1],
  animationName = 'Idle'
}) {
  const group = useRef();
  const { scene, animations } = useGLTF(NPC_MODEL_PATH);
  
  // Clone scene for multiple independent NPCs
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions) return;
    const targetAction = actions[animationName] || Object.values(actions)[0];
    if (targetAction) {
      targetAction.reset().fadeIn(0.3).play();
    }
    return () => {
      if (targetAction) targetAction.fadeOut(0.3);
    };
  }, [actions, animationName]);

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(NPC_MODEL_PATH);
