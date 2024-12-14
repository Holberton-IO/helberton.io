class PlayerWidget {
    constructor(myPlayer) {
        this.myPlayer = myPlayer;
        this.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.textColor = '#FFFFFF';
        this.rankColor = '#FFD700';
        this.faceColor = myPlayer.colorPattern || '#8B4513';
    }

    draw(ctx) {
        // Save the current context state
        ctx.save();

        // Reset transformation to draw in screen space
        ctx.resetTransform();

        // Widget dimensions and styling
        const width = 300;
        const height = 90;

        // Position (top-center)
        const leftMargin = (ctx.canvas.width - width) / 2;
        const topMargin = 10;

        // Background with rounded corners
        this.drawRoundedRect(ctx, leftMargin, topMargin, width, height, 10);
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();

        // Player image/emoji placeholder (avatar)
        this.drawPlayerHead(ctx, leftMargin + 10, topMargin + 10, 50, 50);

        // Player name
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = this.textColor;
        ctx.textBaseline = 'top';
        ctx.fillText(this.myPlayer.name, leftMargin + 70, topMargin + 10);

        // Player rank and stats (aligned below the name)
        ctx.font = '16px Arial';
        const rank = `🏆 #${this.myPlayer.rank || 'N/A'}`;
        ctx.fillStyle = this.rankColor;
        ctx.fillText(rank, leftMargin + 70, topMargin + 35);

        // Stats with emojis and colors
        ctx.font = '16px Arial';
        const scoreText = `🏁 `;
        const scoreValue = `${this.myPlayer.score || 0}%`;
        const killsText = `🔥 `;
        const killsValue = `x${this.myPlayer.kills || 0}`;
        
        // Score in green
        ctx.fillStyle = '#00FF00';  // Bright green
        ctx.fillText(scoreText, leftMargin + 70, topMargin + 55);
        ctx.fillText(scoreValue, leftMargin + 95, topMargin + 55);

        // Kills in red
        ctx.fillStyle = '#FF0000';  // Bright red
        ctx.fillText(killsText, leftMargin + 70, topMargin + 70);
        ctx.fillText(killsValue, leftMargin + 95, topMargin + 70);

        ctx.restore();
    }

    drawPlayerHead(ctx, x, y, width, height) {
        // Rounded square to mimic a player avatar
        ctx.fillStyle = this.faceColor;
        this.drawRoundedRect(ctx, x, y, width, height, 8);
        ctx.fill();

        // Face details (eyes and mouth)
        ctx.fillStyle = '#000000'; // Black for eyes

        // Eyes
        const eyeSize = width * 0.1;
        ctx.fillRect(x + width * 0.25, y + height * 0.3, eyeSize, eyeSize);
        ctx.fillRect(x + width * 0.65, y + height * 0.3, eyeSize, eyeSize);

        // Mouth (simple line)
        ctx.beginPath();
        ctx.moveTo(x + width * 0.3, y + height * 0.7);
        ctx.lineTo(x + width * 0.7, y + height * 0.7);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

export default PlayerWidget;
