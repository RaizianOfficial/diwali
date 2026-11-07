import React, { useRef, useEffect } from 'react';

/**
 * Invisible/Subtle Touch Zone on the right half of the screen for camera swipe rotation
 * - Does not block clicks on HUD buttons because it sits underneath HUD buttons (z-index 10)
 * - Emits onCameraRotate(deltaYaw, deltaPitch)
 */
export default function TouchCameraZone({ onCameraRotate }) {
  const activeTouchId = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleTouchStart = (e) => {
      // Look for a touch on the right half of the screen
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.clientX > window.innerWidth * 0.38) {
          activeTouchId.current = touch.identifier;
          lastPos.current = { x: touch.clientX, y: touch.clientY };
          break;
        }
      }
    };

    const handleTouchMove = (e) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          const dx = touch.clientX - lastPos.current.x;
          const dy = touch.clientY - lastPos.current.y;
          lastPos.current = { x: touch.clientX, y: touch.clientY };

          // Sensitivity
          if (onCameraRotate) {
            onCameraRotate(-dx * 0.006, dy * 0.003);
          }
          break;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId.current) {
          activeTouchId.current = null;
          break;
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onCameraRotate]);

  return null;
}
