import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { soundManager } from '../utils/SoundManager';

export default function UI({ isNearJhula = false, isRidingJhula = false, onToggleJhula }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden">
      
      {/* Top Header */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto pointer-events-auto">
        <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/30 shadow-2xl glow-gold">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-xl shadow-lg shadow-amber-500/40">
            🪔
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold font-festive text-amber-300 tracking-wider">
              SHUBH DEEPAWALI MELA 3D
            </h1>
            <p className="text-xs text-amber-100/70">
              Interactive Festive Ground with Solid Collisions & Jhula
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-2xl border border-amber-500/30 text-amber-400 transition hover:scale-105 active:scale-95 shadow-lg"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleSound}
            className="p-3 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-2xl border border-amber-500/30 text-amber-400 transition hover:scale-105 active:scale-95 shadow-lg"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Center Interactive Prompts */}
      <div className="self-center pointer-events-auto flex flex-col items-center gap-2">
        {/* Jhula Riding Status */}
        {isRidingJhula && (
          <div className="bg-gradient-to-r from-red-600/90 to-amber-600/90 backdrop-blur-md text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-2xl border border-yellow-300 flex items-center gap-2.5 animate-bounce">
            <span className="text-lg">🎡</span>
            <span>Swinging on Jhula! Press <kbd className="px-2 py-0.5 bg-black/40 rounded text-yellow-300">Space</kbd> or <kbd className="px-2 py-0.5 bg-black/40 rounded text-yellow-300">E</kbd> to Jump Off</span>
            <button 
              onClick={() => onToggleJhula(false)}
              className="ml-2 px-3 py-1 bg-white text-slate-950 text-xs font-black rounded-full hover:bg-yellow-200"
            >
              Get Off
            </button>
          </div>
        )}

        {/* Near Jhula Mount Prompt */}
        {!isRidingJhula && isNearJhula && (
          <button
            onClick={() => onToggleJhula(true)}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-sm sm:text-base px-6 py-3 rounded-full shadow-2xl flex items-center gap-2.5 border-2 border-white animate-pulse glow-gold transition hover:scale-105 active:scale-95"
          >
            <span className="text-xl">🎡</span>
            <span>Near Swing: Press <strong>[E]</strong> or Tap to Ride Jhula!</span>
          </button>
        )}
      </div>

      {/* Bottom PC Controls Guide Dock */}
      <footer className="w-full max-w-3xl mx-auto pointer-events-auto pb-2">
        <div className="bg-slate-950/85 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3 sm:p-4 shadow-2xl glow-gold flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-amber-100">
          
          {/* Movement Keys */}
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">Move:</span>
            <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-amber-300 font-bold text-[11px]">W</kbd>
            <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-amber-300 font-bold text-[11px]">A</kbd>
            <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-amber-300 font-bold text-[11px]">S</kbd>
            <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-amber-300 font-bold text-[11px]">D</kbd>
          </div>

          {/* Sprint */}
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">Sprint:</span>
            <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-amber-300 font-bold text-[11px]">Shift</kbd>
          </div>

          {/* Jump */}
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">Jump:</span>
            <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-amber-300 font-bold text-[11px]">Space</kbd>
          </div>

          {/* Interact / Swing */}
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">Ride Jhula:</span>
            <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-amber-300 font-bold text-[11px]">E</kbd>
          </div>

          {/* Camera Orbit */}
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-semibold">Mouse Drag:</span>
            <span>360° Orbit</span>
          </div>

          {/* Camera Zoom */}
          <div className="flex items-center gap-1.5">
            <span className="text-amber-300 font-semibold">Scroll:</span>
            <span>Zoom</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
