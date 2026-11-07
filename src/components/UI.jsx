import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Flame, 
  Disc, 
  Rocket as RocketIcon, 
  HeartHandshake, 
  Volume2, 
  VolumeX, 
  X, 
  CheckCircle,
  HelpCircle,
  IndianRupee,
  Maximize,
  Minimize,
  Download,
  Crosshair
} from 'lucide-react';
import { soundManager } from '../utils/SoundManager';
import { addContributionToFirestore } from '../firebase';
import Joystick from './Joystick';

export const FIRECRACKER_TYPES = [
  {
    id: 'phuljhadi',
    name: 'Phuljhadi',
    hindi: 'फूलझड़ी',
    icon: Sparkles,
    color: 'from-amber-500 to-yellow-400',
    border: 'border-amber-400'
  },
  {
    id: 'anaar',
    name: 'Anaar',
    hindi: 'अनार',
    icon: Flame,
    color: 'from-orange-600 to-amber-500',
    border: 'border-orange-500'
  },
  {
    id: 'chakri',
    name: 'Chakri',
    hindi: 'चकरी',
    icon: Disc,
    color: 'from-red-600 to-rose-500',
    border: 'border-red-500'
  },
  {
    id: 'rocket',
    name: 'Rocket',
    hindi: 'रॉकेट',
    icon: RocketIcon,
    color: 'from-cyan-600 to-blue-500',
    border: 'border-cyan-400'
  }
];

export default function UI({
  activeFirecracker,
  onSelectFirecracker,
  showContributeModal,
  onCloseContributeModal,
  nearFirecrackerToIgnite,
  onManualIgniteNearest,
  onPlaceAtPlayer,
  onJoystickMove,
  onContributionSuccess
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // PWA Install Prompt state
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Form states for contribution modal
  const [donorName, setDonorName] = useState('');
  const [donorAmount, setDonorAmount] = useState('501');
  const [donorMessage, setDonorMessage] = useState('Happy Diwali to all devotees! 🪔');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Listen for PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert("To install on iOS / Chrome: Tap the Share/Menu icon and select 'Add to Home Screen' 📲");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
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

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  /**
   * Razorpay Checkout Integration
   */
  const handleRazorpayPayment = async (e) => {
    e?.preventDefault();
    if (!donorName.trim()) {
      alert('Please enter your name for the sacred billboard entry.');
      return;
    }
    const amountVal = parseInt(donorAmount, 10);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Please enter a valid contribution amount.');
      return;
    }

    setIsProcessing(true);
    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_DiwaliMela2026';

    if (typeof window.Razorpay !== 'undefined' && !rzpKey.includes('rzp_test_DiwaliMela2026')) {
      const options = {
        key: rzpKey,
        amount: amountVal * 100,
        currency: 'INR',
        name: 'Diwali Mela 3D Sewa',
        description: 'Contribution to Diwali Mela Festivities',
        image: '/icon.svg',
        handler: async function (response) {
          await finishContribution(donorName, amountVal, donorMessage);
        },
        prefill: {
          name: donorName,
          email: 'devotee@diwalimela.in'
        },
        theme: {
          color: '#FF9900'
        },
        modal: {
          ondismiss: () => setIsProcessing(false)
        }
      };
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } else {
      setTimeout(async () => {
        await finishContribution(donorName, amountVal, donorMessage);
      }, 700);
    }
  };

  const finishContribution = async (name, amount, msg) => {
    try {
      await addContributionToFirestore(name, amount, msg);
      setIsProcessing(false);
      setPaymentSuccess(true);

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF7700', '#D90429', '#00F0FF', '#39FF14']
      });

      if (onContributionSuccess) {
        onContributionSuccess({ name, amount, message: msg });
      }

      setTimeout(() => {
        setPaymentSuccess(false);
        onCloseContributeModal();
      }, 2400);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-3 sm:p-5 overflow-hidden">
      
      {/* ==================================================== */}
      {/* TOP HEADER: BRANDING, FULLSCREEN & CONTROLS         */}
      {/* ==================================================== */}
      <header className="flex items-center justify-between pointer-events-auto w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-amber-500/30 glow-gold">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-amber-500/40">
            🪔
          </div>
          <div>
            <h1 className="text-xs sm:text-base font-bold font-festive text-amber-300 tracking-wider">
              SHUBH DEEPAWALI 3D
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-100/70 hidden xs:block">
              Diwali Mela 60FPS Mobile Edition
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Button */}
          {installPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/40 border border-yellow-200 animate-pulse"
              title="Install App"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl border border-amber-500/30 text-amber-400 transition hover:scale-105 active:scale-95"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl border border-amber-500/30 text-amber-400 transition hover:scale-105 active:scale-95"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Help Instructions */}
          <button
            onClick={() => setShowInstructions(true)}
            className="p-2 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl border border-amber-500/30 text-amber-400 transition hover:scale-105 active:scale-95"
            title="Help"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* ==================================================== */}
      {/* MOBILE PWA INSTALL BANNER PROMPT                    */}
      {/* ==================================================== */}
      {installPrompt && showInstallBanner && (
        <div className="self-center pointer-events-auto mt-2 max-w-md w-full animate-fade-in">
          <div className="bg-gradient-to-r from-amber-600/95 via-orange-600/95 to-amber-700/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-yellow-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📲</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-yellow-200">
                  Install Diwali Mela App
                </p>
                <p className="text-[11px] text-white/90">
                  Full-screen, offline audio & 60FPS mobile controls!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-white text-slate-950 font-bold text-xs rounded-xl shadow-md hover:bg-yellow-100 transition"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-1 rounded-full bg-black/20 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MOBILE TOUCH HINT: RIGHT-SIDE CAMERA DRAG           */}
      {/* ==================================================== */}
      <div className="self-center pointer-events-none opacity-40 text-[11px] text-amber-200 hidden sm:block">
        Drag right half of screen to rotate 360° camera • Use Joystick to move
      </div>

      {/* ==================================================== */}
      {/* BOTTOM CONTROLS: JOYSTICK (LEFT) & ACTIONS (RIGHT)   */}
      {/* ==================================================== */}
      <div className="w-full flex items-end justify-between pointer-events-none gap-2 pb-1">
        
        {/* BOTTOM LEFT: VIRTUAL JOYSTICK */}
        <div className="pointer-events-auto">
          <Joystick onMove={onJoystickMove} />
        </div>

        {/* BOTTOM CENTER: FIRECRACKER SELECTION DOCK */}
        <div className="pointer-events-auto flex flex-col items-center max-w-sm sm:max-w-md w-full mx-auto px-1">
          
          {/* Quick placement prompt if cracker chosen */}
          {activeFirecracker && (
            <div className="mb-2 bg-black/80 backdrop-blur-md border border-amber-400 text-amber-300 text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Tap ground OR click button to place <strong>{activeFirecracker.toUpperCase()}</strong></span>
            </div>
          )}

          {/* 4 Firecrackers Dock */}
          <div className="bg-slate-950/90 backdrop-blur-xl border border-amber-500/40 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 shadow-2xl glow-gold w-full flex items-center justify-around gap-1 sm:gap-2">
            {FIRECRACKER_TYPES.map((fc) => {
              const Icon = fc.icon;
              const isSelected = activeFirecracker === fc.id;

              return (
                <button
                  key={fc.id}
                  onClick={() => onSelectFirecracker(isSelected ? null : fc.id)}
                  className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 ${
                    isSelected
                      ? `bg-gradient-to-b ${fc.color} text-slate-950 font-bold scale-105 shadow-lg border-2 border-white`
                      : `bg-slate-900/90 text-amber-100 hover:bg-slate-800 border border-amber-500/20`
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span className="text-[10px] sm:text-xs font-semibold truncate mt-0.5">
                    {fc.name}
                  </span>
                  <span className={`text-[9px] hidden xs:block opacity-75 ${isSelected ? 'text-slate-950 font-medium' : 'text-amber-300'}`}>
                    {fc.hindi}
                  </span>

                  {isSelected && (
                    <span className="absolute -top-1.5 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM RIGHT: BIG ACTION BUTTON (MOBILE-FIRST PUBG/ACTION STYLE) */}
        <div className="pointer-events-auto flex flex-col items-end gap-2 shrink-0">
          
          {/* Primary Action Button: Dynamic based on context */}
          {nearFirecrackerToIgnite ? (
            <button
              onClick={onManualIgniteNearest}
              className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-red-600 via-orange-600 to-yellow-500 text-white font-extrabold flex flex-col items-center justify-center shadow-2xl border-2 border-yellow-200 animate-pulse glow-saffron transition transform active:scale-90"
              style={{ width: '4.5rem', height: '4.5rem' }}
            >
              <Flame className="w-7 h-7 text-yellow-200" />
              <span className="text-[10px] tracking-wider uppercase font-black">IGNITE</span>
            </button>
          ) : activeFirecracker ? (
            <button
              onClick={onPlaceAtPlayer}
              className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-extrabold flex flex-col items-center justify-center shadow-2xl border-2 border-white glow-gold transition transform active:scale-90"
              style={{ width: '4.5rem', height: '4.5rem' }}
            >
              <Crosshair className="w-6 h-6 text-slate-950" />
              <span className="text-[10px] tracking-wider uppercase font-black">PLACE</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectFirecracker('phuljhadi')}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/90 text-amber-400 font-bold flex flex-col items-center justify-center shadow-lg border border-amber-500/40 transition transform active:scale-90"
              style={{ width: '4rem', height: '4rem' }}
            >
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span className="text-[9px] uppercase tracking-wider text-amber-200 mt-0.5">CRACKERS</span>
            </button>
          )}

        </div>

      </div>

      {/* ==================================================== */}
      {/* RAZORPAY CONTRIBUTION MODAL                          */}
      {/* ==================================================== */}
      {showContributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md pointer-events-auto animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl glow-gold">
            
            <button
              onClick={onCloseContributeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-3 animate-bounce" />
                <h3 className="text-xl sm:text-2xl font-bold font-festive text-amber-300 mb-1">
                  Daan Accepted! 🙏
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Thank you, <strong>{donorName}</strong>! Your contribution of <strong>₹{donorAmount}</strong> is now shining on the 3D Billboard Leaderboard.
                </p>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <div className="inline-flex p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 mb-1.5 border border-amber-500/40">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-festive text-amber-300">
                    Diwali Mela Daan Patra
                  </h2>
                  <p className="text-[11px] text-amber-200/70 mt-0.5">
                    Updates the Live 3D Billboard in the center square!
                  </p>
                </div>

                <form onSubmit={handleRazorpayPayment} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                      Devotee / Contributor Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                      Select Sacred Amount (₹ INR)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                      {['101', '251', '501', '1100', '2100', '5100'].map((amt) => (
                        <button
                          type="button"
                          key={amt}
                          onClick={() => setDonorAmount(amt)}
                          className={`py-1 text-xs font-semibold rounded-lg border transition ${
                            donorAmount === amt
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                              : 'bg-slate-950/80 text-amber-200 border-amber-500/25'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        min="1"
                        value={donorAmount}
                        onChange={(e) => setDonorAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-amber-500/40 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        placeholder="Custom amount"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                      Festive Wish / Message
                    </label>
                    <input
                      type="text"
                      maxLength={40}
                      placeholder="e.g. Shubh Deepawali to all!"
                      value={donorMessage}
                      onChange={(e) => setDonorMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-lg flex items-center justify-center gap-2 border border-yellow-200 transition active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : `Contribute ₹${donorAmount} via Razorpay`}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* HOW TO PLAY INSTRUCTIONS MODAL                       */}
      {/* ==================================================== */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-amber-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-festive text-amber-300">
                How to Play (Mobile & Desktop)
              </h3>
              <button 
                onClick={() => setShowInstructions(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <p>🕹️ <strong>Move:</strong> Use the on-screen Joystick on the bottom-left (or WASD / Arrow keys).</p>
              <p>🔄 <strong>Look Around:</strong> Swipe the right half of your screen to orbit the 3D camera 360°.</p>
              <p>💥 <strong>Firecrackers:</strong> Choose Phuljhadi, Anaar, Chakri, or Rocket from the bottom dock, then tap the ground or press the <strong>PLACE</strong> button.</p>
              <p>🔥 <strong>Ignite:</strong> Walk near the firecracker and tap the big <strong>IGNITE</strong> button or press [E].</p>
              <p>🪔 <strong>Billboard:</strong> Walk close to the center 3D billboard to contribute and shine on the live leaderboard!</p>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Close & Play
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
