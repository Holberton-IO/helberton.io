import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import Point from "../../ui/objects/point";


class RespawnPacket extends Packet {

    constructor() {
        super();
        this.packetId = 1015;

    }


    // Handel Server Response
    parsePacket() {
        const reader = this.reader;
        this.playerX = reader.readInt2();
        this.playerY = reader.readInt2();
        this.direction = reader.readString();
        this.userId = reader.readInt4();

    }

    finalize() {
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        client.player = new Player(new Point(0, 0), this.userId);
        client.player.isMyPlayer = true;
        client.player.isReady = true;
        window.gameEngine.gameObjects.addPlayer(client.player);
    }
}

export default RespawnPacket;