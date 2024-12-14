import Decorations from "./decorations";

class PresentBox extends Decorations {
    constructor(x, y, options = {}) {
        super(x, y, options);
        this.boxColor = options.boxColor || '#C41E3A';
        this.ribbonColor = options.ribbonColor || '#156615';
        this.size = options.size || 50;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Present box
        ctx.fillStyle = this.boxColor;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

        // Horizontal ribbon
        ctx.fillStyle = this.ribbonColor;
        ctx.fillRect(-this.size / 2, 0, this.size, this.size / 6);

        // Vertical ribbon
        ctx.fillRect(0 - this.size / 12, -this.size / 2, this.size / 6, this.size);



        ctx.restore();
    }
}

export default PresentBox;