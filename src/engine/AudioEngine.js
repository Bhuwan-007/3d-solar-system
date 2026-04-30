export class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.droneOsc = null;
    this.droneGain = null;
    this.warpNoise = null;
    this.warpFilter = null;
    this.warpGain = null;
  }

  toggle() {
    const btn = document.getElementById('init-audio-btn');
    if (!btn) return;
    
    // Toggle Logic if already initialized
    if (this.audioCtx) {
        if (this.audioCtx.state === 'running') {
            this.audioCtx.suspend();
            btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 19h4l5 5V0L9 5H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> Audio Paused';
            btn.classList.replace('bg-blue-900/40', 'bg-red-900/40');
            btn.classList.replace('border-blue-500/50', 'border-red-500/50');
        } else if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
            btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 19h4l5 5V0L9 5H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> Audio Online';
            btn.classList.replace('bg-red-900/40', 'bg-blue-900/40');
            btn.classList.replace('border-red-500/50', 'border-blue-500/50');
        }
        return;
    }

    // Initialization (First Click)
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 1. Deep Space Drone
    this.droneOsc = this.audioCtx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.value = 45;
    this.droneGain = this.audioCtx.createGain();
    this.droneGain.gain.value = 0.4;
    this.droneOsc.connect(this.droneGain);
    this.droneGain.connect(this.audioCtx.destination);
    this.droneOsc.start();

    // 2. Warp Speed Thruster
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    this.warpNoise = this.audioCtx.createBufferSource();
    this.warpNoise.buffer = buffer;
    this.warpNoise.loop = true;
    
    this.warpFilter = this.audioCtx.createBiquadFilter();
    this.warpFilter.type = 'lowpass';
    this.warpFilter.frequency.value = 100; 
    
    this.warpGain = this.audioCtx.createGain();
    this.warpGain.gain.value = 0.0; 
    
    this.warpNoise.connect(this.warpFilter);
    this.warpFilter.connect(this.warpGain);
    this.warpGain.connect(this.audioCtx.destination);
    this.warpNoise.start();

    btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 19h4l5 5V0L9 5H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> Audio Online';
    
    if (btn.classList.contains('bg-green-900/40')) {
        btn.classList.replace('bg-green-900/40', 'bg-blue-900/40');
        btn.classList.replace('border-green-500/50', 'border-blue-500/50');
    }
  }

  playUIClick() {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.1);
  }

  updateWarpSound(scrollVelocity) {
    if(this.audioCtx && this.warpGain) {
      const scrollSpd = Math.min(Math.abs(scrollVelocity) / 50, 1.0);
      this.warpGain.gain.setTargetAtTime(scrollSpd * 0.3, this.audioCtx.currentTime, 0.1);
      this.warpFilter.frequency.setTargetAtTime(100 + scrollSpd * 3000, this.audioCtx.currentTime, 0.1);
    }
  }
}
