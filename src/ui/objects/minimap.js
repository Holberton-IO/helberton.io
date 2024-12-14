
class MiniMap {
    constructor(options = {}) {
        this.width = options.width || 250;
        this.height = options.height || 250;
        this.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        this.borderColor = 'rgba(200, 230, 255, 0.5)';

        this.colors = {
            empty: 'rgba(220, 240, 255, 0.3)',
            occupied: 'rgba(100, 150, 200, 0.5)',
            player: 'rgba(0, 100, 255, 0.7)',
            currentPlayer: 'rgba(255, 69, 0, 0.8)'
        };

        // Positioning
        this.leftMargin = options.leftMargin || 40;
        this.bottomMargin = options.bottomMargin || 40;

        this.running = true;
    }

    draw(ctx, gameEngine, currentPlayer) {
        if(this.running === false) return;


        const blocks = gameEngine.gameObjects.blocks;
        ctx.save();
        ctx.resetTransform();

        // Find world boundaries
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        blocks.forEach(block => {
            const blockPos = block.position;
            minX = Math.min(minX, blockPos.x);
            maxX = Math.max(maxX, blockPos.x);
            minY = Math.min(minY, blockPos.y);
            maxY = Math.max(maxY, blockPos.y);
        });

        // Add some padding
        const worldWidth = maxX - minX + 2;
        const worldHeight = maxY - minY + 2;

        // Calculate scaling factors
        const scaleX = this.width / worldWidth;
        const scaleY = this.height / worldHeight;

        // Position of mini-map
        const x = this.leftMargin;
        const y = ctx.canvas.height - this.height - this.bottomMargin;

        // Draw background with frost effect
        ctx.beginPath();
        ctx.roundRect(x, y, this.width, this.height, 10);
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();

        // Draw border with ice-like effect
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw blocks
        blocks.forEach(block => {
            const blockPos = block.position;
            const blockX = x + (blockPos.x - minX) * scaleX;
            const blockY = y + (blockPos.y - minY) * scaleY;
            
            const player = gameEngine.gameObjects.isPlayerIdExist(block.colorsWithId.id);
            let blockColor = this.colors.empty;
            
            if(player){
                blockColor = block.colorsWithId.pattern;
            }
            
            ctx.fillStyle = blockColor;
            ctx.fillRect(blockX, blockY, scaleX, scaleY);
        });

        // Draw players
        const players = gameEngine.gameObjects.players;
        Object.values(players).forEach(player => {
            // Use position from the player object
            const playerPos = player.position;
            
            // Adjust player position relative to world boundaries
            const playerX = x + (playerPos.x - minX) * scaleX;
            const playerY = y + (playerPos.y - minY) * scaleY;
            
            // Determine player color
            ctx.fillStyle = player === currentPlayer 
                ? this.colors.currentPlayer 
                : this.colors.player;
            
            // Draw player as a slightly larger dot
            ctx.beginPath();
            ctx.arc(playerX + scaleX/2, playerY + scaleY/2, scaleX, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

export default MiniMap;
