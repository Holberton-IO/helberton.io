import Packet from '../packet.js';
import Reader from '../utils/reader.js';
import Writer from '../utils/writer.js';
import {PlayerStatus} from "../client.js"
import Ready from "./ready";


class NamePacket extends Packet {

    constructor(name) {
        super();
        this.name = name;
        this.packetId = 1001;
        this.isVerified = false;
    }


    // Handel Server Response
    static parsePacket(p) {
        const nameLength = p.reader.readInt2();
        p.name = p.reader.readStringFromBytes(nameLength);
        p.isVerified = p.reader.readInt1() === 1;
        return p;
    }

    finalize() {
        const writer = new Writer(this.packetId);
        writer.writeStringInBytes(this.name);
        writer.writeIntInBytes(this.isVerified ? 1 : 0, 1)
        return writer.finalize();
    }


    handleReceivedPacket(packet, client) {
        console.log("Received Name Packet");


        if (packet.isVerified) {
            client.isVerified = packet.isVerified;
            client.username = packet.name;
            client.playerStatus = PlayerStatus.READY;
            client.send(new Ready());
        }else
        {
            //TODO Handle Not Verified Name
        }

    }
}

export default NamePacket;