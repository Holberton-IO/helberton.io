import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Point from "../../ui/objects/point";
import Viewer from "../../ui/objects/viewer";


class KilledPlayerPacket extends Packet {

    constructor() {
        super();
        this.packetId = 1014;
        this.killedPlayer = null;
        this.killerPlayer = null;

    }


    // Handel Server Response
    parsePacket() {

        const reader = this.reader;
        const killerId = reader.readInt4();
        const killerName = reader.readString();
        const killedId = reader.readInt4();
        const killedName = reader.readString();
        const myPlayer = client.player;
        const killHimSelf = myPlayer.id === killerId;
        this.killerPlayer = {
            id: killerId,
            name: killHimSelf ? "Your Self" : killerName
        }
        this.killedPlayer = {
            id: killedId,
            name: killedName
        }
    }

    finalize() {
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        // Now Current Player Is Killed
        const myPlayer = client.player;



        myPlayer.isReady = false;
        window.killMessageOverlay.showMessage(
            this.killerPlayer,
            myPlayer.requestRespawn
        )
    }
}

export default KilledPlayerPacket;