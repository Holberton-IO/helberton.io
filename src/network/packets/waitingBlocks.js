import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Point from "../../ui/objects/point";


class WaitingBlocksPacket extends Packet {

    constructor() {
        super();
        this.packetId = 1005;
        this.player = null;
        this.userId = null;
        this.blocks = [];

    }


    // Handel Server Response
    static parsePacket(p) {
        p.userId = p.reader.readInt4();
        const blocksCount = p.reader.readInt2();
        for (let i = 0; i < blocksCount; i++) {
            const vec = new Point(p.reader.readInt2(), p.reader.readInt2());
            p.blocks.push(vec);
        }


        return p;
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(packet, client) {
        console.log("WaitingBlocksPacket  Packet");
        console.log(window.gameEngine.gameObjects.players);
        const myPlayer = window.gameEngine.gameObjects.myPlayer;

        const playerList = window.gameEngine.gameObjects.players;
        let player = null;
        if (packet.userId in playerList) {
            player = playerList[packet.userId];
        }
        else {
            throw new Error("Player Not Found We Need To Send Player Colors");
        }
        if(myPlayer && myPlayer.equals(player))
        {

        }
        else
        {
            // TODO console.log("SET_TRAIL");
        }



    }
}

export default WaitingBlocksPacket;