import Reader from './utils/reader.js';
import Writer from './utils/writer.js';

class Packet {
    constructor() {
        this.data = null;
        this.packetId = -1;
        this.packetSize = 0;
        this.reader = null
    }


    setPacketData(data) {
        this.data = data;
    }


    toHexString() {
        if (this.reader === null)
            throw new Error("Reader is null");

        return this.reader.toHexString();
    }


    parsePacket() {
        throw new Error("Not implemented");
    }

    static parsePacketData(packetSize, reader, packet) {
        let p = new packet();
        p.reader = reader;
        p.data = reader.data;
        p.packetSize = packetSize;
        p.parsePacket();
        return p;
    }

    handleReceivedPacket(client) {
        throw new Error("Not implemented");
    }

    finalize() {
        throw new Error("Not implemented");
    }

}

export default Packet;