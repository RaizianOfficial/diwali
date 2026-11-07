import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Info, 
  X, 
  Zap, 
  ArrowUp,
  Download,
  Smartphone,
  RotateCcw
} from 'lucide-react';
import { soundManager } from '../utils/SoundManager';
import Joystick from './Joystick';

/**
 * Mobile-First Responsive HUD with Touch Controls & PC Key Guides
 * - Floating Virtual Joystick (Bottom-Left)
 * - Tactile Mobile Action Buttons: Jump, Sprint Lock, and Interactive Jhula (Bottom-Right)
 * - Turn Your Phone (Rotate to Landscape) Notice for Mobile Gamers
 * - One-Tap Fullscreen Immersive Mode
 * - Collapsible Controls Modal
 */
export default function UI({ 
  isNearJhula = false, 
  isRidingJhula = false, 
  onToggleJhula,
  onJump,
  isSprintActive = false,
  onToggleSprint,
  joystickInputRef
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissPortrait, setDismissPortrait] = useState(false);

  // Sound toggle
  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Fullscreen toggle (vital for mobile web games)
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

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Detect mobile device orientation (portrait vs landscape)
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || window.innerWidth < 820;
      const portrait = isMobile && window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleEnterFullscreenFromModal = () => {
    toggleFullscreen();
    setDismissPortrait(true);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-2.5 sm:p-5 select-none overflow-hidden pb-[env(safe-area-inset-bottom,12px)]">
      
      {/* ========================================= */}
      {/* TOP HEADER: Compact & Mobile-Optimized    */}
      {/* ========================================= */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto pointer-events-auto gap-2">
        
        {/* Brand / Title Pill */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/80 backdrop-blur-md px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-amber-500/30 shadow-2xl">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-sm sm:text-xl shadow-md shadow-amber-500/40">
            🪔
          </div>
          <div>
            <h1 className="text-xs sm:text-base font-bold font-festive text-amber-300 tracking-wider">
              SHUBH DIWALI 3D
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-100/70 hidden sm:block">
              Interactive Festive Ground with Solid Collisions & Jhula
            </p>
          </div>
        </div>

        {/* Action Controls & Install Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* PWA Install Button (Mobile) */}
          {deferredPrompt && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-lg border border-amber-300 animate-pulse transition hover:scale-105 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Install</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 sm:p-2.5 backdrop-blur-md rounded-xl sm:rounded-2xl border transition hover:scale-105 active:scale-95 shadow-lg ${
              !isFullscreen 
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse' 
                : 'bg-slate-900/80 hover:bg-slate-800 border-amber-500/30 text-amber-400'
            }`}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            className="p-2 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl sm:rounded-2xl border border-amber-500/30 text-amber-400 transition hover:scale-105 active:scale-95 shadow-lg"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Help / Controls Guide Button */}
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl sm:rounded-2xl border border-amber-500/30 text-amber-400 transition hover:scale-105 active:scale-95 shadow-lg"
            title="Controls Guide"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

        </div>
      </header>

      {/* ================================================= */}
      {/* "ROTATE PHONE" & FULLSCREEN MODAL (PORTRAIT MODE) */}
      {/* ================================================= */}
      {isPortrait && !dismissPortrait && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-5 pointer-events-auto">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center text-amber-100 flex flex-col items-center gap-4 glow-gold">
            
            {/* Animated Rotating Smartphone Icon */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 border border-amber-400/40 flex items-center justify-center shadow-lg">
              <Smartphone className="w-10 h-10 text-amber-300 animate-bounce" />
              <RotateCcw className="absolute w-14 h-14 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>

            {/* Heading & Notice */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black font-festive text-amber-300 tracking-wider">
                ROTATE PHONE TO LANDSCAPE
              </h2>
              <p className="text-xs text-amber-100/75 leading-relaxed">
                Diwali Mela 3D ground landscape mode me sabse shaandar dikhta hai. Phone ko aada (horizontal) ghumaayein!
              </p>
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-2.5 pt-2">
              <button
                onClick={handleEnterFullscreenFromModal}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition"
              >
                <Maximize className="w-4 h-4" />
                <span>Enter Fullscreen Mode</span>
              </button>

              <button
                onClick={() => setDismissPortrait(true)}
                className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-amber-200/80 text-xs font-semibold rounded-xl border border-slate-700 active:scale-95 transition"
              >
                Continue in Portrait
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* BOTTOM CONTROLS DECK (MOBILE-FIRST)       */}
      {/* ========================================= */}
      <div className="w-full flex items-end justify-between pointer-events-none pb-1 sm:pb-3">
        
        {/* BOTTOM LEFT: Virtual Joystick */}
        <div className="pointer-events-auto select-none pl-1 sm:pl-4">
          <Joystick joystickInputRef={joystickInputRef} />
        </div>

        {/* BOTTOM RIGHT: Mobile Action Buttons (All controls cleanly on the side) */}
        <div className="pointer-events-auto flex flex-col items-end gap-3 pr-1 sm:pr-4 select-none">
          
          {/* Side Contextual Swing Action Button (Near Jhula OR Riding Jhula) */}
          {(isNearJhula || isRidingJhula) && (
            <button
              onClick={() => onToggleJhula(!isRidingJhula)}
              data-no-swipe="true"
              className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-2xl font-black text-xs sm:text-sm border-2 transition active:scale-90 ${
                isRidingJhula
                  ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-600 text-white border-yellow-300 shadow-rose-900/50 animate-pulse'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-white shadow-amber-500/50 glow-gold animate-bounce'
              }`}
            >
              <span className="text-xl sm:text-2xl">🎡</span>
              <div className="flex flex-col text-left">
                <span className="leading-tight">{isRidingJhula ? 'Get Off Swing' : 'Ride Jhula'}</span>
                <span className="text-[10px] opacity-80 font-normal leading-tight">{isRidingJhula ? 'Press Space or Tap' : 'Press [E] or Tap'}</span>
              </div>
            </button>
          )}

          {/* Action Buttons Row: Sprint & Jump */}
          <div className="flex items-center gap-3">
            
            {/* Sprint Lock Toggle Button */}
            <button
              onClick={onToggleSprint}
              data-no-swipe="true"
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center border-2 transition active:scale-90 shadow-xl ${
                isSprintActive
                  ? 'bg-amber-500 border-yellow-200 text-slate-950 shadow-amber-500/50 glow-gold scale-105'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-amber-500/40 text-amber-300 backdrop-blur-md'
              }`}
              title="Toggle Sprint"
            >
              <Zap className={`w-5 h-5 ${isSprintActive ? 'fill-slate-950 animate-pulse' : ''}`} />
              <span className="text-[9px] font-black tracking-tight mt-0.5">RUN</span>
            </button>

            {/* Parabolic Jump Button */}
            <button
              onClick={onJump}
              data-no-swipe="true"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black flex flex-col items-center justify-center border-2 border-white/80 shadow-2xl shadow-amber-500/60 transition active:scale-90 hover:scale-105 glow-gold"
              title="Jump"
            >
              <ArrowUp className="w-6 h-6 stroke-[3]" />
              <span className="text-[10px] font-black tracking-tighter">JUMP</span>
            </button>

          </div>

        </div>

      </div>

      {/* ========================================= */}
      {/* CONTROLS GUIDE MODAL (POPUP)              */}
      {/* ========================================= */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-amber-100 flex flex-col gap-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪔</span>
                <h3 className="font-bold font-festive text-amber-300 text-base sm:text-lg">
                  How to Play & Controls
                </h3>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Touch Controls Section */}
            <div>
              <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
                <span>📱</span> Phone & Tablet Touch Controls
              </h4>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li>• <strong className="text-amber-200">Simultaneous Multi-Touch:</strong> Run with left thumb & swipe camera with right thumb at the same time!</li>
                <li>• <strong className="text-amber-200">Left Thumb Joystick:</strong> Move 360° in any direction. Pull past ring to auto-sprint!</li>
                <li>• <strong className="text-amber-200">Right Screen Drag:</strong> Swipe anywhere on the right half to rotate camera 360°.</li>
                <li>• <strong className="text-amber-200">Pinch In/Out:</strong> Two-finger pinch to zoom camera.</li>
                <li>• <strong className="text-amber-200">JUMP Button:</strong> Jump over rangoli and obstacles.</li>
                <li>• <strong className="text-amber-200">RUN Button:</strong> Lock sprint mode for fast running.</li>
                <li>• <strong className="text-amber-200">🎡 Ride Jhula:</strong> Tap the side swing button when near the jhula to swing!</li>
              </ul>
            </div>

            {/* PC Keyboard Controls Section */}
            <div>
              <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
                <span>💻</span> PC Keyboard & Mouse Controls
              </h4>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li>• <strong className="text-amber-200">WASD / Arrow Keys:</strong> Move character</li>
                <li>• <strong className="text-amber-200">Shift:</strong> Sprint run</li>
                <li>• <strong className="text-amber-200">Space:</strong> Jump / Dismount Jhula</li>
                <li>• <strong className="text-amber-200">E Key:</strong> Mount / Dismount Swing</li>
                <li>• <strong className="text-amber-200">Mouse Drag:</strong> 360° Orbit Camera</li>
                <li>• <strong className="text-amber-200">Scroll Wheel:</strong> Camera Zoom In / Out</li>
              </ul>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowHelp(false)}
              className="mt-2 w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              Got it, let's play!
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
