import Packet from "../packet";
import Reader from '../utils/reader.js';
import Writer from '../utils/writer.js';
import Rectangle from "../../ui/objects/rectangle.js";
import Point from "../../ui/objects/point.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Block from "../../ui/objects/block";

class FillAreaPacket extends Packet {
    constructor() {
        super();
        this.packetId = 1003;
        // Shape
        this.rectangle = null;
        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;

        // Colors
        this.colorBrighter = 0;
        this.colorDarker = 0;
        this.colorSlightlyBrighter = 0
        this.colorPattern = 0
        this.colorPatternEdge = 0
        this.playerId = 0;

    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }

    parsePacket() {
        const reader= this.reader;

        this.x = reader.readInt2();
        this.y = reader.readInt2();
        this.width = reader.readInt2();
        this.height = reader.readInt2();

        this.playerId = reader.readInt4();
        this.colorBrighter = convertIntColorToHex(reader.readInt4());
        this.colorDarker = convertIntColorToHex(reader.readInt4());
        this.colorSlightlyBrighter = convertIntColorToHex(reader.readInt4());
        this.colorPattern = convertIntColorToHex(reader.readInt4());
        this.colorPatternEdge = convertIntColorToHex(reader.readInt4());

        this.rectangle = new Rectangle(new Point(this.x, this.y), new Point(this.x + this.width, this.y + this.height));


    }

    handleReceivedPacket(client) {
        console.log("Received Fill Area Packet");

        const colorsWithId = {
            brighter: this.colorBrighter,
            darker: this.colorDarker,
            slightlyBrighter: this.colorSlightlyBrighter,
            pattern: this.colorPattern,
            patternEdge: this.colorPatternEdge,
            id: this.playerId
        }
        Block.convertRectToBlock(this.rectangle, colorsWithId,window.gameEngine.gameObjects.blocks,
            window.gameEngine.gameObjects.myPlayer
            );

    }
}

export default FillAreaPacket;