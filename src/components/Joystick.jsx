import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Mobile Virtual Floating/Fixed Joystick
 * - Multi-touch isolated via pointer/touch events
 * - Outputs normalized movement vector { x: [-1, 1], y: [-1, 1], active: boolean }
 * - Sleek glowing festive design tailored for mobile gaming
 */
export default function Joystick({ onMove }) {
  const containerRef = useRef(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const activeTouchId = useRef(null);
  const MAX_RADIUS = 46; // Max joystick radius in px

  const handleStart = (clientX, clientY, identifier = null) => {
    if (!containerRef.current) return;
    activeTouchId.current = identifier;
    setIsActive(true);
    updatePosition(clientX, clientY);
  };

  const updatePosition = useCallback((clientX, clientY) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);

    let clampedX = deltaX;
    let clampedY = deltaY;

    if (distance > MAX_RADIUS) {
      clampedX = (deltaX / distance) * MAX_RADIUS;
      clampedY = (deltaY / distance) * MAX_RADIUS;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Normalize between -1 and 1
    const normX = clampedX / MAX_RADIUS;
    // In screen coordinates Y is down, in 3D world forward is -Z, so invert Y
    const normY = -clampedY / MAX_RADIUS;

    // Apply small deadzone for stability
    const deadzone = 0.12;
    const finalX = Math.abs(normX) < deadzone ? 0 : normX;
    const finalY = Math.abs(normY) < deadzone ? 0 : normY;

    if (onMove) {
      onMove({ x: finalX, y: finalY, active: true });
    }
  }, [MAX_RADIUS, onMove]);

  const handleEnd = useCallback(() => {
    activeTouchId.current = null;
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    if (onMove) {
      onMove({ x: 0, y: 0, active: false });
    }
  }, [onMove]);

  // Touch event handlers
  useEffect(() => {
    const onTouchMove = (e) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          updatePosition(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const onTouchEnd = (e) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId.current) {
          handleEnd();
          break;
        }
      }
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [updatePosition, handleEnd]);

  // Mouse handlers for desktop pair-testing
  const handleMouseDown = (e) => {
    handleStart(e.clientX, e.clientY, 'mouse');
    const onMouseMove = (ev) => updatePosition(ev.clientX, ev.clientY);
    const onMouseUp = () => {
      handleEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    handleStart(touch.clientX, touch.clientY, touch.identifier);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
      className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center select-none touch-none"
      style={{
        background: 'radial-gradient(circle, rgba(255,153,0,0.18) 0%, rgba(15,23,42,0.65) 70%)',
        border: '2px solid rgba(255, 170, 51, 0.4)',
        boxShadow: isActive 
          ? '0 0 25px rgba(255, 170, 51, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.25)' 
          : '0 0 12px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Direction markings */}
      <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-amber-400/40" />
      <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-amber-400/40" />
      <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-amber-400/40" />
      <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-amber-400/40" />

      {/* Internal concentric boundary guide */}
      <div className="w-16 h-16 rounded-full border border-dashed border-amber-400/20 pointer-events-none" />

      {/* Moveable Knob */}
      <div
        className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center pointer-events-none transition-transform duration-75"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          background: 'radial-gradient(circle, #FFB703 10%, #D97706 70%, #9A3412 100%)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.6), 0 0 15px rgba(255, 183, 3, 0.7)',
          border: '2px solid #FFF'
        }}
      >
        <div className="w-4 h-4 rounded-full bg-white/70 shadow-sm" />
      </div>
    </div>
  );
}
