// Web Audio API Synthesizer for Festive Diwali Sounds
// Realistic procedural audio for firecrackers, rockets, and ambient night mela sounds

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.initialized = true;
      }
    } catch (e) {
      console.warn("Web Audio not supported or blocked", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // White noise generator buffer
  createNoiseBuffer(duration = 1.0) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Play Phuljhadi (Sparkler sizzle/crackle)
  playPhuljhadi() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(2.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.linearRampToValueAtTime(7000, now + 2.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 2.5);
  }

  // Play Anaar (Flowerpot fountain roar and sparkling rush)
  playAnaar() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(3.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3500, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 3.2);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 3.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 3.5);
  }

  // Play Chakri (Whirring spinner sound)
  playChakri() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.8);
    osc.frequency.exponentialRampToValueAtTime(200, now + 2.8);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(3.0);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    osc.connect(gain);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 3.0);
    noise.stop(now + 3.0);
  }

  // Play Rocket (Whistle launch + burst boom)
  playRocket() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Launch Whistle
    const whistle = this.ctx.createOscillator();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(450, now);
    whistle.frequency.exponentialRampToValueAtTime(2200, now + 1.2);

    const whistleGain = this.ctx.createGain();
    whistleGain.gain.setValueAtTime(0.01, now);
    whistleGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

    whistle.connect(whistleGain);
    whistleGain.connect(this.ctx.destination);
    whistle.start(now);
    whistle.stop(now + 1.25);

    // 2. Burst Explosion at 1.25s
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const burstNow = this.ctx.currentTime;

      // Low boom
      const boom = this.ctx.createOscillator();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(140, burstNow);
      boom.frequency.exponentialRampToValueAtTime(30, burstNow + 0.6);

      const boomGain = this.ctx.createGain();
      boomGain.gain.setValueAtTime(0.6, burstNow);
      boomGain.gain.exponentialRampToValueAtTime(0.01, burstNow + 0.7);

      boom.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boom.start(burstNow);
      boom.stop(burstNow + 0.7);

      // Crackle debris
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(1.2);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, burstNow);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, burstNow);
      noiseGain.gain.exponentialRampToValueAtTime(0.005, burstNow + 1.2);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(burstNow);
      noise.stop(burstNow + 1.2);
    }, 1250);
  }

  // Play Diya / Placement click
  playPlace() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const soundManager = new SoundManager();
