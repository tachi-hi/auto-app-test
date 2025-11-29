class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);
        }

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playHitSound() {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Simple beat generator for background music
    startMusic(bpm) {
        if (!this.ctx) return;

        this.stopMusic();

        const interval = 60 / bpm;
        this.nextNoteTime = this.ctx.currentTime;
        this.isPlaying = true;
        this.scheduleNextNote(interval);
    }

    scheduleNextNote(interval) {
        if (!this.isPlaying) return;

        const secondsPerBeat = interval;

        // Schedule a beat
        this.playKick(this.nextNoteTime);

        // Advance time
        this.nextNoteTime += secondsPerBeat;

        // Schedule next call
        const delay = this.nextNoteTime - this.ctx.currentTime;
        setTimeout(() => {
            this.scheduleNextNote(interval);
        }, delay * 1000);
    }

    playKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    stopMusic() {
        this.isPlaying = false;
    }
}
