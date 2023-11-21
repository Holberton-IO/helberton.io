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
window.requestAnimationFrame(gameEngine.loop.bind(gameEngine));


let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");


const draw = () => {
    gameEngine.scaleCanvas(ctx);
    ctx.fillStyle = "#3a3428";
    ctx.fillRect(0, 0,100, canvas.height);

    camera.loop()
    gameEngine.camTransform(ctx);
}
gameEngine.setDrawFunction(draw);


//
// let blocks = [];
// let block = Block.getBlockAt(new Point(0, 0), blocks);
//
// block.draw("",true);
//
//
// console.log(block);