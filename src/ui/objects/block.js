import Point from "./point.js";
import * as GameMath from "../../utils/math.js";
import * as GameUtils from "../utils.js";
import Rectangle from "./rectangle.js";

class Block {
    constructor(p) {
        this.position = p

        this.currentBlock = -1;
        this.nextBlock = -1;


        this.animDirection = 0;
        this.animProgress = 0;
        this.animDelay = 0;

        this.colorsWithId = null;

        this.lastSetTime = Date.now()
    }

    setBlockId(id, delay) {
        this.lastSetTime = Date.now();
        if (!delay) {
            this.currentBlock = this.nextBlock = id;
            this.animDirection = 0;
            this.animProgress = 1;
        } else {

            this.animDelay = delay;

            let isCurrentBlock = id === this.currentBlock;
            let isNextBlock = id === this.nextBlock;

            if (isCurrentBlock && isNextBlock) {
                if (this.animDirection === -1) {
                    this.animDirection = 1;
                }
            }

            if (isCurrentBlock && !isNextBlock) {
                this.animDirection = 1;
                this.nextBlock = this.currentBlock;
            }

            if (!isCurrentBlock && isNextBlock) {
                if (this.animDirection === 1) {
                    this.animDirection = -1;
                }
            }

            if (!isCurrentBlock && !isNextBlock) {
                this.nextBlock = id;
                this.animDirection = -1;
            }
        }

    }

    static getBlockAt(p, blocks) {
        for (let block of blocks) {
            if (block.position.equals(p)) {
                return block;
            }
        }
        let block = new Block(p);
        blocks.push(block);
        return block;

    }

    handleAnimation() {
        if (this.animDelay > 0) {
            this.animDelay -= window.gameEngine.deltaTime;
        } else {
            this.animProgress += window.gameEngine.deltaTime * this.animDirection * 0.003;
        }

        if (this.animProgress > 1) {
            this.animProgress = 1;
            this.animDirection = 0;
        }

        if (this.animProgress < 0) {
            this.animProgress = 0;
            this.animDirection = 1;
            this.currentBlock = this.nextBlock;
            return false
        }
        return true;
    }


    drawBorderBlock(ctx, color, size) {
        if (this.currentBlock !== 0)
            return;

        ctx.fillStyle = color;
        // Calculate the new position Base Of the size
        const newP = window.game.calBlocksGap(this.position, size);
        ctx.fillRect(newP.x, newP.y, size, size);
    }

    drawEmptyBlock(ctx, darkColor, brightColor, size) {
        if (this.currentBlock !== 1)
            return;


        const sizeFactor = 10 / 7;
        const newS = size * sizeFactor; // 10
        let animProgress = 0;

        const newP = window.game.calBlocksGap(this.position, newS);
        const spacingTwenty = GameMath.calPercentage(newS, 0.2);
        const spacingTen = GameMath.calPercentage(newS, 0.1); // 1
        const spacingNinty = GameMath.calPercentage(newS, 0.9);


        /////////////////////// SHADOW ////////////////////////
        if (this.animProgress > .8) {
            GameUtils.drawInCtxRec(ctx, newP, size, darkColor, spacingTwenty);
        }

        ctx.fillStyle = brightColor;
        if (this.animProgress === 1) {
            GameUtils.drawInCtxRec(ctx, newP, size, brightColor, spacingTen);
        } else if (this.animProgress < .4) {
            animProgress = this.animProgress * 2.5;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTwenty, newP.y + GameMath.linearInterpolate(spacingNinty, spacingTwenty, animProgress));
            ctx.lineTo(newP.x + spacingTwenty, newP.y + spacingNinty);
            ctx.lineTo(newP.x + GameMath.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingNinty);
            ctx.fill();
        } else if (this.animProgress < 0.8) {
            animProgress = this.animProgress * 2.5 - 1;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTwenty, newP.y + spacingTwenty);
            ctx.lineTo(newP.x + spacingTwenty, newP.y + 9);
            ctx.lineTo(newP.x + spacingNinty, newP.y + spacingNinty);
            ctx.lineTo(newP.x + spacingNinty, newP.y + GameMath.linearInterpolate(spacingNinty, spacingTwenty, animProgress));
            ctx.lineTo(newP.x + GameMath.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingTwenty);
            ctx.fill();
        } else {

            animProgress = this.animProgress * 5 - 4;
            GameUtils.drawInCtxRec(ctx, newP, size, brightColor, GameMath.linearInterpolate(2, 1, animProgress));
        }
    }

    drawRegularBlock(ctx, darkColor, brightColor, size) {


        if (this.currentBlock < 2)
            return;

        if (this.colorsWithId === null) {
            return;
        }


        let bcolor = this.colorsWithId.pattern;
        let dcolor = this.colorsWithId.patternEdge;


        const sizeFactor = 10 / 9;
        const newS = size * sizeFactor; // 10
        let animProgress = 0;

        const newP = window.game.calBlocksGap(this.position, newS);
        const spacingTwenty = GameMath.calPercentage(newS, 0.2);
        const spacingTen = GameMath.calPercentage(newS, 0.1); // 1
        const spacingNinty = GameMath.calPercentage(newS, 0.9);

        if (this.animProgress > 0.8) {
            ctx.fillStyle = dcolor;
            ctx.fillRect(newP.x + spacingTen, newP.y + spacingTen, size, size);
        }


        ctx.fillStyle = bcolor;
        if (this.animProgress === 1) {
            GameUtils.drawInCtxRec(ctx, newP, size, bcolor, spacingTen);
        } else if (this.animProgress < .4) {
            animProgress = this.animProgress * 2.5;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTen, newP.y + GameMath.linearInterpolate(newS, spacingTen, animProgress));
            ctx.lineTo(newP.x + spacingTen, newP.y + newS);
            ctx.lineTo(newP.x + GameMath.linearInterpolate(spacingTen, newS, animProgress), newP.y + newS);
            ctx.fill();
        } else if (this.animProgress < 0.8) {
            animProgress = this.animProgress * 2.5 - 1;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTen, newP.y + spacingTen);
            ctx.lineTo(newP.x + spacingTen, newP.y + newS);
            ctx.lineTo(newP.x + newS, newP.y + newS);
            ctx.lineTo(newP.x + newS, newP.y + GameMath.linearInterpolate(newS, spacingTen, animProgress));
            ctx.lineTo(newP.x + GameMath.linearInterpolate(spacingTen, newS, animProgress), newP.y + spacingTen);
            ctx.fill();
        } else {

            animProgress = this.animProgress * 5 - 4;
            GameUtils.drawInCtxRec(ctx, newP, size, bcolor, GameMath.linearInterpolate(1, 0, animProgress));
        }

    }

    draw(ctx, checkViewport) {
        if (checkViewport && window.camera.checkObjectInCamera(this.position)) {
            console.log("not in camera");
            return;
        }
        let canDraw = this.handleAnimation();
        if (!canDraw) {
            return;
        }

        this.drawBorderBlock(ctx, "#420707", 10);
        this.drawEmptyBlock(ctx, "#2d2926", "#4e463f", 7);
        this.drawRegularBlock(ctx, "#2d2926", "#4e463f", 9);
        //Ocuupited Block
    }


    static convertRectToBlock(rect, colorsWithId, listOfBlocks, myPlayer) {

        const viewPortRadius = window.game.viewPortRadius;
        if (myPlayer) {
            rect.min.x = Math.max(rect.min.x, Math.round(myPlayer.position.x - viewPortRadius));
            rect.min.y = Math.max(rect.min.y, Math.round(myPlayer.position.y - viewPortRadius));

            rect.max.x = Math.min(rect.max.x, Math.round(myPlayer.position.x + viewPortRadius));
            rect.max.y = Math.min(rect.max.y, Math.round(myPlayer.position.y + viewPortRadius));
        }

        for (let {x, y} of rect.for_each()) {
            let block = Block.getBlockAt(new Point(x, y), listOfBlocks);
            block.colorsWithId = colorsWithId;
            block.setBlockId(colorsWithId.id, Math.random() * 400);
        }

        // console.log(listOfBlocks);
    }

}


export default Block;