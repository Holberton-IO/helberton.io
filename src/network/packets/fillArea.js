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

    static parsePacket(p) {
        p.x = p.reader.readInt2();
        p.y = p.reader.readInt2();
        p.width = p.reader.readInt2();
        p.height = p.reader.readInt2();

        p.playerId = p.reader.readInt4();
        p.colorBrighter = convertIntColorToHex(p.reader.readInt4());
        p.colorDarker = convertIntColorToHex(p.reader.readInt4());
        p.colorSlightlyBrighter = convertIntColorToHex(p.reader.readInt4());
        p.colorPattern = convertIntColorToHex(p.reader.readInt4());
        p.colorPatternEdge = convertIntColorToHex(p.reader.readInt4());

        p.rectangle = new Rectangle(new Point(p.x, p.y), new Point(p.x + p.width, p.y + p.height));


        return p;
    }

    handleReceivedPacket(packet, client) {
        console.log("Received Fill Area Packet");

        const colorsWithId = {
            brighter: packet.colorBrighter,
            darker: packet.colorDarker,
            slightlyBrighter: packet.colorSlightlyBrighter,
            pattern: packet.colorPattern,
            patternEdge: packet.colorPatternEdge,
            id: packet.playerId
        }
        Block.convertRectToBlock(packet.rectangle, colorsWithId,window.gameEngine.gameObjects.blocks,
            window.gameEngine.gameObjects.myPlayer
            );

    }
}

export default FillAreaPacket;