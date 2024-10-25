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

    parsePacket() {
        const reader = this.reader;

        this.userId = reader.readInt4();
        this.mapSize = reader.readInt2();
        this.playerName = reader.readString();

        this.playerX = reader.readInt2();
        this.playerY = reader.readInt2();
        this.direction = reader.readString();


        // Colors
        this.colorBrighter = convertIntColorToHex(reader.readInt4());
        this.colorDarker = convertIntColorToHex(reader.readInt4());
        this.colorSlightlyBrighter = convertIntColorToHex(reader.readInt4());
        this.colorPattern = convertIntColorToHex(reader.readInt4());
        this.colorPatternEdge = convertIntColorToHex(reader.readInt4());
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        console.log("Received Ready Packet");
        const player = client.player;

        player.name = this.playerName;
        player.colorBrighter = this.colorBrighter;
        player.colorDarker = this.colorDarker;
        player.colorSlightlyBrighter = this.colorSlightlyBrighter;
        player.colorPattern = this.colorPattern;
        player.colorPatternEdge = this.colorPatternEdge;
        // player.position = new Point(packet.playerX, packet.playerY);
        // player.dir = packet.direction;
        console.log("READY", player);
        window.gameEngine.gameObjects.mapSize = this.mapSize;
        player.isReady = true;
        console.log(window.gameEngine.gameObjects);


    }
}

export default Ready;