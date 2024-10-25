import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Point from "../../ui/objects/point";


class StopDrawingWaitingBlocksPacket extends Packet {

    constructor() {
        super();
        this.packetId = 1011;
        this.player = null;
        this.userId = null;
        this.lastBlock = null;

    }


    // Handel Server Response
    static parsePacket(p) {
        p.userId = p.reader.readInt4();
        const vec = new Point(p.reader.readInt2(), p.reader.readInt2());
        p.lastBlock = vec;


        return p;
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(packet, client) {
        const playerList = window.gameEngine.gameObjects.players;
        let player = null;
        if (packet.userId in playerList) {
            player = playerList[packet.userId];
        } else {
            throw new Error("Player Not Found We Need To Send Player Colors");
        }

        if (player.waitingBlocks.length > 0) {
            const playerWaitingBlocks = player.waitingBlocks.getLast.blocks;
            if (playerWaitingBlocks.length > 0) {
                playerWaitingBlocks.push(packet.lastBlock);
            }
        }

        if (player.isMyPlayer && player.isGettingWaitingBlocks) {
            player.skipGettingWaitingBlocksRespose = true;
        }

        player.waitingBlocks.push({
            vanishTimer: 0,
            blocks: []
        });


    }
}

export default StopDrawingWaitingBlocksPacket;