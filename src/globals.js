import Point from "./ui/objects/point.js";

const globals = {
    timeStamp: 0,
    gameSpeed: 0.006,
    viewPortRadius: 30,
    maxZoom: 430,
    maxBlocksNumber: 2500, //1100 50 * 50
    usernameLength: 6,
    maxWaitingSocketTime: 1_000,
    drawingOffset: 10,
    calDrawingOffset: (p) => {
        return new Point(p.x * globals.drawingOffset, p.y * globals.drawingOffset);
    },
    calBlocksGap: (p, size) => {
        return new Point(p.x * size, p.y * size);
    }
};




window.game = {};
// Adding to window object
Object.entries(globals).forEach(([key, value]) => {
    window.game[key] = value;
});

export {};