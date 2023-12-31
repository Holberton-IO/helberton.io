class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(otherPoint) {
        return this.x === otherPoint.x && this.y === otherPoint.y;
    }

    distanceVector(otherPoint) {
        return new Point(Math.abs(this.x - otherPoint.x), Math.abs(this.y - otherPoint.y));
    }

    clone() {
        return new Point(this.x, this.y);
    }


    floorVector()
    {
        return new Point(Math.floor(this.x),Math.floor(this.y));
    }

    ceilVector()
    {
        return new Point(Math.ceil(this.x),Math.ceil(this.y));
    }
}

export default Point;