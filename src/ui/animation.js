class Animation {
    constructor(startValue, endValue, duration) {
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.progress = 0; // Ranges from 0 to 1
        this.direction = 0; // 0 for idle, 1 for forward, -1 for backward
        this.delay = 0;
    }

    update(deltaTime) {
        // Handle the delay before starting the animation
        if (this.delay > 0) {
            this.delay -= deltaTime;
            return;
        }

        if (this.direction === 0) return; // If idle, do nothing

        this.progress += (deltaTime * this.duration) * this.direction;

        if (this.progress >= 1) {
            this.progress = 1;
            this.direction = 0; // Stop the animation
        } else if (this.progress <= 0) {
            this.progress = 0;
            this.direction = 1; // Stop the animation
        }
    }

    setForward() {
        this.direction = 1;
    }

    setBackward() {
        this.direction = -1;
    }

    isAnimating() {
        return this.direction !== 0 || this.delay > 0;
    }

    getProgress() {
        return this.progress;
    }

    completeAndStop() {
        this.progress = 1;
        this.direction = 0;
    }

    isGoingForward() {
        return this.direction === 1;
    }
    isGoingBackward() {
        return this.direction === -1;
    }

    isIdle() {
        return this.direction === 0;
    }

    isComplete() {
        return this.progress === 1;
    }
}
export default Animation;