import Packet from '../packet.js';
import Reader from '../utils/reader.js';
import Writer from '../utils/writer.js';
import {PlayerStatus} from "../client.js"
import Ready from "./ready";
import Player  from "../../ui/objects/player";
import Point from "../../ui/objects/point";

class NamePacket extends Packet {

    constructor(name) {
        super();
        this.name = name;
        this.packetId = 1001;
        this.isVerified = false;
        this.userId = 0;
    }


    // Handel Server Response
    static parsePacket(p) {
        const nameLength = p.reader.readInt2();
        p.name = p.reader.readStringFromBytes(nameLength);
        p.userId = p.reader.readInt4();
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

            const player = new Player(new Point(0,0), packet.userId);
            player.isMyPlayer = true;

            client.player = player;
            client.isVerified = packet.isVerified;
            client.username = packet.name;
            client.playerStatus = PlayerStatus.READY;
            window.gameEngine.gameObjects.addPlayer(player);

            client.send(new Ready());
        }else
        {
            //TODO Handle Not Verified Name
        }

    }
}

export default NamePacket;