import * as GameMath from './utils/math.js';
import * as GameUtils from './ui/utils.js';
import {calculate_pixel_ratio} from "./ui/utils.js";
import GameObjects from "./gameObjects.js"
import PingPacket from "./network/packets/ping";


class GameEngine {
    constructor(fps) {
        this.lastFrameTimeStamp = 0
        this.currentFrameTimeStamp = 0
        this.totalDeltaTimeCap = 0
        this.fps = fps
        this.deltaTime = 1000 / this.fps;
        this.interpoatedDeltaTime = 1000 / this.fps;


        this.timesCap = [0, 6.5, 16, 33, 49, 99];
        this.currentCapIndex = 0;

        this.processFrames = [];
        this.missedFrames = [];


        this.canvanQaulity = 1;


        this.gameObjects = new GameObjects();

        this.drawFunction = () => {
        };
    }

    setDrawFunction(drawFunction) {
        this.drawFunction = drawFunction;
    }


    getCap(cap) {
        return this.timesCap[GameMath.clamp(cap, 0, this.timesCap.length - 1)];
    }

    checkIncreasingInFramesProcess() {
        // This function checks if the game is running at the right speed.
        // If the game is running too fast, it will decrease the currentCapIndex.
        // if currentFrameTimeStamp < 90% of the currentCapIndex, then decrease the currentCapIndex.
        if (this.currentFrameTimeStamp < GameMath.linearInterpolate(
            this.getCap(this.currentCapIndex), this.getCap(this.currentCapIndex - 1),
            0.9
        )) {
            this.processFrames.push(Date.now());

            // If Draw More than 190 frames in 10 seconds, then remove the first frame.
            while (this.processFrames.length > 190) {
                if (Date.now() - this.processFrames[0] > 10_000) {
                    this.processFrames.splice(0, 1)
                } else {
                    // if first frame happen in less than 10 seconds, decrease the currentCapIndex.
                    this.currentCapIndex--;
                    this.processFrames = [];
                    this.currentCapIndex = GameMath.clamp(this.currentCapIndex, 0, this.timesCap.length - 1);
                }
            }
        }
    }

    checkDecreaseInFramesProcess() {
        // This function checks if the game is running at the right speed.
        // If the game is running too slow, it will increase the currentCapIndex.
        // if currentFrameTimeStamp > 5% of the currentCapIndex, then increase the currentCapIndex.
        if (this.currentFrameTimeStamp > GameMath.linearInterpolate(
            this.getCap(this.currentCapIndex), this.getCap(this.currentCapIndex + 1),
            0.05
        )) {
            this.missedFrames.push(Date.now());
            this.processFrames = [];
            // If Draw Less than 5 frames in 5 seconds, then remove the first frame.
            while (this.missedFrames.length > 5) {
                if (Date.now() - this.missedFrames[0] > 5_000) {
                    this.missedFrames.splice(0, 1)
                } else {
                    // if first frame happen in less than 5 seconds, increase the currentCapIndex.
                    this.currentCapIndex++;
                    this.missedFrames = [];
                    this.currentCapIndex = GameMath.clamp(this.currentCapIndex, 0, this.timesCap.length - 1);
                }
            }
        }
    }


    handleServerTiming(timeStamp) {
        if (!window.client || !window.client.player)
            return;
        const myPlayer = window.client.player;
        const maxWaitTimeForDisconnect = window.game.maxWaitingSocketTime;
        const clientSideSetPosPassedTime = Date.now() - myPlayer.lastMyPostSetClientSendTime;
        const lastConfirmationPassedTime = Date.now() - myPlayer.lastConfirmedTimeForPos;
        const serverSideSetPosPassed = Date.now() - myPlayer.lastPosServerSentTime;

        const timeTookToConfirmation = serverSideSetPosPassed - clientSideSetPosPassedTime;

        // console.log(`Last Confirmation Passed Time: ${lastConfirmationPassedTime}ms`);
        // console.log(`Time Took To Confirmation: ${timeTookToConfirmation}ms`);
        if (lastConfirmationPassedTime > maxWaitTimeForDisconnect &&
            timeTookToConfirmation > maxWaitTimeForDisconnect) {
            console.log("Check Your Internet Connection");

        }else {

        }

        const maxPingTime = myPlayer.waitingForPing ? 1_0000: 5_000;
        const pingPassedTime = Date.now() - myPlayer.lastPingTime;
        if(pingPassedTime > maxPingTime) {
            myPlayer.waitingForPing = true;
            myPlayer.lastPingTime = Date.now();
            const pingPacket = new PingPacket();
            window.client.send(pingPacket);
        }



    }

    loop(timeStamp) {
        window.game.timeStamp = timeStamp;
        this.currentFrameTimeStamp = timeStamp - this.lastFrameTimeStamp; // 16

        if(this.currentFrameTimeStamp > this.interpoatedDeltaTime){
            this.interpoatedDeltaTime = this.currentFrameTimeStamp;
        }else
        {
            this.interpoatedDeltaTime = GameMath.linearInterpolate(this.interpoatedDeltaTime, this.currentFrameTimeStamp, 0.05);
        }



        this.checkIncreasingInFramesProcess();
        this.checkDecreaseInFramesProcess();
        this.deltaTime = this.currentFrameTimeStamp + this.totalDeltaTimeCap;
        // console.log(this.deltaTime, this.gameObjects.blocks.length);
        this.lastFrameTimeStamp = timeStamp;
        if (this.deltaTime < this.getCap(this.currentCapIndex)) {
            this.totalDeltaTimeCap += this.currentFrameTimeStamp;

        } else {
            this.totalDeltaTimeCap = 0;
            this.drawFunction();
        }


        this.handleServerTiming(timeStamp);
        window.requestAnimationFrame(this.loop.bind(this));
    }


    camTransform(ctx, changeSize = false) {
        if (changeSize) {
            this.scaleCanvas(ctx);
        }

        ctx.save();
        const camera = window.camera;
        camera.calZoom(ctx);


    }

    scaleCanvas(ctx, w = GameUtils.getWidth(),
                h = GameUtils.getHeight()) {
        let MAX_PIXEL_RATIO = calculate_pixel_ratio();
        let drawingQuality = 1;
        let c = ctx.canvas;
        c.width = w * drawingQuality * MAX_PIXEL_RATIO;
        c.height = h * drawingQuality * MAX_PIXEL_RATIO;
        let styleRatio = 1;
        c.style.width = w * styleRatio + "px";
        c.style.height = h * styleRatio + "px";
    }

}


export default GameEngine;