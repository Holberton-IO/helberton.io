import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Point from "../../ui/objects/point";


class DirectionPacket extends Packet {

    constructor(direction, position) {
        super();
        this.dir = direction;
        this.packetId = 1006;
        this.position = position;
    }


    // Handel Server Response
    static parsePacket(p) {
        return p;
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        writer.writeStringInBytes(this.dir);
        writer.writeIntInBytes(this.position.x, 2);
        writer.writeIntInBytes(this.position.y, 2);
        return writer.finalize();
    }


    handleReceivedPacket(packet, client) {
    }
}

export default DirectionPacket;