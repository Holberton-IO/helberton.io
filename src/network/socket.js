class Socket{
    constructor(server,client) {
        this.server = server;
        this.onReceive = client.onReceive.bind(client);
        this.onOpen = client.onOpen.bind(client);
        this.onClose = client.onClose.bind(client);
        this.ws = null;
    }

    iniSocket() {
        this.ws = new WebSocket(this.server);
        let ws = this.ws;
        ws.binaryType = "arraybuffer";
        ws.onopen = this.onOpen;
        ws.onmessage = this.onReceive;
        ws.onclose = this.onClose;
    }

    send(packet) {
        this.ws.send(packet.finalize());
    }

}

export default Socket;