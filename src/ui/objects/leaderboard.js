class Leaderboard {
    constructor() {
        this.players = [];
        this.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.borderColor = 'rgba(255, 255, 255, 0.2)';
        this.titleColor = '#ffffff';
    }

    updateLeaderboard(players) {
        this.players = players;
    }

    removePlayer(name) {
        this.players = this.players.filter(p => p.name !== name);
    }

    clearLeaderboard() {
        this.players = [];
    }

    draw(ctx) {
        if (this.players.length <= 0) return;

        ctx.save();
        ctx.resetTransform();

        // Leaderboard styling
        const width = 300;
        const lineHeight = 40;
        const fontSize = 24;
        const padding = 15;

        // Position
        const leftMargin = 40;
        const topMargin = 40;

        // Background with rounded corners
        ctx.beginPath();
        ctx.roundRect(
            leftMargin, 
            topMargin, 
            width, 
            this.players.length * lineHeight + lineHeight + padding * 2, 
            10
        );
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();
        
        // Border
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Title
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = this.titleColor;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Leaderboard", leftMargin + padding, topMargin + padding);

        // Draw players name and score
        this.players.forEach((player, index) => {
            const yPosition = topMargin + lineHeight * (index + 1.5) + padding;
            
            // Choose color based on player data
            ctx.fillStyle = player.playerColor;
            
            // Draw player name and score
            ctx.font = `${fontSize}px Arial`;
            ctx.fillText(
                `${index + 1}. ${player.name}`, 
                leftMargin + padding, 
                yPosition
            );
            
            // Align score to the right
            ctx.textAlign = "right";
            ctx.fillText(
                `${player.score} %`,
                leftMargin + width - padding, 
                yPosition
            );
            
            // Reset text alignment
            ctx.textAlign = "left";
        });

        ctx.restore();
    }
}

export default Leaderboard;
