import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Mobile Virtual Floating Joystick for 3D Movement
 * - Multi-touch safe (tracks specific touch identifier)
 * - Pure analog direction vector — no sprint logic
 * - Updates movement vector without triggering 60fps React re-renders on the parent
 */
export default function Joystick({ joystickInputRef }) {
  const containerRef = useRef(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const activeTouchId = useRef(null);

  const MAX_RADIUS = 48;

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

    const normX = clampedX / MAX_RADIUS;
    const normY = -clampedY / MAX_RADIUS; // Invert Y: up = forward in 3D

    const deadzone = 0.1;
    const finalX = Math.abs(normX) < deadzone ? 0 : normX;
    const finalY = Math.abs(normY) < deadzone ? 0 : normY;

    const currentDist = Math.hypot(finalX, finalY);

    if (joystickInputRef) {
      joystickInputRef.current = {
        x: finalX,
        y: finalY,
        active: currentDist > 0.05
      };
    }
  }, [joystickInputRef]);

  const handleEnd = useCallback(() => {
    activeTouchId.current = null;
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    if (joystickInputRef) {
      joystickInputRef.current = { x: 0, y: 0, active: false };
    }
  }, [joystickInputRef]);

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

  const handleTouchStart = (e) => {
    e.stopPropagation();
    if (activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    setIsActive(true);
    updatePosition(touch.clientX, touch.clientY);
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsActive(true);
    activeTouchId.current = 'mouse';
    updatePosition(e.clientX, e.clientY);

    const onMouseMove = (ev) => updatePosition(ev.clientX, ev.clientY);
    const onMouseUp = () => {
      handleEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
      data-no-swipe="true"
      className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center select-none touch-none pointer-events-auto"
      style={{
        background: 'radial-gradient(circle, rgba(255, 170, 51, 0.18) 0%, rgba(15, 23, 42, 0.8) 75%)',
        border: '2px solid rgba(255, 170, 51, 0.45)',
        boxShadow: isActive
          ? '0 0 20px rgba(255, 170, 51, 0.5), inset 0 0 10px rgba(255, 215, 0, 0.2)'
          : '0 4px 15px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Direction markings */}
      <div className="absolute top-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/50" />
      <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/50" />
      <div className="absolute left-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/50" />
      <div className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/50" />

      {/* Inner guide ring */}
      <div className="w-16 h-16 rounded-full border border-dashed border-amber-400/25 pointer-events-none" />

      {/* Moveable Knob */}
      <div
        className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center pointer-events-none transition-transform duration-75"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          background: 'radial-gradient(circle, #FBBF24 10%, #D97706 65%, #9A3412 100%)',
          boxShadow: '0 0 12px rgba(251, 191, 36, 0.7), 0 4px 10px rgba(0,0,0,0.5)',
          border: '1.5px solid rgba(255, 255, 255, 0.6)'
        }}
      >
        <span className="text-sm select-none">🪔</span>
      </div>
    </div>
  );
}
