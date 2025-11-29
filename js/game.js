// import { Renderer } from './renderer.js';
// import { AudioManager } from './audio.js';
// import { InputManager } from './input.js';
// import { DEMO_SONG } from './song.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.audio = new AudioManager();
        this.input = new InputManager();

        this.state = 'MENU'; // MENU, PLAYING, GAMEOVER
        this.score = 0;
        this.combo = 0;
        this.startTime = 0;
        this.song = DEMO_SONG;

        // Active notes (cloned from song data)
        this.notes = [];

        // UI Elements
        this.scoreEl = document.getElementById('score-value');
        this.comboEl = document.getElementById('combo-value');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreEl = document.getElementById('final-score');

        // Bind loop
        this.loop = this.loop.bind(this);

        // Input handling
        this.input.on('keydown', (lane) => this.handleInput(lane));

        // Start loop
        requestAnimationFrame(this.loop);
    }

    start() {
        this.audio.init();
        this.state = 'PLAYING';
        this.score = 0;
        this.combo = 0;
        this.updateUI();

        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');

        // Clone notes so we can modify the array (remove hit notes)
        this.notes = this.song.notes.map(n => ({ ...n, hit: false }));

        this.audio.startMusic(this.song.bpm);
        this.startTime = this.audio.ctx.currentTime + this.song.offset;
    }

    handleInput(lane) {
        if (lane === 'START') {
            if (this.state === 'MENU' || this.state === 'GAMEOVER') {
                this.start();
            }
            return;
        }

        if (this.state !== 'PLAYING') return;

        this.renderer.drawLaneFeedback(lane);

        const currentTime = this.audio.ctx.currentTime;
        const songTime = currentTime - this.startTime;

        // Find closest note in this lane
        // We only care about notes that haven't been hit yet
        const hitWindow = 0.15; // seconds

        const noteIndex = this.notes.findIndex(n =>
            !n.hit &&
            n.lane === lane &&
            Math.abs(n.time - songTime) < hitWindow
        );

        if (noteIndex !== -1) {
            const note = this.notes[noteIndex];
            const diff = Math.abs(note.time - songTime);

            // Hit!
            note.hit = true;
            this.audio.playHitSound();

            let points = 0;
            if (diff < 0.05) {
                points = 300; // Perfect
            } else if (diff < 0.1) {
                points = 100; // Good
            } else {
                points = 50; // Bad
            }

            this.score += points;
            this.combo++;
            this.updateUI();
        } else {
            // Miss (clicked but no note)
            this.combo = 0;
            this.updateUI();
        }
    }

    update() {
        if (this.state !== 'PLAYING') return;

        const currentTime = this.audio.ctx.currentTime;
        const songTime = currentTime - this.startTime;

        // Check for misses (notes passed without being hit)
        this.notes.forEach(n => {
            if (!n.hit && songTime > n.time + 0.2) {
                n.hit = true; // Mark as processed so we don't check again
                this.combo = 0;
                this.updateUI();
            }
        });

        // Check for song end
        const lastNoteTime = this.song.notes[this.song.notes.length - 1].time;
        if (songTime > lastNoteTime + 2.0) {
            this.gameOver();
        }
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawHighway();

        if (this.state === 'PLAYING') {
            const currentTime = this.audio.ctx.currentTime;
            const songTime = currentTime - this.startTime;

            // Draw notes
            // We need to map time to progress (0 to 1)
            // Let's say notes appear 2 seconds before they hit
            const lookahead = 2.0;

            this.notes.forEach(n => {
                if (n.hit) return;

                const timeToHit = n.time - songTime;

                if (timeToHit < lookahead && timeToHit > -0.2) {
                    // progress = 1 when timeToHit = 0
                    // progress = 0 when timeToHit = lookahead
                    const progress = 1 - (timeToHit / lookahead);
                    this.renderer.drawNote(n.lane, progress);
                }
            });
        }
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    }

    updateUI() {
        this.scoreEl.textContent = this.score;
        this.comboEl.textContent = this.combo;
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.audio.stopMusic();
        this.finalScoreEl.textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
    }
}
