import Point from "./point.js";
import * as GameMath from "../../utils/math.js";
import * as GameUtils from "../utils.js";

class Player {
    constructor(position = new Point(0,0), id) {
        this.id = id
        this.position = position
        this.drawPosition = new Point(-1, -1);
        this.drawPosSet = false;
        this.serverPosition = new Point(0,0);
        this.dir = 0;
        this.isMyPlayer = false;
        this.isDead = false;
        this.deathWasCertain = false;
        this.didUncertainDeathLastTick = false;
        this.isDeathTimer=0;
        this.uncertainDeathPosition = new Point(0,0);
        this.deadAnimParts =[];
        this.deadAnimPartsRandDist =[];
        this.hitLines =[];
        this.moveRelativeToServerPosNextFrame =[];





        this.trails = [];
        this.name = "";



        // Colors
        this.colorBrighter = 0;
        this.colorDarker = 0;
        this.colorSlightlyBrighter = 0
        this.colorPattern = 0
        this.colorPatternEdge = 0

    }

    equals(player){
        return this.id === player.id;
    }

    static getPlayerById(id, players){
        for(let p of players){
            if(p.id === id)
                return p;
        }
    }



    drawPlayerTiles(ctx)
    {
        if(this.trails.length > 0){

        }

    }

    drawHitLines(ctx) {
        if (this.hitLines.length <= 0)
            return;

        
    }



    draw(ctx){
        this.drawPlayerTiles(ctx);
        this.drawHitLines(ctx);

    }

    equals(player){
        return this.id === player.id;
    }
}


export default Player;