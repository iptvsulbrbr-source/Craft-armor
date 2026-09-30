/**
 * Native Web Audio API Sound Synthesizer
 * Zero external audio assets, works 100% offline in browser
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazily initialized on user interaction to comply with browser autoplay policies
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sound when purchasing a weapon
   */
  public playBuy() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12); // C6

    osc2.frequency.setValueAtTime(659.25, now); // E5
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.22);
    osc2.stop(now + 0.22);
  }

  /**
   * Sound when merging two weapons. Rich harmonic chord with golden resonance!
   */
  public playMerge(tier: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreq = 240 + Math.min(tier, 15) * 50; // Higher tiers produce higher base resonance
    
    // Notes for harmonic chord based on tier
    const frequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
    if (tier >= 4) frequencies.push(baseFreq * 2);
    if (tier >= 8) frequencies.push(baseFreq * 2.5);
    if (tier >= 12) frequencies.push(baseFreq * 3);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + (0.38 + tier * 0.025));
    masterGain.connect(ctx.destination);

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      osc.type = tier >= 10 ? 'sawtooth' : tier >= 5 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.08, now + 0.32);

      noteGain.gain.setValueAtTime(0.12, now + idx * 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + idx * 0.03);
      osc.stop(now + 0.45);
    });

    // Golden sparkle high bell
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(1800 + tier * 80, now + 0.08);
    chimeOsc.frequency.exponentialRampToValueAtTime(2400 + tier * 100, now + 0.35);
    chimeGain.gain.setValueAtTime(0.08, now + 0.08);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chimeOsc.start(now + 0.08);
    chimeOsc.stop(now + 0.4);
  }

  /**
   * Sound when selling a weapon - crisp coin register cascade
   */
  public playSell() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.035);

      gain.gain.setValueAtTime(0.15, now + i * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.035 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.035);
      osc.stop(now + i * 0.035 + 0.2);
    });
  }

  /**
   * Sound when converting Cedulas to Diamonds (crystalline shimmer)
   */
  public playDiamondConvert() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const crystalNotes = [1318.51, 1661.22, 1975.53, 2637.02]; // E6, G#6, B6, E7

    crystalNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.14, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.38);
    });
  }

  /**
   * Sound when starting a craft / forge process (anvil strike)
   */
  public playCraftStart() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Sound when unlocking a new tier for the very first time
   */
  public playUnlock() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.35);
    });
  }

  /**
   * Sound for invalid actions (e.g. board full, not enough cedulas)
   */
  public playError() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.18);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Sound when two weapons swap positions on the workbench
   */
  public playSwap() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(460, now + 0.04);
    osc.frequency.linearRampToValueAtTime(380, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Sound when opening a Season Pass Chest (triumphant coin burst + golden fanfare)
   */
  public playChestReward() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Fanfare chord progression (C5 -> E5 -> G5 -> C6 -> E6)
    const fanfareNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51];

    fanfareNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx >= 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.04, now + idx * 0.055 + 0.3);

      gain.gain.setValueAtTime(0.18, now + idx * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.5);
    });

    // Coin shower cascade chimes
    const coinNotes = [1567.98, 1760.0, 2093.0, 2349.32, 2637.02, 3135.96];
    coinNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.15 + i * 0.04);

      gain.gain.setValueAtTime(0.12, now + 0.15 + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + i * 0.04 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + 0.15 + i * 0.04);
      osc.stop(now + 0.15 + i * 0.04 + 0.22);
    });
  }

  /**
   * Crisp synthesized click for buttons, tiles and interactive elements
   */
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const sound = new SoundEngine();
