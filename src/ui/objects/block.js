import Point from "./point.js";

class Block {
    constructor(p) {
        this.position = p
        this.currentBlock = -1;
        this.nextBlock = -1;
        this.animDirection = 0;
        this.animProgress = 0;
        this.animDelay = 0;
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


    draw(ctx, checkViewport) {
        if (checkViewport && window.camera.checkObjectInCamera(this.position)) {
            console.log("not in camera");
            return;
        }


    }

}


export default Block;