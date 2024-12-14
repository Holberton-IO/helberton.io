class SnowParticle {
    constructor(options = {}) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.radius = options.radius || Math.random() * 3 + 1;
        this.shape = options.shape || this.getRandomShape();

        // Movement physics
        this.vx = options.vx || (Math.random() - 0.5) * 0.5;
        this.vy = options.vy || Math.random() * 1 + 0.5;

        // Rotation and wobble
        this.rotation = options.rotation || Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;

        // Opacity and depth
        this.opacity = options.opacity || Math.random() * 0.7 + 0.3;
        this.depth = options.depth || Math.random();

        this.camera = options.camera;
        this.canvasWidth = options.canvasWidth || window.innerWidth;
        this.canvasHeight = options.canvasHeight || window.innerHeight;
    }

    getRandomShape() {
        const shapes = ['crystal', 'hexagon', 'star'];
        return shapes[Math.floor(Math.random() * shapes.length)];
    }

    isInCameraView() {
        // If no camera or canvas dimensions are not set, always return true
        if (!this.camera || !this.canvasWidth || !this.canvasHeight) {
            return true;
        }

        // Use viewPortRadius from game configuration
        const viewPortRadius = window.game.viewPortRadius * 0.9;
        const cameraX = this.camera.camPosition.x;
        const cameraY = this.camera.camPosition.y;

        return (
            this.x >= cameraX - viewPortRadius &&
            this.x <= cameraX + viewPortRadius &&
            this.y >= cameraY - viewPortRadius &&
            this.y <= cameraY + viewPortRadius
        );
    }

    update(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Horizontal wobble
        this.x += this.vx * (1 + this.depth);
        this.y += this.vy * (1 + this.depth);

        this.rotation += this.rotationSpeed;

        if (this.y > canvasHeight + 50) {
            this.y = -50;
            this.x = Math.random() * canvasWidth;
        }

        if (this.x < -50 || this.x > canvasWidth + 50) {
            this.x = Math.random() * canvasWidth;
        }
    }

    drawStar(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        const r = this.radius;
        const innerRadius = r * 0.5;

        for (let i = 0; i < 5; i++) {
            // Outer point
            ctx.lineTo(
                Math.cos((Math.PI * 4 * i) / 5 - Math.PI / 2) * r,
                Math.sin((Math.PI * 4 * i) / 5 - Math.PI / 2) * r
            );

            // Inner point
            ctx.lineTo(
                Math.cos((Math.PI * 4 * i) / 5 - Math.PI / 2) * innerRadius,
                Math.sin((Math.PI * 4 * i) / 5 - Math.PI / 2) * innerRadius
            );
        }

        ctx.closePath();

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        gradient.addColorStop(0, 'rgba(200, 220, 255, 0.9)');
        gradient.addColorStop(0.7, 'rgba(220, 230, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(240, 240, 255, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
    }

    drawCrystal(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        const r = this.radius;

        // Outer octagon-like shape
        ctx.moveTo(0, -r);
        ctx.lineTo(r / 2, -r / 2);
        ctx.lineTo(r, 0);
        ctx.lineTo(r / 2, r / 2);
        ctx.lineTo(0, r);
        ctx.lineTo(-r / 2, r / 2);
        ctx.lineTo(-r, 0);
        ctx.lineTo(-r / 2, -r / 2);
        ctx.closePath();

        // Inner crystal structure lines
        ctx.moveTo(0, -r);
        ctx.lineTo(0, r); // Vertical
        ctx.moveTo(-r, 0);
        ctx.lineTo(r, 0); // Horizontal

        ctx.moveTo(-r / 2, -r / 2);
        ctx.lineTo(r / 2, r / 2); // Diagonal bottom-left to top-right
        ctx.moveTo(r / 2, -r / 2);
        ctx.lineTo(-r / 2, r / 2); // Diagonal top-left to bottom-right

        ctx.strokeStyle = 'rgba(200, 220, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    drawHexagon(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const r = this.radius;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        gradient.addColorStop(0, 'rgba(220, 235, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(200, 220, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(180, 200, 240, 0.2)');

        ctx.fillStyle = gradient;
        ctx.fill();

        // Subtle outline
        ctx.strokeStyle = 'rgba(200, 220, 255, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
    }

    draw(ctx) {
        if (!this.isInCameraView()) return;

        ctx.globalAlpha = this.opacity;

        if (this.shape === 'star') {
            this.drawStar(ctx);
        } else if (this.shape === 'crystal') {
            this.drawCrystal(ctx);
        } else {
            this.drawHexagon(ctx);
        }

        ctx.globalAlpha = 1;
    }
}

class SnowEffect {
    constructor(options = {}) {
        this.particleCount = options.particleCount || 150;
        this.camera = options.camera;
        this.particles = [];
        this.init();
    }

    init() {
        let {canvasWidth, canvasHeight} = this.getCanvasDim();

        // Ensure dimensions are positive numbers
        canvasWidth = Math.max(100, canvasWidth);
        canvasHeight = Math.max(100, canvasHeight);

        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new SnowParticle({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                camera: this.camera,
                canvasWidth: canvasWidth,
                canvasHeight: canvasHeight
            }));
        }
    }

    draw(ctx) {
        let {canvasWidth, canvasHeight} = this.getCanvasDim();

        canvasWidth = Math.max(100, canvasWidth);
        canvasHeight = Math.max(100, canvasHeight);

        this.particles.forEach(particle => {
            particle.update(canvasWidth, canvasHeight);
            particle.draw(ctx);
        });
    }

    getCanvasDim() {
        let canvasWidth, canvasHeight;
        if (window.game && window.game.canvas) {
            canvasWidth = window.game.canvas.width;
            canvasHeight = window.game.canvas.height;
        }
        return {canvasWidth, canvasHeight};
    }
}

export default SnowEffect;
