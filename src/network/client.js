import Socket from "./socket.js"
import Reader from "./utils/reader.js"
import PacketsDictionary from "./packets/packets";
import NamePacket from "./packets/namePacket.js";

const ConnectionStatus = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};

const PlayerStatus = {
    WAITING: -1,
    CONNECTED: 0,
    READY: 1,
    PLAYING: 2,
    DISCONNECTED: 3
};





class Client {
    constructor(server,onConnect, ) {
        this.server = server;
        this.ws = new Socket(this.server, this);
        this.ws.iniSocket();
        this.onConnect = onConnect;


        this.connectionStatus = ConnectionStatus.CONNECTING;
        this.playerStatus = PlayerStatus.WAITING;
        this.username = "";


    }


    send(packet) {
        this.ws.send(packet);
    }

    onReceive(messageEvent) {
        if (typeof messageEvent.data !== "object")
            return;

        this.packetHandler(messageEvent.data);


    }

    onOpen(onOpenEvent) {
        console.log("Connected to server");
        console.log(onOpenEvent);
        this.connectionStatus = ConnectionStatus.OPEN;
        this.playerStatus = PlayerStatus.CONNECTED;
        this.onConnect(this);
        // let p = new namePacket(this.username);



    }

    onClose(onCloseEvent) {
        console.log("OnClose to server");
        console.log(onCloseEvent);
        this.connectionStatus = ConnectionStatus.CLOSED;
    }

    packetHandler(data) {
        let x = new Uint8Array(data);
        const reader = new Reader(x);
        const packetSize = reader.readInt2();
        const packetId = reader.readInt2();
        const packetClass = PacketsDictionary[packetId];
        const packet = packetClass.parsePacketData(packetSize, reader, packetClass);
        packet.handleReceivedPacket(packet,this);
    }

    setPlayerName(name) {
        let p = new NamePacket(name);
        this.send(p);
    }

}

export {ConnectionStatus, Client, PlayerStatus};