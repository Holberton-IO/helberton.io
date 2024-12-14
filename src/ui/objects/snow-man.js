import Decorations from "./decorations";

class SnowMan extends Decorations {
    constructor(x, y, options = {}) {
        super(x, y, options);
        this.bodyColor = options.bodyColor || '#FFFFFF';
        this.detailColor = options.detailColor || '#FF4500';
        this.size = options.size || 60;
        this.outlineColor = options.outlineColor || 'rgba(0, 255, 255, 0.8)';
        this.blinkFrame = 0;
        this.blinkInterval = Math.floor(Math.random() * 100) + 50;
        this.blinkDuration = 5;
        this.isBlinking = false;
    }


    drawEyes(ctx, isBlinking = false) {
        ctx.fillStyle = '#000000';

        if (isBlinking) {
            // Closed eyes (thin line)
            ctx.beginPath();
            ctx.moveTo(-10, -110);
            ctx.lineTo(-5, -110);
            ctx.moveTo(5, -110);
            ctx.lineTo(10, -110);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Open eyes (circular)
            ctx.beginPath();
            ctx.arc(-8, -110, 3, 0, Math.PI * 2);
            ctx.arc(8, -110, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    updateBlinkAnimation() {
        this.blinkFrame++;

        // Reset blink cycle when interval is reached
        if (this.blinkFrame >= this.blinkInterval) {
            this.isBlinking = true;

            // Stop blinking after blinkDuration
            if (this.blinkFrame >= this.blinkInterval + this.blinkDuration) {
                this.blinkFrame = 0;
                this.isBlinking = false;

                // Randomize next blink interval
                this.blinkInterval = Math.floor(Math.random() * 100) + 50;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Update blinking animation
        this.updateBlinkAnimation();

        // Bottom snow ball (largest)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Middle snow ball
        ctx.beginPath();
        ctx.ellipse(0, -60, 35, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -110, 25, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes with blinking
        this.drawEyes(ctx, this.isBlinking);

        // Coal buttons
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, -40, 5, 0, Math.PI * 2);
        ctx.arc(0, -55, 5, 0, Math.PI * 2);
        ctx.arc(0, -70, 5, 0, Math.PI * 2);
        ctx.fill();

        // Carrot nose
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(0, -110);
        ctx.lineTo(15, -105);
        ctx.lineTo(0, -100);
        ctx.closePath();
        ctx.fill();

        // Stick arms
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-40, -60);
        ctx.lineTo(-70, -90);
        ctx.moveTo(40, -60);
        ctx.lineTo(70, -90);
        ctx.stroke();

        // Hat
        ctx.fillStyle = '#36454F';
        ctx.beginPath();
        ctx.rect(-30, -140, 60, 15);
        ctx.rect(-20, -160, 40, 20);
        ctx.fill();

        ctx.restore();
    }
}

class ShakySnowman extends SnowMan {
    constructor(x, y, options = {}) {
        super(x, y, options);

        // Rotation animation properties
        this.rotationAngle = 0;
        this.rotationSpeed = options.rotationSpeed || 0.05; // Rotation speed
        this.maxRotationAngle = options.maxRotationAngle || Math.PI / 6; // Maximum rotation angle

    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Update blinking animation
        this.updateBlinkAnimation();

        // Calculate rotation around midpoint
        this.rotationAngle += this.rotationSpeed;
        const currentRotation = Math.sin(this.rotationAngle) * this.maxRotationAngle;

        // Rotate around midpoint
        ctx.translate(0, -60); // Move rotation point to midpoint of snowman
        ctx.rotate(currentRotation);
        ctx.translate(0, 60); // Move back

        // Bottom snow ball (largest)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Middle snow ball
        ctx.beginPath();
        ctx.ellipse(0, -60, 35, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -110, 25, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes with blinking
        this.drawEyes(ctx, this.isBlinking);

        // Coal buttons
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, -40, 5, 0, Math.PI * 2);
        ctx.arc(0, -55, 5, 0, Math.PI * 2);
        ctx.arc(0, -70, 5, 0, Math.PI * 2);
        ctx.fill();

        // Carrot nose
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(0, -110);
        ctx.lineTo(15, -105);
        ctx.lineTo(0, -100);
        ctx.closePath();
        ctx.fill();

        // Stick arms
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-40, -60);
        ctx.lineTo(-70, -90);
        ctx.moveTo(40, -60);
        ctx.lineTo(70, -90);
        ctx.stroke();

        // Hat
        ctx.fillStyle = '#36454F';
        ctx.beginPath();
        ctx.rect(-30, -140, 60, 15);
        ctx.rect(-20, -160, 40, 20);
        ctx.fill();

        ctx.restore();
    }
}

export {SnowMan, ShakySnowman};