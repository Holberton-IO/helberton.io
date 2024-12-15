class KillMessage {
    constructor(options = {}) {
        this.isActive = false;
        this.message = '';
        this.killer = '';
        this.startTime = 0;
        this.duration = options.duration || 3000; // 3 seconds
        
        this.styles = {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            textColor: '#FF4136',
            subtextColor: '#FFFFFF',
            progressBar: {
                mainColor: '#FF4136',
                edgeColor: 'rgba(255, 255, 255, 0.5)',
                patternColor: 'rgba(255, 255, 255, 0.2)'
            },
            font: {
                main: 'bold 48px Arial',
                sub: '24px Arial'
            }
        };


        this.OnMessageEnd = null;
    }

    showMessage(killerDetails = {},afterMessage=null) {
        this.isActive = true;
        this.startTime = Date.now();
        this.killer = killerDetails.name || 'Unknown Player';
        this.message = `YOU WERE KILLED BY`;
        this.OnMessageEnd=afterMessage;
    }

    update() {
        if (!this.isActive) return;

        const elapsedTime = Date.now() - this.startTime;
        if (elapsedTime > this.duration) {
            this.isActive = false;
            this.OnMessageEnd();
        }
    }

    draw(ctx) {
        if (!this.isActive) return;
        this.update();

        const canvas = ctx.canvas;
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;
        const progress = elapsedTime / this.duration;

        ctx.save();
        ctx.resetTransform();



        // Fade in/out effect
        ctx.globalAlpha = progress < 0.2 ? progress * 5 : 
                          progress > 0.8 ? 1 - ((progress - 0.8) * 5) : 1;


        // Background
        ctx.fillStyle = this.styles.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Main Message
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // First line: "YOU WERE KILLED BY"
        ctx.font = this.styles.font.main;
        ctx.fillStyle = this.styles.textColor;
        ctx.fillText(this.message, canvas.width / 2, canvas.height / 2 - 50);

        // Killer's name
        ctx.font = this.styles.font.sub;
        ctx.fillStyle = this.styles.subtextColor;
        ctx.fillText(this.killer, canvas.width / 2, canvas.height / 2 + 50);

        // Progress Bar with Pattern
        const barHeight = 10;
        const barWidth = canvas.width;
        const remainingProgress = 1 - progress;

        // Background pattern
        ctx.fillStyle = this.styles.progressBar.patternColor;
        ctx.fillRect(0, canvas.height - barHeight, barWidth, barHeight);

        // Main progress bar
        ctx.fillStyle = this.styles.progressBar.mainColor;
        ctx.fillRect(
            0, 
            0,
            barWidth * remainingProgress, 
            barHeight
        );

        // Edge highlight
        ctx.fillStyle = this.styles.progressBar.edgeColor;
        ctx.fillRect(
            0, 
            canvas.height - barHeight, 
            barWidth * remainingProgress, 
            2
        );

        ctx.restore();
    }

    reset() {
        this.isActive = false;
        this.message = '';
        this.killer = '';
        this.startTime = 0;
    }
}

export default KillMessage;
