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
    parsePacket() {
        const reader = this.reader;
        this.userId = reader.readInt4();
        const blocksCount = reader.readInt2();
        for (let i = 0; i < blocksCount; i++) {
            const vec = new Point(reader.readInt2(), reader.readInt2());
            this.blocks.push(vec);
        }
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


        let replaceWaitingBlocks = false;
        if (player.isMyPlayer) {


            // some cases we need to skip the response
            if (player.skipGettingWaitingBlocksRespose) {
                player.skipGettingWaitingBlocksRespose = false;
                player.waitingPushedDuringReceiving = [];
            } else {

                // If Player Requesting Waiting Blocks vai RequestWaitingBlocks Packet
                // the RequestWaitingBlocks could happen if we found server and client blocks are not synced
                // in Player State Packet
                if (player.isGettingWaitingBlocks) {
                    player.isGettingWaitingBlocks = false;

                    // Player Requesting Waiting Blocks From Server So We Need To Replace The Waiting Blocks
                    replaceWaitingBlocks = true;


                    // Push Player Movement During Receiving Waiting Blocks
                    for (let i = 0; i < player.waitingPushedDuringReceiving.length; i++) {
                        const vec = player.waitingPushedDuringReceiving[i];
                        this.blocks.push(vec);
                    }

                    player.waitingPushedDuringReceiving = [];
                }



                // If Player Waiting Blocks Are Empty We Need To Request Waiting Blocks
                // possible that player received stop drawing blocks
                // possible that initial waiting blocks are empty game just started


                // TODO Think Of This player.waitingBlocks For Reviewer Type
                if (player.waitingBlocks && player.waitingBlocks.length > 0) {
                    const lastBlock = player.waitingBlocks.getLast;
                    if (lastBlock.blocks.length <= 0 && this.blocks.length > 0) {
                        // this call will cause to replace the waiting blocks with the new blocks coming from server
                        player.requestWaitingBlocks();

                    }
                }
            }
        }


        if (replaceWaitingBlocks) {

            // TODO Think Of This player.waitingBlocks For Reviewer Type
            if (player.waitingBlocks &&player.waitingBlocks.length > 0) {
                const lastBlock = player.waitingBlocks.getLast;
                lastBlock.blocks = [...this.blocks];
                lastBlock.vanishTimer = 0;
            } else {
                replaceWaitingBlocks = false;
            }
        }

        // TODO Think Of This player.waitingBlocks For Reviewer Type
        if (!replaceWaitingBlocks && player.waitingBlocks) {
            player.waitingBlocks.push({
                vanishTimer: 0,
                blocks: [...this.blocks]
            });
        }


    }
}

export default WaitingBlocksPacket;