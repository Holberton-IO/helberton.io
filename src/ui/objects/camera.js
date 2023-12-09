import Point from "./point.js";
import * as GameUtils from "../utils.js";
import * as GameMath from "../../utils/math.js";

class Camera {
    constructor() {
        this.zoom = 5;
        this.camPosition = new Point(0, 0);
        this.camRotationOffset = 0;
        this.camPositionOffset = new Point(0, 0);
        this.camPrevPosition = new Point(0, 0);

        this.camPosSet = false;

        this.camShakeBuffer = [];
        //
    }


    // TODO ADD VIEWPORT RADIUS
    checkObjectInCamera(point) {
        return (
            point.x < this.camPosition.x - window.game.viewPortRadius ||
            point.x > this.camPosition.x + window.game.viewPortRadius ||
            point.y < this.camPosition.y - window.game.viewPortRadius ||
            point.y > this.camPosition.y + window.game.viewPortRadius
        )
    }

    shakeCamera(p, rotate = true) {
        this.camShakeBuffer.push([
            p, 0, !!rotate
        ]);
    }

    shakeCameraDirection(dir, amount = 6, rotate = true) {
        let x, y = 0;
        switch (dir) {
            case 0:
                x = amount;
                break;
            case 1:
                y = amount;
                break;
            case 2:
                x = -amount;
                break;
            case 3:
                y = -amount;
                break;
        }
        this.shakeCamera(new Point(x, y), rotate);
    }

    calCameraOffset() {
        for (let i = this.camShakeBuffer.length - 1; i >= 0; i--) {
            let shake = this.camShakeBuffer[i];
            shake[1] = window.gameEngine.deltaTime * 0.003;
            let shakeTime = shake[1];
            let shakeTime2 = 0;
            let shakeTime3 = 0;
            if (shakeTime < 1) {
                shakeTime2 = GameUtils.ease.out(shakeTime);
                shakeTime3 = GameUtils.ease.inout(shakeTime);

            } else if (shakeTime < 8) {
                shakeTime2 = GameUtils.ease.inout(GameMath.inverseLinearInterpolate(8, 1, shakeTime));
                shakeTime3 = GameUtils.ease.in(GameMath.inverseLinearInterpolate(8, 1, shakeTime));
            } else {
                this.camShakeBuffer.splice(i, 1);
            }
            this.camPositionOffset.x += shake[0].x * shakeTime2;
            this.camPositionOffset.y += shake[0].y * shakeTime2;

            this.camPositionOffset.x += shake[0] * Math.cos(shakeTime * 8) * 0.04 * shakeTime3;
            this.camPositionOffset.y += shake[0] * Math.cos(shakeTime * 7) * 0.04 * shakeTime3;
            if (shake[2]) {
                this.camRotationOffset += Math.cos(shakeTime * 9) * 0.003 * shakeTime3;
            }
            console.log(this.camShakeBuffer.length);
        }

        let limit = 80;
        let x = this.camPositionOffset.x;
        let y = this.camPositionOffset.y;
        x /= limit;
        y /= limit;
        x = GameMath.smoothLimit(x);
        y = GameMath.smoothLimit(y);
        x *= limit;
        y *= limit;
        this.camPositionOffset.x = x;
        this.camPositionOffset.y = y;

    }

    calZoom(ctx) {
        let maxPixelRatio = GameUtils.calculate_pixel_ratio();
        let quality = 1;
        const canvas = window.game.canvas;


        if (ctx.canvas === canvas || true) {
            const maxDimension = Math.max(canvas.width, canvas.height);
            const zoomEdge = maxDimension / window.game.maxZoom;
            const screenPixels = canvas.width * canvas.height;
            const blockPixels = screenPixels / window.game.maxBlocksNumber;
            const zoomBlocks = Math.sqrt(blockPixels) / 10;
            this.zoom = Math.max(zoomEdge, zoomBlocks);
            ctx.translate(window.game.canvas.width / 2, window.game.canvas.height / 2);

            ctx.rotate(this.camRotationOffset);
            ctx.scale(this.zoom, this.zoom);
            ctx.translate(-this.camPrevPosition.x * 10 - this.camPositionOffset.x, -this.camPrevPosition.y * 10 - this.camPositionOffset.y);

        } else {
            // ctx.setTransform(maxPixelRatio * quality, 0, 0, maxPixelRatio * quality, 0, 0);
        }
    }


    moveToPlayer(player) {
        if (!player) return;
        if (this.camPosSet) {
            this.camPosition.x = GameMath.linearInterpolate(this.camPosition.x, player.position.x, 0.03);
            this.camPosition.y = GameMath.linearInterpolate(this.camPosition.y, player.position.y, 0.03);

        } else {
            this.camPosition = player.position.clone();
            this.camPosSet = true;
        }
    }


    loop() {
        this.camPrevPosition = this.camPosition;
        this.calCameraOffset();
    }


}


export default Camera;