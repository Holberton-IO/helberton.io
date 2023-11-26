import Packet from '../packet.js';
import Reader from '../utils/reader.js';
import Writer from '../utils/writer.js';
import {PlayerStatus} from "../client.js"
import Player from "../../ui/objects/player.js";

class Ready extends Packet {

    constructor(userId, mapSize) {
        super();
        this.userId = userId;
        this.packetId = 1002;
        this.mapSize = mapSize;
        this.player_name = "";
    }


    // Handel Server Response
    static parsePacket(p) {
        p.userId = p.reader.readInt4();
        p.mapSize = p.reader.readInt2();
        p.player_name = p.reader.readString();
        return p;
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(packet, client) {
        const player = new Player(null, packet.userId);
        player.isMyPlayer = true;
        player.name = packet.player_name;
        window.gameEngine.gameObjects.addMyPlayer(player);
        window.gameEngine.gameObjects.mapSize = packet.mapSize;
        console.log("Ready");
        console.log(window.gameEngine.gameObjects);
    }
}

export default Ready;