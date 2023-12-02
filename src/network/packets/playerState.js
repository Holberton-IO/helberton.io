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
    static parsePacket(p) {
        p.userId = p.reader.readInt4();
        p.playerName = p.reader.readString();

        p.playerX = p.reader.readInt2();
        p.playerY = p.reader.readInt2();
        p.direction = p.reader.readString();


        // Colors
        p.colorBrighter = convertIntColorToHex(p.reader.readInt4());
        p.colorDarker = convertIntColorToHex(p.reader.readInt4());
        p.colorSlightlyBrighter = convertIntColorToHex(p.reader.readInt4());
        p.colorPattern = convertIntColorToHex(p.reader.readInt4());
        p.colorPatternEdge = convertIntColorToHex(p.reader.readInt4());

        return p;
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(packet, client) {
        console.log("PlayerState Ready Packet");

        const myPlayer = client.player;

        let player = new Player(null, packet.userId);

        player = window.gameEngine.gameObjects.addPlayer(player);


        player.name = packet.playerName;
        player.colorBrighter = packet.colorBrighter;
        player.colorDarker = packet.colorDarker;
        player.colorSlightlyBrighter = packet.colorSlightlyBrighter;
        player.colorPattern = packet.colorPattern;
        player.colorPatternEdge = packet.colorPatternEdge;
        player.position = new Point(packet.playerX, packet.playerY);
        player.dir = packet.direction;

        player.hasReceivedPosition = true;
        player.moveRelativeToServerPosNextFrame = true;
        player.lastServerPosSentTime = Date.now();


        myPlayer.lastPosHasBeenConfirmed = true;
        let offset = player.calMoveOffset();
        let newPos = new Point(packet.playerX, packet.playerY);
        let newDir = packet.direction;
        Player.movePlayer(newPos, newDir, offset);
        let doSetPos = true;

        if (player.isMyPlayer) {
            player.lastPosServerSentTime = Date.now();

            // Check If dir and por are close to current
            const distVector = player.position.distanceVector(newPos);
            if ((player.dir === newDir || player.myNextDir === newDir) &&
                distVector.x < 1 && distVector.y < 1) {
                doSetPos = false;
            }

            //if dir and pos are the first item of lastClientsideMoves
            //when two movements are made shortly after each other the
            //previous check (dir && pos) won't suffice, eg:
            // client makes move #1
            // client makes move #2
            // receives move #1 <-- different from current dir & pos
            // recieves move #2
            if (player.clientSideMoves.length > 0) {
                const lastClientSideMove = player.clientSideMoves.shift()
                if (lastClientSideMove.dir === newDir
                    && lastClientSideMove.pos.equals(newPos)) {
                    doSetPos = false;
                } else {
                    player.clientSideMoves = [];
                }
            }

            if (doSetPos) {
                player.myNextDir = newDir;
                player.changeCurrentDir(newDir,newPos,false,false);

                //TODO REQUEST MY WAITING
                player.sendDirQueue=[];
            }


            player.serverPos = newPos;
            player.serverDir = newDir;
        }else
        {
            player.dir = newDir;
        }

        if (doSetPos) {
            player.position = newPos;
            player.lastPosServerSentTime = Date.now();
        }


        if (!player.drawPosSet) {
            player.drawPosSet = true;
            player.drawPosition = new Point(packet.playerX, packet.playerY);
        }

    }
}

export default PlayerStatePacket;