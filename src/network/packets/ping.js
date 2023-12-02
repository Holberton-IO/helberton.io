import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Point from "../../ui/objects/point";


class PingPacket extends Packet {

    constructor() {
        super();
        this.packetId = 1007;
    }


    // Handel Server Response
    static parsePacket(p) {
        return p;
    }

    finalize() {
        // Handle Server Request
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(packet, client) {
    }
}

export default PingPacket;