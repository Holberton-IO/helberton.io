import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Point from "../../ui/objects/point";


class PlayerRemovedPacket extends Packet {

    constructor() {
        super();
        this.userId = null;
        this.packetId = 1010;
        this.player = null;

    }


    // Handel Server Response
    parsePacket() {
        this.userId = this.reader.readInt4();
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        const player = window.gameEngine.gameObjects.players[this.userId];
        if(player)
            window.gameEngine.gameObjects.removePlayer(player);

    }
}

export default PlayerRemovedPacket;