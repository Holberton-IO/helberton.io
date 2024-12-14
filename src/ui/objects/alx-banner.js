import Decorations from "./decorations";

class AlxBanner extends Decorations {
    static HEIGHT = 50;
    static WIDTH = 200;

    constructor(x, y, options = {}) {
        super(x, y, options);
        this.width = options.width || 200;
        this.height = options.height || AlxBanner.HEIGHT;
        AlxBanner.HEIGHT = this.height;
        this.text = options.text || 'Alx IO!';
        this.backgroundColor = options.backgroundColor || '#C41E3A';
        this.textColor = options.textColor || '#FFFFFF';
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Banner background
        ctx.fillStyle = this.backgroundColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, 0);
        ctx.lineTo(this.width * 1.1, this.height);
        ctx.lineTo(-this.width * 0.1, this.height);
        ctx.closePath();
        ctx.fill();

        // Text
        ctx.fillStyle = this.textColor;
        ctx.font = `${this.height * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.width / 2, this.height * 0.8);

        // Decorative ribbons
        ctx.strokeStyle = this.textColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-this.width * 0.1, this.height);
        ctx.lineTo(-this.width * 0.2, this.height * 1.5);
        ctx.moveTo(this.width * 1.1, this.height);
        ctx.lineTo(this.width * 1.2, this.height * 1.5);
        ctx.stroke();

        ctx.restore();
    }
}

export default AlxBanner;