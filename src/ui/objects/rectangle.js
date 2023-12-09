import Point from './point.js';
class Rectangle {
    constructor(minVec, maxVec) {
        this.min = minVec;
        this.max = maxVec;
    }

    toString() {
        return `<Rectangle min=${this.min} max=${this.max}>`;
    }

    clamp(rect) {
        const minVec = new Point(
            Math.max(this.min.x, rect.min.x),
            Math.max(this.min.y, rect.min.y)
        );

        const maxVec = new Point(
            Math.min(this.max.x, rect.max.x),
            Math.min(this.max.y, rect.max.y)
        );

        return new Rectangle(minVec, maxVec);
    }

    *for_each() {
        for (let x = this.min.x; x < this.max.x; x++) {
            for (let y = this.min.y; y < this.max.y; y++) {
                yield { x, y };
            }
        }
    }

    isRectOverlap(rect) {
        return (
            this.min.x < rect.max.x &&
            this.max.x > rect.min.x &&
            this.min.y < rect.max.y &&
            this.max.y > rect.min.y
        );
    }

    isNotRectOverlap(rect) {
        return (
            this.max.x < rect.min.x ||
            this.min.x > rect.max.x ||
            this.max.y < rect.min.y ||
            this.min.y > rect.max.y
        );
    }


    pointInRect(point) {
        return (
            point.x >= this.min.x &&
            point.x <= this.max.x &&
            point.y >= this.min.y &&
            point.y <= this.max.y
        );
    }
}

export default Rectangle;