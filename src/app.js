import * as Globals from './globals.js';
import * as GameMath from './utils/math.js';
import * as UI from './ui/utils.js';
import Camera from './ui/objects/camera.js';
import Block from './ui/objects/block.js';
import Point from './ui/objects/point.js';
import GameEngine from "./gameEngine";


const camera = new Camera();
const gameEngine = new GameEngine(60);
window.gameEngine = gameEngine;
window.camera = camera;


let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let blocks = [];




const draw = () => {
    gameEngine.scaleCanvas(ctx);
    ctx.fillStyle = "#3a3428";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    camera.loop()
    gameEngine.camTransform(ctx);
    for (let b of blocks) {
        b.draw(ctx, false);
    }




    ctx.restore();
}

let row = Math.sqrt(window.game.maxBlocksNumber);
for (let i = 0; i < row; i++) {
    for (let j = 0; j < row; j++) {
        let block = Block.getBlockAt(new Point(i, j), blocks);
        block.setBlockId(1,1000)
    }
}
blocks.forEach((b) => {
   if(b.position.x === 0 || b.position.y === 0 || b.position.x === row-1 || b.position.y === row-1)
    b.setBlockId(0);

});

Block.getBlockAt(new Point(1, 1), blocks).setBlockId(2, .5);
Block.getBlockAt(new Point(1, 2), blocks).setBlockId(2,0.5);
Block.getBlockAt(new Point(1, 3), blocks).setBlockId(2,0.5);
Block.getBlockAt(new Point(1, 4), blocks).setBlockId(2,0.5);
Block.getBlockAt(new Point(1, 5), blocks).setBlockId(2);


Block.getBlockAt(new Point(2, 1), blocks).setBlockId(2);
Block.getBlockAt(new Point(3, 1), blocks).setBlockId(2);
Block.getBlockAt(new Point(4, 1), blocks).setBlockId(2);
Block.getBlockAt(new Point(5, 1), blocks).setBlockId(2);


gameEngine.setDrawFunction(draw);

window.requestAnimationFrame(gameEngine.loop.bind(gameEngine));

