import React, { useRef, useEffect } from 'react';

/**
 * Isolated Touch Camera Control Zone
 * - True Simultaneous Multi-Touch: Swipe camera & run with joystick at the same time!
 * - Isolated from Joystick: Ignores joystick touches so they never trigger pinch zoom or lock rotation
 * - Single camera finger: 360° Camera Yaw & Pitch Orbit
 * - Two camera fingers: Pinch to Zoom In/Out
 */
export default function TouchCameraZone({ touchCameraRef }) {
  // Map of active touches belonging strictly to camera gestures (touchId -> { x, y })
  const cameraTouches = useRef(new Map());
  const pinchDistance = useRef(null);

  useEffect(() => {
    const isCameraTouch = (touch, target) => {
      // 1. Ignore if started on interactive buttons, links, or marked HUD elements
      if (
        target && (
          target.closest('button') || 
          target.closest('a') || 
          target.closest('[data-no-swipe="true"]')
        )
      ) {
        return false;
      }

      // 2. Ignore if touch is in the bottom-left joystick quadrant
      const isBottomLeftQuadrant = 
        touch.clientX < window.innerWidth * 0.42 && 
        touch.clientY > window.innerHeight * 0.45;
      
      return !isBottomLeftQuadrant;
    };

    const handleTouchStart = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (isCameraTouch(touch, e.target)) {
          cameraTouches.current.set(touch.identifier, {
            x: touch.clientX,
            y: touch.clientY
          });
        }
      }

      // If two camera fingers are active on the camera zone, initialize pinch distance
      if (cameraTouches.current.size === 2) {
        const touchArray = Array.from(cameraTouches.current.values());
        const dx = touchArray[0].x - touchArray[1].x;
        const dy = touchArray[0].y - touchArray[1].y;
        pinchDistance.current = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e) => {
      // CASE 1: Two camera fingers in camera zone = Pinch Zoom
      if (cameraTouches.current.size === 2 && pinchDistance.current !== null) {
        // Update stored positions of changed camera touches
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (cameraTouches.current.has(touch.identifier)) {
            cameraTouches.current.set(touch.identifier, {
              x: touch.clientX,
              y: touch.clientY
            });
          }
        }

        const touchArray = Array.from(cameraTouches.current.values());
        const dx = touchArray[0].x - touchArray[1].x;
        const dy = touchArray[0].y - touchArray[1].y;
        const currentDist = Math.hypot(dx, dy);
        const deltaZoom = (pinchDistance.current - currentDist) * 0.015;
        pinchDistance.current = currentDist;

        if (touchCameraRef && touchCameraRef.current) {
          touchCameraRef.current.zoom += deltaZoom;
        }
        return;
      }

      // CASE 2: Single camera finger = 360° Camera Orbit (Works simultaneously while running on joystick!)
      if (cameraTouches.current.size === 1) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          const prev = cameraTouches.current.get(touch.identifier);
          if (prev) {
            const deltaX = touch.clientX - prev.x;
            const deltaY = touch.clientY - prev.y;
            cameraTouches.current.set(touch.identifier, {
              x: touch.clientX,
              y: touch.clientY
            });

            if (touchCameraRef && touchCameraRef.current) {
              touchCameraRef.current.yaw -= deltaX * 0.0055;
              touchCameraRef.current.pitch += deltaY * 0.0035;
            }
            break;
          }
        }
      }
    };

    const handleTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        cameraTouches.current.delete(e.changedTouches[i].identifier);
      }
      if (cameraTouches.current.size < 2) {
        pinchDistance.current = null;
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
