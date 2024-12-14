import Point from "./point.js";
import * as GameMath from "../../utils/math.js";
import * as GameUtils from "../utils.js";
import Animation from "../animation.js";

class Block {
    constructor(p) {
        this.position = p

        this.currentBlock = -1;
        this.nextBlock = -1;
        this.colorsWithId = null;
        this.lastSetTime = Date.now()
        this.animation = new Animation(0, 1, 0.003);
    }


    setBlockId(id, delay) {
        this.lastSetTime = Date.now();

        // If there is no delay for the animation
        if (!delay) {
            this.currentBlock = this.nextBlock = id;
            this.animation.completeAndStop();
        } else {

            // Set the delay
            this.animation.delay = delay;

            let isCurrentBlock = id === this.currentBlock;
            let isNextBlock = id === this.nextBlock;


            if (isCurrentBlock && isNextBlock) {
                // If the current block is the same as the next block
                // Then we don't need to do anything
                if (this.animation.isGoingBackward()) {
                    this.animation.setForward();
                }
            } else if (!isCurrentBlock && !isNextBlock) {
                // if we need to change the block
                // then we need to set the next block to the id
                this.nextBlock = id;
                this.animation.setBackward();
            }

                // this two cases can happen
            // during the animation new block is set
            else if (isCurrentBlock && !isNextBlock) {
                // cancel the animation and set the next block to the id
                this.nextBlock = this.currentBlock;
                this.animation.setForward()
            } else if (!isCurrentBlock && isNextBlock) {
                // reverse the animation to set the current block to the id of next block
                // in handleAnimation we will set the current block to the next block
                if (this.animation.isGoingForward()) this.animation.setBackward()
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
    static BorderBlockWidth = 10;
    static EmptyBlockWidth = 9;
    static RegularBlockWidth = 9;


    handleAnimation() {
        this.animation.update(window.gameEngine.deltaTime);
        const progress = this.animation.getProgress();
        if (progress <= 0) {
            this.currentBlock = this.nextBlock;
            return false;
        }
        return true;
    }

    calBlockGap(position, size) {
        return new Point(position.x * size, position.y * size);
    }


    drawBorderBlock(ctx, color, size) {
        if (this.currentBlock !== 0) return;

        ctx.fillStyle = color;
        // Calculate the new position Base Of the size
        const newP = this.calBlockGap(this.position, size);
        ctx.fillRect(newP.x, newP.y, size, size);
    }

    drawEmptyBlock(ctx, darkColor, brightColor, size) {
        if (this.currentBlock !== 1) return;

        const sizeFactor = 10 / size;
        const newS = size * sizeFactor; // 10
        let animProgress = 0;

        const newP = this.calBlockGap(this.position, newS);
        const spacingTwenty = GameMath.calPercentage(newS, 0.2);
        const spacingTen = GameMath.calPercentage(newS, 0.1); // 1
        const spacingNinty = GameMath.calPercentage(newS, 0.9);

        // Snow-like background with subtle texture
        ctx.fillStyle = brightColor;
        ctx.fillRect(newP.x, newP.y, size, size);

        // Generate random snowflake-like patterns
        this.drawSnowflakeTexture(ctx, newP, size);

        /////////////////////// SHADOW ////////////////////////
        if (this.animation.progress > .8) {
            GameUtils.drawInCtxRec(ctx, newP, size, darkColor, spacingTwenty);
        }

        if (this.animation.progress < .4) {
            animProgress = this.animation.progress * 2.5;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTwenty, newP.y + spacingTwenty);
            ctx.lineTo(newP.x + spacingTwenty, newP.y + spacingNinty);
            ctx.lineTo(newP.x + GameMath.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingNinty);
            ctx.lineTo(newP.x + GameMath.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingTwenty);
            ctx.fill();
        } else if (this.animation.progress < 0.8) {
            animProgress = this.animation.progress * 2.5 - 1;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTwenty, newP.y + spacingTwenty);
            ctx.lineTo(newP.x + spacingNinty, newP.y + spacingTwenty);
            ctx.lineTo(newP.x + spacingNinty, newP.y + GameMath.linearInterpolate(spacingTwenty, spacingNinty, animProgress));
            ctx.lineTo(newP.x + GameMath.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingTwenty);
            ctx.fill();
        } else {

            animProgress = this.animation.progress * 5 - 4;
            GameUtils.drawInCtxRec(ctx, newP, size, brightColor, GameMath.linearInterpolate(2, 1, animProgress));
        }
    }

    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    generateBlockSeed() {
        // Use block's grid coordinates to create a unique, consistent seed
        const gridX = Math.floor(this.position.x / 10);
        const gridY = Math.floor(this.position.y / 10);
        
        // Create a unique seed based on grid coordinates
        return gridX * 1000 + gridY;
    }

    drawSnowflakeTexture(ctx, position, size) {
        ctx.save();
        ctx.globalAlpha = 0.3; // Subtle effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;

        // Generate a consistent seed for this block
        const blockSeed = this.generateBlockSeed();
        
        // Number of snowflakes based on block size
        const snowflakeCount = Math.floor(size / 5);

        for (let i = 0; i < snowflakeCount; i++) {
            // Use seeded random to ensure consistent randomness
            const seedOffset = blockSeed + i * 137; // Prime number to reduce pattern repetition
            const pseudoRandom = this.seededRandom(seedOffset);
            
            const x = position.x + pseudoRandom * size;
            const y = position.y + this.seededRandom(seedOffset + 1000) * size;
            const snowflakeSize = this.seededRandom(seedOffset + 2000) * 3;
            
            this.drawSingleSnowflake(ctx, x, y, snowflakeSize);
        }

        ctx.restore();
    }

    drawSingleSnowflake(ctx, x, y, size) {
        ctx.beginPath();
        
        // Create a simple star-like snowflake
        const arms = 6;
        for (let i = 0; i < arms; i++) {
            const angle = (i / arms) * Math.PI * 2;
            const armLength = size;
            
            const startX = x;
            const startY = y;
            
            const endX = x + Math.cos(angle) * armLength;
            const endY = y + Math.sin(angle) * armLength;
            
            // Slight curve to make it more organic
            const controlX = x + Math.cos(angle + Math.PI/4) * (armLength/2);
            const controlY = y + Math.sin(angle + Math.PI/4) * (armLength/2);
            
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        }
        
        ctx.stroke();
    }

    drawRegularBlock(ctx, darkColor, brightColor, size) {


        if (this.currentBlock < 2) return;

        if (this.colorsWithId === null) {
            return;
        }


        let bcolor = this.colorsWithId.pattern;
        let dcolor = this.colorsWithId.patternEdge;


        const sizeFactor = 10 / size;
        const newS = size * sizeFactor; // 10
        let animProgress = 0;

        const newP = this.calBlockGap(this.position, newS);
        const spacingTwenty = GameMath.calPercentage(newS, 0.2);
        const spacingTen = GameMath.calPercentage(newS, 0.1); // 1
        const spacingNinty = GameMath.calPercentage(newS, 0.9);

        if (this.animation.progress > 0.8) {
            ctx.fillStyle = dcolor;
            ctx.fillRect(newP.x + spacingTen, newP.y + spacingTen, size, size);
        }


        ctx.fillStyle = bcolor;
        if (this.animation.progress === 1) {
            GameUtils.drawInCtxRec(ctx, newP, size, bcolor, spacingTen);
        } else if (this.animation.progress < .4) {
            animProgress = this.animation.progress * 2.5;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTen, newP.y + GameMath.linearInterpolate(newS, spacingTen, animProgress));
            ctx.lineTo(newP.x + spacingTen, newP.y + newS);
            ctx.lineTo(newP.x + GameMath.linearInterpolate(spacingTen, newS, animProgress), newP.y + newS);
            ctx.fill();
        } else if (this.animation.progress < 0.8) {
            animProgress = this.animation.progress * 2.5 - 1;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTen, newP.y + spacingTen);
            ctx.lineTo(newP.x + spacingTen, newP.y + newS);
            ctx.lineTo(newP.x + newS, newP.y + newS);
            ctx.lineTo(newP.x + newS, newP.y + GameMath.linearInterpolate(newS, spacingTen, animProgress));
            ctx.lineTo(newP.x + GameMath.linearInterpolate(spacingTen, newS, animProgress), newP.y + spacingTen);
            ctx.fill();
        } else {

            animProgress = this.animation.progress * 5 - 4;
            GameUtils.drawInCtxRec(ctx, newP, size, bcolor, GameMath.linearInterpolate(1, 0, animProgress));
        }

    }

    drawSnowBlock(ctx, baseColor, size) {
        // Debug logging to understand block state
        console.log('Snow Block Drawing:', {
            currentBlock: this.currentBlock,
            position: this.position,
            size: size
        });

        // Modify condition to draw snow blocks more flexibly
        if (this.currentBlock < 3 || this.currentBlock > 3) {
            return;
        }

        const newP = this.calBlockGap(this.position, size);
        
        // Vibrant snow block background with gradient
        const gradient = ctx.createLinearGradient(
            newP.x, newP.y, 
            newP.x, newP.y + size
        );
        gradient.addColorStop(0, '#f0f8ff');     // Light blue-white
        gradient.addColorStop(0.5, '#ffffff');   // Pure white
        gradient.addColorStop(1, '#f0f8ff');     // Light blue-white

        ctx.fillStyle = gradient;
        ctx.fillRect(newP.x, newP.y, size, size);

        // More prominent snow texture
        this.drawSnowTexture(ctx, newP, size);

        // Add depth and shadow
        ctx.shadowColor = 'rgba(200, 200, 220, 0.3)';
        ctx.shadowBlur = 3;
        ctx.strokeStyle = 'rgba(200, 200, 220, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(newP.x, newP.y, size, size);
        ctx.shadowBlur = 0;
    }

    drawSnowTexture(ctx, position, size) {
        ctx.save();
        ctx.globalAlpha = 0.6;  // Increased visibility
        ctx.strokeStyle = 'rgba(220, 230, 255, 0.8)';
        ctx.lineWidth = 1.5;

        const blockSeed = this.generateBlockSeed();
        const snowflakeCount = Math.floor(size / 3);  // More snowflakes

        for (let i = 0; i < snowflakeCount; i++) {
            const seedOffset = blockSeed + i * 137;
            const pseudoRandom = this.seededRandom(seedOffset);
            
            const x = position.x + pseudoRandom * size;
            const y = position.y + this.seededRandom(seedOffset + 1000) * size;
            const snowflakeSize = this.seededRandom(seedOffset + 2000) * 3;
            
            this.drawDetailedSnowflake(ctx, x, y, snowflakeSize);
        }

        ctx.restore();
    }

    drawDetailedSnowflake(ctx, x, y, size) {
        ctx.beginPath();
        
        // More pronounced snowflake pattern
        const arms = 6;
        for (let i = 0; i < arms; i++) {
            const angle = (i / arms) * Math.PI * 2;
            
            // Main arm with more detail
            const mainArmLength = size;
            const mainEndX = x + Math.cos(angle) * mainArmLength;
            const mainEndY = y + Math.sin(angle) * mainArmLength;
            
            ctx.moveTo(x, y);
            ctx.lineTo(mainEndX, mainEndY);
            
            // Longer side branches
            const branchAngle = Math.PI / 4; // 45-degree branches
            const branchLength = size * 0.7;
            
            // Left branch
            const leftBranchEndX = mainEndX + Math.cos(angle - branchAngle) * branchLength;
            const leftBranchEndY = mainEndY + Math.sin(angle - branchAngle) * branchLength;
            ctx.moveTo(mainEndX, mainEndY);
            ctx.lineTo(leftBranchEndX, leftBranchEndY);
            
            // Right branch
            const rightBranchEndX = mainEndX + Math.cos(angle + branchAngle) * branchLength;
            const rightBranchEndY = mainEndY + Math.sin(angle + branchAngle) * branchLength;
            ctx.moveTo(mainEndX, mainEndY);
            ctx.lineTo(rightBranchEndX, rightBranchEndY);
        }
        
        ctx.stroke();
    }

    draw(ctx, checkViewport) {
        // Viewport check
        if (checkViewport && !window.camera.checkObjectInCamera(this.position)) {
            return false;
        }

        let canDraw = this.handleAnimation();
        if (!canDraw) {
            return true;
        }

        // Draw different block types
        this.drawBorderBlock(ctx, "#420707", Block.BorderBlockWidth);
        this.drawEmptyBlock(ctx, "#2d2926", "#e6f3ff", Block.EmptyBlockWidth);
        this.drawRegularBlock(ctx, "#2d2926", "#e6f3ff", Block.RegularBlockWidth);
        return true;
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

    }

}


export default Block;