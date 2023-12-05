import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Point from "../../ui/objects/point";


class Ready extends Packet {

    constructor(userId, mapSize) {
        super();
        this.userId = userId;
        this.packetId = 1002;
        this.mapSize = mapSize;
        this.playerName = "";
        this.playerX = 0;
        this.playerY = 0;
        this.direction = 0;


        // Colors
        this.colorBrighter = 0;
        this.colorDarker = 0;
        this.colorSlightlyBrighter = 0
        this.colorPattern = 0
        this.colorPatternEdge = 0
    }


    // Handel Server Response
    static parsePacket(p) {
        p.userId = p.reader.readInt4();
        p.mapSize = p.reader.readInt2();
        p.playerName = p.reader.readString();

        p.playerX = p.reader.readInt2();
        p.playerY = p.reader.readInt2();
        p.direction = p.reader.readString();


        // Colors
        p.colorBrighter = convertIntColorToHex(p.reader.readInt4());
        p.colorDarker = convertIntColorToHex(p.reader.readInt4());
        p.colorSlightlyBrighter = convertIntColorToHex(p.reader.readInt4());
        p.colorPattern = convertIntColorToHex(p.reader.readInt4());
        p.colorPatternEdge = convertIntColorToHex(p.reader.readInt4());

        return p;
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(packet, client) {
        console.log("Received Ready Packet");
        const player = client.player;

        player.name = packet.playerName;
        player.colorBrighter = packet.colorBrighter;
        player.colorDarker = packet.colorDarker;
        player.colorSlightlyBrighter = packet.colorSlightlyBrighter;
        player.colorPattern = packet.colorPattern;
        player.colorPatternEdge = packet.colorPatternEdge;
        // player.position = new Point(packet.playerX, packet.playerY);
        // player.dir = packet.direction;
        console.log("READY",player);
        window.gameEngine.gameObjects.mapSize = packet.mapSize;
        player.isReady = true;
        console.log(window.gameEngine.gameObjects);


    }
}

export default Ready;