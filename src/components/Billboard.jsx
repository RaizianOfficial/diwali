import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Billboard Component with dynamic 2D HTML Canvas Leaderboard Texture
 * - Subscribes to Firestore Top 10 Contributors
 * - Renders crisp festive UI onto an offscreen canvas
 * - Detects proximity to trigger the HTML Contribution Modal
 */
export default function Billboard({ 
  position = [0, 0, -2], 
  contributors = [], 
  playerPosition = [0, 0, 0],
  onProximityChange 
}) {
  const canvasRef = useRef(null);
  const textureRef = useRef(null);
  const isNearRef = useRef(false);

  // Initialize Canvas & CanvasTexture once
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1280;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return { canvas: c, texture: tex };
  }, []);

  canvasRef.current = canvas;
  textureRef.current = texture;

  // Draw the Leaderboard onto the Canvas whenever contributors update
  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background: Deep Royal Night Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0a0d1f');
    bgGradient.addColorStop(0.5, '#170f2c');
    bgGradient.addColorStop(1, '#080512');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative Outer Border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 34, width - 68, height - 68);

    // Corner Ornaments
    const drawCorner = (cx, cy) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    };
    drawCorner(44, 44);
    drawCorner(width - 44, 44);
    drawCorner(44, height - 44);
    drawCorner(width - 44, height - 44);

    // Top Header - Festive Greeting
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFB703';
    ctx.font = 'bold 36px "Cinzel", Georgia, serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('✨  SHUBH  DEEPAWALI  ✨', width / 2, 90);

    // Main Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 52px "Cinzel", Georgia, serif';
    ctx.shadowColor = 'rgba(255, 170, 0, 0.8)';
    ctx.shadowBlur = 18;
    ctx.fillText('MELA MAHA DAAN PATRA', width / 2, 160);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = '#FB8500';
    ctx.font = '600 24px "Outfit", sans-serif';
    ctx.fillText('TOP 10 SACRED CONTRIBUTORS & PATRONS', width / 2, 205);

    // Golden Divider Line
    const lineGrad = ctx.createLinearGradient(120, 225, width - 120, 225);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.5, '#FFD700');
    lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 225);
    ctx.lineTo(width - 120, 225);
    ctx.stroke();

    // Table Header
    const startY = 270;
    const rowHeight = 78;

    ctx.fillStyle = 'rgba(255, 183, 3, 0.15)';
    ctx.fillRect(60, startY - 40, width - 120, 48);

    ctx.font = 'bold 22px "Outfit", sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText('RANK', 85, startY - 10);
    ctx.fillText('DEVOTEE NAME', 220, startY - 10);
    ctx.textAlign = 'right';
    ctx.fillText('SEWA AMOUNT', width - 90, startY - 10);

    // Render Top 10 Contributors
    const displayList = contributors.slice(0, 10);

    displayList.forEach((item, index) => {
      const y = startY + 25 + index * rowHeight;
      const isTop3 = index < 3;

      // Row background zebra / highlight
      ctx.fillStyle = isTop3 
        ? (index === 0 ? 'rgba(255, 215, 0, 0.16)' : 'rgba(255, 153, 0, 0.10)') 
        : (index % 2 === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.2)');
      
      ctx.beginPath();
      ctx.roundRect(60, y - 42, width - 120, 68, 12);
      ctx.fill();

      // Border for Top 1
      if (index === 0) {
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Rank Badge
      const badgeX = 115;
      const badgeY = y - 8;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 20, 0, Math.PI * 2);
      ctx.fillStyle = index === 0 ? '#FFD700' : index === 1 ? '#E2E8F0' : index === 2 ? '#CD7F32' : '#334155';
      ctx.fill();

      ctx.fillStyle = index < 3 ? '#1E1B4B' : '#E2E8F0';
      ctx.font = 'bold 20px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${index + 1}`, badgeX, badgeY + 7);

      // Name & Optional Message
      ctx.textAlign = 'left';
      ctx.font = isTop3 ? 'bold 27px "Outfit", sans-serif' : '500 25px "Outfit", sans-serif';
      ctx.fillStyle = isTop3 ? '#FFFBEB' : '#F1F5F9';
      
      const displayName = item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name;
      ctx.fillText(displayName, 220, y - 10);

      if (item.message) {
        ctx.font = 'italic 16px "Outfit", sans-serif';
        ctx.fillStyle = '#F59E0B';
        const msg = item.message.length > 28 ? item.message.substring(0, 26) + '...' : item.message;
        ctx.fillText(`"${msg}"`, 220, y + 14);
      }

      // Amount with Indian Rupee formatting
      ctx.textAlign = 'right';
      ctx.font = 'bold 28px "Outfit", sans-serif';
      ctx.fillStyle = index === 0 ? '#4ADE80' : '#38BDF8';
      const formattedAmount = `₹${Number(item.amount).toLocaleString('en-IN')}`;
      ctx.fillText(formattedAmount, width - 90, y - 5);
    });

    // Empty rows placeholder if fewer than 10
    if (displayList.length < 10) {
      for (let i = displayList.length; i < 10; i++) {
        const y = startY + 25 + i * rowHeight;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.beginPath();
        ctx.roundRect(60, y - 42, width - 120, 68, 12);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.textAlign = 'center';
        ctx.font = '500 20px "Outfit", sans-serif';
        ctx.fillText('— Available Slot —', width / 2, y - 6);
      }
    }

    // Bottom Call to Action Footer
    const footerY = height - 90;
    const footerGrad = ctx.createLinearGradient(0, footerY - 20, 0, height);
    footerGrad.addColorStop(0, 'rgba(255, 153, 0, 0.2)');
    footerGrad.addColorStop(1, 'rgba(255, 100, 0, 0.05)');
    ctx.fillStyle = footerGrad;
    ctx.fillRect(40, footerY - 25, width - 80, 80);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌟  WALK CLOSE (< 5m) TO CONTRIBUTE VIA RAZORPAY  🌟', width / 2, footerY + 15);
    
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '500 16px "Outfit", sans-serif';
    ctx.fillText('Live Firestore Sync • Instant Leaderboard Recognition', width / 2, footerY + 42);

    // Signal Three.js that texture needs re-uploading
    texture.needsUpdate = true;
  }, [contributors, canvas, texture]);

  // Proximity check on every frame (within 5 units)
  useFrame(() => {
    if (!playerPosition) return;
    const [px, , pz] = playerPosition;
    const [bx, , bz] = position;
    const dx = px - bx;
    const dz = pz - bz;
    const distSq = dx * dx + dz * dz;
    const thresholdSq = 5.0 * 5.0; // 5 units distance

    const isNear = distSq <= thresholdSq;
    if (isNear !== isNearRef.current) {
      isNearRef.current = isNear;
      if (onProximityChange) {
        onProximityChange(isNear);
      }
    }
  });

  return (
    <group position={position}>
      {/* Grand Indian Wooden/Brass Billboard Framework */}
      
      {/* Main Billboard Display Plane */}
      <mesh position={[0, 4.2, 0]} castShadow receiveShadow>
        <planeGeometry args={[6.2, 7.8]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.2} 
          metalness={0.1}
          emissive="#FFA500"
          emissiveIntensity={0.06}
        />
      </mesh>

      {/* Back Plate */}
      <mesh position={[0, 4.2, -0.08]} castShadow>
        <boxGeometry args={[6.5, 8.1, 0.14]} />
        <meshStandardMaterial color="#2B1810" roughness={0.7} />
      </mesh>

      {/* Golden Carved Frame Surrounding */}
      <mesh position={[0, 4.2, 0.02]}>
        <boxGeometry args={[6.4, 8.0, 0.08]} />
        <meshStandardMaterial color="#DAA520" metalness={0.65} roughness={0.25} wireframe={false} />
      </mesh>

      {/* Ornate Top Arch / Toran */}
      <mesh position={[0, 8.4, 0]}>
        <cylinderGeometry args={[0.3, 0.45, 6.8, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#B8860B" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Decorative Gold Finials / Kalash on top */}
      {[-3, -1.5, 0, 1.5, 3].map((x, idx) => (
        <group key={idx} position={[x, 8.8, 0]}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <coneGeometry args={[0.12, 0.35, 16]} />
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Heavy Support Pillars (Left & Right) */}
      {[-3.2, 3.2].map((x, idx) => (
        <group key={idx} position={[x, 3.6, -0.1]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.22, 0.28, 7.6, 16]} />
            <meshStandardMaterial color="#3E2723" roughness={0.6} />
          </mesh>
          {/* Pillar Base */}
          <mesh position={[0, -3.7, 0]}>
            <boxGeometry args={[0.8, 0.4, 0.8]} />
            <meshStandardMaterial color="#8D6E63" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Spotlights Illuminating the Billboard */}
      <spotLight 
        position={[0, 7.5, 3.5]} 
        target-position={[0, 4.5, 0]}
        angle={0.75} 
        penumbra={0.6} 
        intensity={2.8} 
        color="#FFF2CC"
        castShadow
      />
      <pointLight position={[-2.5, 8.2, 0.5]} intensity={1.2} color="#FFA500" distance={6} />
      <pointLight position={[2.5, 8.2, 0.5]} intensity={1.2} color="#FFA500" distance={6} />

      {/* Hanging Diyas on Billboard sides */}
      {[-3.3, 3.3].map((x, idx) => (
        <group key={idx} position={[x, 1.8, 0.3]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.08, 0.12, 12]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Flame */}
          <mesh position={[0, 0.12, 0]}>
            <coneGeometry args={[0.06, 0.16, 8]} />
            <meshBasicMaterial color="#FFCC00" />
          </mesh>
          <pointLight position={[0, 0.2, 0]} color="#FF9900" intensity={1.4} distance={4} />
        </group>
      ))}

      {/* Proximity Ring on Ground to indicate contribution zone */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.6, 4.9, 48]} />
        <meshBasicMaterial color="#FFB703" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
