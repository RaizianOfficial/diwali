import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

// Configurable model path for drop-in Swing / Jhula asset
export const JHULA_MODEL_PATH = '/models/jhula.glb';

/**
 * Traditional Village Swing (Jhula) Component
 * Loads external .glb file using useGLTF
 */
export default function Jhula({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1] 
}) {
  const { scene } = useGLTF(JHULA_MODEL_PATH);

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
      {/* Hanging Diya / Warm Light on Swing */}
      <pointLight position={[0, 3.4, 0.2]} color="#FFA500" intensity={1.5} distance={5} />
    </group>
  );
}

useGLTF.preload(JHULA_MODEL_PATH);
