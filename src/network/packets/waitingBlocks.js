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
        const playerList = window.gameEngine.gameObjects.players;
        let player = null;
        if (packet.userId in playerList) {
            player = playerList[packet.userId];
        } else {
            throw new Error("Player Not Found We Need To Send Player Colors");
        }




        let replaceStack = false;
        if (player.isMyPlayer) {
            if (player.skipGettingWaitingBlocksRespose) {
                player.skipGettingWaitingBlocksRespose = false;
                player.waitingPushedDuringReceiving = [];
            } else {

                // If Player Requesting Waiting Blocks vai RequestWaitingBlocks Packet
                if (player.isGettingWaitingBlocks) {
                    player.isGettingWaitingBlocks = false;
                    replaceStack = true;
                    for (let i = 0; i < player.waitingPushedDuringReceiving.length; i++) {
                        const vec = player.waitingPushedDuringReceiving[i];
                        this.blocks.push(vec);
                    }
                    player.waitingPushedDuringReceiving = [];
                }

                if (player.waitingBlocks.length > 0) {
                    const lastBlock = player.waitingBlocks[player.waitingBlocks.length - 1];
                    if (lastBlock.blocks.length <= 0 && this.blocks.length > 0) {
                        player.requestWaitingBlocks();
                    }
                }
            }
        }


        if (replaceStack) {
            if (player.waitingBlocks.length > 0) {
                const lastBlock = player.waitingBlocks[player.waitingBlocks.length - 1];
                lastBlock.blocks = this.blocks;
                lastBlock.vanishTimer = 0;
            } else {
                replaceStack = false;
            }
        }
        if (!replaceStack) {
            player.waitingBlocks.push({
                vanishTimer: 0,
                blocks: this.blocks
            });
        }

        console.log("Waiting Blocks", [...player.waitingBlocks]);

    }
}

export default WaitingBlocksPacket;