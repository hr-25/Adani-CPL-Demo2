// Adani Cement CPL 2026 — Web Audio API Synthesizer Engine
// Fully self-contained browser-native sound generation with no external audio file dependencies

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.8;

  private getContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public enable(): void {
    this.isEnabled = true;
    this.getContext();
    this.playBidClick();
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.getContext();
      this.playBidClick();
    }
    return this.isEnabled;
  }

  public getSoundEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // 1. High-Clarity Corporate Bid Placement Click
  public playBidClick(): void {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio click error:', e);
    }
  }

  // 2. Gavel Warning Call (Going Once / Going Twice)
  public playWarning(multiplier: number = 1): void {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      const base = 523.25 * multiplier; // C5
      osc1.frequency.setValueAtTime(base, ctx.currentTime);
      osc2.frequency.setValueAtTime(base * 1.5, ctx.currentTime); // G5 5th harmony

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.45, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio warning error:', e);
    }
  }

  // 3. Master Sold Hammer Strike & Stadium Fanfare (Fanfare + Gavel Clack)
  public playSoldFanfare(): void {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;

      const t = ctx.currentTime;

      // Deep Wooden Gavel Thump
      const gavelOsc = ctx.createOscillator();
      const gavelGain = ctx.createGain();
      gavelOsc.type = 'sine';
      gavelOsc.frequency.setValueAtTime(180, t);
      gavelOsc.frequency.exponentialRampToValueAtTime(45, t + 0.25);

      gavelGain.gain.setValueAtTime(0.01, t);
      gavelGain.gain.linearRampToValueAtTime(this.volume * 0.9, t + 0.015);
      gavelGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      gavelOsc.connect(gavelGain);
      gavelGain.connect(this.masterGain);
      gavelOsc.start(t);
      gavelOsc.stop(t + 0.4);

      // Resonant Clack
      const clackOsc = ctx.createOscillator();
      const clackGain = ctx.createGain();
      clackOsc.type = 'triangle';
      clackOsc.frequency.setValueAtTime(480, t);
      clackOsc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

      clackGain.gain.setValueAtTime(this.volume * 0.75, t);
      clackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      clackOsc.connect(clackGain);
      clackGain.connect(this.masterGain);
      clackOsc.start(t);
      clackOsc.stop(t + 0.15);

      // Celebratory Brass Chords / Fanfare (C5 -> E5 -> G5 -> C6)
      const notes = [
        { f: 523.25, time: t + 0.22, dur: 0.2 },
        { f: 659.25, time: t + 0.38, dur: 0.2 },
        { f: 783.99, time: t + 0.54, dur: 0.25 },
        { f: 1046.5, time: t + 0.74, dur: 0.7 },
      ];

      notes.forEach((note) => {
        if (!this.masterGain) return;
        const oscA = ctx.createOscillator();
        const oscB = ctx.createOscillator();
        const noteGain = ctx.createGain();

        oscA.type = 'sawtooth';
        oscB.type = 'sine';
        oscA.frequency.setValueAtTime(note.f, note.time);
        oscB.frequency.setValueAtTime(note.f * 1.003, note.time); // Subtle rich detune

        noteGain.gain.setValueAtTime(0.0001, note.time);
        noteGain.gain.linearRampToValueAtTime(this.volume * 0.45, note.time + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, note.time + note.dur);

        oscA.connect(noteGain);
        oscB.connect(noteGain);
        noteGain.connect(this.masterGain);

        oscA.start(note.time);
        oscB.start(note.time);
        oscA.stop(note.time + note.dur + 0.05);
        oscB.stop(note.time + note.dur + 0.05);
      });
    } catch (e) {
      console.warn('Sold fanfare error:', e);
    }
  }

  // 4. Mark Unsold Descending Chime
  public playUnsold(): void {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;

      const t = ctx.currentTime;
      const notes = [
        { f: 587.33, time: t, dur: 0.18 }, // D5
        { f: 493.88, time: t + 0.16, dur: 0.18 }, // B4
        { f: 440.0, time: t + 0.32, dur: 0.35 }, // A4
      ];

      notes.forEach((note) => {
        if (!this.masterGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, note.time);

        gain.gain.setValueAtTime(0.001, note.time);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, note.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, note.time + note.dur);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(note.time);
        osc.stop(note.time + note.dur + 0.05);
      });
    } catch (e) {
      console.warn('Unsold sound error:', e);
    }
  }

  // 5. Monospace Countdown Tick
  public playCountdownTick(isUrgent: boolean = false): void {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isUrgent ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 950 : 700, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(this.volume * (isUrgent ? 0.2 : 0.08), ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (isUrgent ? 0.08 : 0.04));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('Tick error:', e);
    }
  }

  // 6. Outbid Urgent Alert
  public playOutbidAlert(): void {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, t); // E5
      osc.frequency.setValueAtTime(587.33, t + 0.08); // D5

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) {
      console.warn('Outbid alert error:', e);
    }
  }
}

export const sound = new SoundEngine();
