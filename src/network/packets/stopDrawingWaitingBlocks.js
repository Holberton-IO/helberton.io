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
    parsePacket() {
        this.userId = this.reader.readInt4();
        const vec = new Point(this.reader.readInt2(), this.reader.readInt2());
        this.lastBlock = vec;

    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        const playerList = window.gameEngine.gameObjects.players;
        let player = null;
        if (this.userId in playerList) {
            player = playerList[this.userId];
        } else {
            throw new Error("Player Not Found We Need To Send Player Colors");
        }


        // TODO Think Of This player.waitingBlocks For Reviewer Type
        if (player.waitingBlocks && player.waitingBlocks.length > 0) {
            const playerWaitingBlocks = player.waitingBlocks.getLast.blocks;
            if (playerWaitingBlocks.length > 0) {
                playerWaitingBlocks.push(this.lastBlock);
            }
        }


        // if player received to stop drawing waiting blocks request is sent to server
        // we need to skip the response
        if (player.isMyPlayer && player.isGettingWaitingBlocks) {
            player.skipGettingWaitingBlocksRespose = true;
        }



        // TODO Think Of This player.waitingBlocks For Reviewer Type
        if(player.waitingBlocks)
        player.waitingBlocks.push({
            vanishTimer: 0,
            blocks: []
        });


    }
}

export default StopDrawingWaitingBlocksPacket;