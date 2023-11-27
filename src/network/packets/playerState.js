import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Point from "../../ui/objects/point";


class PlayerStatePacket extends Packet {

    constructor(userId, mapSize) {
        super();
        this.userId = userId;
        this.packetId = 1004;
        this.player = null;

    }


    // Handel Server Response
    static parsePacket(p) {
        p.userId = p.reader.readInt4();
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
        console.log("PlayerState Ready Packet");

        const myPlayer = window.gameEngine.gameObjects.myPlayer;

        const player = new Player(null, packet.userId);
        player.isMyPlayer = true;
        player.name = packet.playerName;
        player.colorBrighter = packet.colorBrighter;
        player.colorDarker = packet.colorDarker;
        player.colorSlightlyBrighter = packet.colorSlightlyBrighter;
        player.colorPattern = packet.colorPattern;
        player.colorPatternEdge = packet.colorPatternEdge;
        player.position = new Point(packet.playerX, packet.playerY);
        player.direction = packet.direction;

        if (myPlayer && myPlayer.equals(player)) {
            myPlayer.position = player.position;
            myPlayer.direction = player.direction;
        }

        window.gameEngine.gameObjects.addPlayer(player);



    }
}

export default PlayerStatePacket;