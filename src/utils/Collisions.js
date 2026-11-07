// Static Collision Registry for Diwali Mela Grounds
export const MELA_COLLIDERS = [
  // Central Deepstambha Monument (Circular stone base + pillar)
  { type: 'cylinder', x: 0, z: 0, radius: 2.85 },

  // West Side Stalls (Mithai & Diya Dukaan)
  { type: 'box', x: -12, z: -6, width: 4.2, depth: 2.5 },
  { type: 'box', x: -14, z: 2, width: 4.2, depth: 2.5 },

  // East Side Stalls (Kandil & Puja Dukaan)
  { type: 'box', x: 12, z: -6, width: 4.2, depth: 2.5 },
  { type: 'box', x: 14, z: 2, width: 4.2, depth: 2.5 },

  // Grand Entrance Gate Pillars (at z = 22)
  { type: 'box', x: -4, z: 22, width: 1.6, depth: 1.6 },
  { type: 'box', x: 4, z: 22, width: 1.6, depth: 1.6 },

  // Jhula Left & Right A-Frame Wooden Pillars (at x = -10, z = 12)
  { type: 'box', x: -12.1, z: 12, width: 0.9, depth: 2.0 },
  { type: 'box', x: -7.9, z: 12, width: 0.9, depth: 2.0 },
];

/**
 * Resolves character collisions against all static obstacles in the mela
 * Allows natural wall-sliding while completely preventing clipping
 */
export function resolveMelaCollision(currentX, currentZ, radius = 0.44) {
  let resolvedX = currentX;
  let resolvedZ = currentZ;

  for (let i = 0; i < MELA_COLLIDERS.length; i++) {
    const col = MELA_COLLIDERS[i];

    if (col.type === 'cylinder') {
      const dx = resolvedX - col.x;
      const dz = resolvedZ - col.z;
      const dist = Math.hypot(dx, dz);
      const minDist = col.radius + radius;

      if (dist < minDist && dist > 0.0001) {
        const pushDistance = minDist - dist;
        resolvedX += (dx / dist) * pushDistance;
        resolvedZ += (dz / dist) * pushDistance;
      }
    } else if (col.type === 'box') {
      const halfW = col.width / 2 + radius;
      const halfD = col.depth / 2 + radius;
      const dx = resolvedX - col.x;
      const dz = resolvedZ - col.z;

      if (Math.abs(dx) < halfW && Math.abs(dz) < halfD) {
        const overlapX = halfW - Math.abs(dx);
        const overlapZ = halfD - Math.abs(dz);

        if (overlapX < overlapZ) {
          resolvedX += Math.sign(dx) * overlapX;
        } else {
          resolvedZ += Math.sign(dz) * overlapZ;
        }
      }
    }
  }

  return { x: resolvedX, z: resolvedZ };
}
