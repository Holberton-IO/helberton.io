import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Point from "../../ui/objects/point";


class PlayerStatePacket extends Packet {

    constructor(userId, mapSize) {
        super();
        this.userId = userId;
        this.packetId = 1004;
        this.player = null;

    }


    // Handel Server Response
    parsePacket() {
        const reader = this.reader;
        this.userId = reader.readInt4();
        this.playerName = reader.readString();

        this.playerX = reader.readInt2();
        this.playerY = reader.readInt2();
        this.direction = reader.readString();


        // Colors
        this.colorBrighter = convertIntColorToHex(reader.readInt4());
        this.colorDarker = convertIntColorToHex(reader.readInt4());
        this.colorSlightlyBrighter = convertIntColorToHex(reader.readInt4());
        this.colorPattern = convertIntColorToHex(reader.readInt4());
        this.colorPatternEdge = convertIntColorToHex(reader.readInt4());

    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        console.log("PlayerState Ready Packet");

        const myPlayer = client.player;

        let player = new Player(new Point(0, 0), this.userId);
        player = window.gameEngine.gameObjects.addPlayer(player);


        player.name = this.playerName;
        player.colorBrighter = this.colorBrighter;
        player.colorDarker = this.colorDarker;
        player.colorSlightlyBrighter = this.colorSlightlyBrighter;
        player.colorPattern = this.colorPattern;
        player.colorPatternEdge = this.colorPatternEdge;


        player.hasReceivedPosition = true;

        // When Receiving Player State
        // Next Frame Move Relative To Server Pos
        player.moveRelativeToServerPosNextFrame = true;
        player.lastServerPosSentTime = Date.now();
        myPlayer.lastPosHasBeenConfirmed = true;


        let offset = player.calMoveOffset();
        let newPos = new Point(this.playerX, this.playerY);
        let newPosOffset = newPos.clone();
        let newDir = this.direction;

        newPosOffset = Player.movePlayer(newPosOffset, newDir, offset);
        let serverSyncedWithClient = true;


        if (player.isMyPlayer) {
            player.lastPosServerSentTime = Date.now();

            // Check If Server Synced With Client
            // To Draw This Movement or Ignore It
            // if server predict the same movement
            // or the movement is to close to server
            serverSyncedWithClient = player.checkClientMovementSyncedWithServer(newDir
            , newPosOffset, newPos);

            if (serverSyncedWithClient) {
                player.myNextDir = newDir;
                player.changeCurrentDir(newDir, newPos, false, false);
                player.requestWaitingBlocks();
                player.sendDirQueue = [];
            }

            player.serverPos = newPosOffset.clone();
            player.serverDir = newDir;

            player.removeBlocksOutsideCamera();
        } else {
            player.updatePlayerDirection(newDir);
        }

        if (serverSyncedWithClient) {
            player.position=newPosOffset.clone();
            player.addWaitingBlocks(newPos);
        }

        //Start To Handel Draw Position
        if (!player.drawPosSet) {
            player.drawPosSet = true;
            player.drawPosition = player.position.clone();
        }

    }
}

export default PlayerStatePacket;