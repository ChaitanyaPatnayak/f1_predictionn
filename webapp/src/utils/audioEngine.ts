// Synthetic F1 Power Unit Audio Synthesizer using Web Audio API (Zero external assets required)
class F1AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isRevving: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Radio beep sound (team radio activation: "Box, box, box")
  public playRadioBeep() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1760, this.ctx.currentTime); // A6
      osc.frequency.setValueAtTime(2200, this.ctx.currentTime + 0.08); // C#7

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Audio fallback silent
    }
  }

  // F1 Start Beep on lights
  public playLightBeep(isFinal: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isFinal ? "square" : "sine";
      osc.frequency.setValueAtTime(isFinal ? 1200 : 750, this.ctx.currentTime);

      gain.gain.setValueAtTime(isFinal ? 0.12 : 0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (isFinal ? 0.35 : 0.12));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + (isFinal ? 0.36 : 0.13));
    } catch {
      // Audio fallback silent
    }
  }

  // Engine throttle rev burst (V6 Turbo Hybrid sound synthesis)
  public playThrottleBurst(targetRpm: number = 12000) {
    if (this.isMuted || this.isRevving) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      this.isRevving = true;
      const now = this.ctx.currentTime;

      // Base engine harmonics (sawtooth + square for growl)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const turboOsc = this.ctx.createOscillator(); // High pitch turbo whine

      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "triangle";
      turboOsc.type = "sine";

      // Map RPM to audio frequencies
      const baseFreq = 80 + (targetRpm / 15000) * 180;
      osc1.frequency.setValueAtTime(baseFreq * 0.7, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.4);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 1.2);

      osc2.frequency.setValueAtTime(baseFreq * 1.4, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3.0, now + 0.4);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 1.2);

      // Turbocharger whistle (3.2 kHz to 5.5 kHz)
      turboOsc.frequency.setValueAtTime(3200, now);
      turboOsc.frequency.exponentialRampToValueAtTime(5400, now + 0.35);
      turboOsc.frequency.exponentialRampToValueAtTime(2800, now + 1.2);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(6000, now + 0.4);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 1.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      osc1.connect(filter);
      osc2.connect(filter);
      turboOsc.connect(gain);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      turboOsc.start(now);

      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);
      turboOsc.stop(now + 1.3);

      setTimeout(() => {
        this.isRevving = false;
      }, 1300);
    } catch {
      this.isRevving = false;
    }
  }
}

export const audioEngine = new F1AudioEngine();
