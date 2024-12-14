import Decorations from "./decorations";

class Lights extends Decorations {
    constructor(x, y, options = {}) {
        super(x, y, options);

        // Configurable properties
        this.length = options.length || 200;
        this.numLights = options.numLights || 15;
        this.lightColors = options.lightColors || [
            '#FF0000',   // Red
            '#00FF00',   // Green
            '#0000FF',   // Blue
            '#FFD700',   // Gold
            '#FF69B4',   // Pink
            '#00FFFF'    // Cyan
        ];

        // Animation properties
        this.animationFrame = 0;
        this.twinkleIntensity = options.twinkleIntensity || 0.5;

        // Light properties
        this.lightRadius = options.lightRadius || 5;
        this.lightSpacing = this.length / (this.numLights - 1);

        // Curve properties
        this.curviness = options.curviness || 0.2; // How much the lights curve
        this.flipVertical = options.flipVertical || false; // Flip curve vertically
        this.flipHorizontal = options.flipHorizontal || false; // Flip curve horizontally
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Adjust scaling for flip
        const verticalFactor = this.flipVertical ? -1 : 1;
        const horizontalFactor = this.flipHorizontal ? -1 : 1;

        // Draw the light string (wire)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100,100,100,0.5)';
        ctx.lineWidth = 2;

        // Increment animation frame for continuous twinkling
        this.animationFrame++;

        for (let i = 0; i < this.numLights; i++) {
            const t = i / (this.numLights - 1);

            // Calculate x and y positions with flipping
            const x = horizontalFactor * (t * this.length +
                Math.sin(t * Math.PI) * this.length * this.curviness);

            const y = verticalFactor * (Math.sin(t * Math.PI) * this.length * this.curviness * 0.5);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw individual lights
        for (let i = 0; i < this.numLights; i++) {
            const t = i / (this.numLights - 1);

            const x = horizontalFactor * (t * this.length +
                Math.sin(t * Math.PI) * this.length * this.curviness);
            const y = verticalFactor * (Math.sin(t * Math.PI) * this.length * this.curviness * 0.5);

            const colorIndex = i % this.lightColors.length;
            const baseColor = this.lightColors[colorIndex];

            // Create twinkling effect
            const twinkleOffset = Math.sin(this.animationFrame * 0.1 + i) * this.twinkleIntensity;
            const opacity = 0.6 + twinkleOffset;

            // Draw light
            ctx.beginPath();
            ctx.fillStyle = this.adjustColorOpacity(baseColor, opacity);
            ctx.arc(x, y, this.lightRadius, 0, Math.PI * 2);
            ctx.fill();

            // Optional: Add a subtle glow
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
                x, y, 0,
                x, y, this.lightRadius * 2
            );
            gradient.addColorStop(0, this.adjustColorOpacity(baseColor, opacity));
            gradient.addColorStop(1, this.adjustColorOpacity(baseColor, 0));

            ctx.fillStyle = gradient;
            ctx.arc(x, y, this.lightRadius * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    adjustColorOpacity(color, opacity) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        return `rgba(${r},${g},${b},${opacity})`;
    }
}

export default Lights;