import IObject from "./i_object";

class Viewer extends IObject{
    constructor(position,id) {
        super(position,id,"Viewer");
    }

    draw(ctx){
         const camera = window.camera;
         camera.moveToPlayer(this)
    }
}

export default Viewer;