class PlayerNameInput {
    constructor(onSubmitPlayerName) {
        this.playerName = '';
        this.isEditing = true;
        this.maxNameLength = 12;
        this.onNameSubmitted = onSubmitPlayerName;

        // Create a separate canvas for the input
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cursorVisible = true;

        // Append canvas to body
        document.body.appendChild(this.canvas);
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';

        this.lastBlinkTime = performance.now();
        this.cursorBlinkInterval = 500; // Milliseconds

        this.initializeEventListeners();
        this.resizeCanvas();

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    initializeEventListeners() {
        window.addEventListener('keydown', (event) => {
            if (!this.isEditing) return;

            if (event.key === 'Backspace') {
                this.playerName = this.playerName.slice(0, -1);
            } else if (event.key === 'Enter') {
                this.submitName();
            } else if (this.isValidCharacter(event.key) && this.playerName.length < this.maxNameLength) {
                this.playerName += event.key;
            }
        });

        window.addEventListener('mousemove', (event) => {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    draw() {
        if (!this.isEditing) return;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Input box container
        const width = 400;
        const height = 200;
        const leftMargin = (this.canvas.width - width) / 2;
        const topMargin = (this.canvas.height - height) / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 5;
        ctx.fillRect(leftMargin, topMargin, width, height);
        ctx.strokeRect(leftMargin, topMargin, width, height);

        // Title
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText('ENTER YOUR NAME', this.canvas.width / 2, topMargin + 40);

        // Input box
        const inputBoxWidth = 300;
        const inputBoxHeight = 50;
        const inputBoxX = (this.canvas.width - inputBoxWidth) / 2;
        const inputBoxY = topMargin + 90;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = this.isHovered(inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight)
            ? '#FFD700'
            : '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.fillRect(inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight);
        ctx.strokeRect(inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight);

        // Player Name with blinking cursor
        ctx.font = '22px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';

        const displayName = this.playerName || 'TYPE HERE';
        const cursorX = inputBoxX + 10 + ctx.measureText(this.playerName).width;
        ctx.fillText(displayName, inputBoxX + 10, inputBoxY + inputBoxHeight / 2 + 8);

        // Blink cursor
        const currentTime = performance.now();
        if (currentTime - this.lastBlinkTime > this.cursorBlinkInterval) {
            this.cursorVisible = !this.cursorVisible;
            this.lastBlinkTime = currentTime;
        }

        if (this.cursorVisible && this.playerName.length < this.maxNameLength) {
            ctx.fillRect(cursorX, inputBoxY + 10, 2, inputBoxHeight - 20);
        }
    }

    isHovered(x, y, width, height) {
        return (
            this.mouseX >= x &&
            this.mouseX <= x + width &&
            this.mouseY >= y &&
            this.mouseY <= y + height
        );
    }

    submitName() {
        if (this.playerName.trim().length > 0) {
            this.isEditing = false;
            document.body.removeChild(this.canvas);
            this.onNameSubmitted(this.playerName);
        }
    }

    isValidCharacter(char) {
        return /^[a-zA-Z0-9_]$/.test(char);
    }
}

export default PlayerNameInput;
