import Decorations from "./decorations";


class Tree extends Decorations {
    constructor(x, y, options = {}) {
        super(x, y, options);
        this.treeColor = options.treeColor || '#228B22';
        this.ornamentColors = options.ornamentColors || ['#FF0000', '#FFD700', '#00FFFF'];
        this.size = options.size || 400;
        this.starColor = options.starColor || '#FFD700';
        this.curveDirection = options.curveDirection || 'center';
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Tree trunk
        const trunkWidth = this.size * 0.2;
        const trunkHeight = this.size * 0.3;
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(-trunkWidth / 2, 0, trunkWidth, trunkHeight);

        // Tree layers
        const layers = 3;
        const layerHeight = this.size / layers;
        for (let i = 0; i < layers; i++) {
            const yOffset = -trunkHeight - i * layerHeight * 0.8;
            const layerWidth = this.size - i * 15;

            // Curve adjustment based on direction
            const curveOffset = this._calculateCurveOffset(layerWidth, i);

            // Create gradient for the tree layer
            const gradient = ctx.createLinearGradient(
                -layerWidth / 2, yOffset, layerWidth / 2, yOffset + layerHeight
            );
            gradient.addColorStop(0, '#2E8B57'); // Dark green
            gradient.addColorStop(0.5, this.treeColor); // Main green
            gradient.addColorStop(1, '#3CB371'); // Lighter green

            ctx.fillStyle = gradient;

            // Draw the tree layer
            ctx.beginPath();
            ctx.moveTo(0, yOffset);
            ctx.quadraticCurveTo(
                curveOffset.controlX, yOffset + layerHeight / 2,
                layerWidth / 2, yOffset + layerHeight
            );
            ctx.lineTo(-layerWidth / 2, yOffset + layerHeight);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    _calculateCurveOffset(layerWidth, layerIndex) {
        const curveStrength = layerWidth * 0.2;
        const layerAdjustment = layerIndex * curveStrength * 0.1;

        switch (this.curveDirection) {
            case 'left':
                return { controlX: -curveStrength - layerAdjustment };
            case 'right':
                return { controlX: curveStrength + layerAdjustment };
            case 'up':
                return { controlX: 0 };
            case 'down':
                return { controlX: 0 };
            default:
                return { controlX: 0 };
        }
    }
}

export default Tree;