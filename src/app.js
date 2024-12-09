import Camera from './ui/objects/camera.js';
import GameEngine from "./gameEngine";
import {Client} from "./network/client";
import "./globals.js";
import "./controls.js";
import "./extensions/arraysExtensions.js";
import ConnectAsViewerPacket from "./network/packets/connectAsViewerPacket";
import Point from "./ui/objects/point";


const isViewing = window.serverArgs.isViewing;


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

if (isViewing) {
    client = new Client('ws://127.0.0.1:5000/game', (c) => {
        let p = new ConnectAsViewerPacket();
        c.send(p);
    });

} else {

    client = new Client('ws://127.0.0.1:5000/game', (c) => {
        c.setPlayerName("Test");
    });

}


