/**
 * Процедурный ambient pad через Web Audio API.
 *
 * Собственная композиция в минорном ладу с медленной аккордовой прогрессией
 * Am → F → C → G, суббасом и «шимером» в верхнем регистре. Простой реверб
 * через DelayNode с обратной связью. Никаких сэмплов, никаких файлов,
 * никаких нарушений копирайта Джона Уильямса — оригинальный синтез,
 * похожий по настроению на кинематографический sci-fi ambient.
 */

interface Voice {
  osc: OscillatorNode;
  gain: GainNode;
}

// Полутоны от корня A2 (110 Hz). MIDI: A2 = 45.
// Прогрессия: Am (0, 3, 7, 12) → F (-4, 0, 3, 8) → C (3, 7, 10, 15) → G (-2, 2, 5, 10)
const ROOT_HZ = 110;
const CHORD_STEPS: number[][] = [
  [0, 3, 7, 12, 15], // Am (с добавленной 9 = 15)
  [-4, 0, 3, 8, 12], // F maj7
  [3, 7, 10, 15, 19], // C add9
  [-2, 2, 5, 10, 14], // G
];
const CHORD_INTERVAL_SEC = 8;
const DETUNE_CENTS = [-9, 9];

function midiOffsetToHz(offset: number): number {
  return ROOT_HZ * Math.pow(2, offset / 12);
}

export class AmbientPad {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wetBus: GainNode | null = null;
  private dryBus: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private voices: Voice[] = [];
  private subOsc: OscillatorNode | null = null;
  private subGain: GainNode | null = null;
  private shimmerOsc: OscillatorNode | null = null;
  private shimmerGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private started = false;
  private chordTimer: number | null = null;
  private chordIndex = 0;

  isRunning(): boolean {
    return this.started && this.ctx?.state === 'running';
  }

  async ensure(): Promise<AudioContext> {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();

      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);

      // Простой feedback-delay реверб
      this.dryBus = this.ctx.createGain();
      this.dryBus.gain.value = 0.75;
      this.dryBus.connect(this.master);

      this.wetBus = this.ctx.createGain();
      this.wetBus.gain.value = 0.35;
      this.wetBus.connect(this.master);

      const delay = this.ctx.createDelay(2);
      delay.delayTime.value = 0.45;
      const feedback = this.ctx.createGain();
      feedback.gain.value = 0.55;
      const wetFilter = this.ctx.createBiquadFilter();
      wetFilter.type = 'lowpass';
      wetFilter.frequency.value = 1800;

      delay.connect(wetFilter);
      wetFilter.connect(feedback);
      feedback.connect(delay);
      wetFilter.connect(this.wetBus);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 700;
      this.filter.Q.value = 0.7;
      this.filter.connect(this.dryBus);
      this.filter.connect(delay);
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  private buildVoices(): void {
    if (!this.ctx || !this.filter || !this.master || !this.dryBus) return;

    const initial = CHORD_STEPS[0];
    for (const step of initial) {
      const freq = midiOffsetToHz(step);
      for (const detune of DETUNE_CENTS) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = detune;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.04 / Math.max(0.7, freq / ROOT_HZ);

        osc.connect(gain).connect(this.filter);
        osc.start();

        this.voices.push({ osc, gain });
      }
    }

    // Суббас — синусоида на корневой ноте октавой ниже
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.value = ROOT_HZ / 2; // A1
    this.subGain = this.ctx.createGain();
    this.subGain.gain.value = 0.09;
    this.subOsc.connect(this.subGain).connect(this.dryBus);
    this.subOsc.start();

    // Верхний shimmer — тихая синусоида на 5-й октаве корня
    this.shimmerOsc = this.ctx.createOscillator();
    this.shimmerOsc.type = 'sine';
    this.shimmerOsc.frequency.value = ROOT_HZ * 8; // A5
    this.shimmerGain = this.ctx.createGain();
    this.shimmerGain.gain.value = 0.012;
    this.shimmerOsc.connect(this.shimmerGain).connect(this.dryBus);
    this.shimmerOsc.start();

    // LFO на частоту среза фильтра — «дыхание»
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.value = 0.07;
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 350;
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);
    this.lfo.start();

    // Розовый шум — «звёздная пыль»
    this.noise = this.buildPinkNoise();
    if (this.noise) {
      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.value = 0.011;
      this.noise.connect(this.noiseGain).connect(this.dryBus);
      this.noise.start();
    }

    this.scheduleNextChord();
  }

  private scheduleNextChord(): void {
    if (typeof window === 'undefined') return;
    this.chordTimer = window.setTimeout(() => {
      this.chordIndex = (this.chordIndex + 1) % CHORD_STEPS.length;
      this.applyChord(this.chordIndex);
      this.scheduleNextChord();
    }, CHORD_INTERVAL_SEC * 1000);
  }

  private applyChord(index: number): void {
    if (!this.ctx) return;
    const chord = CHORD_STEPS[index];
    const now = this.ctx.currentTime;
    const ramp = 3.5; // плавный переход между аккордами
    let vi = 0;
    for (const step of chord) {
      const freq = midiOffsetToHz(step);
      for (const detune of DETUNE_CENTS) {
        const voice = this.voices[vi++];
        if (!voice) continue;
        voice.osc.frequency.cancelScheduledValues(now);
        voice.osc.frequency.linearRampToValueAtTime(freq, now + ramp);
        voice.osc.detune.setValueAtTime(detune, now);
      }
    }
    // Суббас идёт по корню аккорда
    if (this.subOsc) {
      const rootHz = midiOffsetToHz(chord[0]) / 2;
      this.subOsc.frequency.cancelScheduledValues(now);
      this.subOsc.frequency.linearRampToValueAtTime(rootHz, now + ramp);
    }
    // Shimmer — на квинте аккорда, октавой вверх
    if (this.shimmerOsc) {
      const fifth = chord[2] ?? chord[0];
      const shimmerHz = midiOffsetToHz(fifth) * 4;
      this.shimmerOsc.frequency.cancelScheduledValues(now);
      this.shimmerOsc.frequency.linearRampToValueAtTime(shimmerHz, now + ramp);
    }
  }

  private buildPinkNoise(): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  }

  async start(volume: number): Promise<void> {
    await this.ensure();
    if (!this.started) {
      this.buildVoices();
      this.started = true;
    }
    this.setVolume(volume);
  }

  setVolume(volume: number): void {
    if (!this.master || !this.ctx) return;
    const target = Math.max(0, Math.min(1, volume)) * 0.35;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(target, now + 0.6);
  }

  fadeOut(): void {
    if (!this.master || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.4);
    if (this.chordTimer !== null) {
      clearTimeout(this.chordTimer);
      this.chordTimer = null;
    }
  }
}

let singleton: AmbientPad | null = null;
export function getAmbientPad(): AmbientPad {
  if (!singleton) singleton = new AmbientPad();
  return singleton;
}
