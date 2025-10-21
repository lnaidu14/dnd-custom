export class AudioManager {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.tracks = new Map();
    this.effects = new Map();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
  }

  async loadTrack(name, url, type = 'music') {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

    const track = {
      buffer: audioBuffer,
      gain: this.context.createGain(),
      source: null,
      type,
      volume: type === 'music' ? 0.5 : 0.8
    };

    track.gain.connect(this.masterGain);
    this.tracks.set(name, track);
  }

  playTrack(name, options = { loop: true, fadeIn: 2 }) {
    const track = this.tracks.get(name);
    if (!track) return;

    if (track.source) {
      track.source.stop();
    }

    track.source = this.context.createBufferSource();
    track.source.buffer = track.buffer;
    track.source.loop = options.loop;
    track.source.connect(track.gain);

    // Fade in
    track.gain.gain.setValueAtTime(0, this.context.currentTime);
    track.gain.gain.linearRampToValueAtTime(
      track.volume,
      this.context.currentTime + options.fadeIn
    );

    track.source.start();
  }

  playEffect(name, options = { spatialize: false, position: null }) {
    const effect = this.effects.get(name);
    if (!effect) return;

    const source = this.context.createBufferSource();
    source.buffer = effect.buffer;

    if (options.spatialize && options.position) {
      const panner = this.context.createPanner();
      panner.setPosition(...options.position);
      source.connect(panner);
      panner.connect(effect.gain);
    } else {
      source.connect(effect.gain);
    }

    source.start();
  }
}