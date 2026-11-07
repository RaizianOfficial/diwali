import React, { useRef, useEffect } from 'react';

/**
 * Invisible Touch Camera Control Zone
 * - Single-finger swipe: 360° Camera Yaw & Pitch
 * - Two-finger pinch: Camera Zoom In/Out
 * - Safely ignores touches on joystick, buttons, and HUD controls
 * - Accumulates deltas in touchCameraRef (no React re-renders)
 */
export default function TouchCameraZone({ touchCameraRef }) {
  const activeTouchId = useRef(null);
  const lastTouchPos = useRef({ x: 0, y: 0 });

  // Two-finger pinch zoom tracking
  const pinchDistance = useRef(null);

  useEffect(() => {
    const handleTouchStart = (e) => {
      // Ignore if touch started on an interactive control or joystick
      const target = e.target;
      if (
        target.closest('button') || 
        target.closest('a') || 
        target.closest('[data-no-swipe="true"]')
      ) {
        return;
      }

      // Check for two-finger pinch
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDistance.current = Math.hypot(dx, dy);
        return;
      }

      // Single finger drag (look for a touch on the right 65% of screen or non-joystick region)
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.clientX > window.innerWidth * 0.35) {
          activeTouchId.current = touch.identifier;
          lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
          break;
        }
      }
    };

    const handleTouchMove = (e) => {
      // 1. Two-finger pinch zoom
      if (e.touches.length === 2 && pinchDistance.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const deltaZoom = (pinchDistance.current - currentDist) * 0.015;
        pinchDistance.current = currentDist;

        if (touchCameraRef && touchCameraRef.current) {
          touchCameraRef.current.zoom += deltaZoom;
        }
        return;
      }

      // 2. Single-finger camera orbit
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          const deltaX = touch.clientX - lastTouchPos.current.x;
          const deltaY = touch.clientY - lastTouchPos.current.y;
          lastTouchPos.current = { x: touch.clientX, y: touch.clientY };

          if (touchCameraRef && touchCameraRef.current) {
            touchCameraRef.current.yaw -= deltaX * 0.0055;
            touchCameraRef.current.pitch += deltaY * 0.0035;
          }
          break;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        pinchDistance.current = null;
      }
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
  }, [touchCameraRef]);

  return null;
}
