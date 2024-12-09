import Packet from '../packet.js';
import Writer from '../utils/writer.js';
import Player from "../../ui/objects/player.js";
import {convertIntColorToHex} from "../../ui/utils.js";
import Point from "../../ui/objects/point";
import Viewer from "../../ui/objects/viewer";


class ConnectAsViewerPacket extends Packet {

    constructor() {
        super();
        this.packetId = 1012;
        this.mapSize = 0;
        this.userId = 0;
        this.x = 0;
        this.y = 0;

    }


    // Handel Server Response
    parsePacket() {
        const reader = this.reader;
        this.mapSize = reader.readInt2();
        this.userId = reader.readInt4();
        this.x = reader.readInt2();
        this.y = reader.readInt2();
    }

    finalize() {
        const writer = new Writer(this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        let viewer = new Viewer(new Point(this.x, this.y), this.userId);
        viewer.isMyPlayer = true;
        client.player = viewer;
        window.gameEngine.gameObjects.mapSize = this.mapSize;
        window.gameEngine.gameObjects.addPlayer(viewer);
    }
}

export default ConnectAsViewerPacket;