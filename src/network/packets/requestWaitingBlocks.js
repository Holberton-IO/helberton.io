import Packet from '../packet.js';
import Writer from '../utils/writer.js';

class RequestWaitingBlockPacket extends Packet {

    constructor() {
        super();
        this.packetId = 1009;


    }


    // Handel Server Response
    static parsePacket(p) {

        return p;
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(packet, client) {
        console.log("RequestWaitingBlockPacket", packet);

    }
}

export default RequestWaitingBlockPacket;