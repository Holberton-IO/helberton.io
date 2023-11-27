import Camera from './ui/objects/camera.js';
import GameEngine from "./gameEngine";
import {Client}  from "./network/client";
import {} from "./globals.js";

const camera = new Camera();
const gameEngine = new GameEngine(60);
window.gameEngine = gameEngine;
window.camera = camera;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let blocks = window.gameEngine.gameObjects.blocks;


const draw = () => {

    if(gameEngine.gameObjects.myPlayer) {
       camera.camPrevPosition = camera.camPosition;
         camera.camPosition = gameEngine.gameObjects.myPlayer.position;
    }
    gameEngine.scaleCanvas(ctx);
    ctx.fillStyle = "#3a3428";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    camera.loop()
    gameEngine.camTransform(ctx);
    for (let b of blocks) {
        b.draw(ctx, false);
    }

    // camera.camPosition.x += 0.1;




    ctx.restore();
}


gameEngine.setDrawFunction(draw);
window.requestAnimationFrame(gameEngine.loop.bind(gameEngine));

let client = new Client('ws://127.0.0.1:5000/game', (client) => {
    client.setPlayerName("Test");
});


