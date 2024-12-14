import Point from "./point";

class IObject {
    constructor(position, id, name) {
        this.id = id;
        this.name = name;
        this.isReady = false;
        this.isDead = false;


        this.position = position;
        this.serverPosition = new Point(0, 0);
        this.serverPos = new Point(0, 0);
        this.serverDir = '';


        this.isMyPlayer = false;
        this.lastPosHasBeenConfirmed = false;
    }

    /**
     * This Is Called In PlayerState Message
     * To Remove Blocks Outside Camera
     */
    removeBlocksOutsideCamera() {
        const camera = window.camera;
        const playerRect = camera.getViewPortRec(this.position);
        const blocks = window.gameEngine.gameObjects.blocks;
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (!playerRect.pointInRect(block.position)) {
                blocks.splice(i, 1);
            }
        }
    }
    calMoveOffset() {
        return 0
    }
    checkClientMovementSyncedWithServer(newDir, newPosOffset, newPos) {
        return false
    }


}

export default IObject;