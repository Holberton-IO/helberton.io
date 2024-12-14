import Block from "./block";
import Point from "./point";
import Tree from "./tree";

class Decorations {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.scale = options.scale || 1;
        this.rotation = options.rotation || 0;
        this.opacity = options.opacity || 1;
    }



    drawObject(ctx,camera){
        if(!camera.checkNotScaledObjectInCamera(new Point(this.x,this.y),Block.BorderBlockWidth)) return false;
        this.draw(ctx);
        return true;
    }

    draw(ctx) {
        throw new Error('Draw method must be implemented by subclass');
    }


}






export default Decorations;
