import Camera from './ui/objects/camera.js';
import GameEngine from "./gameEngine";
import {Client} from "./network/client";
import {} from "./globals.js";
import {} from "./controls.js";
import {} from "./extensions/arraysExtensions.js";

const camera = new Camera();
const gameEngine = new GameEngine(60);

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let blocks = gameEngine.gameObjects.blocks;
let players = gameEngine.gameObjects.players;

let helperCanvas = document.createElement("canvas");
let helperCtx = helperCanvas.getContext("2d");

window.game.helperCtx = helperCtx;
window.gameEngine = gameEngine;
window.camera = camera;
window.game.canvas = canvas;

let client = null;
let myPlayer = null;

const draw = () => {
    if (client && client.player) myPlayer = client.player;

    gameEngine.scaleCanvas(ctx);
    ctx.fillStyle = "#3a3428";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    camera.loop()
    gameEngine.camTransform(ctx);


    console.log("Blocks: " + blocks.length);
    for (let b of blocks) {
        b.draw(ctx, false);
    }

    for (let p in players) {
        players[p].draw(ctx);
    }

    if (client && client.player) myPlayer.removeBlocksOutsideCamera();

}


gameEngine.setDrawFunction(draw);


window.requestAnimationFrame(gameEngine.loop.bind(gameEngine));
client = new Client('ws://127.0.0.1:5000/game', (client) => {
    client.setPlayerName("Test");
});


