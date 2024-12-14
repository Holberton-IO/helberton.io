import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Point from "../../ui/objects/point";
import Viewer from "../../ui/objects/viewer";
import {convertIntColorToHex} from "../../ui/utils";


class UpdateLeaderBoardPacket extends Packet {

    constructor() {
        super();
        this.packetId = 1013;
        this.players = [];

    }


    // Handel Server Response
    parsePacket() {
        const reader = this.reader;
        const playersLength = reader.readInt2();
        for (let i = 0; i < playersLength; i++) {
            const name = reader.readString();
            const id = reader.readInt4();
            const numberOfKills = reader.readInt4();
            const playerColor = convertIntColorToHex(reader.readInt4());
            const score = Math.round(reader.readFloatFromBytes() * 100) / 100;

            if (window.myPlayer && window.myPlayer.id === id){
                window.myPlayer.score = score;
                window.myPlayer.kills = numberOfKills;
                window.myPlayer.rank = i + 1;
            }



            this.players.push(
                {
                    name: name,
                    playerColor: playerColor,
                    score,
                    id,
                    numberOfKills,
                }
            );
        }



    }

    finalize() {
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        window.leaderboard.updateLeaderboard(this.players);
    }
}

export default UpdateLeaderBoardPacket;