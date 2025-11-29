class Song {
    constructor(data) {
        this.bpm = data.bpm;
        this.offset = data.offset || 0; // Offset in seconds
        this.notes = data.notes; // Array of { time: number, lane: number }
    }
}

// Generate a simple demo song
function generateDemoSong() {
    const bpm = 120;
    const notes = [];
    const duration = 60; // 60 seconds
    const beatInterval = 60 / bpm;

    for (let i = 0; i < duration / beatInterval; i++) {
        // Simple pattern: 0, 1, 2, 3, 3, 2, 1, 0
        const pattern = [0, 1, 2, 3, 3, 2, 1, 0];
        const lane = pattern[i % pattern.length];

        // Add some randomness
        if (Math.random() > 0.2) {
            notes.push({
                time: i * beatInterval,
                lane: lane
            });
        }

        // Occasional double notes
        if (Math.random() > 0.8) {
            notes.push({
                time: i * beatInterval,
                lane: (lane + 2) % 4
            });
        }
    }

    return new Song({
        bpm: bpm,
        offset: 2.0, // Start after 2 seconds
        notes: notes
    });
}

// Expose to global scope
window.Song = Song;
window.DEMO_SONG = generateDemoSong();
