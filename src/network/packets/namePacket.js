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
    parsePacket() {
        const nameLength = this.reader.readInt2();
        this.name = this.reader.readStringFromBytes(nameLength);
        this.userId = this.reader.readInt4();
        this.isVerified = this.reader.readInt1() === 1;

    }

    finalize() {
        const writer = new Writer(this.packetId);
        writer.writeStringInBytes(this.name);
        writer.writeIntInBytes(this.isVerified ? 1 : 0, 1)
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        console.log("Received Name Packet");


        if (this.isVerified) {

            const player = new Player(new Point(0,0), this.userId);
            player.isMyPlayer = true;

            client.player = player;
            client.isVerified = this.isVerified;
            client.username = this.name;
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