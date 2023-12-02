import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Point from "../../ui/objects/point";
import * as GameMath from "../../utils/math";

class PongPacket extends Packet {

    constructor() {
        super();
        this.packetId = 1008;
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
        const myPlayer = client.player;
        const ping = Date.now() - myPlayer.lastPingTime;
        const currentPingDiff = Math.abs(ping - myPlayer.severLastPing);
        myPlayer.serverPingDiff = Math.max(myPlayer.serverPingDiff, currentPingDiff);
        myPlayer.serverPingDiff = GameMath.linearInterpolate(currentPingDiff, myPlayer.serverPingDiff, 0.5);
        myPlayer.serverAvgPing = GameMath.linearInterpolate(myPlayer.serverAvgPing, ping, 0.5);
        myPlayer.severLastPing = ping;
        myPlayer.lastPingTime = Date.now();
        myPlayer.waitingForPing = false;
    }
}

export default PongPacket;