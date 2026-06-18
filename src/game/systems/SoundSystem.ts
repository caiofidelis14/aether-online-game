const STORAGE_KEY = 'aether_sound_v1';

interface SoundSettings {
  music: number; // 0-1
  sfx: number;   // 0-1
}

function loadSettings(): SoundSettings {
  try { return { music: 0.25, sfx: 0.7, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }; }
  catch { return { music: 0.25, sfx: 0.7 }; }
}

export class SoundSystem {
  private ctx: AudioContext;
  private musicGain: GainNode;
  private sfxGain: GainNode;
  private settings: SoundSettings;
  private ambOscs: OscillatorNode[] = [];
  private ambRunning = false;

  constructor() {
    this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    this.musicGain = this.ctx.createGain();
    this.sfxGain   = this.ctx.createGain();
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain.connect(this.ctx.destination);
    this.settings = loadSettings();
    this.musicGain.gain.value = this.settings.music;
    this.sfxGain.gain.value   = this.settings.sfx;
  }

  getMusicVolume() { return this.settings.music; }
  getSfxVolume()   { return this.settings.sfx; }

  setMusicVolume(v: number) {
    this.settings.music = Math.max(0, Math.min(1, v));
    this.musicGain.gain.value = this.settings.music;
    this.save();
  }

  setSfxVolume(v: number) {
    this.settings.sfx = Math.max(0, Math.min(1, v));
    this.sfxGain.gain.value = this.settings.sfx;
    this.save();
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
  }

  // resume context on first user interaction (browser policy)
  resume() { if (this.ctx.state === 'suspended') this.ctx.resume(); }

  // ── SFX ──────────────────────────────────────────────────────────────────

  playAttack() {
    this.resume();
    const t = this.ctx.currentTime;
    // Short punch: fast envelope with pitch drop
    const osc = this.ctx.createOscillator();
    const g   = this.ctx.createGain();
    osc.connect(g); g.connect(this.sfxGain);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.07);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t); osc.stop(t + 0.1);
  }

  playSkill() {
    this.resume();
    const t = this.ctx.currentTime;
    [440, 554, 659].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g   = this.ctx.createGain();
      osc.connect(g); g.connect(this.sfxGain);
      osc.type = 'sine'; osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t + i * 0.04);
      g.gain.linearRampToValueAtTime(0.25, t + i * 0.04 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.18);
      osc.start(t + i * 0.04); osc.stop(t + i * 0.04 + 0.2);
    });
  }

  playHit() {
    this.resume();
    const t   = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.05), this.ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = this.ctx.createBufferSource();
    const g   = this.ctx.createGain();
    src.buffer = buf; src.connect(g); g.connect(this.sfxGain);
    g.gain.value = 0.2; src.start(t);
  }

  playLevelUp() {
    this.resume();
    const t = this.ctx.currentTime;
    [523, 659, 784, 1047, 1319].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g   = this.ctx.createGain();
      osc.connect(g); g.connect(this.sfxGain);
      osc.type = 'sine'; osc.frequency.value = freq;
      const st = t + i * 0.1;
      g.gain.setValueAtTime(0, st);
      g.gain.linearRampToValueAtTime(0.35, st + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
      osc.start(st); osc.stop(st + 0.3);
    });
  }

  playCoin() {
    this.resume();
    const t = this.ctx.currentTime;
    [1320, 1760].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g   = this.ctx.createGain();
      osc.connect(g); g.connect(this.sfxGain);
      osc.type = 'sine'; osc.frequency.value = freq;
      g.gain.setValueAtTime(0.18, t + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.12);
      osc.start(t + i * 0.07); osc.stop(t + i * 0.07 + 0.12);
    });
  }

  playPortal() {
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g   = this.ctx.createGain();
    osc.connect(g); g.connect(this.sfxGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.4);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.start(t); osc.stop(t + 0.5);
  }

  // ── Ambient Music ────────────────────────────────────────────────────────

  startAmbient() {
    if (this.ambRunning) return;
    this.ambRunning = true;
    this.resume();
    const chords = [
      [110, 138.6, 164.8], // Am
      [98, 123.5, 146.8],  // Gm
      [130.8, 164.8, 196], // C
      [110, 138.6, 164.8], // Am
    ];
    let beat = 0;
    const playChord = () => {
      if (!this.ambRunning) return;
      const t = this.ctx.currentTime;
      const chord = chords[beat % chords.length];
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const g   = this.ctx.createGain();
        osc.connect(g); g.connect(this.musicGain);
        osc.type = 'sine'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.07, t + 0.5);
        g.gain.linearRampToValueAtTime(0.07, t + 3.5);
        g.gain.linearRampToValueAtTime(0, t + 4.5);
        osc.start(t); osc.stop(t + 4.5);
        this.ambOscs.push(osc);
      });
      beat++;
      setTimeout(playChord, 4000);
    };
    playChord();
  }

  stopAmbient() {
    this.ambRunning = false;
    this.ambOscs.forEach(o => { try { o.stop(); } catch { /* already stopped */ } });
    this.ambOscs = [];
  }
}

let _instance: SoundSystem | null = null;
export function getSoundSystem(): SoundSystem {
  if (!_instance) _instance = new SoundSystem();
  return _instance;
}
