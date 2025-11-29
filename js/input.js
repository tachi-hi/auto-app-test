class InputManager {
    constructor() {
        this.keys = {
            'KeyD': 0,
            'KeyF': 1,
            'KeyJ': 2,
            'KeyK': 3
        };
        this.listeners = [];

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);

        // Attach event listeners
        window.addEventListener('keydown', this.handleKeyDown);
    }

    on(event, callback) {
        if (event === 'keydown') {
            this.listeners.push(callback);
        }
    }

    handleKeyDown(event) {
        if (this.keys.hasOwnProperty(event.code)) {
            const laneIndex = this.keys[event.code];
            this.listeners.forEach(callback => callback(laneIndex));
        } else if (event.code === 'Space') {
            // Special case for start/restart
            this.listeners.forEach(callback => callback('START'));
        }
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.listeners = [];
    }
}
