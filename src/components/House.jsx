import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

// Configurable model path for drop-in 3D assets
export const HOUSE_MODEL_PATH = '/models/house.glb';

/**
 * Traditional Indian Village House Component
 * Loads external .glb file using useGLTF and renders via <primitive />
 */
export default function House({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1] 
}) {
  const { scene } = useGLTF(HOUSE_MODEL_PATH);

  // Clone scene so multiple houses can exist independently with shadows enabled
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

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload asset for instant rendering
useGLTF.preload(HOUSE_MODEL_PATH);
