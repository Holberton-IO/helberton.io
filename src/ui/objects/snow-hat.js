import Decorations from "./decorations";

class SnowHat extends Decorations {
    constructor(x, y, options = {}) {
        super(x, y, options);
        this.hatColor = options.hatColor || '#C41E3A';
        this.trimColor = options.trimColor || '#FFFFFF';
        this.size = options.size || 50;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Main hat body
        ctx.beginPath();
        ctx.fillStyle = this.hatColor;
        ctx.moveTo(0, -this.size);
        ctx.lineTo(-this.size / 2, 0);
        ctx.lineTo(this.size / 2, 0);
        ctx.closePath();
        ctx.fill();

        // White trim
        ctx.beginPath();
        ctx.fillStyle = this.trimColor;
        ctx.rect(-this.size / 2, 0, this.size, this.size / 5);
        ctx.fill();

        // Fluffy pom-pom
        ctx.beginPath();
        ctx.fillStyle = this.trimColor;
        ctx.arc(0, -this.size * 1.2, this.size / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
export default SnowHat;