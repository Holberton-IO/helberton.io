import Point from "./point.js";
import * as GameMath from "../../utils/math.js";
import * as GameUtils from "../utils.js";
import DirectionPacket from "../../network/packets/direction";
import {log} from "three/nodes";
import RequestWaitingBlockPacket from "../../network/packets/requestWaitingBlocks";

class Player {

    constructor(position = new Point(0, 0), id) {
        this.id = id
        this.drawPosSet = false;

        this.isMyPlayer = false;
        this.deathWasCertain = false;
        this.didUncertainDeathLastTick = false;
        this.isDeathTimer = 0;
        this.uncertainDeathPosition = new Point(0, 0);
        this.deadAnimParts = [];
        this.deadAnimPartsRandDist = [];
        this.hitLines = [];

        this.position = position
        this.drawPosition = new Point(-1, -1);
        this.serverPosition = new Point(0, 0);
        this.lastChangedDirPos = new Point(0, 0);


        this.waitingBlocks = [];
        this.name = "";


        // Colors
        this.colorBrighter = 0;
        this.colorDarker = 0;
        this.colorSlightlyBrighter = 0
        this.colorPattern = 0
        this.colorPatternEdge = 0


        // Movements
        this.hasReceivedPosition = false;
        this.moveRelativeToServerPosNextFrame = false;
        this.lastServerPosSentTime = 0;


        this.isReady = false;
        this.isDead = false;

        ///
        this.waitingBlocksDuringWaiting = [];
        //
        this.lastPosHasBeenConfirmed = false;
        this.lastPosServerSentTime = 0;
        this.myNextDir = '';
        this.myLastSendDir = '';
        this.lastDirServerSentTime = 0;
        this.lastMyPostSetClientSendTime = 0;
        this.lastConfirmedTimeForPos = 0;
        this.dir = '';
        this.sendDirQueue = [];
        this.clientSideMoves = [];
        this.changeDirAtCoord = null;
        this.changeDirAtIsHorizontal = false;

        this.serverPos = new Point(0, 0);
        this.serverDir = '';


        this.waitingForPing = false;
        this.lastPingTime = 0;
        this.severLastPing = 0;
        this.serverAvgPing = 0;
        this.serverDiffPing = 0;


        this.isGettingWaitingBlocks = false;
        this.skipGettingWaitingBlocksRespose = false;
        this.waitingPushedDuringReceiving = [];

    }


    updatePlayerDirection(dir) {
        this.dir = dir;
    }

    checkNextDirAndCamera() {

        if (!this.isMyPlayer) return;

        const camera = window.camera;
        camera.moveToPlayer(this)


        if (this.myNextDir === this.dir) return;
        const isHorizontal = this.isMovingHorizontally(this.dir);
        if (this.changeDirAtIsHorizontal === isHorizontal) return;
        let changeDirNow = false;
        const currentCoord = isHorizontal ? this.position.x : this.position.y;


        if (GameUtils.isMovingToPositiveDir(this.dir)) {
            if (this.changeDirAtCoord < currentCoord) changeDirNow = true;
        } else {
            if (this.changeDirAtCoord > currentCoord) changeDirNow = true;
        }
        if (changeDirNow) {
            const newPos = this.position.clone();
            const tooFar = Math.abs(this.changeDirAtCoord - currentCoord);
            if (isHorizontal)
                newPos.x = this.changeDirAtCoord;
            else
                newPos.y = this.changeDirAtCoord;
            this.changeCurrentDir(this.myNextDir, newPos);
            Player.movePlayer(this.position, this.dir, tooFar);
        }

    }


    equals(player) {
        return this.id === player.id;
    }

    static getPlayerById(id, players) {
        for (let p of players) {
            if (p.id === id) return p;
        }
    }


    drawPlayerTiles(ctx) {


    }

    drawHitLines(ctx) {
        if (this.hitLines.length <= 0) return;


    }

    parseDirQueue() {

        if (this.sendDirQueue.length <= 0) return;
        const firstDir = this.sendDirQueue[0];
        const timePassed = Date.now() - firstDir.time;
        const gameSpeed = window.game.gameSpeed;
        const minTimeToWaitToSendDir = 1.2 / gameSpeed;
        if (timePassed < minTimeToWaitToSendDir || this.changeDir(firstDir.dir, true)) this.sendDirQueue.shift();
    }


    moveDrawPosToPos() {
        let target = null;

        target = this.position;

        this.drawPosition.x = GameMath.linearInterpolate(this.drawPosition.x, target.x, 0.23);
        this.drawPosition.y = GameMath.linearInterpolate(this.drawPosition.y, target.y, 0.23);
    }

    draw(ctx) {
        if (!this.isReady) return;


        if (!this.hasReceivedPosition) return;

        const gameSpeed = window.game.gameSpeed;
        let offset = window.gameEngine.deltaTime * gameSpeed;
        if (this.moveRelativeToServerPosNextFrame) {
            offset = (Date.now() - this.lastServerPosSentTime) * gameSpeed;
        }

        if(this.isMyPlayer) {
            Player.movePlayer(this.serverPos, this.serverDir, offset);
            if (this.serverDir === this.dir) {
                let clientSideDist = 0;
                if (Player.isMovingHorizontally(this.dir)) {
                    if (this.position.y === this.serverPos.y) {
                        if (this.dir === 'right') {
                            clientSideDist = this.position.x - this.serverPos.x;
                        }else {
                            clientSideDist = this.serverPos.x - this.position.x;
                        }
                    }
                }else {
                    if (this.position.x === this.serverPos.x) {
                        if (this.dir === 'down') {
                            clientSideDist = this.position.y - this.serverPos.y;
                        }else {
                            clientSideDist = this.serverPos.y - this.position.y;
                        }
                    }
                }
                clientSideDist = Math.max(0, clientSideDist);
                offset *= GameMath.linearInterpolate(.5, 1, GameMath.inverseLinearInterpolate(5, 0, clientSideDist));
            }
        }
        Player.movePlayer(this.position, this.dir, offset);
        this.moveRelativeToServerPosNextFrame = false;
        this.moveDrawPosToPos();
        this.checkNextDirAndCamera();

        this.drawWaitingBlocks(ctx);
        this.drawPlayerHeadWithEye(ctx);
        this.parseDirQueue();

    }


    drawPlayerHead(ctx) {
        let newDrawPos = new Point(this.drawPosition.x * 10 + 4.5, this.drawPosition.y * 10 + 4.5);
        let radius = 6;
        let shadowOffset = .3;

        const gradient = ctx.createRadialGradient(newDrawPos.x - 3, newDrawPos.y - 3, 0, newDrawPos.x, newDrawPos.y, radius);
        gradient.addColorStop(0, this.colorSlightlyBrighter);
        gradient.addColorStop(1, this.colorBrighter);
        if (false) {

        } else {
            ctx.fillStyle = this.colorDarker;
            ctx.beginPath();
            ctx.arc(newDrawPos.x + shadowOffset, newDrawPos.y + shadowOffset, radius, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(newDrawPos.x - shadowOffset, newDrawPos.y - shadowOffset, radius, 0, Math.PI * 2, false);
            ctx.fill();
            if (this.isMyPlayer) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(newDrawPos.x - shadowOffset, newDrawPos.y - shadowOffset, 1, 0, Math.PI * 2, false);
                ctx.fill();
            }
        }
    }


    drawPlayerHeadWithEye(ctx) {
        let newDrawPos = new Point(this.drawPosition.x * 10 + 4.5, this.drawPosition.y * 10 + 4.5);
        const bigEye = "#ffff";
        const smallEye = "#000";
        let radius = 6;
        let size = radius;
        const animationSpeed = 0.005;
        const eyeAnimation = Math.sin(Date.now() * animationSpeed) * 2;
        let r = 0.5;

        const gradient = ctx.createRadialGradient(newDrawPos.x - 3, newDrawPos.y - 3, 0, newDrawPos.x, newDrawPos.y, radius);
        gradient.addColorStop(0, this.colorSlightlyBrighter);
        gradient.addColorStop(1, this.colorBrighter);

        const c = ctx;
        c.translate(newDrawPos.x, newDrawPos.y);

        if (this.dir === 'up') {
            c.rotate(Math.PI * r);
        } else if (this.dir === 'down') {
            r += .5 * 2;
            c.rotate(Math.PI * r);
        } else if (this.dir === 'left') {
            r += .5 * 3;
            c.rotate(Math.PI * r);
        } else {
            r += .5;
            c.rotate(Math.PI * r);
        }

        c.beginPath();
        c.arc(0, 0, size, 0, Math.PI * 2, false);

        c.fillStyle = gradient;
        c.fill();

        // Draw the left white eye
        c.beginPath();
        c.fillStyle = bigEye;
        c.arc(-size / 2, -size / 2.5, size / 4, 0, Math.PI * 2, false);
        c.fill();

        // Draw the left black eye
        c.beginPath();
        c.fillStyle = smallEye;
        c.arc(-size / 2, -size / 2.5 + eyeAnimation, size / 8, 0, Math.PI * 2, false);
        c.fill();

        // Draw the right white eye
        c.beginPath();
        c.fillStyle = bigEye;
        c.arc(-size / 2, size / 2.5, size / 4, 0, Math.PI * 2, false);
        c.fill();

        // Draw the right black eye
        c.beginPath();
        c.fillStyle = smallEye;
        c.arc(-size / 2, size / 2.5 + eyeAnimation, size / 8, 0, Math.PI * 2, false);
        c.fill();

        // Smile
        c.beginPath();
        c.arc(size / 4, 0, size / 2, -0.5 * Math.PI, 0.5 * Math.PI);
        c.lineWidth = size / 10;
        c.stroke();

        c.restore();
    }

    drawWaitingBlocks(ctx) {
        if (this.waitingBlocks.length <= 0) return;
        const gameSpeed = window.game.gameSpeed;
        const deltaTime = window.gameEngine.deltaTime;


        for (let blockIndex = this.waitingBlocks.length - 1; blockIndex >= 0; blockIndex--) {
            let block = this.waitingBlocks[blockIndex];
            let isLastBlock = blockIndex === this.waitingBlocks.length - 1;

            if (!isLastBlock || this.isDead) {
                let speed = (this.isDead && isLastBlock) ? gameSpeed : 0.02;
                block.vanishTimer += deltaTime * speed;
                if (!isLastBlock && (block.vanishTimer > 10)) {
                    this.waitingBlocks.splice(blockIndex, 1);
                }
            }

            let helperCanvas = window.game.helperCtx.canvas;
            let helperCtx = window.game.helperCtx;

            if (block.blocks.length <= 0) continue;

            const lastDrawPos = isLastBlock ? this.drawPosition : null;

            if (block.vanishTimer > 0 && false) {
                window.gameEngine.camTransform(helperCtx, true);


                this.drawWaitingBlockInCTX([
                    {ctx: helperCtx, color: this.colorDarker, offset: 5},
                    {ctx: helperCtx, color: this.colorBrighter, offset: 4},
                ], block.blocks, lastDrawPos);


                helperCtx.globalCompositeOperation = 'destination-out';

                ctx.restore();
                helperCtx.restore();

                ctx.drawImage(helperCanvas, 0, 0);

                helperCtx.fillStyle = '#c7c7c7';
                helperCtx.globalCompositeOperation = "source-in";
                helperCtx.fillRect(0, 0, helperCanvas.width, helperCanvas.height);
                window.gameEngine.camTransform(ctx);

            }
            else if (block.vanishTimer < 10) {
                this.drawWaitingBlockInCTX([
                    {ctx: ctx, color: this.colorDarker, offset: 6},
                    {ctx: ctx, color: this.colorBrighter, offset: 4},
                ], block.blocks, lastDrawPos);
            }


        }


    }


    drawDiagonalLines(ctx, color, thickness, spaceBetween, offset) {
        if (thickness <= 0) return;
        ctx.lineCap = "butt";
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        const viewPortSize = window.game.viewPortRadius;
        const camera = window.camera;
        const mixSize = viewPortSize * 20;
        let xOffset = 0;
        let yOffset = 0;


        // if(camera.camPrevPosition !== null &&
        //
        // ){
        //     xOffset = camera.camPrevPosition.x - camera.camPosition.x;
        //     yOffset = camera.camPrevPosition.y - camera.camPosition.y;
        // }


    }

    drawWaitingBlockInCTX(callback, blocks, lastPosition) {
        if (blocks.length <= 0) return;


        for (let ctxIndex = 0; ctxIndex < callback.length; ctxIndex++) {
            let b = callback[ctxIndex];
            let ctx = b.ctx;
            let offset = b.offset;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = 6;
            ctx.strokeStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(blocks[0].x * 10 + offset, blocks[0].y * 10 + offset);
            for (let i = 1; i < blocks.length; i++) {
                ctx.lineTo(blocks[i].x * 10 + offset, blocks[i].y * 10 + offset);
            }
            if (lastPosition !== null) {
               ctx.lineTo(lastPosition.x * 10 + offset, lastPosition.y * 10 + offset);
            }
            ctx.stroke();
        }
    }

    isMovingHorizontally(direction = this.dir) {
        return direction === 'left' || direction === 'right';
    }

    static isMovingHorizontally(direction) {
        return direction === 'left' || direction === 'right';
    }

    isMovingVertically() {
        return !this.isMovingHorizontally();
    }

    handleMyPlayerMovement(offset) {
        if (!this.isMyPlayer) return offset;

        Player.movePlayer(this.serverPos, this.serverDir, offset);
        if (this.serverDir === this.dir) {
            let clientServerDist = 0;
            if (this.isMovingHorizontally()) {
                if (this.dir === 'left') {
                    clientServerDist = this.serverPos.x - this.position.x;
                } else {
                    clientServerDist = this.position.x - this.serverPos.x;
                }
            } else {
                if (this.dir === 'up') {
                    clientServerDist = this.serverPos.y - this.position.y;
                } else {
                    clientServerDist = this.position.y - this.serverPos.y;
                }
            }
            clientServerDist = Math.max(0, clientServerDist);
            offset *= GameMath.linearInterpolate(.5, 1, GameMath.inverseLinearInterpolate(5, 0, clientServerDist));

        }
        return offset;
    }

    static movePlayer(pos, dir, offset) {
        if (dir === 'up') {
            pos.y -= offset;
        } else if (dir === 'down') {
            pos.y += offset;
        } else if (dir === 'left') {
            pos.x -= offset;
        } else if (dir === 'right') {
            pos.x += offset;
        }

        return;
        const isHorizontal = Player.isMovingHorizontally(dir);
        let value = isHorizontal ? pos.x : pos.y;
        value = Math.floor(value);
        // Prevent Moving To Reach Boundries
        if (value <= 0)
            value = 1;
        else if (value >= window.gameEngine.gameObjects.mapSize - 1)
            value = window.gameEngine.gameObjects.mapSize - 2;

        // Setting The Correct Value
        if (isHorizontal)
            pos.x = value;
        else
            pos.y = value;

    }

    calMoveOffset() {
        let offset = 0;
        if (!this.isMyPlayer || this.serverAvgPing <= 50) return offset;

        const gameSpeed = window.game.gameSpeed;
        offset = this.serverAvgPing / 2 * gameSpeed;
        return offset;
    }

    static mapControlsToDir(controls) {
        if (controls === 1) return 'up'; else if (controls === 3) return 'down'; else if (controls === 4) return 'left'; else if (controls === 2) return 'right'; else return '';
    }


    checkIfPositionSentEarlier(pos) {
        return false; // TODO: Fix This
        // console.log(pos, this.lastChangedDirPos, "E");


        if (this.dir === 'up' && pos.y >= this.lastChangedDirPos.y) return true;
        else if (this.dir === 'down' && pos.y <= this.lastChangedDirPos.y) return true;
        else if (this.dir === 'left' && pos.x >= this.lastChangedDirPos.x) return true;
        else return this.dir === 'right' && pos.x <= this.lastChangedDirPos.x;
    }


    addWaitingBlocks(pos = new Point(0, 0)) {
        console.log("Add Waiting Blocks Called",this.waitingBlocks.length);
        if (this.waitingBlocks.length <= 0) return;

        const lastBlock = this.waitingBlocks[this.waitingBlocks.length - 1].blocks;
        console.log("LastBlock Exists",lastBlock.length);

        if (lastBlock.length <= 0) return;

        if (!(lastBlock[0].x !== pos.x || lastBlock[0].y !== pos.y)) return;
        console.log("Before Push",lastBlock.length, lastBlock, pos);
        lastBlock.push(pos.clone());
        console.log("After Push",lastBlock.length, lastBlock, pos);

        if (this.isMyPlayer && this.isGettingWaitingBlocks) {
            this.waitingPushedDuringReceiving.push(pos);
        }

    }

    changeCurrentDir(dir, pos, addWaitingBlocks = true, clientDecision = true) {
        this.updatePlayerDirection(dir);
        this.myNextDir = dir;

        this.position = pos.clone();
        this.lastChangedDirPos = pos.clone();


        if (addWaitingBlocks) {
            //addWaitingBlocks
            this.addWaitingBlocks(pos);
        }
        if (clientDecision) {
            //clientDecision
            this.clientSideMoves.push({
                dir: dir, pos: pos.clone(), time: Date.now()
            });
        }

    }


    positionInWalls(pos) {
        const mapSize = window.gameEngine.gameObjects.mapSize;
        const playerPosition = pos.floorVector();

        return playerPosition.x <= 0 || playerPosition.x >= mapSize - 1 || playerPosition.y <= 0 || playerPosition.y >= mapSize - 1;
    }

    changeDir(value, skipQueue = false) {
        const dir = Player.mapControlsToDir(value);
        // console.log(dir);
        const gameSpeed = window.game.gameSpeed;
        const timePassedFromLastSend = Date.now() - this.lastDirServerSentTime;
        const minTimeToWaitToSendDir = 0.7 / gameSpeed;
        // console.log(`Change Dir From ${this.dir} To ${dir}`);
        if (true) {
            //check Player Socket Connection
        }


        // Prevent Sending Same Dir
        // Prevent Sending Dir Too Fast
        if (dir === this.myLastSendDir && timePassedFromLastSend < minTimeToWaitToSendDir) {
            console.log("dir === this.myLastSendDir || timePassedFromLastSend < minTimeToWaitToSendDir")
            return false;
        }
        this.myLastSendDir = dir;
        this.lastDirServerSentTime = Date.now();

        if (this.dir === dir) {
            console.log("this.dir === dir");
            this.addDirToQueue(dir, skipQueue);
            return false;
        }

        // Check If Dir Is Opposite Of Current Dir
        if (GameUtils.isOppositeDir(dir, this.dir)) {
            console.log("GameUtils.isOppositeDir(dir, this.dir)");
            this.addDirToQueue(dir, skipQueue);
            return false;
        }

        // Round Player Position To The Nearest Integer
        const isHorizontal = !this.isMovingHorizontally(this.dir);
        const valueToRound = isHorizontal ? this.position.y : this.position.x;
        const roundedValue = Math.round(valueToRound);
        const newPlayerPos = this.position.clone();
        if (isHorizontal) newPlayerPos.y = roundedValue; else newPlayerPos.x = roundedValue;
        // console.log("LastPos", this.position, "NewPos", newPlayerPos);

        // Check If Position Corrupted Since Last Send
        if (this.checkIfPositionSentEarlier(newPlayerPos)) {
            console.log("GameUtils.checkIfPositionSentEarlier(dir, this.dir)");
            this.addDirToQueue(dir, skipQueue);
            return false;
        }

        // Check If Position To Touch Walls
        if (this.positionInWalls(newPlayerPos)) {
            console.log("this.positionInWalls()");
            this.addDirToQueue(dir, skipQueue);
            return false;
        }

        console.log("Position Passed")
        // Check If Last Direction Complete passed .55 Of Current Block
        let changeDirNow = false;
        const blockProgress = valueToRound - Math.floor(valueToRound);
        if (GameUtils.isMovingToPositiveDir(dir)) {
            if (blockProgress < .45) changeDirNow = true;
        } else if (blockProgress > .55) changeDirNow = true;

        if (changeDirNow) {
            console.log("changeDirNow");
            this.changeCurrentDir(dir, newPlayerPos);
        } else {
            console.log("Change It Next Frame");
            this.myNextDir = dir;
            this.changeDirAtCoord = roundedValue;
            this.changeDirAtIsHorizontal = isHorizontal;
            this.lastChangedDirPos = newPlayerPos.clone();
        }


        // Last Send Time
        // Last Confirmed Time
        this.lastMyPostSetClientSendTime = Date.now();
        if (this.lastPosHasBeenConfirmed) {
            this.lastConfirmedTimeForPos = Date.now();
        }

        this.lastPosHasBeenConfirmed = false;
        const packet = new DirectionPacket(dir, newPlayerPos);
        // console.log(packet);
        // console.log(packet.finalize());
        window.client.send(packet);
        return true;
    }


    addDirToQueue(dir, skip = false) {
        if (skip && this.sendDirQueue.length < 3) {
            this.sendDirQueue.push({
                dir: dir, time: Date.now()
            });
        }
    }


    requestWaitingBlocks() {
        this.isGettingWaitingBlocks = true;
        this.waitingPushedDuringReceiving = [];
        const packet = new RequestWaitingBlockPacket();
        window.client.send(packet);
    }
}


export default Player;