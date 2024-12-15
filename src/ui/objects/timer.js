class Timer {
    constructor() {
        this.timeRemaining = 5 * 60; // 5 minutes in seconds
        this.isStarted = false;
        this.lastUpdateTime = Date.now();
    }

    start() {
        this.isStarted = true;
        this.lastUpdateTime = Date.now();
    }

    stop() {
        this.isStarted = false;
    }

    reset() {
        this.timeRemaining = 5 * 60;
        this.lastUpdateTime = Date.now();
    }

    formatTime() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    loop() {
        if (!this.isStarted || this.timeRemaining <= 0) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime >= 1000) {
            this.timeRemaining--;
            this.lastUpdateTime = currentTime;
        }
    }

    draw(ctx) {
        const canvas = ctx.canvas;
        this.loop();
        
        ctx.save();
        ctx.resetTransform();
        
        // Set text properties
        ctx.font = "bold 32px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        
        // Draw timer at top right with 20px top margin and 20px right margin
        ctx.fillText(this.formatTime(), canvas.width - 40, 20);
        
        ctx.restore();
    }
}

export default Timer;
