/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config/game-config.js":
/*!***********************************!*\
  !*** ./src/config/game-config.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    SERVER_URL: 'ws://127.0.0.1:5000/game',
    BACKGROUND_COLOR: "#e6f3ff",
    SNOW_EFFECT_CONFIG: {
        particleCount: 500
    },
    GAME_FPS: 60
});


/***/ }),

/***/ "./src/controls.js":
/*!*************************!*\
  !*** ./src/controls.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ui_objects_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ui/objects/player */ "./src/ui/objects/player.js");


const keyMapper = { //In Circle Way
    ArrowUp: 1,
    ArrowDown: 3,
    ArrowLeft: 4,
    ArrowRight: 2,
}

window.onkeyup = (e) => {
    //console.log(keyMapper[e.key]);
    const keyVal = keyMapper[e.key];
    if(keyVal && window.client && window.client.player && window.client.player.isReady){
        const dir = _ui_objects_player__WEBPACK_IMPORTED_MODULE_0__["default"].mapControlsToDir(keyVal);
        window.client.player.requestChangeDir(dir);
    }
};


/***/ }),

/***/ "./src/extensions/arrays-extensions.js":
/*!*********************************************!*\
  !*** ./src/extensions/arrays-extensions.js ***!
  \*********************************************/
/***/ (() => {

Object.defineProperty(Array.prototype, 'getLast', {
    get: function() {
        if (this.length === 0) {
            throw new Error("No elements in array");
        }
        return this[this.length - 1];
    }
});


Object.defineProperty(Array.prototype, 'first', {
    get: function() {
        if (this.length === 0) {
            throw new Error("No elements in array");
        }
        return this[0];
    }
});


/***/ }),

/***/ "./src/game-engine.js":
/*!****************************!*\
  !*** ./src/game-engine.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/math.js */ "./src/utils/math.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _game_objects__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./game-objects */ "./src/game-objects.js");
/* harmony import */ var _network_packets_ping__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./network/packets/ping */ "./src/network/packets/ping.js");







class GameEngine {
    constructor(fps) {
        this.lastFrameTimeStamp = 0
        this.currentFrameTimeStamp = 0
        this.totalDeltaTimeCap = 0
        this.fps = fps
        this.deltaTime = 1000 / this.fps;
        this.interpoatedDeltaTime = 1000 / this.fps;


        this.timesCap = [0, 6.5, 16, 33, 49, 99];
        this.currentCapIndex = 0;

        this.processFrames = [];
        this.missedFrames = [];


        this.canvanQaulity = 1;


        this.gameObjects = new _game_objects__WEBPACK_IMPORTED_MODULE_2__["default"]();

        this.drawFunction = () => {
        };
    }

    setDrawFunction(drawFunction) {
        this.drawFunction = drawFunction;
    }


    getCap(cap) {
        return this.timesCap[_utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(cap, 0, this.timesCap.length - 1)];
    }

    checkIncreasingInFramesProcess() {
        // This function checks if the game is running at the right speed.
        // If the game is running too fast, it will decrease the currentCapIndex.
        // if currentFrameTimeStamp < 90% of the currentCapIndex, then decrease the currentCapIndex.
        if (this.currentFrameTimeStamp < _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.linearInterpolate(
            this.getCap(this.currentCapIndex), this.getCap(this.currentCapIndex - 1),
            0.9
        )) {
            this.processFrames.push(Date.now());

            // If Draw More than 190 frames in 10 seconds, then remove the first frame.
            while (this.processFrames.length > 190) {
                if (Date.now() - this.processFrames[0] > 10_000) {
                    this.processFrames.splice(0, 1)
                } else {
                    // if first frame happen in less than 10 seconds, decrease the currentCapIndex.
                    this.currentCapIndex--;
                    this.processFrames = [];
                    this.currentCapIndex = _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(this.currentCapIndex, 0, this.timesCap.length - 1);
                }
            }
        }
    }

    checkDecreaseInFramesProcess() {
        // This function checks if the game is running at the right speed.
        // If the game is running too slow, it will increase the currentCapIndex.
        // if currentFrameTimeStamp > 5% of the currentCapIndex, then increase the currentCapIndex.
        if (this.currentFrameTimeStamp > _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.linearInterpolate(
            this.getCap(this.currentCapIndex), this.getCap(this.currentCapIndex + 1),
            0.05
        )) {
            this.missedFrames.push(Date.now());
            this.processFrames = [];
            // If Draw Less than 5 frames in 5 seconds, then remove the first frame.
            while (this.missedFrames.length > 5) {
                if (Date.now() - this.missedFrames[0] > 5_000) {
                    this.missedFrames.splice(0, 1)
                } else {
                    // if first frame happen in less than 5 seconds, increase the currentCapIndex.
                    this.currentCapIndex++;
                    this.missedFrames = [];
                    this.currentCapIndex = _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(this.currentCapIndex, 0, this.timesCap.length - 1);
                }
            }
        }
    }


    handleServerTiming(timeStamp) {
        if (!window.client || !window.client.player)
            return;
        const myPlayer = window.client.player;
        const maxWaitTimeForDisconnect = window.game.maxWaitingSocketTime;
        const clientSideSetPosPassedTime = Date.now() - myPlayer.lastMyPostSetClientSendTime;
        const lastConfirmationPassedTime = Date.now() - myPlayer.lastConfirmedTimeForPos;
        const serverSideSetPosPassed = Date.now() - myPlayer.lastPosServerSentTime;

        const timeTookToConfirmation = serverSideSetPosPassed - clientSideSetPosPassedTime;

        // console.log(`Last Confirmation Passed Time: ${lastConfirmationPassedTime}ms`);
        // console.log(`Time Took To Confirmation: ${timeTookToConfirmation}ms`);
        if (lastConfirmationPassedTime > maxWaitTimeForDisconnect &&
            timeTookToConfirmation > maxWaitTimeForDisconnect) {
            console.log("Check Your Internet Connection");

        }else {

        }

        const maxPingTime = myPlayer.waitingForPing ? 1_0000: 5_000;
        const pingPassedTime = Date.now() - myPlayer.lastPingTime;
        if(pingPassedTime > maxPingTime) {
            myPlayer.waitingForPing = true;
            myPlayer.lastPingTime = Date.now();
            const pingPacket = new _network_packets_ping__WEBPACK_IMPORTED_MODULE_3__["default"]();
            window.client.send(pingPacket);
        }



    }

    loop(timeStamp) {
        window.game.timeStamp = timeStamp;
        this.currentFrameTimeStamp = timeStamp - this.lastFrameTimeStamp; // 16

        if(this.currentFrameTimeStamp > this.interpoatedDeltaTime){
            this.interpoatedDeltaTime = this.currentFrameTimeStamp;
        }else
        {
            this.interpoatedDeltaTime = _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.linearInterpolate(this.interpoatedDeltaTime, this.currentFrameTimeStamp, 0.05);
        }



        this.checkIncreasingInFramesProcess();
        this.checkDecreaseInFramesProcess();
        this.deltaTime = this.currentFrameTimeStamp + this.totalDeltaTimeCap;
        // console.log(this.deltaTime, this.gameObjects.blocks.length);
        this.lastFrameTimeStamp = timeStamp;
        if (this.deltaTime < this.getCap(this.currentCapIndex)) {
            this.totalDeltaTimeCap += this.currentFrameTimeStamp;

        } else {
            this.totalDeltaTimeCap = 0;
            this.drawFunction();
        }


        this.handleServerTiming(timeStamp);
        window.requestAnimationFrame(this.loop.bind(this));
    }


    camTransform(ctx, changeSize = false) {
        if (changeSize) {
            this.scaleCanvas(ctx);
        }

        ctx.save();
        const camera = window.camera;
        camera.calZoom(ctx);


    }

    scaleCanvas(ctx, w = _ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.getWidth(),
                h = _ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.getHeight()) {
        let MAX_PIXEL_RATIO = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.calculate_pixel_ratio)();
        let drawingQuality = 1;
        let c = ctx.canvas;
        c.width = w * drawingQuality * MAX_PIXEL_RATIO;
        c.height = h * drawingQuality * MAX_PIXEL_RATIO;
        let styleRatio = 1;
        c.style.width = w * styleRatio + "px";
        c.style.height = h * styleRatio + "px";
    }

}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameEngine);

/***/ }),

/***/ "./src/game-objects.js":
/*!*****************************!*\
  !*** ./src/game-objects.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ui_objects_block_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ui/objects/block.js */ "./src/ui/objects/block.js");


class GameObjects {
    constructor() {
        this.players = {};
        this.blocks = [];
        this.myPlayer = null;
        this.mapSize = 0;
    }


    /***
     * Add Player To Game Objects
     *  if player is already in the game objects return the player
     *  if player is my player set it to my player
     *  else set player to ready as it is already in the game
     */
    addPlayer(player) {
        if (player.id in this.players)
            return this.players[player.id];
        if (player.isMyPlayer) {
            window.myPlayer = player;
            this.myPlayer = player;
        }
        else
            player.isReady = true;

        this.players[player.id] = player;
        return player;
    }



    getPlayerById(id) {
        return this.players[id];
    }


    removePlayer(player) {
        if (player.id in this.players)
            delete this.players[player.id];
    }

    isPlayerExist(player) {
        return player.id in this.players;
    }

    isPlayerIdExist(id) {
        return id in this.players;
    }

    addBlock(block) {
        return _ui_objects_block_js__WEBPACK_IMPORTED_MODULE_0__["default"].getBlockAt(block.position, this.blocks);
    }


}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameObjects);

/***/ }),

/***/ "./src/globals.js":
/*!************************!*\
  !*** ./src/globals.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ui/objects/point.js */ "./src/ui/objects/point.js");


const globals = {
    timeStamp: 0,
    gameSpeed: 0.006,
    viewPortRadius: 30,
    maxZoom: 430,
    maxBlocksNumber: 2500, //1100 50 * 50
    usernameLength: 6,
    maxWaitingSocketTime: 1_000,
    drawingOffset: 10,
    calDrawingOffset: (p) => {
        return new _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_0__["default"](p.x * globals.drawingOffset, p.y * globals.drawingOffset);
    }
};




window.game = {};
// Adding to window object
Object.entries(globals).forEach(([key, value]) => {
    window.game[key] = value;
});


/***/ }),

/***/ "./src/network/client.js":
/*!*******************************!*\
  !*** ./src/network/client.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Client: () => (/* binding */ Client),
/* harmony export */   ConnectionStatus: () => (/* binding */ ConnectionStatus),
/* harmony export */   PlayerStatus: () => (/* binding */ PlayerStatus)
/* harmony export */ });
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./socket.js */ "./src/network/socket.js");
/* harmony import */ var _utils_reader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/reader.js */ "./src/network/utils/reader.js");
/* harmony import */ var _packets_packets__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./packets/packets */ "./src/network/packets/packets.js");
/* harmony import */ var _packets_namePacket_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./packets/namePacket.js */ "./src/network/packets/namePacket.js");





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
        window.client = this;
        this.server = server;
        this.ws = new _socket_js__WEBPACK_IMPORTED_MODULE_0__["default"](this.server, this);
        this.ws.iniSocket();
        this.onConnect = onConnect;


        this.connectionStatus = ConnectionStatus.CONNECTING;
        this.playerStatus = PlayerStatus.WAITING;
        this.username = "";
        this.player = null;


    }


    send(packet) {

        // console.log("Sending Packet ->>>>>" +packet.constructor.name);
        this.ws.send(packet);
    }

    onReceive(messageEvent) {
        if (typeof messageEvent.data !== "object")
            return;

        this.packetHandler(messageEvent.data);


    }

    onOpen(onOpenEvent) {
        // console.log("Connected to server");
        // console.log(onOpenEvent);
        this.connectionStatus = ConnectionStatus.OPEN;
        this.playerStatus = PlayerStatus.CONNECTED;
        this.onConnect(this);

    }

    onClose(onCloseEvent) {
        console.log("OnClose to server");
        console.log(onCloseEvent);
        this.connectionStatus = ConnectionStatus.CLOSED;
    }

    packetHandler(data) {
        let x = new Uint8Array(data);
        const reader = new _utils_reader_js__WEBPACK_IMPORTED_MODULE_1__["default"](x);
        const packetSize = reader.readInt2();
        const packetId = reader.readInt2();
        const packetClass = _packets_packets__WEBPACK_IMPORTED_MODULE_2__["default"][packetId];
        const packet = packetClass.parsePacketData(packetSize, reader, packetClass);
        packet.handleReceivedPacket(this);
    }

    setPlayerName(name) {
        let p = new _packets_namePacket_js__WEBPACK_IMPORTED_MODULE_3__["default"](name);
        this.send(p);
    }

}



/***/ }),

/***/ "./src/network/packet.js":
/*!*******************************!*\
  !*** ./src/network/packet.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_reader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/reader.js */ "./src/network/utils/reader.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/writer.js */ "./src/network/utils/writer.js");



class Packet {
    constructor() {
        this.data = null;
        this.packetId = -1;
        this.packetSize = 0;
        this.reader = null
    }


    setPacketData(data) {
        this.data = data;
    }


    toHexString() {
        if (this.reader === null)
            throw new Error("Reader is null");

        return this.reader.toHexString();
    }


    parsePacket() {
        throw new Error("Not implemented");
    }

    static parsePacketData(packetSize, reader, packet) {
        let p = new packet();
        // console.log("Received Packet <-----: " + p.constructor.name);

        p.reader = reader;
        p.data = reader.data;
        p.packetSize = packetSize;
        p.parsePacket();
        return p;
    }

    handleReceivedPacket(client) {
        throw new Error("Not implemented");
    }

    finalize() {
        throw new Error("Not implemented");
    }

}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Packet);

/***/ }),

/***/ "./src/network/packets/connectAsViewerPacket.js":
/*!******************************************************!*\
  !*** ./src/network/packets/connectAsViewerPacket.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/player.js */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");
/* harmony import */ var _ui_objects_viewer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../ui/objects/viewer */ "./src/ui/objects/viewer.js");








class ConnectAsViewerPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

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
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        let viewer = new _ui_objects_viewer__WEBPACK_IMPORTED_MODULE_5__["default"](new _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__["default"](this.x, this.y), this.userId);
        viewer.isMyPlayer = true;
        client.player = viewer;
        window.gameEngine.gameObjects.mapSize = this.mapSize;
        window.gameEngine.gameObjects.addPlayer(viewer);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConnectAsViewerPacket);

/***/ }),

/***/ "./src/network/packets/direction.js":
/*!******************************************!*\
  !*** ./src/network/packets/direction.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/player.js */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");







class DirectionPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

    constructor(direction, position) {
        super();
        this.dir = direction;
        this.packetId = 1006;
        this.position = position;
    }


    // Handel Server Response
    parsePacket() {
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        writer.writeStringInBytes(this.dir);
        writer.writeIntInBytes(this.position.x, 2);
        writer.writeIntInBytes(this.position.y, 2);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DirectionPacket);

/***/ }),

/***/ "./src/network/packets/fillArea.js":
/*!*****************************************!*\
  !*** ./src/network/packets/fillArea.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet */ "./src/network/packet.js");
/* harmony import */ var _utils_reader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/reader.js */ "./src/network/utils/reader.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_rectangle_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/objects/rectangle.js */ "./src/ui/objects/rectangle.js");
/* harmony import */ var _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/point.js */ "./src/ui/objects/point.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _ui_objects_block__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../ui/objects/block */ "./src/ui/objects/block.js");








class FillAreaPacket extends _packet__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor() {
        super();
        this.packetId = 1003;
        // Shape
        this.rectangle = null;
        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;

        // Colors
        this.colorBrighter = 0;
        this.colorDarker = 0;
        this.colorSlightlyBrighter = 0
        this.colorPattern = 0
        this.colorPatternEdge = 0
        this.playerId = 0;

    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_2__["default"](this.packetId);
        return writer.finalize();
    }

    parsePacket() {
        const reader= this.reader;

        this.x = reader.readInt2();
        this.y = reader.readInt2();
        this.width = reader.readInt2();
        this.height = reader.readInt2();

        this.playerId = reader.readInt4();
        this.colorBrighter = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_5__.convertIntColorToHex)(reader.readInt4());
        this.colorDarker = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_5__.convertIntColorToHex)(reader.readInt4());
        this.colorSlightlyBrighter = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_5__.convertIntColorToHex)(reader.readInt4());
        this.colorPattern = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_5__.convertIntColorToHex)(reader.readInt4());
        this.colorPatternEdge = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_5__.convertIntColorToHex)(reader.readInt4());

        this.rectangle = new _ui_objects_rectangle_js__WEBPACK_IMPORTED_MODULE_3__["default"](new _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_4__["default"](this.x, this.y), new _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_4__["default"](this.x + this.width, this.y + this.height));


    }

    handleReceivedPacket(client) {
        // console.log("Received Fill Area Packet");

        const colorsWithId = {
            brighter: this.colorBrighter,
            darker: this.colorDarker,
            slightlyBrighter: this.colorSlightlyBrighter,
            pattern: this.colorPattern,
            patternEdge: this.colorPatternEdge,
            id: this.playerId
        }
        _ui_objects_block__WEBPACK_IMPORTED_MODULE_6__["default"].convertRectToBlock(this.rectangle, colorsWithId,window.gameEngine.gameObjects.blocks,
            window.gameEngine.gameObjects.myPlayer
            );

    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FillAreaPacket);

/***/ }),

/***/ "./src/network/packets/killedPlayer.js":
/*!*********************************************!*\
  !*** ./src/network/packets/killedPlayer.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/player.js */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");
/* harmony import */ var _ui_objects_viewer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../ui/objects/viewer */ "./src/ui/objects/viewer.js");








class KilledPlayerPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

    constructor() {
        super();
        this.packetId = 1014;
        this.killedPlayer = null;
        this.killerPlayer = null;

    }


    // Handel Server Response
    parsePacket() {

        const reader = this.reader;
        const killerId = reader.readInt4();
        const killerName = reader.readString();
        const killedId = reader.readInt4();
        const killedName = reader.readString();
        const myPlayer = client.player;
        const killHimSelf = myPlayer.id === killerId;
        this.killerPlayer = {
            id: killerId,
            name: killHimSelf ? "Your Self" : killerName
        }
        this.killedPlayer = {
            id: killedId,
            name: killedName
        }
    }

    finalize() {
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        // Now Current Player Is Killed
        const myPlayer = client.player;



        myPlayer.isReady = false;
        window.killMessageOverlay.showMessage(
            this.killerPlayer,
            myPlayer.requestRespawn
        )
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (KilledPlayerPacket);

/***/ }),

/***/ "./src/network/packets/namePacket.js":
/*!*******************************************!*\
  !*** ./src/network/packets/namePacket.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_reader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/reader.js */ "./src/network/utils/reader.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _client_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../client.js */ "./src/network/client.js");
/* harmony import */ var _ready__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ready */ "./src/network/packets/ready.js");
/* harmony import */ var _ui_objects_player__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../ui/objects/player */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");








class NamePacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

    constructor(name) {
        super();
        this.name = name;
        this.packetId = 1001;
        this.isVerified = false;
        this.userId = 0;
    }


    // Handel Server Response
    parsePacket() {
        const nameLength = this.reader.readInt2();
        this.name = this.reader.readStringFromBytes(nameLength);
        this.userId = this.reader.readInt4();
        this.isVerified = this.reader.readInt1() === 1;

    }

    finalize() {
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_2__["default"](this.packetId);
        writer.writeStringInBytes(this.name);
        writer.writeIntInBytes(this.isVerified ? 1 : 0, 1)
        return writer.finalize();
    }


    handleReceivedPacket(client) {

        if (this.isVerified) {

            const player = new _ui_objects_player__WEBPACK_IMPORTED_MODULE_5__["default"](new _ui_objects_point__WEBPACK_IMPORTED_MODULE_6__["default"](0,0), this.userId);
            player.isMyPlayer = true;

            client.player = player;
            client.isVerified = this.isVerified;
            client.username = this.name;
            client.playerStatus = _client_js__WEBPACK_IMPORTED_MODULE_3__.PlayerStatus.READY;
            window.gameEngine.gameObjects.addPlayer(player);
            window.myPlayer = player;

            client.send(new _ready__WEBPACK_IMPORTED_MODULE_4__["default"]());
        }else
        {
            //TODO Handle Not Verified Name
        }

    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (NamePacket);

/***/ }),

/***/ "./src/network/packets/packets.js":
/*!****************************************!*\
  !*** ./src/network/packets/packets.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _namePacket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./namePacket */ "./src/network/packets/namePacket.js");
/* harmony import */ var _ready__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ready */ "./src/network/packets/ready.js");
/* harmony import */ var _fillArea__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fillArea */ "./src/network/packets/fillArea.js");
/* harmony import */ var _playerState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./playerState */ "./src/network/packets/playerState.js");
/* harmony import */ var _waitingBlocks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./waitingBlocks */ "./src/network/packets/waitingBlocks.js");
/* harmony import */ var _direction__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./direction */ "./src/network/packets/direction.js");
/* harmony import */ var _ping__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ping */ "./src/network/packets/ping.js");
/* harmony import */ var _pong__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./pong */ "./src/network/packets/pong.js");
/* harmony import */ var _requestWaitingBlocks__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./requestWaitingBlocks */ "./src/network/packets/requestWaitingBlocks.js");
/* harmony import */ var _playerRemoved__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./playerRemoved */ "./src/network/packets/playerRemoved.js");
/* harmony import */ var _stopDrawingWaitingBlocks__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./stopDrawingWaitingBlocks */ "./src/network/packets/stopDrawingWaitingBlocks.js");
/* harmony import */ var _connectAsViewerPacket__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./connectAsViewerPacket */ "./src/network/packets/connectAsViewerPacket.js");
/* harmony import */ var _updateLeaderBoard__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./updateLeaderBoard */ "./src/network/packets/updateLeaderBoard.js");
/* harmony import */ var _killedPlayer__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./killedPlayer */ "./src/network/packets/killedPlayer.js");
/* harmony import */ var _respawn__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./respawn */ "./src/network/packets/respawn.js");
















const PacketsDictionary = {
    1001: _namePacket__WEBPACK_IMPORTED_MODULE_0__["default"],
    1004: _playerState__WEBPACK_IMPORTED_MODULE_3__["default"],
    1002: _ready__WEBPACK_IMPORTED_MODULE_1__["default"],
    1003: _fillArea__WEBPACK_IMPORTED_MODULE_2__["default"],
    1005: _waitingBlocks__WEBPACK_IMPORTED_MODULE_4__["default"],
    1006: _direction__WEBPACK_IMPORTED_MODULE_5__["default"],
    1007: _ping__WEBPACK_IMPORTED_MODULE_6__["default"],
    1008: _pong__WEBPACK_IMPORTED_MODULE_7__["default"],
    1009: _requestWaitingBlocks__WEBPACK_IMPORTED_MODULE_8__["default"],
    1010: _playerRemoved__WEBPACK_IMPORTED_MODULE_9__["default"],
    1011: _stopDrawingWaitingBlocks__WEBPACK_IMPORTED_MODULE_10__["default"],
    1012: _connectAsViewerPacket__WEBPACK_IMPORTED_MODULE_11__["default"],
    1013: _updateLeaderBoard__WEBPACK_IMPORTED_MODULE_12__["default"],
    1014: _killedPlayer__WEBPACK_IMPORTED_MODULE_13__["default"],
    1015: _respawn__WEBPACK_IMPORTED_MODULE_14__["default"], // We Be Receive As Ready Packet
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PacketsDictionary);

/***/ }),

/***/ "./src/network/packets/ping.js":
/*!*************************************!*\
  !*** ./src/network/packets/ping.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/player.js */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");







class PingPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

    constructor() {
        super();
        this.packetId = 1007;
    }


    // Handel Server Response
    parsePacket() {

    }

    finalize() {
        // Handle Server Request
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PingPacket);

/***/ }),

/***/ "./src/network/packets/playerRemoved.js":
/*!**********************************************!*\
  !*** ./src/network/packets/playerRemoved.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/player.js */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");







class PlayerRemovedPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

    constructor() {
        super();
        this.userId = null;
        this.packetId = 1010;
        this.player = null;

    }


    // Handel Server Response
    parsePacket() {
        this.userId = this.reader.readInt4();
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        const player = window.gameEngine.gameObjects.players[this.userId];
        if(player)
            window.gameEngine.gameObjects.removePlayer(player);

    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PlayerRemovedPacket);

/***/ }),

/***/ "./src/network/packets/playerState.js":
/*!********************************************!*\
  !*** ./src/network/packets/playerState.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/player.js */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");







class PlayerStatePacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

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
        this.colorBrighter = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_3__.convertIntColorToHex)(reader.readInt4());
        this.colorDarker = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_3__.convertIntColorToHex)(reader.readInt4());
        this.colorSlightlyBrighter = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_3__.convertIntColorToHex)(reader.readInt4());
        this.colorPattern = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_3__.convertIntColorToHex)(reader.readInt4());
        this.colorPatternEdge = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_3__.convertIntColorToHex)(reader.readInt4());


    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {

        const myPlayer = client.player;

        let player = new _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__["default"](new _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__["default"](0, 0), this.userId);
        player = window.gameEngine.gameObjects.addPlayer(player);

        player.name = this.playerName;
        player.colorBrighter = this.colorBrighter;
        player.colorDarker = this.colorDarker;
        player.colorSlightlyBrighter = this.colorSlightlyBrighter;
        player.colorPattern = this.colorPattern;
        player.colorPatternEdge = this.colorPatternEdge;




        // When Receiving Player State
        // Next Frame Move Relative To Server Pos
        player.hasReceivedPosition = true;
        player.moveRelativeToServerPosNextFrame = true;
        player.lastServerPosSentTime = Date.now();

        // current player consider that his last position has been confirmed
        myPlayer.lastPosHasBeenConfirmed = true;


        let offset = player.calMoveOffset();
        let newPos = new _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__["default"](this.playerX, this.playerY);
        let newPosOffset = newPos.clone();
        let newDir = this.direction;

        newPosOffset = _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__["default"].movePlayer(newPosOffset, newDir, offset);
        let clientServerNeedsSync = true;



        if (player.isMyPlayer) {


            player.lastPosServerSentTime = Date.now();

            // Check If Server Synced With Client
            // To Draw This Movement or Ignore It
            // if server predict the same movement
            // or the movement is to close to server
            clientServerNeedsSync = player.checkClientMovementSyncedWithServer(newDir
                , newPosOffset, newPos);

            if (clientServerNeedsSync) {
                /***
                 Here We Found That Server and Client not Synced
                 So We Need To Sync Them
                 1- Change Player Direction
                 2- Change Player Position
                 3- Request Waiting Blocks From Server
                 4- Clear Send Dir Queue
                 */
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

        if (clientServerNeedsSync) {
            player.position = newPosOffset.clone();
            player.addWaitingBlocks(newPos);
        }

        //Start To Handel Draw Position
        if (!player.drawPosSet) {
            // if we don't draw this player before set draw position
            player.drawPosSet = true;
            player.drawPosition = player.position.clone();
        }


    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PlayerStatePacket);

/***/ }),

/***/ "./src/network/packets/pong.js":
/*!*************************************!*\
  !*** ./src/network/packets/pong.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/player.js */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");
/* harmony import */ var _utils_math__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/math */ "./src/utils/math.js");







class PongPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

    constructor() {
        super();
        this.packetId = 1008;
    }


    // Handel Server Response
     parsePacket() {

    }

    finalize() {
        // Handle Server Request
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        const myPlayer = client.player;
        const ping = Date.now() - myPlayer.lastPingTime;
        const currentPingDiff = Math.abs(ping - myPlayer.severLastPing);
        myPlayer.serverPingDiff = Math.max(myPlayer.serverPingDiff, currentPingDiff);
        myPlayer.serverPingDiff = _utils_math__WEBPACK_IMPORTED_MODULE_5__.linearInterpolate(currentPingDiff, myPlayer.serverPingDiff, 0.5);
        myPlayer.serverAvgPing = _utils_math__WEBPACK_IMPORTED_MODULE_5__.linearInterpolate(myPlayer.serverAvgPing, ping, 0.5);
        myPlayer.severLastPing = ping;
        myPlayer.lastPingTime = Date.now();
        myPlayer.waitingForPing = false;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PongPacket);

/***/ }),

/***/ "./src/network/packets/ready.js":
/*!**************************************!*\
  !*** ./src/network/packets/ready.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/player.js */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");







class Ready extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

    constructor(userId, mapSize) {
        super();
        this.userId = userId;
        this.packetId = 1002;
        this.mapSize = mapSize;
        this.playerName = "";
        this.playerX = 0;
        this.playerY = 0;
        this.direction = 0;


        // Colors
        this.colorBrighter = 0;
        this.colorDarker = 0;
        this.colorSlightlyBrighter = 0
        this.colorPattern = 0
        this.colorPatternEdge = 0
    }


    // Handel Server Response

    parsePacket() {
        const reader = this.reader;

        this.userId = reader.readInt4();
        this.mapSize = reader.readInt2();
        this.playerName = reader.readString();

        this.playerX = reader.readInt2();
        this.playerY = reader.readInt2();
        this.direction = reader.readString();


        // Colors
        this.colorBrighter = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_3__.convertIntColorToHex)(reader.readInt4());
        this.colorDarker = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_3__.convertIntColorToHex)(reader.readInt4());
        this.colorSlightlyBrighter = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_3__.convertIntColorToHex)(reader.readInt4());
        this.colorPattern = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_3__.convertIntColorToHex)(reader.readInt4());
        this.colorPatternEdge = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_3__.convertIntColorToHex)(reader.readInt4());
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        console.log("Received Ready Packet");
        const player = client.player;

        player.name = this.playerName;
        player.colorBrighter = this.colorBrighter;
        player.colorDarker = this.colorDarker;
        player.colorSlightlyBrighter = this.colorSlightlyBrighter;
        player.colorPattern = this.colorPattern;
        player.colorPatternEdge = this.colorPatternEdge;
        window.gameEngine.gameObjects.mapSize = this.mapSize;
        player.isReady = true;


    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Ready);

/***/ }),

/***/ "./src/network/packets/requestWaitingBlocks.js":
/*!*****************************************************!*\
  !*** ./src/network/packets/requestWaitingBlocks.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");



class RequestWaitingBlockPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

    constructor() {
        super();
        this.packetId = 1009;


    }

    // Handel Server Response
     parsePacket() {
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        return writer.finalize();
    }

    handleReceivedPacket(client) {

    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RequestWaitingBlockPacket);

/***/ }),

/***/ "./src/network/packets/respawn.js":
/*!****************************************!*\
  !*** ./src/network/packets/respawn.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/player.js */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");






class RespawnPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

    constructor() {
        super();
        this.packetId = 1015;

    }


    // Handel Server Response
    parsePacket() {
        const reader = this.reader;
        this.playerX = reader.readInt2();
        this.playerY = reader.readInt2();
        this.direction = reader.readString();
        this.userId = reader.readInt4();

    }

    finalize() {
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        client.player = new _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__["default"](new _ui_objects_point__WEBPACK_IMPORTED_MODULE_3__["default"](0, 0), this.userId);
        client.player.isMyPlayer = true;
        client.player.isReady = true;
        window.gameEngine.gameObjects.addPlayer(client.player);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RespawnPacket);

/***/ }),

/***/ "./src/network/packets/stopDrawingWaitingBlocks.js":
/*!*********************************************************!*\
  !*** ./src/network/packets/stopDrawingWaitingBlocks.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");





class StopDrawingWaitingBlocksPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

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
        const vec = new _ui_objects_point__WEBPACK_IMPORTED_MODULE_2__["default"](this.reader.readInt2(), this.reader.readInt2());
        this.lastBlock = vec;

    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (StopDrawingWaitingBlocksPacket);

/***/ }),

/***/ "./src/network/packets/updateLeaderBoard.js":
/*!**************************************************!*\
  !*** ./src/network/packets/updateLeaderBoard.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");
/* harmony import */ var _ui_objects_viewer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/objects/viewer */ "./src/ui/objects/viewer.js");
/* harmony import */ var _ui_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/utils */ "./src/ui/utils.js");







class UpdateLeaderBoardPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

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
            const playerColor = (0,_ui_utils__WEBPACK_IMPORTED_MODULE_4__.convertIntColorToHex)(reader.readInt4());
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
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
        return writer.finalize();
    }


    handleReceivedPacket(client) {
        window.leaderboard.updateLeaderboard(this.players);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UpdateLeaderBoardPacket);

/***/ }),

/***/ "./src/network/packets/waitingBlocks.js":
/*!**********************************************!*\
  !*** ./src/network/packets/waitingBlocks.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ "./src/network/packet.js");
/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/writer.js */ "./src/network/utils/writer.js");
/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/objects/player.js */ "./src/ui/objects/player.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/point */ "./src/ui/objects/point.js");







class WaitingBlocksPacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__["default"] {

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
            const vec = new _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__["default"](reader.readInt2(), reader.readInt2());
            this.blocks.push(vec);
        }
    }

    finalize() {
        // Handle Server Request
        // Send Empty Packet As Ask For Ready
        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WaitingBlocksPacket);

/***/ }),

/***/ "./src/network/socket.js":
/*!*******************************!*\
  !*** ./src/network/socket.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Socket);

/***/ }),

/***/ "./src/network/utils/bytes-utils.js":
/*!******************************************!*\
  !*** ./src/network/utils/bytes-utils.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bytesToInt: () => (/* binding */ bytesToInt),
/* harmony export */   intToBytes: () => (/* binding */ intToBytes),
/* harmony export */   toHexString: () => (/* binding */ toHexString)
/* harmony export */ });
const intToBytes = (value, byteorder = 'little', signed = false, numBytes = 4) => {
    const littleEndian = (byteorder === 'little');
    const bytes = new Uint8Array(numBytes);
    const view = new DataView(bytes.buffer);

    if (signed && value < 0) {
        // Convert negative value to 2's complement representation
        value = (1 << (8 * numBytes)) + value;
    }

    for (let i = 0; i < numBytes; i++) {
        const shift = littleEndian ? i * 8 : (numBytes - 1 - i) * 8;
        view.setUint8(i, (value >> shift) & 0xFF);
    }

    return bytes;
}
const bytesToInt = (bytes, byteorder = 'little', signed = false) => {
    const view = new DataView(bytes.buffer);
    const littleEndian = (byteorder === 'little');

    if (bytes.length <= 0 || bytes.length > 8) {
        throw new Error('Unsupported number of bytes');
    }
    let value = 0;

    for (let i = 0; i < bytes.length; i++) {
        const shift = littleEndian ? i * 8 : (bytes.length - 1 - i) * 8;
        value |= view.getUint8(i) << shift;
    }
    if (signed) {
        const signBit = 1 << (8 * bytes.length - 1);
        if (value & signBit) {
            value = value - (signBit << 1);
        }
    }
    return value;
}


const toHexString = (data) => {
    return Array.from(data)
        .map(byte => '0x' + byte.toString(16).padStart(2, '0'))
        .join(' ');
}



/***/ }),

/***/ "./src/network/utils/reader.js":
/*!*************************************!*\
  !*** ./src/network/utils/reader.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _bytes_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bytes-utils.js */ "./src/network/utils/bytes-utils.js");



class Reader {
    constructor(data) {
        this.data = data;
        this.position = 0;
    }

    readIntFromBytes(bytesNumber = 2) {
        const bytes = this.data.slice(this.position, this.position + bytesNumber);
        this.position += bytesNumber;
        return (0,_bytes_utils_js__WEBPACK_IMPORTED_MODULE_0__.bytesToInt)(bytes, 'little', false);
    }

    readStringFromBytes(stringLength) {
        const bytes = this.data.slice(this.position, this.position + stringLength);
        this.position += stringLength;
        return new TextDecoder().decode(bytes);
    }

    readFloatFromBytes(bytesNumber = 4) {
        const bytes = this.data.slice(this.position, this.position + bytesNumber);
        this.position += bytesNumber;
        const buffer = new ArrayBuffer(bytesNumber);
        new Uint8Array(buffer).set(bytes);
        const view = new DataView(buffer);
        if (bytesNumber === 4) {
            return view.getFloat32(0, true);
        }
        if (bytesNumber === 8) {
            return view.getFloat64(0, true);
        }
        throw new Error('Unsupported number of bytes for float');
    }

    readString() {
        const stringLength = this.readInt2();
        return this.readStringFromBytes(stringLength);
    }


    readInt1() {
        return this.readIntFromBytes(1);
    }
    readInt4() {
        return this.readIntFromBytes(4);
    }
    readInt2() {
        return this.readIntFromBytes(2);
    }
    readInt8() {
        return this.readIntFromBytes(8);
    }
    readInt16() {
        return this.readIntFromBytes(16);
    }
    readInt32() {
        return this.readIntFromBytes(32);
    }


    toHexString()
    {
        return (0,_bytes_utils_js__WEBPACK_IMPORTED_MODULE_0__.toHexString)(this.data);
    }

}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Reader);

/***/ }),

/***/ "./src/network/utils/writer.js":
/*!*************************************!*\
  !*** ./src/network/utils/writer.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _bytes_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bytes-utils.js */ "./src/network/utils/bytes-utils.js");


class Writer {
    // Infinity
    constructor(packetId = -1) {
        this.packetSize = 20;
        this.packetId = packetId;

        this.data = new Uint8Array(this.packetSize);
        this.position = 0;
        this.setPacketId();
    }

    setPacketId() {
        this.position = 2;
        this.writeIntInBytes(this.packetId);
        this.updatePacketSize()

    }

    updatePacketSize() {
        this.packetSize = this.position;
        const currentOffset = this.position;
        this.position = 0;
        const b = (0,_bytes_utils_js__WEBPACK_IMPORTED_MODULE_0__.intToBytes)(this.packetSize, 'little', false, 2);
        this.data.set(b, this.position);
        this.position = currentOffset;
    }

    writeIntInBytes(number, bytesNumber = 2) {
        let bytes = (0,_bytes_utils_js__WEBPACK_IMPORTED_MODULE_0__.intToBytes)(number, 'little', false, bytesNumber);
        this.ensureCapacity(bytesNumber);
        this.data.set(bytes, this.position);
        this.position += bytesNumber;
        this.updatePacketSize();
    }


    writeStringInBytes(string) {
        let stringLength = string.length;
        this.writeIntInBytes(stringLength, 2);
        let bytes = new TextEncoder().encode(string);
        this.ensureCapacity(stringLength);
        this.data.set(bytes, this.position);
        this.position += stringLength;
        this.updatePacketSize();
    }

    ensureCapacity(requiredSize) {

        if (this.position + requiredSize > this.data.length) {
            const newSize = requiredSize + (this.data.length) * 2;
            const newData = new Uint8Array(newSize);
            newData.set(this.data);
            this.data = newData;
        }

    }

    finalize() {
        return this.data.slice(0, this.position);
    }

    toHexString() {
        return (0,_bytes_utils_js__WEBPACK_IMPORTED_MODULE_0__.toHexString)(this.finalize());
    }


}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Writer);

/***/ }),

/***/ "./src/services/game-initializer.js":
/*!******************************************!*\
  !*** ./src/services/game-initializer.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ GameInitializer)
/* harmony export */ });
/* harmony import */ var _ui_objects_camera_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ui/objects/camera.js */ "./src/ui/objects/camera.js");
/* harmony import */ var _game_engine_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../game-engine.js */ "./src/game-engine.js");
/* harmony import */ var _ui_objects_timer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ui/objects/timer.js */ "./src/ui/objects/timer.js");
/* harmony import */ var _ui_objects_leaderboard_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ui/objects/leaderboard.js */ "./src/ui/objects/leaderboard.js");
/* harmony import */ var _ui_objects_minimap_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../ui/objects/minimap.js */ "./src/ui/objects/minimap.js");
/* harmony import */ var _network_client_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../network/client.js */ "./src/network/client.js");
/* harmony import */ var _network_packets_connectAsViewerPacket_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../network/packets/connectAsViewerPacket.js */ "./src/network/packets/connectAsViewerPacket.js");
/* harmony import */ var _config_game_config_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../config/game-config.js */ "./src/config/game-config.js");
/* harmony import */ var _ui_objects_player_name_input__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../ui/objects/player-name-input */ "./src/ui/objects/player-name-input.js");
/* harmony import */ var _ui_objects_player_widget__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../ui/objects/player-widget */ "./src/ui/objects/player-widget.js");
/* harmony import */ var _ui_objects_decoration_manager__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../ui/objects/decoration-manager */ "./src/ui/objects/decoration-manager.js");
/* harmony import */ var _ui_objects_snow_particles__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../ui/objects/snow-particles */ "./src/ui/objects/snow-particles.js");
/* harmony import */ var _ui_objects_kill_message__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../ui/objects/kill-message */ "./src/ui/objects/kill-message.js");














class GameInitializer {
    constructor(canvas, serverArgs) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.serverArgs = serverArgs;
        this.initializeGameComponents();
    }

    initializeGameComponents() {
        this.camera = new _ui_objects_camera_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
        this.gameEngine = new _game_engine_js__WEBPACK_IMPORTED_MODULE_1__["default"](_config_game_config_js__WEBPACK_IMPORTED_MODULE_7__["default"].GAME_FPS);
        this.gameTimer = new _ui_objects_timer_js__WEBPACK_IMPORTED_MODULE_2__["default"]();
        this.gameLeaderboard = new _ui_objects_leaderboard_js__WEBPACK_IMPORTED_MODULE_3__["default"]();
        this.gameMiniMap = new _ui_objects_minimap_js__WEBPACK_IMPORTED_MODULE_4__["default"]();
        this.decorationManager = new _ui_objects_decoration_manager__WEBPACK_IMPORTED_MODULE_10__["default"]();
        this.snowEffect = new _ui_objects_snow_particles__WEBPACK_IMPORTED_MODULE_11__["default"]({
            particleCount: _config_game_config_js__WEBPACK_IMPORTED_MODULE_7__["default"].SNOW_EFFECT_CONFIG.particleCount,
            camera: this.camera
        });


        // this.gameTimer.start();

        this.killMessageOverlay = new _ui_objects_kill_message__WEBPACK_IMPORTED_MODULE_12__["default"]({
            duration: 5000,
            styles: {
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                textColor: '#FFFFFF',
                subtextColor: '#FFD700'
            }
        });


         this.setupGlobalReferences();
        this.initializeClient();
        this.setupNameInput();

    }

    setupGlobalReferences() {
        window.game.helperCtx = document.createElement('canvas').getContext('2d');
        window.gameEngine = this.gameEngine;
        window.camera = this.camera;
        window.game.canvas = this.canvas;
        window.leaderboard = this.gameLeaderboard;
        window.decorationManager = this.decorationManager;
        window.snowEffect = this.snowEffect;
        window.gameTimer = this.gameTimer;
        window.gameMiniMap = this.gameMiniMap;
        window.killMessageOverlay = this.killMessageOverlay;
    }

    setupNameInput() {
        const { isViewing, playerSubmitName } = this.serverArgs;
        if (isViewing && playerSubmitName === '') {
            this.nameInput = new _ui_objects_player_name_input__WEBPACK_IMPORTED_MODULE_8__["default"](this.onSubmitPlayerName);
        }
    }

    onSubmitPlayerName = (name) => {
        window.location.href = `/?name=${name}`;
    }

    initializeClient() {
        const { isViewing, playerSubmitName } = this.serverArgs;
        
        if (isViewing) {
            this.client = new _network_client_js__WEBPACK_IMPORTED_MODULE_5__.Client(_config_game_config_js__WEBPACK_IMPORTED_MODULE_7__["default"].SERVER_URL, (c) => {
                c.send(new _network_packets_connectAsViewerPacket_js__WEBPACK_IMPORTED_MODULE_6__["default"]());
            });
        } else {
            this.client = new _network_client_js__WEBPACK_IMPORTED_MODULE_5__.Client(_config_game_config_js__WEBPACK_IMPORTED_MODULE_7__["default"].SERVER_URL, (c) => {
                c.setPlayerName(playerSubmitName);
            });
        }
    }

    createDrawFunction() {
        return () => {
            const blocks = this.gameEngine.gameObjects.blocks;
            const players = this.gameEngine.gameObjects.players;
            let myPlayer = this.client?.player;
            let playerWidget;

            if (myPlayer) {
                playerWidget = new _ui_objects_player_widget__WEBPACK_IMPORTED_MODULE_9__["default"](myPlayer);
            }

            if (!this.decorationManager.isInitialized()) {
                this.decorationManager.initialize();
            }

            this.gameEngine.scaleCanvas(this.ctx);
            this.ctx.fillStyle = _config_game_config_js__WEBPACK_IMPORTED_MODULE_7__["default"].BACKGROUND_COLOR;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.camera.loop();
            this.gameEngine.camTransform(this.ctx);
            this.decorationManager.draw(this.ctx, this.camera);

            blocks.forEach(block => block.draw(this.ctx, true));
            Object.values(players).forEach(player => player.draw(this.ctx));

            this.gameLeaderboard.draw(this.ctx);
            this.gameMiniMap.draw(this.ctx, this.gameEngine, myPlayer);





            const { isViewing } = this.serverArgs;
            if (isViewing && this.nameInput?.isEditing) {
                this.nameInput.draw();
            }

            playerWidget?.draw(this.ctx);
            myPlayer?.removeBlocksOutsideCamera();
             // this.snowEffect.draw(this.ctx);
            //this.gameTimer.draw(this.ctx);


            this.killMessageOverlay.draw(this.ctx);
        };
    }

    start() {
        this.gameEngine.setDrawFunction(this.createDrawFunction());
        window.requestAnimationFrame(this.gameEngine.loop.bind(this.gameEngine));
    }
}


/***/ }),

/***/ "./src/ui/animation.js":
/*!*****************************!*\
  !*** ./src/ui/animation.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Animation {
    constructor(startValue, endValue, duration) {
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.progress = 0; // Ranges from 0 to 1
        this.direction = 0; // 0 for idle, 1 for forward, -1 for backward
        this.delay = 0;
    }

    update(deltaTime) {
        // Handle the delay before starting the animation
        if (this.delay > 0) {
            this.delay -= deltaTime;
            return;
        }

        if (this.direction === 0) return; // If idle, do nothing

        this.progress += (deltaTime * this.duration) * this.direction;

        if (this.progress >= 1) {
            this.progress = 1;
            this.direction = 0; // Stop the animation
        } else if (this.progress <= 0) {
            this.progress = 0;
            this.direction = 1; // Stop the animation
        }
    }

    setForward() {
        this.direction = 1;
    }

    setBackward() {
        this.direction = -1;
    }

    isAnimating() {
        return this.direction !== 0 || this.delay > 0;
    }

    getProgress() {
        return this.progress;
    }

    completeAndStop() {
        this.progress = 1;
        this.direction = 0;
    }

    isGoingForward() {
        return this.direction === 1;
    }
    isGoingBackward() {
        return this.direction === -1;
    }

    isIdle() {
        return this.direction === 0;
    }

    isComplete() {
        return this.progress === 1;
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Animation);

/***/ }),

/***/ "./src/ui/objects/alx-banner.js":
/*!**************************************!*\
  !*** ./src/ui/objects/alx-banner.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _decorations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./decorations */ "./src/ui/objects/decorations.js");


class AlxBanner extends _decorations__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static HEIGHT = 50;
    static WIDTH = 200;

    constructor(x, y, options = {}) {
        super(x, y, options);
        this.width = options.width || 200;
        this.height = options.height || AlxBanner.HEIGHT;
        AlxBanner.HEIGHT = this.height;
        this.text = options.text || 'Alx IO!';
        this.backgroundColor = options.backgroundColor || '#C41E3A';
        this.textColor = options.textColor || '#FFFFFF';
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Banner background
        ctx.fillStyle = this.backgroundColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, 0);
        ctx.lineTo(this.width * 1.1, this.height);
        ctx.lineTo(-this.width * 0.1, this.height);
        ctx.closePath();
        ctx.fill();

        // Text
        ctx.fillStyle = this.textColor;
        ctx.font = `${this.height * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.width / 2, this.height * 0.8);

        // Decorative ribbons
        ctx.strokeStyle = this.textColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-this.width * 0.1, this.height);
        ctx.lineTo(-this.width * 0.2, this.height * 1.5);
        ctx.moveTo(this.width * 1.1, this.height);
        ctx.lineTo(this.width * 1.2, this.height * 1.5);
        ctx.stroke();

        ctx.restore();
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AlxBanner);

/***/ }),

/***/ "./src/ui/objects/block.js":
/*!*********************************!*\
  !*** ./src/ui/objects/block.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point.js */ "./src/ui/objects/point.js");
/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/math.js */ "./src/utils/math.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./src/ui/utils.js");
/* harmony import */ var _animation_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../animation.js */ "./src/ui/animation.js");





class Block {
    constructor(p) {
        this.position = p

        this.currentBlock = -1;
        this.nextBlock = -1;
        this.colorsWithId = null;
        this.lastSetTime = Date.now()
        this.animation = new _animation_js__WEBPACK_IMPORTED_MODULE_3__["default"](0, 1, 0.003);
    }


    setBlockId(id, delay) {
        this.lastSetTime = Date.now();

        // If there is no delay for the animation
        if (!delay) {
            this.currentBlock = this.nextBlock = id;
            this.animation.completeAndStop();
        } else {

            // Set the delay
            this.animation.delay = delay;

            let isCurrentBlock = id === this.currentBlock;
            let isNextBlock = id === this.nextBlock;


            if (isCurrentBlock && isNextBlock) {
                // If the current block is the same as the next block
                // Then we don't need to do anything
                if (this.animation.isGoingBackward()) {
                    this.animation.setForward();
                }
            } else if (!isCurrentBlock && !isNextBlock) {
                // if we need to change the block
                // then we need to set the next block to the id
                this.nextBlock = id;
                this.animation.setBackward();
            }

                // this two cases can happen
            // during the animation new block is set
            else if (isCurrentBlock && !isNextBlock) {
                // cancel the animation and set the next block to the id
                this.nextBlock = this.currentBlock;
                this.animation.setForward()
            } else if (!isCurrentBlock && isNextBlock) {
                // reverse the animation to set the current block to the id of next block
                // in handleAnimation we will set the current block to the next block
                if (this.animation.isGoingForward()) this.animation.setBackward()
            }
        }

    }

    static getBlockAt(p, blocks) {
        for (let block of blocks) {
            if (block.position.equals(p)) {
                return block;
            }
        }
        let block = new Block(p);
        blocks.push(block);
        return block;

    }
    static BorderBlockWidth = 10;
    static EmptyBlockWidth = 9;
    static RegularBlockWidth = 9;


    handleAnimation() {
        this.animation.update(window.gameEngine.deltaTime);
        const progress = this.animation.getProgress();
        if (progress <= 0) {
            this.currentBlock = this.nextBlock;
            return false;
        }
        return true;
    }

    calBlockGap(position, size) {
        return new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](position.x * size, position.y * size);
    }


    drawBorderBlock(ctx, color, size) {
        if (this.currentBlock !== 0) return;

        ctx.fillStyle = color;
        // Calculate the new position Base Of the size
        const newP = this.calBlockGap(this.position, size);
        ctx.fillRect(newP.x, newP.y, size, size);
    }

    drawEmptyBlock(ctx, darkColor, brightColor, size) {
        if (this.currentBlock !== 1) return;

        const sizeFactor = 10 / size;
        const newS = size * sizeFactor; // 10
        let animProgress = 0;

        const newP = this.calBlockGap(this.position, newS);
        const spacingTwenty = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.2);
        const spacingTen = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.1); // 1
        const spacingNinty = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.9);

        // Snow-like background with subtle texture
        ctx.fillStyle = brightColor;
        ctx.fillRect(newP.x, newP.y, size, size);

        // Generate random snowflake-like patterns
        this.drawSnowflakeTexture(ctx, newP, size);

        /////////////////////// SHADOW ////////////////////////
        if (this.animation.progress > .8) {
            _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, darkColor, spacingTwenty);
        }

        if (this.animation.progress < .4) {
            animProgress = this.animation.progress * 2.5;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTwenty, newP.y + spacingTwenty);
            ctx.lineTo(newP.x + spacingTwenty, newP.y + spacingNinty);
            ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingNinty);
            ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingTwenty);
            ctx.fill();
        } else if (this.animation.progress < 0.8) {
            animProgress = this.animation.progress * 2.5 - 1;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTwenty, newP.y + spacingTwenty);
            ctx.lineTo(newP.x + spacingNinty, newP.y + spacingTwenty);
            ctx.lineTo(newP.x + spacingNinty, newP.y + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTwenty, spacingNinty, animProgress));
            ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingTwenty);
            ctx.fill();
        } else {

            animProgress = this.animation.progress * 5 - 4;
            _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, brightColor, _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(2, 1, animProgress));
        }
    }

    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    generateBlockSeed() {
        // Use block's grid coordinates to create a unique, consistent seed
        const gridX = Math.floor(this.position.x / 10);
        const gridY = Math.floor(this.position.y / 10);
        
        // Create a unique seed based on grid coordinates
        return gridX * 1000 + gridY;
    }

    drawSnowflakeTexture(ctx, position, size) {
        ctx.save();
        ctx.globalAlpha = 0.3; // Subtle effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;

        // Generate a consistent seed for this block
        const blockSeed = this.generateBlockSeed();
        
        // Number of snowflakes based on block size
        const snowflakeCount = Math.floor(size / 5);

        for (let i = 0; i < snowflakeCount; i++) {
            // Use seeded random to ensure consistent randomness
            const seedOffset = blockSeed + i * 137; // Prime number to reduce pattern repetition
            const pseudoRandom = this.seededRandom(seedOffset);
            
            const x = position.x + pseudoRandom * size;
            const y = position.y + this.seededRandom(seedOffset + 1000) * size;
            const snowflakeSize = this.seededRandom(seedOffset + 2000) * 3;
            
            this.drawSingleSnowflake(ctx, x, y, snowflakeSize);
        }

        ctx.restore();
    }

    drawSingleSnowflake(ctx, x, y, size) {
        ctx.beginPath();
        
        // Create a simple star-like snowflake
        const arms = 6;
        for (let i = 0; i < arms; i++) {
            const angle = (i / arms) * Math.PI * 2;
            const armLength = size;
            
            const startX = x;
            const startY = y;
            
            const endX = x + Math.cos(angle) * armLength;
            const endY = y + Math.sin(angle) * armLength;
            
            // Slight curve to make it more organic
            const controlX = x + Math.cos(angle + Math.PI/4) * (armLength/2);
            const controlY = y + Math.sin(angle + Math.PI/4) * (armLength/2);
            
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        }
        
        ctx.stroke();
    }

    drawRegularBlock(ctx, darkColor, brightColor, size) {


        if (this.currentBlock < 2) return;

        if (this.colorsWithId === null) {
            return;
        }


        let bcolor = this.colorsWithId.pattern;
        let dcolor = this.colorsWithId.patternEdge;


        const sizeFactor = 10 / size;
        const newS = size * sizeFactor; // 10
        let animProgress = 0;

        const newP = this.calBlockGap(this.position, newS);
        const spacingTwenty = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.2);
        const spacingTen = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.1); // 1
        const spacingNinty = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.9);

        if (this.animation.progress > 0.8) {
            ctx.fillStyle = dcolor;
            ctx.fillRect(newP.x + spacingTen, newP.y + spacingTen, size, size);
        }


        ctx.fillStyle = bcolor;
        if (this.animation.progress === 1) {
            _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, bcolor, spacingTen);
        } else if (this.animation.progress < .4) {
            animProgress = this.animation.progress * 2.5;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTen, newP.y + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(newS, spacingTen, animProgress));
            ctx.lineTo(newP.x + spacingTen, newP.y + newS);
            ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTen, newS, animProgress), newP.y + newS);
            ctx.fill();
        } else if (this.animation.progress < 0.8) {
            animProgress = this.animation.progress * 2.5 - 1;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTen, newP.y + spacingTen);
            ctx.lineTo(newP.x + spacingTen, newP.y + newS);
            ctx.lineTo(newP.x + newS, newP.y + newS);
            ctx.lineTo(newP.x + newS, newP.y + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(newS, spacingTen, animProgress));
            ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTen, newS, animProgress), newP.y + spacingTen);
            ctx.fill();
        } else {

            animProgress = this.animation.progress * 5 - 4;
            _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, bcolor, _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(1, 0, animProgress));
        }

    }

    drawSnowBlock(ctx, baseColor, size) {
        // Debug logging to understand block state
        console.log('Snow Block Drawing:', {
            currentBlock: this.currentBlock,
            position: this.position,
            size: size
        });

        // Modify condition to draw snow blocks more flexibly
        if (this.currentBlock < 3 || this.currentBlock > 3) {
            return;
        }

        const newP = this.calBlockGap(this.position, size);
        
        // Vibrant snow block background with gradient
        const gradient = ctx.createLinearGradient(
            newP.x, newP.y, 
            newP.x, newP.y + size
        );
        gradient.addColorStop(0, '#f0f8ff');     // Light blue-white
        gradient.addColorStop(0.5, '#ffffff');   // Pure white
        gradient.addColorStop(1, '#f0f8ff');     // Light blue-white

        ctx.fillStyle = gradient;
        ctx.fillRect(newP.x, newP.y, size, size);

        // More prominent snow texture
        this.drawSnowTexture(ctx, newP, size);

        // Add depth and shadow
        ctx.shadowColor = 'rgba(200, 200, 220, 0.3)';
        ctx.shadowBlur = 3;
        ctx.strokeStyle = 'rgba(200, 200, 220, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(newP.x, newP.y, size, size);
        ctx.shadowBlur = 0;
    }

    drawSnowTexture(ctx, position, size) {
        ctx.save();
        ctx.globalAlpha = 0.6;  // Increased visibility
        ctx.strokeStyle = 'rgba(220, 230, 255, 0.8)';
        ctx.lineWidth = 1.5;

        const blockSeed = this.generateBlockSeed();
        const snowflakeCount = Math.floor(size / 3);  // More snowflakes

        for (let i = 0; i < snowflakeCount; i++) {
            const seedOffset = blockSeed + i * 137;
            const pseudoRandom = this.seededRandom(seedOffset);
            
            const x = position.x + pseudoRandom * size;
            const y = position.y + this.seededRandom(seedOffset + 1000) * size;
            const snowflakeSize = this.seededRandom(seedOffset + 2000) * 3;
            
            this.drawDetailedSnowflake(ctx, x, y, snowflakeSize);
        }

        ctx.restore();
    }

    drawDetailedSnowflake(ctx, x, y, size) {
        ctx.beginPath();
        
        // More pronounced snowflake pattern
        const arms = 6;
        for (let i = 0; i < arms; i++) {
            const angle = (i / arms) * Math.PI * 2;
            
            // Main arm with more detail
            const mainArmLength = size;
            const mainEndX = x + Math.cos(angle) * mainArmLength;
            const mainEndY = y + Math.sin(angle) * mainArmLength;
            
            ctx.moveTo(x, y);
            ctx.lineTo(mainEndX, mainEndY);
            
            // Longer side branches
            const branchAngle = Math.PI / 4; // 45-degree branches
            const branchLength = size * 0.7;
            
            // Left branch
            const leftBranchEndX = mainEndX + Math.cos(angle - branchAngle) * branchLength;
            const leftBranchEndY = mainEndY + Math.sin(angle - branchAngle) * branchLength;
            ctx.moveTo(mainEndX, mainEndY);
            ctx.lineTo(leftBranchEndX, leftBranchEndY);
            
            // Right branch
            const rightBranchEndX = mainEndX + Math.cos(angle + branchAngle) * branchLength;
            const rightBranchEndY = mainEndY + Math.sin(angle + branchAngle) * branchLength;
            ctx.moveTo(mainEndX, mainEndY);
            ctx.lineTo(rightBranchEndX, rightBranchEndY);
        }
        
        ctx.stroke();
    }

    draw(ctx, checkViewport) {
        // Viewport check
        if (checkViewport && !window.camera.checkObjectInCamera(this.position)) {
            return false;
        }

        let canDraw = this.handleAnimation();
        if (!canDraw) {
            return true;
        }

        // Draw different block types
        this.drawBorderBlock(ctx, "#420707", Block.BorderBlockWidth);
        this.drawEmptyBlock(ctx, "#2d2926", "#e6f3ff", Block.EmptyBlockWidth);
        this.drawRegularBlock(ctx, "#2d2926", "#e6f3ff", Block.RegularBlockWidth);
        return true;
    }



    static convertRectToBlock(rect, colorsWithId, listOfBlocks, myPlayer) {
        const viewPortRadius = window.game.viewPortRadius;

        if (myPlayer) {
            rect.min.x = Math.max(rect.min.x, Math.round(myPlayer.position.x - viewPortRadius));
            rect.min.y = Math.max(rect.min.y, Math.round(myPlayer.position.y - viewPortRadius));

            rect.max.x = Math.min(rect.max.x, Math.round(myPlayer.position.x + viewPortRadius));
            rect.max.y = Math.min(rect.max.y, Math.round(myPlayer.position.y + viewPortRadius));
        }

        for (let {x, y} of rect.for_each()) {
            let block = Block.getBlockAt(new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](x, y), listOfBlocks);
            block.colorsWithId = colorsWithId;
            block.setBlockId(colorsWithId.id, Math.random() * 400);
        }

    }

}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Block);

/***/ }),

/***/ "./src/ui/objects/camera.js":
/*!**********************************!*\
  !*** ./src/ui/objects/camera.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point.js */ "./src/ui/objects/point.js");
/* harmony import */ var _rectangle_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rectangle.js */ "./src/ui/objects/rectangle.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./src/ui/utils.js");
/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/math.js */ "./src/utils/math.js");





class Camera {
    constructor() {
        this.zoom = 5;
        this.camPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
        this.camRotationOffset = 0;
        this.camPositionOffset = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
        this.camPrevPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);

        this.camPosSet = false;

        this.camShakeBuffer = [];


    }


    checkObjectInCamera(point) {
         const bounds = {
            minX: this.camPosition.x - (window.game.viewPortRadius*.9),
            maxX: this.camPosition.x + (window.game.viewPortRadius*.9),
            minY: this.camPosition.y - (window.game.viewPortRadius*.9),
            maxY: this.camPosition.y + (window.game.viewPortRadius*.9),
        }
       return point.x > bounds.minX &&
               point.x < bounds.maxX &&
              point.y > bounds.minY &&
            point.y < bounds.maxY;
    }

    checkNotScaledObjectInCamera(t,scale) {
        const point = t.divide(scale);
        const bounds = {
            minX: this.camPosition.x - window.game.viewPortRadius,
            maxX: this.camPosition.x + window.game.viewPortRadius,
            minY: this.camPosition.y - window.game.viewPortRadius,
            maxY: this.camPosition.y + window.game.viewPortRadius
        }
       return point.x > bounds.minX &&
               point.x < bounds.maxX &&
              point.y > bounds.minY &&
            point.y < bounds.maxY;
    }


    shakeCamera(p, rotate = true) {
        this.camShakeBuffer.push([
            p, 0, !!rotate
        ]);
    }

    shakeCameraDirection(dir, amount = 6, rotate = true) {
        let x, y = 0;
        switch (dir) {
            case 0:
                x = amount;
                break;
            case 1:
                y = amount;
                break;
            case 2:
                x = -amount;
                break;
            case 3:
                y = -amount;
                break;
        }
        this.shakeCamera(new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](x, y), rotate);
    }

    calCameraOffset() {
        for (let i = this.camShakeBuffer.length - 1; i >= 0; i--) {
            let shake = this.camShakeBuffer[i];
            shake[1] = window.gameEngine.deltaTime * 0.003;
            let shakeTime = shake[1];
            let shakeTime2 = 0;
            let shakeTime3 = 0;
            if (shakeTime < 1) {
                shakeTime2 = _utils_js__WEBPACK_IMPORTED_MODULE_2__.ease.out(shakeTime);
                shakeTime3 = _utils_js__WEBPACK_IMPORTED_MODULE_2__.ease.inout(shakeTime);

            } else if (shakeTime < 8) {
                shakeTime2 = _utils_js__WEBPACK_IMPORTED_MODULE_2__.ease.inout(_utils_math_js__WEBPACK_IMPORTED_MODULE_3__.inverseLinearInterpolate(8, 1, shakeTime));
                shakeTime3 = _utils_js__WEBPACK_IMPORTED_MODULE_2__.ease.in(_utils_math_js__WEBPACK_IMPORTED_MODULE_3__.inverseLinearInterpolate(8, 1, shakeTime));
            } else {
                this.camShakeBuffer.splice(i, 1);
            }
            this.camPositionOffset.x += shake[0].x * shakeTime2;
            this.camPositionOffset.y += shake[0].y * shakeTime2;

            this.camPositionOffset.x += shake[0] * Math.cos(shakeTime * 8) * 0.04 * shakeTime3;
            this.camPositionOffset.y += shake[0] * Math.cos(shakeTime * 7) * 0.04 * shakeTime3;
            if (shake[2]) {
                this.camRotationOffset += Math.cos(shakeTime * 9) * 0.003 * shakeTime3;
            }
            console.log(this.camShakeBuffer.length);
        }

        let limit = 80;
        let x = this.camPositionOffset.x;
        let y = this.camPositionOffset.y;
        x /= limit;
        y /= limit;
        x = _utils_math_js__WEBPACK_IMPORTED_MODULE_3__.smoothLimit(x);
        y = _utils_math_js__WEBPACK_IMPORTED_MODULE_3__.smoothLimit(y);
        x *= limit;
        y *= limit;
        this.camPositionOffset.x = x;
        this.camPositionOffset.y = y;

    }

    calZoom(ctx) {
        let maxPixelRatio = _utils_js__WEBPACK_IMPORTED_MODULE_2__.calculate_pixel_ratio();
        let quality = 1;
        const canvas = window.game.canvas;


        if (ctx.canvas === canvas || true) {
            const maxDimension = Math.max(canvas.width, canvas.height);
            const zoomEdge = maxDimension / window.game.maxZoom;
            const screenPixels = canvas.width * canvas.height;
            const blockPixels = screenPixels / window.game.maxBlocksNumber;
            const zoomBlocks = Math.sqrt(blockPixels) / 10;
            this.zoom = Math.max(zoomEdge, zoomBlocks);
            ctx.translate(window.game.canvas.width / 2, window.game.canvas.height / 2);

            ctx.rotate(this.camRotationOffset);
            ctx.scale(this.zoom, this.zoom);
            ctx.translate(-this.camPrevPosition.x * 10 - this.camPositionOffset.x, -this.camPrevPosition.y * 10 - this.camPositionOffset.y);

        } else {}
    }


    moveToPlayer(player) {
        if (!player) return;
        if (this.camPosSet) {
            this.camPosition.x = _utils_math_js__WEBPACK_IMPORTED_MODULE_3__.linearInterpolate(this.camPosition.x, player.position.x, 0.03);
            this.camPosition.y = _utils_math_js__WEBPACK_IMPORTED_MODULE_3__.linearInterpolate(this.camPosition.y, player.position.y, 0.03);

        } else {
            this.camPosition = player.position.clone();
            this.camPosSet = true;
        }
    }

    moveToAbsolutePosition(pos) {
        this.camPosition = pos;
    }


    loop() {
        this.camPrevPosition = this.camPosition;
        this.calCameraOffset();
    }


    getViewPortRec(pos){
        const viewPortRadius = window.game.viewPortRadius * 2;
        const leftSide = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](
            pos.x - viewPortRadius,
            pos.y - viewPortRadius
        )
        const rightSide = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](
            pos.x + viewPortRadius,
            pos.y + viewPortRadius
        )
        return new _rectangle_js__WEBPACK_IMPORTED_MODULE_1__["default"](leftSide, rightSide);
    }

}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Camera);

/***/ }),

/***/ "./src/ui/objects/decoration-manager.js":
/*!**********************************************!*\
  !*** ./src/ui/objects/decoration-manager.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _block__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./block */ "./src/ui/objects/block.js");
/* harmony import */ var _tree__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tree */ "./src/ui/objects/tree.js");
/* harmony import */ var _snow_hat__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./snow-hat */ "./src/ui/objects/snow-hat.js");
/* harmony import */ var _snow_man__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./snow-man */ "./src/ui/objects/snow-man.js");
/* harmony import */ var _present_box__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./present-box */ "./src/ui/objects/present-box.js");
/* harmony import */ var _alx_banner__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./alx-banner */ "./src/ui/objects/alx-banner.js");
/* harmony import */ var _lights__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./lights */ "./src/ui/objects/lights.js");








class DecorationManager {
    constructor() {
        this.decorations = [];
    }

    isInitialized() {
        return this.decorations.length > 0;
    }

    draw(ctx, camera) {
        if (!this.isInitialized()) return;
        this.decorations.forEach(decoration => {
           const isDrawn = decoration.drawObject(ctx,camera);
        });
    }


    prepareObjects() {
        this.decorationPositions.forEach(decorationData => {
            const decoration = new decorationData.type(decorationData.x, decorationData.y, {
                scale: decorationData.scale,
                rotation: decorationData.rotation,
                opacity: 0.9,
                size: 40,
                ...decorationData
            });

            this.decorations.push(decoration);
        });
    }


    initialize() {

        const mapSize = window.gameEngine.gameObjects.mapSize;
        if (mapSize === 0) return;


        const boardWidth = mapSize * _block__WEBPACK_IMPORTED_MODULE_0__["default"].BorderBlockWidth;
        const boardHeight = mapSize * _block__WEBPACK_IMPORTED_MODULE_0__["default"].BorderBlockWidth;
        const midWidth = boardWidth / 2;


        this.decorationPositions = [



            {x: -2, y: -4, type: _snow_hat__WEBPACK_IMPORTED_MODULE_2__["default"], scale: 0.4, rotation: -Math.PI / 16},
            {x: boardWidth + 2, y: -4, type: _snow_hat__WEBPACK_IMPORTED_MODULE_2__["default"], scale: 0.4, rotation: Math.PI / 16},
            {x: midWidth - 40, y: -25, type: _alx_banner__WEBPACK_IMPORTED_MODULE_5__["default"], scale: 0.4, rotation: 0},

            {x: 50, y: -20, type: _snow_man__WEBPACK_IMPORTED_MODULE_3__.ShakySnowman, scale: 0.4, rotation: Math.PI / 8},
            {x: boardWidth - 50, y: -20, type: _snow_man__WEBPACK_IMPORTED_MODULE_3__.ShakySnowman, scale: 0.4, rotation: -Math.PI / 8},
            {x: -30, y: boardHeight + 57, type: _snow_man__WEBPACK_IMPORTED_MODULE_3__.ShakySnowman, scale: 0.4, rotation: Math.PI / 8},


            {x: 0, y: 4, type: _lights__WEBPACK_IMPORTED_MODULE_6__["default"], scale: 0.4, rotation: Math.PI / 2},
            {x: 0, y: 84, type: _lights__WEBPACK_IMPORTED_MODULE_6__["default"], scale: 0.4, rotation: Math.PI / 2},
            {x: 0, y: 164, type: _lights__WEBPACK_IMPORTED_MODULE_6__["default"], scale: 0.4, rotation: Math.PI / 2},
            {x: 0, y: 80 * 3 + 4, type: _lights__WEBPACK_IMPORTED_MODULE_6__["default"], scale: 0.4, rotation: Math.PI / 2},
            {x: -5, y: 80, type: _tree__WEBPACK_IMPORTED_MODULE_1__["default"], scale: 1, rotation: -Math.PI / 2},
            {x: -5, y: 160, type: _tree__WEBPACK_IMPORTED_MODULE_1__["default"], scale: 1, rotation: -Math.PI / 2},
            {x: -5, y: 80 * 3, type: _tree__WEBPACK_IMPORTED_MODULE_1__["default"], scale: 1, rotation: -Math.PI / 2},


            {x: boardWidth + 5, y: 80, type: _tree__WEBPACK_IMPORTED_MODULE_1__["default"], scale: 1, rotation: Math.PI / 2},
            {x: boardWidth + 35, y: 80, type: _snow_hat__WEBPACK_IMPORTED_MODULE_2__["default"], scale: .25, rotation: Math.PI - Math.PI / 2},
            {x: boardWidth + 5, y: 160, type: _tree__WEBPACK_IMPORTED_MODULE_1__["default"], scale: 1, rotation: Math.PI / 2},
            {x: boardWidth + 35, y: 160, type: _snow_hat__WEBPACK_IMPORTED_MODULE_2__["default"], scale: .25, rotation: Math.PI - Math.PI / 2},

            {x: boardWidth + 5, y: 240, type: _tree__WEBPACK_IMPORTED_MODULE_1__["default"], scale: 1, rotation: Math.PI / 2},
            {x: boardWidth + 35, y: 240, type: _snow_hat__WEBPACK_IMPORTED_MODULE_2__["default"], scale: .25, rotation: Math.PI - Math.PI / 2},


            // Present boxes
            {x: 20, y: boardHeight + 9, type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#228B22', boxColor: '#FF4500'},
            {x: 20 + 17, y: boardHeight + 9, type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#FFD700', boxColor: '#1E90FF'},
            {x: 20 + (17 * 2), y: boardHeight + 9, type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#32CD32', boxColor: '#FF69B4'},
            {x: 20 + (17 * 3), y: boardHeight + 9, type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#00CED1', boxColor: '#9370DB'},
            {x: 20 + (17 * 4), y: boardHeight + 9, type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#FF4500', boxColor: '#20B2AA'},
            {x: 20 + (17 * 5), y: boardHeight + 9, type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#1E90FF', boxColor: '#FF6347'},
            {x: 20 + (17 * 6), y: boardHeight + 9, type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#FF69B4', boxColor: '#32CD32'},
            {x: 20 + (17 * 7), y: boardHeight + 9, type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#20B2AA', boxColor: '#FFD700'},



            {x: 20 + (17 * 1), y: boardHeight + 9 + (17 * 1), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#9370DB', boxColor: '#00CED1'},
            {x: 20 + (17 * 2), y: boardHeight + 9 + (17 * 1), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#FF6347', boxColor: '#1E90FF'},
            {x: 20 + (17 * 3), y: boardHeight + 9 + (17 * 1), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#20B2AA', boxColor: '#FF69B4'},
            {x: 20 + (17 * 4), y: boardHeight + 9 + (17 * 1), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#FFD700', boxColor: '#32CD32'},
            {x: 20 + (17 * 5), y: boardHeight + 9 + (17 * 1), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#00CED1', boxColor: '#9370DB'},
            {x: 20 + (17 * 6), y: boardHeight + 9 + (17 * 1), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#32CD32', boxColor: '#FF4500'},

            {x: 20 + (17 * 2), y: boardHeight + 9 + (17 * 2), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#1E90FF', boxColor: '#20B2AA'},
            {x: 20 + (17 * 3), y: boardHeight + 9 + (17 * 2), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#FF69B4', boxColor: '#FFD700'},
            {x: 20 + (17 * 4), y: boardHeight + 9 + (17 * 2), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#9370DB', boxColor: '#FF6347'},
            {x: 20 + (17 * 5), y: boardHeight + 9 + (17 * 2), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#32CD32', boxColor: '#00CED1'},

            {x: 20 + (17 * 3), y: boardHeight + 9 + (17 * 3), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#FFD700', boxColor: '#1E90FF'},
            {x: 20 + (17 * 4), y: boardHeight + 9 + (17 * 3), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#20B2AA', boxColor: '#FF69B4'},

            {x: 20 + (17 * 3.5), y: boardHeight + 9 + (17 * 4), type: _present_box__WEBPACK_IMPORTED_MODULE_4__["default"], scale: 0.4, rotation: Math.PI, ribbonColor: '#9370DB', boxColor: '#32CD32'},



            {x: midWidth, y: boardHeight + 15, type: _snow_man__WEBPACK_IMPORTED_MODULE_3__.SnowMan, scale: 0.4, rotation: Math.PI},
            {x: midWidth + 40, y: boardHeight + 12, type: _snow_man__WEBPACK_IMPORTED_MODULE_3__.SnowMan, scale: 0.3, rotation: Math.PI},
            {x: midWidth + 40 + 27, y: boardHeight + 10, type: _snow_man__WEBPACK_IMPORTED_MODULE_3__.SnowMan, scale: 0.2, rotation: Math.PI},
            {x: midWidth + 40 + 27 + 16, y: boardHeight + 8, type: _snow_man__WEBPACK_IMPORTED_MODULE_3__.SnowMan, scale: 0.1, rotation: Math.PI},
            {x: boardWidth + 20, y: boardHeight -40, type: _snow_man__WEBPACK_IMPORTED_MODULE_3__.ShakySnowman, scale: 0.4, rotation: Math.PI/2},

        ]

        this.prepareObjects()
    }


}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DecorationManager);

/***/ }),

/***/ "./src/ui/objects/decorations.js":
/*!***************************************!*\
  !*** ./src/ui/objects/decorations.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _block__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./block */ "./src/ui/objects/block.js");
/* harmony import */ var _point__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./point */ "./src/ui/objects/point.js");
/* harmony import */ var _tree__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tree */ "./src/ui/objects/tree.js");




class Decorations {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.scale = options.scale || 1;
        this.rotation = options.rotation || 0;
        this.opacity = options.opacity || 1;
    }



    drawObject(ctx,camera){
        if(!camera.checkNotScaledObjectInCamera(new _point__WEBPACK_IMPORTED_MODULE_1__["default"](this.x,this.y),_block__WEBPACK_IMPORTED_MODULE_0__["default"].BorderBlockWidth)) return false;
        this.draw(ctx);
        return true;
    }

    draw(ctx) {
        throw new Error('Draw method must be implemented by subclass');
    }


}






/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Decorations);


/***/ }),

/***/ "./src/ui/objects/i-object.js":
/*!************************************!*\
  !*** ./src/ui/objects/i-object.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _point__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point */ "./src/ui/objects/point.js");


class IObject {
    constructor(position, id, name) {
        this.id = id;
        this.name = name;
        this.isReady = false;
        this.isDead = false;


        this.position = position;
        this.serverPosition = new _point__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
        this.serverPos = new _point__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
        this.serverDir = '';


        this.isMyPlayer = false;
        this.lastPosHasBeenConfirmed = false;
    }

    /**
     * This Is Called In PlayerState Message
     * To Remove Blocks Outside Camera
     */
    removeBlocksOutsideCamera() {
        const camera = window.camera;
        const playerRect = camera.getViewPortRec(this.position);
        const blocks = window.gameEngine.gameObjects.blocks;
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (!playerRect.pointInRect(block.position)) {
                blocks.splice(i, 1);
            }
        }
    }
    calMoveOffset() {
        return 0
    }
    checkClientMovementSyncedWithServer(newDir, newPosOffset, newPos) {
        return false
    }


}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (IObject);

/***/ }),

/***/ "./src/ui/objects/kill-message.js":
/*!****************************************!*\
  !*** ./src/ui/objects/kill-message.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class KillMessage {
    constructor(options = {}) {
        this.isActive = false;
        this.message = '';
        this.killer = '';
        this.startTime = 0;
        this.duration = options.duration || 3000; // 3 seconds
        
        this.styles = {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            textColor: '#FF4136',
            subtextColor: '#FFFFFF',
            progressBar: {
                mainColor: '#FF4136',
                edgeColor: 'rgba(255, 255, 255, 0.5)',
                patternColor: 'rgba(255, 255, 255, 0.2)'
            },
            font: {
                main: 'bold 48px Arial',
                sub: '24px Arial'
            }
        };


        this.OnMessageEnd = null;
    }

    showMessage(killerDetails = {},afterMessage=null) {
        this.isActive = true;
        this.startTime = Date.now();
        this.killer = killerDetails.name || 'Unknown Player';
        this.message = `YOU WERE KILLED BY`;
        this.OnMessageEnd=afterMessage;
    }

    update() {
        if (!this.isActive) return;

        const elapsedTime = Date.now() - this.startTime;
        if (elapsedTime > this.duration) {
            this.isActive = false;
            this.OnMessageEnd();
        }
    }

    draw(ctx) {
        if (!this.isActive) return;
        this.update();

        const canvas = ctx.canvas;
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;
        const progress = elapsedTime / this.duration;

        ctx.save();
        ctx.resetTransform();



        // Fade in/out effect
        ctx.globalAlpha = progress < 0.2 ? progress * 5 : 
                          progress > 0.8 ? 1 - ((progress - 0.8) * 5) : 1;


        // Background
        ctx.fillStyle = this.styles.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Main Message
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // First line: "YOU WERE KILLED BY"
        ctx.font = this.styles.font.main;
        ctx.fillStyle = this.styles.textColor;
        ctx.fillText(this.message, canvas.width / 2, canvas.height / 2 - 50);

        // Killer's name
        ctx.font = this.styles.font.sub;
        ctx.fillStyle = this.styles.subtextColor;
        ctx.fillText(this.killer, canvas.width / 2, canvas.height / 2 + 50);

        // Progress Bar with Pattern
        const barHeight = 10;
        const barWidth = canvas.width;
        const remainingProgress = 1 - progress;

        // Background pattern
        ctx.fillStyle = this.styles.progressBar.patternColor;
        ctx.fillRect(0, canvas.height - barHeight, barWidth, barHeight);

        // Main progress bar
        ctx.fillStyle = this.styles.progressBar.mainColor;
        ctx.fillRect(
            0, 
            0,
            barWidth * remainingProgress, 
            barHeight
        );

        // Edge highlight
        ctx.fillStyle = this.styles.progressBar.edgeColor;
        ctx.fillRect(
            0, 
            canvas.height - barHeight, 
            barWidth * remainingProgress, 
            2
        );

        ctx.restore();
    }

    reset() {
        this.isActive = false;
        this.message = '';
        this.killer = '';
        this.startTime = 0;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (KillMessage);


/***/ }),

/***/ "./src/ui/objects/leaderboard.js":
/*!***************************************!*\
  !*** ./src/ui/objects/leaderboard.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Leaderboard {
    constructor() {
        this.players = [];
        this.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.borderColor = 'rgba(255, 255, 255, 0.2)';
        this.titleColor = '#ffffff';
    }

    updateLeaderboard(players) {
        this.players = players;
    }

    removePlayer(name) {
        this.players = this.players.filter(p => p.name !== name);
    }

    clearLeaderboard() {
        this.players = [];
    }

    draw(ctx) {
        if (this.players.length <= 0) return;

        ctx.save();
        ctx.resetTransform();

        // Leaderboard styling
        const width = 300;
        const lineHeight = 40;
        const fontSize = 24;
        const padding = 15;

        // Position
        const leftMargin = 40;
        const topMargin = 40;

        // Background with rounded corners
        ctx.beginPath();
        ctx.roundRect(
            leftMargin, 
            topMargin, 
            width, 
            this.players.length * lineHeight + lineHeight + padding * 2, 
            10
        );
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();
        
        // Border
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Title
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = this.titleColor;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Leaderboard", leftMargin + padding, topMargin + padding);

        // Draw players name and score
        this.players.forEach((player, index) => {
            const yPosition = topMargin + lineHeight * (index + 1.5) + padding;
            
            // Choose color based on player data
            ctx.fillStyle = player.playerColor;
            
            // Draw player name and score
            ctx.font = `${fontSize}px Arial`;
            ctx.fillText(
                `${index + 1}. ${player.name}`, 
                leftMargin + padding, 
                yPosition
            );
            
            // Align score to the right
            ctx.textAlign = "right";
            ctx.fillText(
                `${player.score} %`,
                leftMargin + width - padding, 
                yPosition
            );
            
            // Reset text alignment
            ctx.textAlign = "left";
        });

        ctx.restore();
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Leaderboard);


/***/ }),

/***/ "./src/ui/objects/lights.js":
/*!**********************************!*\
  !*** ./src/ui/objects/lights.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _decorations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./decorations */ "./src/ui/objects/decorations.js");


class Lights extends _decorations__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(x, y, options = {}) {
        super(x, y, options);

        // Configurable properties
        this.length = options.length || 200;
        this.numLights = options.numLights || 15;
        this.lightColors = options.lightColors || [
            '#FF0000',   // Red
            '#00FF00',   // Green
            '#0000FF',   // Blue
            '#FFD700',   // Gold
            '#FF69B4',   // Pink
            '#00FFFF'    // Cyan
        ];

        // Animation properties
        this.animationFrame = 0;
        this.twinkleIntensity = options.twinkleIntensity || 0.5;

        // Light properties
        this.lightRadius = options.lightRadius || 5;
        this.lightSpacing = this.length / (this.numLights - 1);

        // Curve properties
        this.curviness = options.curviness || 0.2; // How much the lights curve
        this.flipVertical = options.flipVertical || false; // Flip curve vertically
        this.flipHorizontal = options.flipHorizontal || false; // Flip curve horizontally
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Adjust scaling for flip
        const verticalFactor = this.flipVertical ? -1 : 1;
        const horizontalFactor = this.flipHorizontal ? -1 : 1;

        // Draw the light string (wire)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100,100,100,0.5)';
        ctx.lineWidth = 2;

        // Increment animation frame for continuous twinkling
        this.animationFrame++;

        for (let i = 0; i < this.numLights; i++) {
            const t = i / (this.numLights - 1);

            // Calculate x and y positions with flipping
            const x = horizontalFactor * (t * this.length +
                Math.sin(t * Math.PI) * this.length * this.curviness);

            const y = verticalFactor * (Math.sin(t * Math.PI) * this.length * this.curviness * 0.5);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw individual lights
        for (let i = 0; i < this.numLights; i++) {
            const t = i / (this.numLights - 1);

            const x = horizontalFactor * (t * this.length +
                Math.sin(t * Math.PI) * this.length * this.curviness);
            const y = verticalFactor * (Math.sin(t * Math.PI) * this.length * this.curviness * 0.5);

            const colorIndex = i % this.lightColors.length;
            const baseColor = this.lightColors[colorIndex];

            // Create twinkling effect
            const twinkleOffset = Math.sin(this.animationFrame * 0.1 + i) * this.twinkleIntensity;
            const opacity = 0.6 + twinkleOffset;

            // Draw light
            ctx.beginPath();
            ctx.fillStyle = this.adjustColorOpacity(baseColor, opacity);
            ctx.arc(x, y, this.lightRadius, 0, Math.PI * 2);
            ctx.fill();

            // Optional: Add a subtle glow
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
                x, y, 0,
                x, y, this.lightRadius * 2
            );
            gradient.addColorStop(0, this.adjustColorOpacity(baseColor, opacity));
            gradient.addColorStop(1, this.adjustColorOpacity(baseColor, 0));

            ctx.fillStyle = gradient;
            ctx.arc(x, y, this.lightRadius * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    adjustColorOpacity(color, opacity) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        return `rgba(${r},${g},${b},${opacity})`;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Lights);

/***/ }),

/***/ "./src/ui/objects/minimap.js":
/*!***********************************!*\
  !*** ./src/ui/objects/minimap.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

class MiniMap {
    constructor(options = {}) {
        this.width = options.width || 250;
        this.height = options.height || 250;
        this.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        this.borderColor = 'rgba(200, 230, 255, 0.5)';

        this.colors = {
            empty: 'rgba(220, 240, 255, 0.3)',
            occupied: 'rgba(100, 150, 200, 0.5)',
            player: 'rgba(0, 100, 255, 0.7)',
            currentPlayer: 'rgba(255, 69, 0, 0.8)'
        };

        // Positioning
        this.leftMargin = options.leftMargin || 40;
        this.bottomMargin = options.bottomMargin || 40;

        this.running = true;
    }

    draw(ctx, gameEngine, currentPlayer) {
        if(this.running === false) return;


        const blocks = gameEngine.gameObjects.blocks;
        ctx.save();
        ctx.resetTransform();

        // Find world boundaries
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        blocks.forEach(block => {
            const blockPos = block.position;
            minX = Math.min(minX, blockPos.x);
            maxX = Math.max(maxX, blockPos.x);
            minY = Math.min(minY, blockPos.y);
            maxY = Math.max(maxY, blockPos.y);
        });

        // Add some padding
        const worldWidth = maxX - minX + 2;
        const worldHeight = maxY - minY + 2;

        // Calculate scaling factors
        const scaleX = this.width / worldWidth;
        const scaleY = this.height / worldHeight;

        // Position of mini-map
        const x = this.leftMargin;
        const y = ctx.canvas.height - this.height - this.bottomMargin;

        // Draw background with frost effect
        ctx.beginPath();
        ctx.roundRect(x, y, this.width, this.height, 10);
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();

        // Draw border with ice-like effect
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw blocks
        blocks.forEach(block => {
            const blockPos = block.position;
            const blockX = x + (blockPos.x - minX) * scaleX;
            const blockY = y + (blockPos.y - minY) * scaleY;
            
            const player = gameEngine.gameObjects.isPlayerIdExist(block.colorsWithId.id);
            let blockColor = this.colors.empty;
            
            if(player){
                blockColor = block.colorsWithId.pattern;
            }
            
            ctx.fillStyle = blockColor;
            ctx.fillRect(blockX, blockY, scaleX, scaleY);
        });

        // Draw players
        const players = gameEngine.gameObjects.players;
        Object.values(players).forEach(player => {
            // Use position from the player object
            const playerPos = player.position;
            
            // Adjust player position relative to world boundaries
            const playerX = x + (playerPos.x - minX) * scaleX;
            const playerY = y + (playerPos.y - minY) * scaleY;
            
            // Determine player color
            ctx.fillStyle = player === currentPlayer 
                ? this.colors.currentPlayer 
                : this.colors.player;
            
            // Draw player as a slightly larger dot
            ctx.beginPath();
            ctx.arc(playerX + scaleX/2, playerY + scaleY/2, scaleX, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MiniMap);


/***/ }),

/***/ "./src/ui/objects/player-name-input.js":
/*!*********************************************!*\
  !*** ./src/ui/objects/player-name-input.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class PlayerNameInput {
    constructor(onSubmitPlayerName) {
        this.playerName = '';
        this.isEditing = true;
        this.maxNameLength = 12;
        this.onNameSubmitted = onSubmitPlayerName;

        // Create a separate canvas for the input
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cursorVisible = true;

        // Append canvas to body
        document.body.appendChild(this.canvas);
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';

        this.lastBlinkTime = performance.now();
        this.cursorBlinkInterval = 500; // Milliseconds

        this.initializeEventListeners();
        this.resizeCanvas();

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    initializeEventListeners() {
        window.addEventListener('keydown', (event) => {
            if (!this.isEditing) return;

            if (event.key === 'Backspace') {
                this.playerName = this.playerName.slice(0, -1);
            } else if (event.key === 'Enter') {
                this.submitName();
            } else if (this.isValidCharacter(event.key) && this.playerName.length < this.maxNameLength) {
                this.playerName += event.key;
            }
        });

        window.addEventListener('mousemove', (event) => {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    draw() {
        if (!this.isEditing) return;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Input box container
        const width = 400;
        const height = 200;
        const leftMargin = (this.canvas.width - width) / 2;
        const topMargin = (this.canvas.height - height) / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 5;
        ctx.fillRect(leftMargin, topMargin, width, height);
        ctx.strokeRect(leftMargin, topMargin, width, height);

        // Title
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText('ENTER YOUR NAME', this.canvas.width / 2, topMargin + 40);

        // Input box
        const inputBoxWidth = 300;
        const inputBoxHeight = 50;
        const inputBoxX = (this.canvas.width - inputBoxWidth) / 2;
        const inputBoxY = topMargin + 90;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = this.isHovered(inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight)
            ? '#FFD700'
            : '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.fillRect(inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight);
        ctx.strokeRect(inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight);

        // Player Name with blinking cursor
        ctx.font = '22px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';

        const displayName = this.playerName || 'TYPE HERE';
        const cursorX = inputBoxX + 10 + ctx.measureText(this.playerName).width;
        ctx.fillText(displayName, inputBoxX + 10, inputBoxY + inputBoxHeight / 2 + 8);

        // Blink cursor
        const currentTime = performance.now();
        if (currentTime - this.lastBlinkTime > this.cursorBlinkInterval) {
            this.cursorVisible = !this.cursorVisible;
            this.lastBlinkTime = currentTime;
        }

        if (this.cursorVisible && this.playerName.length < this.maxNameLength) {
            ctx.fillRect(cursorX, inputBoxY + 10, 2, inputBoxHeight - 20);
        }
    }

    isHovered(x, y, width, height) {
        return (
            this.mouseX >= x &&
            this.mouseX <= x + width &&
            this.mouseY >= y &&
            this.mouseY <= y + height
        );
    }

    submitName() {
        if (this.playerName.trim().length > 0) {
            this.isEditing = false;
            document.body.removeChild(this.canvas);
            this.onNameSubmitted(this.playerName);
        }
    }

    isValidCharacter(char) {
        return /^[a-zA-Z0-9_]$/.test(char);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PlayerNameInput);


/***/ }),

/***/ "./src/ui/objects/player-widget.js":
/*!*****************************************!*\
  !*** ./src/ui/objects/player-widget.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class PlayerWidget {
    constructor(myPlayer) {
        this.myPlayer = myPlayer;
        this.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.textColor = '#FFFFFF';
        this.rankColor = '#FFD700';
        this.faceColor = myPlayer.colorPattern || '#8B4513';
    }

    draw(ctx) {
        ctx.save();
        ctx.resetTransform();

        // Widget dimensions and styling
        const width = 300;
        const height = 90;

        // Position (top-center)
        const leftMargin = (ctx.canvas.width - width) / 2;
        const topMargin = 20;

        // Background with rounded corners
        this.drawRoundedRect(ctx, leftMargin, topMargin, width, height, 10);
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();

        // Player image/emoji placeholder (avatar)
        this.drawPlayerHead(ctx, leftMargin + 10, topMargin + 10, 50, 50);

        // Player name
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = this.textColor;
        ctx.textBaseline = 'top';
        ctx.fillText(this.myPlayer.name, leftMargin + 70, topMargin + 10);

        // Player rank and stats (aligned below the name)
        ctx.font = '16px Arial';
        const rank = `🏆 #${this.myPlayer.rank || 'N/A'}`;
        ctx.fillStyle = this.rankColor;
        ctx.fillText(rank, leftMargin + 70, topMargin + 35);

        // Stats with emojis and colors
        ctx.font = '16px Arial';
        const scoreText = `🏁 `;
        const scoreValue = `${this.myPlayer.score || 0}%`;
        const killsText = `🔥 `;
        const killsValue = `x${this.myPlayer.kills || 0}`;
        
        // Score in green
        ctx.fillStyle = '#00FF00';  // Bright green
        ctx.fillText(scoreText, leftMargin + 70, topMargin + 55);
        ctx.fillText(scoreValue, leftMargin + 95, topMargin + 55);

        // Kills in red
        ctx.fillStyle = '#FF0000';  // Bright red
        ctx.fillText(killsText, leftMargin + 70, topMargin + 70);
        ctx.fillText(killsValue, leftMargin + 95, topMargin + 70);

        ctx.restore();
    }

    drawPlayerHead(ctx, x, y, width, height) {
        // Rounded square to mimic a player avatar
        ctx.fillStyle = this.faceColor;
        this.drawRoundedRect(ctx, x, y, width, height, 8);
        ctx.fill();

        // Face details (eyes and mouth)
        ctx.fillStyle = '#000000'; // Black for eyes

        // Eyes
        const eyeSize = width * 0.1;
        ctx.fillRect(x + width * 0.25, y + height * 0.3, eyeSize, eyeSize);
        ctx.fillRect(x + width * 0.65, y + height * 0.3, eyeSize, eyeSize);

        // Mouth (simple line)
        ctx.beginPath();
        ctx.moveTo(x + width * 0.3, y + height * 0.7);
        ctx.lineTo(x + width * 0.7, y + height * 0.7);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PlayerWidget);


/***/ }),

/***/ "./src/ui/objects/player.js":
/*!**********************************!*\
  !*** ./src/ui/objects/player.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point.js */ "./src/ui/objects/point.js");
/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/math.js */ "./src/utils/math.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./src/ui/utils.js");
/* harmony import */ var _network_packets_direction__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../network/packets/direction */ "./src/network/packets/direction.js");
/* harmony import */ var _network_packets_requestWaitingBlocks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../network/packets/requestWaitingBlocks */ "./src/network/packets/requestWaitingBlocks.js");
/* harmony import */ var _i_object__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./i-object */ "./src/ui/objects/i-object.js");
/* harmony import */ var _network_packets_respawn__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../network/packets/respawn */ "./src/network/packets/respawn.js");









class Player extends _i_object__WEBPACK_IMPORTED_MODULE_5__["default"] {


    reset() {
         this.drawPosSet = false; // from PlayerState Packet

        this.deathWasCertain = false;
        this.didUncertainDeathLastTick = false;
        this.isDeathTimer = 0;
        this.uncertainDeathPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
        this.deadAnimParts = [];
        this.deadAnimPartsRandDist = [];
        this.hitLines = [];

        this.drawPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](-1, -1);
        this.lastChangedDirPos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);







        // Movements
        this.hasReceivedPosition = false; // from PlayerState Packet it set position
        this.moveRelativeToServerPosNextFrame = false; // from PlayerState Packet
        this.lastServerPosSentTime = 0;



        ///
        /**
         * waitingBlocks can be updated vai two messaged only
         * 1- WaitingBlocksPacket [if player requested waiting blocks]
         * 2- StopDrawingWaitingBlocksPacket [if player received to stop drawing waiting blocks request is sent to server]
         * @type {*[]}
         */
        this.waitingBlocks = [];
        this.waitingBlocksDuringWaiting = [];
        //
        this.lastPosHasBeenConfirmed = false;
        this.lastPosServerSentTime = 0;
        this.myNextDir = '';
        this.myLastSendDir = '';
        this.lastDirServerSentTime = 0;
        this.lastMyPostSetClientSendTime = 0;
        this.lastConfirmedTimeForPos = 0;
        this.dir = '';
        this.sendDirQueue = [];
        this.clientSideMoves = [];
        this.changeDirAtCoord = null;
        this.changeDirAtIsHorizontal = false;

        this.waitingForPing = false;
        this.lastPingTime = 0;
        this.severLastPing = 0;
        this.serverAvgPing = 0;
        this.serverDiffPing = 0;


        this.isGettingWaitingBlocks = false;
        this.skipGettingWaitingBlocksRespose = false;
        this.waitingPushedDuringReceiving = [];
        this.isReady = false; // from Ready Packet

        // animation and drawing
        this.nameAlphaTimer = 0;
        this.isDeadTimer = 0;

        this.inRespawnPhase = false;
    }
    constructor(position = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](1, 1), id) {
        super(position, id, "");

         // Colors
        this.colorBrighter = 0;
        this.colorDarker = 0;
        this.colorSlightlyBrighter = 0
        this.colorPattern = 0
        this.colorPatternEdge = 0

        this.reset();

    }


    static getPlayerById(id, players) {
        for (let p of players) {
            if (p.id === id) return p;
        }
    }

    static isMovingHorizontally(direction) {
        return direction === 'left' || direction === 'right';
    }

    static movePlayer(pos, dir, offset) {
        let workingPos = pos.clone();
        if (dir === 'up') {
            workingPos.y -= offset;
        } else if (dir === 'down') {
            workingPos.y += offset;
        } else if (dir === 'left') {
            workingPos.x -= offset;
        } else if (dir === 'right') {
            workingPos.x += offset;
        }
        return workingPos;

    }

    static mapControlsToDir(controls) {
        if (controls === 1) return 'up'; else if (controls === 3) return 'down'; else if (controls === 4) return 'left'; else if (controls === 2) return 'right'; else return '';
    }

    /**
     * Verifies if the client's predicted player movement is synchronized with the server's authoritative state.
     * This function checks the alignment of the player's current or next direction and position against the server's updates.
     * It is critical for maintaining gameplay integrity by ensuring that all movements rendered client-side are accurate and acknowledged by the server.
     * This helps prevent discrepancies that can affect game dynamics, such as rubberbanding or desyncs.
     *
     * - The function compares the latest direction and position (factoring in calculated offsets for lag) received from the server.
     * - Returns false if the client’s predictions are confirmed by the server (i.e., no update or correction needed),
     *   which means the player's state on the client matches the server's data.
     * - Returns true if discrepancies are found, signaling the need for the client to update its local state based on the latest server information.
     *
     * Use this function to ensure that the gameplay remains fluid and consistent, avoiding interruptions due to network latency or processing delays.
     */
    checkClientMovementSyncedWithServer(newDir, newPosOffset, newPos) {
        // Check If dir and por are close to current
        const distVector = this.position.distanceVector(newPosOffset);
        if ((this.dir === newDir || this.myNextDir === newDir) &&
            distVector.x < 1 && distVector.y < 1) {
            return false
        }

        // check if last client side move is same as new
        // if server faster than client
        if (this.clientSideMoves.length > 0) {
            const lastClientSideMove = this.clientSideMoves.shift()
            if (lastClientSideMove.dir === newDir
                && lastClientSideMove.pos.equals(newPos)) {
                return false
            } else {
                this.clientSideMoves = [];
            }
        }

        return true

    }


    equals(player) {
        return this.id === player.id;
    }


    /**
     * Calculate Move Offset Based On Ping And Game Speed
     * If Player Is Not My Player Or Ping Is Less Than 50 Return 0
     * 50 ms is the minimum ping to consider the player is synced with the server
     * so if not my player no need to calculate offset but if my player and ping is bigger than 50
     * ping [round trip] / 2 * gameSpeed = offset
     * @returns {number}
     */
    calMoveOffset() {
        let offset = 0;
        if (!this.isMyPlayer || this.serverAvgPing <= 50) return offset;

        const gameSpeed = window.game.gameSpeed;
        offset = (this.serverAvgPing / 2) * gameSpeed;
        return offset;
    }


    addWaitingBlocks(pos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0)) {
        if (this.waitingBlocks.length <= 0) return;
        const lastBlock = this.waitingBlocks.getLast.blocks;
        if (lastBlock.length <= 0) return;
        if (!(lastBlock[0].x !== pos.x || lastBlock[0].y !== pos.y)) return;
        lastBlock.push(pos.clone());


        // If Player Change his Direction During Receiving Waiting Blocks
        if (this.isMyPlayer && this.isGettingWaitingBlocks) {
            this.waitingPushedDuringReceiving.push(pos);
        }

    }

    /**
     * This Function Is Called Every Frame
     * It Moves The Draw Position To The Position
     */
    moveDrawPosToPos() {
        let target = this.position;
        this.drawPosition.x = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(this.drawPosition.x, target.x, 0.23);
        this.drawPosition.y = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(this.drawPosition.y, target.y, 0.23);
    }

    /**
     * Update Player Direction
     * @param dir
     */
    updatePlayerDirection(dir) {
        this.dir = dir;
    }

    /**
     * Check If Player Is Moving Horizontally
     * @param direction
     * @returns {boolean}
     */
    isMovingHorizontally(direction = this.dir) {
        return direction === 'left' || direction === 'right';
    }

    /**
     * Update Player Position
     * @param pos
     */
    updatePlayerPosition(pos) {
        this.position = pos;
    }



    /**
     * This Function Is Called Every Frame
     * It Checks If The Player Should Change Direction
     * Based On Next Direction If It Should Change Direction
     */
    checkNextDirAndCamera() {

        if (!this.isMyPlayer) return;

        const camera = window.camera;
        camera.moveToPlayer(this)



        if (this.myNextDir === this.dir) return;

        const isHorizontal = this.isMovingHorizontally(this.dir);
        if (this.changeDirAtIsHorizontal !== isHorizontal) return;


        let changeDirectionCurrentFrame = false;
        const currentCoord = isHorizontal ? this.position.x : this.position.y;

        // Check If Last Direction passed the point that player requested to change direction
        if (_utils_js__WEBPACK_IMPORTED_MODULE_2__.isMovingToPositiveDir(this.dir)) {
            if (this.changeDirAtCoord < currentCoord) changeDirectionCurrentFrame = true;
        } else {
            if (this.changeDirAtCoord > currentCoord) changeDirectionCurrentFrame = true;
        }


        if (changeDirectionCurrentFrame) {
            const newPos = this.position.clone();
            const distance = Math.abs(this.changeDirAtCoord - currentCoord);
            if (isHorizontal)
                newPos.x = this.changeDirAtCoord;
            else
                newPos.y = this.changeDirAtCoord;
            this.changeCurrentDir(this.myNextDir, newPos);
            let offsetPosition = Player.movePlayer(this.position, this.dir, distance);
            this.updatePlayerPosition(offsetPosition);
        }

    }

    /**
     * Change Player Direction and Position
     * Add Waiting Blocks
     * Add Client Side Move To Check If Server Synced With Client in PlayerState Message
     * @param dir
     * @param pos
     * @param addWaitingBlocks
     * @param clientDecision
     */
    changeCurrentDir(dir, pos, addWaitingBlocks = true, clientDecision = true) {
        this.updatePlayerDirection(dir);
        this.myNextDir = dir;

        this.updatePlayerPosition(pos.clone());
        this.lastChangedDirPos = pos.clone();


        if (addWaitingBlocks) {
            this.addWaitingBlocks(pos);
        }


        // To Check If Player Movement is Synced With Server in
        // PlayerState Message
        if (clientDecision) {
            this.clientSideMoves.push({
                dir: dir, pos: pos.clone(), time: Date.now()
            });
        }

    }


    ////////////// DRAWING /////////////////
    drawPlayerHeadWithEye(ctx) {
        let newDrawPos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](this.drawPosition.x * 10 + 4.5, this.drawPosition.y * 10 + 4.5);
        const bigEye = "#ffff";
        const smallEye = "#000";
        let radius = 6;
        let size = radius;
        const animationSpeed = 0.005;
        const eyeAnimation = Math.sin(Date.now() * animationSpeed) * 2;
        let r = 0.5;

        const gradient = ctx.createRadialGradient(newDrawPos.x - 3, newDrawPos.y - 3, 0, newDrawPos.x, newDrawPos.y, radius);
        gradient.addColorStop(0, this.colorSlightlyBrighter);
        gradient.addColorStop(1, this.colorBrighter);

        const c = ctx;
        c.translate(newDrawPos.x, newDrawPos.y);

        if (this.dir === 'up') {
            c.rotate(Math.PI * r);
        } else if (this.dir === 'down') {
            r += .5 * 2;
            c.rotate(Math.PI * r);
        } else if (this.dir === 'left') {
            r += .5 * 3;
            c.rotate(Math.PI * r);
        } else {
            r += .5;
            c.rotate(Math.PI * r);
        }

        c.beginPath();
        c.arc(0, 0, size, 0, Math.PI * 2, false);

        c.fillStyle = gradient;
        c.fill();

        // Draw the left white eye
        c.beginPath();
        c.fillStyle = bigEye;
        c.arc(-size / 2, -size / 2.5, size / 4, 0, Math.PI * 2, false);
        c.fill();

        // Draw the left black eye
        c.beginPath();
        c.fillStyle = smallEye;
        c.arc(-size / 2, -size / 2.5 + eyeAnimation, size / 8, 0, Math.PI * 2, false);
        c.fill();

        // Draw the right white eye
        c.beginPath();
        c.fillStyle = bigEye;
        c.arc(-size / 2, size / 2.5, size / 4, 0, Math.PI * 2, false);
        c.fill();

        // Draw the right black eye
        c.beginPath();
        c.fillStyle = smallEye;
        c.arc(-size / 2, size / 2.5 + eyeAnimation, size / 8, 0, Math.PI * 2, false);
        c.fill();

        // Smile
        c.beginPath();
        c.arc(size / 4, 0, size / 2, -0.5 * Math.PI, 0.5 * Math.PI);
        c.lineWidth = size / 10;
        c.stroke();

        c.restore();
        window.gameEngine.camTransform(ctx);

    }

    drawWaitingBlocks(ctx) {
        if (this.waitingBlocks.length <= 0) return;
        const gameSpeed = window.game.gameSpeed;
        const deltaTime = window.gameEngine.deltaTime;


        for (let blockIndex = this.waitingBlocks.length - 1; blockIndex >= 0; blockIndex--) {
            let block = this.waitingBlocks[blockIndex];
            let isLastBlock = blockIndex === this.waitingBlocks.length - 1;


            // remove Top Block From Waiting Blocks If It's Vanish Timer Is More Than 10
            if (!isLastBlock || this.isDead) {
                let speed = (this.isDead && isLastBlock) ? gameSpeed : 0.02;
                block.vanishTimer += deltaTime * speed;
                if (!isLastBlock && (block.vanishTimer > 10)) {
                    this.waitingBlocks.splice(blockIndex, 1);
                }
            }

            let helperCanvas = window.game.helperCtx.canvas;
            let helperCtx = window.game.helperCtx;

            if (block.blocks.length <= 0) continue;

            const lastDrawPos = isLastBlock ? this.drawPosition : null;

            if (block.vanishTimer > 0) {
                window.gameEngine.camTransform(helperCtx, true);


                this.drawWaitingBlockInCTX([
                    {ctx: helperCtx, color: this.colorDarker, offset: 5},
                    {ctx: helperCtx, color: this.colorBrighter, offset: 4},
                ], block.blocks, lastDrawPos);


                helperCtx.globalCompositeOperation = 'destination-out';

                ctx.restore();
                helperCtx.restore();

                ctx.drawImage(helperCanvas, 0, 0);

                helperCtx.fillStyle = '#c7c7c7';
                helperCtx.globalCompositeOperation = "source-in";
                helperCtx.fillRect(0, 0, helperCanvas.width, helperCanvas.height);
                window.gameEngine.camTransform(ctx);

            } else if (block.vanishTimer < 10) {
                this.drawWaitingBlockInCTX([
                    {ctx: ctx, color: this.colorDarker, offset: 6},
                    {ctx: ctx, color: this.colorBrighter, offset: 4},
                ], block.blocks, lastDrawPos);
            }


        }


    }

    drawWaitingBlockInCTX(contexts, blocks, lastPosition) {
        if (blocks.length <= 0) return;


        for (let ctxIndex = 0; ctxIndex < contexts.length; ctxIndex++) {
            let b = contexts[ctxIndex];
            let ctx = b.ctx;
            let offset = b.offset;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = 6;
            ctx.strokeStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(blocks[0].x * 10 + offset, blocks[0].y * 10 + offset);
            for (let i = 1; i < blocks.length; i++) {
                ctx.lineTo(blocks[i].x * 10 + offset, blocks[i].y * 10 + offset);
            }
            if (lastPosition !== null) {
                ctx.lineTo(lastPosition.x * 10 + offset, lastPosition.y * 10 + offset);
            }
            ctx.stroke();
        }
    }

    draw(ctx) {
        if (!this.isReady) return; // from Ready Packet
        if (!this.hasReceivedPosition) return; // from PlayerState Packet
        const gameSpeed = window.game.gameSpeed;
        let offset = window.gameEngine.deltaTime * gameSpeed;

        if (!window.gameEngine.gameObjects.isPlayerExist(this)) return;


        // When Receiving Player State Next Frame Move Relative To Server Pos
        if (this.moveRelativeToServerPosNextFrame) {
            // When Receiving Player State
            // Next Frame Move Relative To Server Pos
            offset = (Date.now() - this.lastServerPosSentTime) * gameSpeed;
            this.moveRelativeToServerPosNextFrame = false;
        }

        if (this.isMyPlayer) {
            this.serverPos = Player.movePlayer(this.serverPos, this.serverDir, offset);

            // Check If Client Movement As Same As Server Direction Received From Server in PlayerState Message
            if (this.serverDir === this.dir) {
                let clientSideDist = 0;
                if (Player.isMovingHorizontally(this.dir)) {
                    if (this.position.y === this.serverPos.y) {
                        if (this.dir === 'right') {
                            clientSideDist = this.position.x - this.serverPos.x;
                        } else {
                            clientSideDist = this.serverPos.x - this.position.x;
                        }
                    }
                } else {
                    if (this.position.x === this.serverPos.x) {
                        if (this.dir === 'down') {
                            clientSideDist = this.position.y - this.serverPos.y;
                        } else {
                            clientSideDist = this.serverPos.y - this.position.y;
                        }
                    }
                }
                clientSideDist = Math.max(0, clientSideDist);
                offset *= _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(.5, 1, _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.inverseLinearInterpolate(5, 0, clientSideDist));
            }
        }



        let offsetPosition = Player.movePlayer(this.position, this.dir, offset);
        if (!this.positionInWalls(offsetPosition))
            this.updatePlayerPosition(offsetPosition);


        this.moveDrawPosToPos();
        this.checkNextDirAndCamera();
        this.drawWaitingBlocks(ctx);
        this.drawPlayerHeadWithEye(ctx);
        this.drawPlayerName(ctx)
        this.parseDirQueue();

    }


    drawPlayerName(ctx) {
        this.nameAlphaTimer += window.gameEngine.deltaTime * 0.001;
        const userNameSize = 6;
        ctx.font = `${userNameSize}px Arial, Helvetica, sans-serif`;
        let myAlpha = 1;
        let deadAlpha = 1;
        if (this.isMyPlayer) {
            myAlpha = 9 - this.nameAlphaTimer;
        }
        if (this.isDead) {
            deadAlpha = 1 - this.isDeadTimer;
        }
        let alpha = Math.min(myAlpha, deadAlpha);
        // if (alpha <= 0) return;

        ctx.save();
        // ctx.globalAlpha = GameMath.clamp(alpha, 0, 1);
        let realNameWidth = ctx.measureText(this.name).width;
        let nameWidth = Math.max(100, realNameWidth);

        const maxNamePos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"]((this.drawPosition.x * 10) + 5 - (nameWidth / 2), this.drawPosition.y * 10 - 5);
        // center the width i we have a space


        const namePos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](maxNamePos.x, maxNamePos.y);
        const distanceToMax = this.drawPosition.multiply(10).distanceVector(maxNamePos).abs();
        namePos.x = Math.abs(distanceToMax.x - realNameWidth)/2 + maxNamePos.x;


        ctx.rect(namePos.x - 4, namePos.y - userNameSize * 1.2, nameWidth + 8, userNameSize * 2);
        ctx.clip();

        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = ctx.shadowOffsetY = 2;
        ctx.fillStyle = this.colorBrighter;
        ctx.fillText(this.name, namePos.x, namePos.y);

        ctx.shadowColor = this.colorDarker;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = ctx.shadowOffsetY = 0.8;
        ctx.fillText(this.name, namePos.x, namePos.y);

        ctx.restore();


    }

    ///////////////////////////////////

    checkIfPositionSentEarlier(pos) {
        return false; // TODO: Fix This
        // console.log(pos, this.lastChangedDirPos, "E");


        if (this.dir === 'up' && pos.y >= this.lastChangedDirPos.y) return true;
        else if (this.dir === 'down' && pos.y <= this.lastChangedDirPos.y) return true;
        else if (this.dir === 'left' && pos.x >= this.lastChangedDirPos.x) return true;
        else return this.dir === 'right' && pos.x <= this.lastChangedDirPos.x;
    }


    positionInWalls(pos) {
        const mapSize = window.gameEngine.gameObjects.mapSize - 1;
        const playerPositionFloored = pos.floorVector();
        const playerPositionCelled = pos.ceilVector();
        const minBoundary = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
        const maxBoundary = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](mapSize, mapSize);

        return (playerPositionFloored.x <= minBoundary.x ||
            playerPositionCelled.x >= maxBoundary.x ||
            playerPositionFloored.y <= minBoundary.y ||
            playerPositionCelled.y >= maxBoundary.y)
    }

    requestChangeDir(direction, skipQueue = false) {
        const dir = direction;
        const gameSpeed = window.game.gameSpeed;
        const timePassedFromLastSend = Date.now() - this.lastDirServerSentTime;
        const minTimeToWaitToSendDir = 0.7 / gameSpeed;

        // Prevent Sending Same Dir
        // Prevent Sending Dir Too Fast
        if (dir === this.myLastSendDir && timePassedFromLastSend < minTimeToWaitToSendDir) {
            return false;
        }
        this.myLastSendDir = dir;
        this.lastDirServerSentTime = Date.now();


        // Check If Dir Is Same As Current Dir
        if (this.dir === dir) {
            return false;
        }

        // Check If Dir Is Opposite Of Current Dir
        if (_utils_js__WEBPACK_IMPORTED_MODULE_2__.isOppositeDir(dir, this.dir)) {
            return false;
        }

        // Round Player Position To The Nearest Integer
        const isHorizontal = this.isMovingHorizontally(this.dir);

        const valueToRound = isHorizontal ? this.position.x : this.position.y;
        const roundedValue = Math.round(valueToRound);
        const newPlayerPos = this.position.clone();
        if (isHorizontal) newPlayerPos.x = roundedValue;
        else newPlayerPos.y = roundedValue;

        // Check If Position Corrupted Since Last Send
        if (this.checkIfPositionSentEarlier(newPlayerPos)) {
            console.log("GameUtils.checkIfPositionSentEarlier(dir, this.dir)");
            this.addDirToQueue(dir, skipQueue);
            return false;
        }

        // Check If Last Direction Complete passed .55 Of Current Block
        let changeDirectionCurrentFrame = false;

        const blockProgress = valueToRound - Math.floor(valueToRound);
        if (_utils_js__WEBPACK_IMPORTED_MODULE_2__.isMovingToPositiveDir(dir)) {
            if (blockProgress < .45)
                changeDirectionCurrentFrame = true;

        }
        else if (blockProgress > .55)

            changeDirectionCurrentFrame = true;


        // Check If Prediction Of Next Direction Will Touch Wall
        // We Change It Now Not in Next Frame
        // Because checkNextDirAndCamera function will not change the direction
        // Because the player is not moving to the next block
        // as it prevented from move in main update function
        let predictionVector = this.position.clone();
        predictionVector = Player.movePlayer(predictionVector, this.dir, 1);

        if (this.positionInWalls(predictionVector))
            changeDirectionCurrentFrame = true;


        if (changeDirectionCurrentFrame) {
            this.changeCurrentDir(dir, newPlayerPos);
        } else {
            // change direction in next frame
            // this movement will be done in next frame not now
            this.myNextDir = dir;
            this.changeDirAtCoord = roundedValue;
            this.changeDirAtIsHorizontal = isHorizontal;
            this.lastChangedDirPos = newPlayerPos.clone();
        }


        // Last Send Time
        // Last Confirmed Time
        this.lastMyPostSetClientSendTime = Date.now();
        if (this.lastPosHasBeenConfirmed) {
            this.lastConfirmedTimeForPos = Date.now();
            this.lastPosHasBeenConfirmed = false;
        }


        // We Send The Position and Dir To Server
        // To Make Server Sync With Client
        const packet = new _network_packets_direction__WEBPACK_IMPORTED_MODULE_3__["default"](dir, newPlayerPos);
        window.client.send(packet);
        return true;
    }


    parseDirQueue() {

        if (this.sendDirQueue.length <= 0) return;
        const firstDir = this.sendDirQueue.first;
        const timePassed = (Date.now() - firstDir.time);
        const gameSpeed = window.game.gameSpeed;
        const minTimeToWaitToSendDir = 1.2 / gameSpeed;

        /// Check If Time Passed From Last Send Is Less Than minTimeToWaitToSendDir
        if (timePassed < minTimeToWaitToSendDir || this.requestChangeDir(firstDir.dir, true)) {
            this.sendDirQueue.shift();
        }
    }

    addDirToQueue(dir, skip = false) {
        if (!skip && this.sendDirQueue.length < 3) {
            this.sendDirQueue.push({
                dir: dir, time: Date.now()
            });
        }
    }

    /**
     * Request Waiting Blocks For Two Reasons
     * 1- If server thinks during player movement then some waiting blocks were missed so we request it

     the RequestWaitingBlocks could happen if we found server and client blocks are not synced
     in Player State Packet



     */
    requestWaitingBlocks() {
        this.isGettingWaitingBlocks = true;
        this.waitingPushedDuringReceiving = [];
        const packet = new _network_packets_requestWaitingBlocks__WEBPACK_IMPORTED_MODULE_4__["default"]();
        window.client.send(packet);
    }


    drawPlayerHead(ctx) {
        let newDrawPos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](this.drawPosition.x * 10 + 4.5, this.drawPosition.y * 10 + 4.5);
        let radius = 6;
        let shadowOffset = .3;

        const gradient = ctx.createRadialGradient(newDrawPos.x - 3, newDrawPos.y - 3, 0, newDrawPos.x, newDrawPos.y, radius);
        gradient.addColorStop(0, this.colorSlightlyBrighter);
        gradient.addColorStop(1, this.colorBrighter);
        if (false) {} else {
            ctx.fillStyle = this.colorDarker;
            ctx.beginPath();
            ctx.arc(newDrawPos.x + shadowOffset, newDrawPos.y + shadowOffset, radius, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(newDrawPos.x - shadowOffset, newDrawPos.y - shadowOffset, radius, 0, Math.PI * 2, false);
            ctx.fill();
            if (this.isMyPlayer) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(newDrawPos.x - shadowOffset, newDrawPos.y - shadowOffset, 1, 0, Math.PI * 2, false);
                ctx.fill();
            }
        }
    }





    requestRespawn() {
        const packet = new _network_packets_respawn__WEBPACK_IMPORTED_MODULE_6__["default"]();
        window.client.send(packet);
    }
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Player);

/***/ }),

/***/ "./src/ui/objects/point.js":
/*!*********************************!*\
  !*** ./src/ui/objects/point.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(otherPoint) {
        return this.x === otherPoint.x && this.y === otherPoint.y;
    }

    distanceVector(otherPoint) {
        return new Point(Math.abs(this.x - otherPoint.x), Math.abs(this.y - otherPoint.y));
    }


    multiply(scalar) {
        return new Point(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Point(Math.floor(this.x / scalar), Math.floor(this.y / scalar));
    }


    clone() {
        return new Point(this.x, this.y);
    }


    floorVector()
    {
        return new Point(Math.floor(this.x),Math.floor(this.y));
    }

    ceilVector()
    {
        return new Point(Math.ceil(this.x),Math.ceil(this.y));
    }

    abs(){
        return new Point(Math.abs(this.x),Math.abs(this.y));
    }


}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Point);

/***/ }),

/***/ "./src/ui/objects/present-box.js":
/*!***************************************!*\
  !*** ./src/ui/objects/present-box.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _decorations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./decorations */ "./src/ui/objects/decorations.js");


class PresentBox extends _decorations__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(x, y, options = {}) {
        super(x, y, options);
        this.boxColor = options.boxColor || '#C41E3A';
        this.ribbonColor = options.ribbonColor || '#156615';
        this.size = options.size || 50;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Present box
        ctx.fillStyle = this.boxColor;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

        // Horizontal ribbon
        ctx.fillStyle = this.ribbonColor;
        ctx.fillRect(-this.size / 2, 0, this.size, this.size / 6);

        // Vertical ribbon
        ctx.fillRect(0 - this.size / 12, -this.size / 2, this.size / 6, this.size);



        ctx.restore();
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PresentBox);

/***/ }),

/***/ "./src/ui/objects/rectangle.js":
/*!*************************************!*\
  !*** ./src/ui/objects/rectangle.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point.js */ "./src/ui/objects/point.js");

class Rectangle {
    constructor(minVec, maxVec) {
        this.min = minVec;
        this.max = maxVec;
    }

    toString() {
        return `<Rectangle min=${this.min} max=${this.max}>`;
    }

    clamp(rect) {
        const minVec = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](
            Math.max(this.min.x, rect.min.x),
            Math.max(this.min.y, rect.min.y)
        );

        const maxVec = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](
            Math.min(this.max.x, rect.max.x),
            Math.min(this.max.y, rect.max.y)
        );

        return new Rectangle(minVec, maxVec);
    }

    *for_each() {
        for (let x = this.min.x; x < this.max.x; x++) {
            for (let y = this.min.y; y < this.max.y; y++) {
                yield { x, y };
            }
        }
    }

    isRectOverlap(rect) {
        return (
            this.min.x < rect.max.x &&
            this.max.x > rect.min.x &&
            this.min.y < rect.max.y &&
            this.max.y > rect.min.y
        );
    }

    isNotRectOverlap(rect) {
        return (
            this.max.x < rect.min.x ||
            this.min.x > rect.max.x ||
            this.max.y < rect.min.y ||
            this.min.y > rect.max.y
        );
    }


    pointInRect(point) {
        return (
            point.x >= this.min.x &&
            point.x <= this.max.x &&
            point.y >= this.min.y &&
            point.y <= this.max.y
        );
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Rectangle);

/***/ }),

/***/ "./src/ui/objects/snow-hat.js":
/*!************************************!*\
  !*** ./src/ui/objects/snow-hat.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _decorations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./decorations */ "./src/ui/objects/decorations.js");


class SnowHat extends _decorations__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(x, y, options = {}) {
        super(x, y, options);
        this.hatColor = options.hatColor || '#C41E3A';
        this.trimColor = options.trimColor || '#FFFFFF';
        this.size = options.size || 50;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Main hat body
        ctx.beginPath();
        ctx.fillStyle = this.hatColor;
        ctx.moveTo(0, -this.size);
        ctx.lineTo(-this.size / 2, 0);
        ctx.lineTo(this.size / 2, 0);
        ctx.closePath();
        ctx.fill();

        // White trim
        ctx.beginPath();
        ctx.fillStyle = this.trimColor;
        ctx.rect(-this.size / 2, 0, this.size, this.size / 5);
        ctx.fill();

        // Fluffy pom-pom
        ctx.beginPath();
        ctx.fillStyle = this.trimColor;
        ctx.arc(0, -this.size * 1.2, this.size / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SnowHat);

/***/ }),

/***/ "./src/ui/objects/snow-man.js":
/*!************************************!*\
  !*** ./src/ui/objects/snow-man.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShakySnowman: () => (/* binding */ ShakySnowman),
/* harmony export */   SnowMan: () => (/* binding */ SnowMan)
/* harmony export */ });
/* harmony import */ var _decorations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./decorations */ "./src/ui/objects/decorations.js");


class SnowMan extends _decorations__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(x, y, options = {}) {
        super(x, y, options);
        this.bodyColor = options.bodyColor || '#FFFFFF';
        this.detailColor = options.detailColor || '#FF4500';
        this.size = options.size || 60;
        this.outlineColor = options.outlineColor || 'rgba(0, 255, 255, 0.8)';
        this.blinkFrame = 0;
        this.blinkInterval = Math.floor(Math.random() * 100) + 50;
        this.blinkDuration = 5;
        this.isBlinking = false;
    }


    drawEyes(ctx, isBlinking = false) {
        ctx.fillStyle = '#000000';

        if (isBlinking) {
            // Closed eyes (thin line)
            ctx.beginPath();
            ctx.moveTo(-10, -110);
            ctx.lineTo(-5, -110);
            ctx.moveTo(5, -110);
            ctx.lineTo(10, -110);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Open eyes (circular)
            ctx.beginPath();
            ctx.arc(-8, -110, 3, 0, Math.PI * 2);
            ctx.arc(8, -110, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    updateBlinkAnimation() {
        this.blinkFrame++;

        // Reset blink cycle when interval is reached
        if (this.blinkFrame >= this.blinkInterval) {
            this.isBlinking = true;

            // Stop blinking after blinkDuration
            if (this.blinkFrame >= this.blinkInterval + this.blinkDuration) {
                this.blinkFrame = 0;
                this.isBlinking = false;

                // Randomize next blink interval
                this.blinkInterval = Math.floor(Math.random() * 100) + 50;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Update blinking animation
        this.updateBlinkAnimation();

        // Bottom snow ball (largest)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Middle snow ball
        ctx.beginPath();
        ctx.ellipse(0, -60, 35, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -110, 25, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes with blinking
        this.drawEyes(ctx, this.isBlinking);

        // Coal buttons
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, -40, 5, 0, Math.PI * 2);
        ctx.arc(0, -55, 5, 0, Math.PI * 2);
        ctx.arc(0, -70, 5, 0, Math.PI * 2);
        ctx.fill();

        // Carrot nose
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(0, -110);
        ctx.lineTo(15, -105);
        ctx.lineTo(0, -100);
        ctx.closePath();
        ctx.fill();

        // Stick arms
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-40, -60);
        ctx.lineTo(-70, -90);
        ctx.moveTo(40, -60);
        ctx.lineTo(70, -90);
        ctx.stroke();

        // Hat
        ctx.fillStyle = '#36454F';
        ctx.beginPath();
        ctx.rect(-30, -140, 60, 15);
        ctx.rect(-20, -160, 40, 20);
        ctx.fill();

        ctx.restore();
    }
}

class ShakySnowman extends SnowMan {
    constructor(x, y, options = {}) {
        super(x, y, options);

        // Rotation animation properties
        this.rotationAngle = 0;
        this.rotationSpeed = options.rotationSpeed || 0.05; // Rotation speed
        this.maxRotationAngle = options.maxRotationAngle || Math.PI / 6; // Maximum rotation angle

    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Update blinking animation
        this.updateBlinkAnimation();

        // Calculate rotation around midpoint
        this.rotationAngle += this.rotationSpeed;
        const currentRotation = Math.sin(this.rotationAngle) * this.maxRotationAngle;

        // Rotate around midpoint
        ctx.translate(0, -60); // Move rotation point to midpoint of snowman
        ctx.rotate(currentRotation);
        ctx.translate(0, 60); // Move back

        // Bottom snow ball (largest)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Middle snow ball
        ctx.beginPath();
        ctx.ellipse(0, -60, 35, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -110, 25, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes with blinking
        this.drawEyes(ctx, this.isBlinking);

        // Coal buttons
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, -40, 5, 0, Math.PI * 2);
        ctx.arc(0, -55, 5, 0, Math.PI * 2);
        ctx.arc(0, -70, 5, 0, Math.PI * 2);
        ctx.fill();

        // Carrot nose
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(0, -110);
        ctx.lineTo(15, -105);
        ctx.lineTo(0, -100);
        ctx.closePath();
        ctx.fill();

        // Stick arms
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-40, -60);
        ctx.lineTo(-70, -90);
        ctx.moveTo(40, -60);
        ctx.lineTo(70, -90);
        ctx.stroke();

        // Hat
        ctx.fillStyle = '#36454F';
        ctx.beginPath();
        ctx.rect(-30, -140, 60, 15);
        ctx.rect(-20, -160, 40, 20);
        ctx.fill();

        ctx.restore();
    }
}



/***/ }),

/***/ "./src/ui/objects/snow-particles.js":
/*!******************************************!*\
  !*** ./src/ui/objects/snow-particles.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class SnowParticle {
    constructor(options = {}) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.radius = options.radius || Math.random() * 3 + 1;
        this.shape = options.shape || this.getRandomShape();

        // Movement physics
        this.vx = options.vx || (Math.random() - 0.5) * 0.5;
        this.vy = options.vy || Math.random() * 1 + 0.5;

        // Rotation and wobble
        this.rotation = options.rotation || Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;

        // Opacity and depth
        this.opacity = options.opacity || Math.random() * 0.7 + 0.3;
        this.depth = options.depth || Math.random();

        this.camera = options.camera;
        this.canvasWidth = options.canvasWidth || window.innerWidth;
        this.canvasHeight = options.canvasHeight || window.innerHeight;
    }

    getRandomShape() {
        const shapes = ['crystal', 'hexagon', 'star'];
        return shapes[Math.floor(Math.random() * shapes.length)];
    }

    isInCameraView() {
        // If no camera or canvas dimensions are not set, always return true
        if (!this.camera || !this.canvasWidth || !this.canvasHeight) {
            return true;
        }

        // Use viewPortRadius from game configuration
        const viewPortRadius = window.game.viewPortRadius * 0.9;
        const cameraX = this.camera.camPosition.x;
        const cameraY = this.camera.camPosition.y;

        return (
            this.x >= cameraX - viewPortRadius &&
            this.x <= cameraX + viewPortRadius &&
            this.y >= cameraY - viewPortRadius &&
            this.y <= cameraY + viewPortRadius
        );
    }

    update(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Horizontal wobble
        this.x += this.vx * (1 + this.depth);
        this.y += this.vy * (1 + this.depth);

        this.rotation += this.rotationSpeed;

        if (this.y > canvasHeight + 50) {
            this.y = -50;
            this.x = Math.random() * canvasWidth;
        }

        if (this.x < -50 || this.x > canvasWidth + 50) {
            this.x = Math.random() * canvasWidth;
        }
    }

    drawStar(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        const r = this.radius;
        const innerRadius = r * 0.5;

        for (let i = 0; i < 5; i++) {
            // Outer point
            ctx.lineTo(
                Math.cos((Math.PI * 4 * i) / 5 - Math.PI / 2) * r,
                Math.sin((Math.PI * 4 * i) / 5 - Math.PI / 2) * r
            );

            // Inner point
            ctx.lineTo(
                Math.cos((Math.PI * 4 * i) / 5 - Math.PI / 2) * innerRadius,
                Math.sin((Math.PI * 4 * i) / 5 - Math.PI / 2) * innerRadius
            );
        }

        ctx.closePath();

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        gradient.addColorStop(0, 'rgba(200, 220, 255, 0.9)');
        gradient.addColorStop(0.7, 'rgba(220, 230, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(240, 240, 255, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
    }

    drawCrystal(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        const r = this.radius;

        // Outer octagon-like shape
        ctx.moveTo(0, -r);
        ctx.lineTo(r / 2, -r / 2);
        ctx.lineTo(r, 0);
        ctx.lineTo(r / 2, r / 2);
        ctx.lineTo(0, r);
        ctx.lineTo(-r / 2, r / 2);
        ctx.lineTo(-r, 0);
        ctx.lineTo(-r / 2, -r / 2);
        ctx.closePath();

        // Inner crystal structure lines
        ctx.moveTo(0, -r);
        ctx.lineTo(0, r); // Vertical
        ctx.moveTo(-r, 0);
        ctx.lineTo(r, 0); // Horizontal

        ctx.moveTo(-r / 2, -r / 2);
        ctx.lineTo(r / 2, r / 2); // Diagonal bottom-left to top-right
        ctx.moveTo(r / 2, -r / 2);
        ctx.lineTo(-r / 2, r / 2); // Diagonal top-left to bottom-right

        ctx.strokeStyle = 'rgba(200, 220, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    drawHexagon(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const r = this.radius;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        gradient.addColorStop(0, 'rgba(220, 235, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(200, 220, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(180, 200, 240, 0.2)');

        ctx.fillStyle = gradient;
        ctx.fill();

        // Subtle outline
        ctx.strokeStyle = 'rgba(200, 220, 255, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
    }

    draw(ctx) {
        if (!this.isInCameraView()) return;

        ctx.globalAlpha = this.opacity;

        if (this.shape === 'star') {
            this.drawStar(ctx);
        } else if (this.shape === 'crystal') {
            this.drawCrystal(ctx);
        } else {
            this.drawHexagon(ctx);
        }

        ctx.globalAlpha = 1;
    }
}

class SnowEffect {
    constructor(options = {}) {
        this.particleCount = options.particleCount || 150;
        this.camera = options.camera;
        this.particles = [];
        this.init();
    }

    init() {
        let {canvasWidth, canvasHeight} = this.getCanvasDim();

        // Ensure dimensions are positive numbers
        canvasWidth = Math.max(100, canvasWidth);
        canvasHeight = Math.max(100, canvasHeight);

        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new SnowParticle({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                camera: this.camera,
                canvasWidth: canvasWidth,
                canvasHeight: canvasHeight
            }));
        }
    }

    draw(ctx) {
        let {canvasWidth, canvasHeight} = this.getCanvasDim();

        canvasWidth = Math.max(100, canvasWidth);
        canvasHeight = Math.max(100, canvasHeight);

        this.particles.forEach(particle => {
            particle.update(canvasWidth, canvasHeight);
            particle.draw(ctx);
        });
    }

    getCanvasDim() {
        let canvasWidth, canvasHeight;
        if (window.game && window.game.canvas) {
            canvasWidth = window.game.canvas.width;
            canvasHeight = window.game.canvas.height;
        }
        return {canvasWidth, canvasHeight};
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SnowEffect);


/***/ }),

/***/ "./src/ui/objects/timer.js":
/*!*********************************!*\
  !*** ./src/ui/objects/timer.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Timer {
    constructor() {
        this.timeRemaining = 5 * 60; // 5 minutes in seconds
        this.isStarted = false;
        this.lastUpdateTime = Date.now();
    }

    start() {
        this.isStarted = true;
        this.lastUpdateTime = Date.now();
    }

    stop() {
        this.isStarted = false;
    }

    reset() {
        this.timeRemaining = 5 * 60;
        this.lastUpdateTime = Date.now();
    }

    formatTime() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    loop() {
        if (!this.isStarted || this.timeRemaining <= 0) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime >= 1000) {
            this.timeRemaining--;
            this.lastUpdateTime = currentTime;
        }
    }

    draw(ctx) {
        const canvas = ctx.canvas;
        this.loop();
        
        ctx.save();
        ctx.resetTransform();
        
        // Set text properties
        ctx.font = "bold 32px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        
        // Draw timer at top right with 20px top margin and 20px right margin
        ctx.fillText(this.formatTime(), canvas.width - 40, 20);
        
        ctx.restore();
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Timer);


/***/ }),

/***/ "./src/ui/objects/tree.js":
/*!********************************!*\
  !*** ./src/ui/objects/tree.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _decorations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./decorations */ "./src/ui/objects/decorations.js");



class Tree extends _decorations__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(x, y, options = {}) {
        super(x, y, options);
        this.treeColor = options.treeColor || '#228B22';
        this.ornamentColors = options.ornamentColors || ['#FF0000', '#FFD700', '#00FFFF'];
        this.size = options.size || 400;
        this.starColor = options.starColor || '#FFD700';
        this.curveDirection = options.curveDirection || 'center';
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;

        // Tree trunk
        const trunkWidth = this.size * 0.2;
        const trunkHeight = this.size * 0.3;
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(-trunkWidth / 2, 0, trunkWidth, trunkHeight);

        // Tree layers
        const layers = 3;
        const layerHeight = this.size / layers;
        for (let i = 0; i < layers; i++) {
            const yOffset = -trunkHeight - i * layerHeight * 0.8;
            const layerWidth = this.size - i * 15;

            // Curve adjustment based on direction
            const curveOffset = this._calculateCurveOffset(layerWidth, i);

            // Create gradient for the tree layer
            const gradient = ctx.createLinearGradient(
                -layerWidth / 2, yOffset, layerWidth / 2, yOffset + layerHeight
            );
            gradient.addColorStop(0, '#2E8B57'); // Dark green
            gradient.addColorStop(0.5, this.treeColor); // Main green
            gradient.addColorStop(1, '#3CB371'); // Lighter green

            ctx.fillStyle = gradient;

            // Draw the tree layer
            ctx.beginPath();
            ctx.moveTo(0, yOffset);
            ctx.quadraticCurveTo(
                curveOffset.controlX, yOffset + layerHeight / 2,
                layerWidth / 2, yOffset + layerHeight
            );
            ctx.lineTo(-layerWidth / 2, yOffset + layerHeight);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    _calculateCurveOffset(layerWidth, layerIndex) {
        const curveStrength = layerWidth * 0.2;
        const layerAdjustment = layerIndex * curveStrength * 0.1;

        switch (this.curveDirection) {
            case 'left':
                return { controlX: -curveStrength - layerAdjustment };
            case 'right':
                return { controlX: curveStrength + layerAdjustment };
            case 'up':
                return { controlX: 0 };
            case 'down':
                return { controlX: 0 };
            default:
                return { controlX: 0 };
        }
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Tree);

/***/ }),

/***/ "./src/ui/objects/viewer.js":
/*!**********************************!*\
  !*** ./src/ui/objects/viewer.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _i_object__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./i-object */ "./src/ui/objects/i-object.js");


class Viewer extends _i_object__WEBPACK_IMPORTED_MODULE_0__["default"]{
    constructor(position,id) {
        super(position,id,"Viewer");
    }

    draw(ctx){
         const camera = window.camera;
         camera.moveToPlayer(this)
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Viewer);

/***/ }),

/***/ "./src/ui/utils.js":
/*!*************************!*\
  !*** ./src/ui/utils.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   calculate_pixel_ratio: () => (/* binding */ calculate_pixel_ratio),
/* harmony export */   convertIntColorToHex: () => (/* binding */ convertIntColorToHex),
/* harmony export */   drawInCtxRec: () => (/* binding */ drawInCtxRec),
/* harmony export */   ease: () => (/* binding */ ease),
/* harmony export */   getHeight: () => (/* binding */ getHeight),
/* harmony export */   getWidth: () => (/* binding */ getWidth),
/* harmony export */   isMovingToPositiveDir: () => (/* binding */ isMovingToPositiveDir),
/* harmony export */   isOppositeDir: () => (/* binding */ isOppositeDir),
/* harmony export */   isVerticalDir: () => (/* binding */ isVerticalDir)
/* harmony export */ });
const getHeight = () => window.innerHeight;
const getWidth = () => window.innerWidth;

const calculate_pixel_ratio = () => {
    let context = document.createElement("canvas").getContext("2d");
    let dpr = window.devicePixelRatio || 1;
    let bsr = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    return dpr / bsr;
}

const ease = {
    in: function (t) {
        return t * t * t * t;
    },
    out: function (t) {
        return 1 - Math.pow(1 - t, 4);
    },
    inout: function (t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    },
};


const drawInCtxRec = (ctx, point, size, color, spacing = 0) => {
    ctx.fillStyle = color;
    ctx.fillRect(point.x + spacing, point.y + spacing, size, size);
}


const convertIntColorToHex = (color) => {
    return "#" + ("000000" + color.toString(16)).slice(-6);
}


const isOppositeDir = (newDir, OldDir) => {
    if (newDir === 'up' && OldDir === 'down')
        return true;
    else if (newDir === 'down' && OldDir === 'up')
        return true;
    else if (newDir === 'left' && OldDir === 'right')
        return true;
    else return newDir === 'right' && OldDir === 'left';

}

const isVerticalDir = (dir) => {
    return dir === 'up' || dir === 'down';
}

const isMovingToPositiveDir = (dir) => {
    return dir === 'down' || dir === 'right';

}



/***/ }),

/***/ "./src/utils/math.js":
/*!***************************!*\
  !*** ./src/utils/math.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   adaptedConLinearInterpolate: () => (/* binding */ adaptedConLinearInterpolate),
/* harmony export */   adaptedLinearInterpolate: () => (/* binding */ adaptedLinearInterpolate),
/* harmony export */   calPercentage: () => (/* binding */ calPercentage),
/* harmony export */   clamp: () => (/* binding */ clamp),
/* harmony export */   inverseLinearInterpolate: () => (/* binding */ inverseLinearInterpolate),
/* harmony export */   linearInterpolate: () => (/* binding */ linearInterpolate),
/* harmony export */   smoothLimit: () => (/* binding */ smoothLimit)
/* harmony export */ });
const linearInterpolate = (a, b, v) => {
    return a + (b - a) * v;
}


const inverseLinearInterpolate = (a, b, v) => {
    return (v - a) / (b - a);
}

const adaptedLinearInterpolate = (a, b, val1, val2) => {
    let x = 1 - Math.pow((1 - val1), val2);
    return linearInterpolate(a, b, x);
};

const adaptedConLinearInterpolate = (val2) => (a, b, val1) => {
    return adaptedLinearInterpolate(a, b, val1, val2);
}

const smoothLimit = (v) => {
    let negative = v < 0;
    if (negative) {
        v *= -1;
    }
    v = 1 - Math.pow(2, -v);
    if (negative) {
        v *= -1;
    }
    return v;
}

const clamp = (val, min, max) => {
    return Math.max(min, Math.min(max, val));
}


const calPercentage = (a, percentage) => a * percentage;



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _services_game_initializer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./services/game-initializer.js */ "./src/services/game-initializer.js");
/* harmony import */ var _globals_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./globals.js */ "./src/globals.js");
/* harmony import */ var _controls_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./controls.js */ "./src/controls.js");
/* harmony import */ var _extensions_arrays_extensions_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./extensions/arrays-extensions.js */ "./src/extensions/arrays-extensions.js");
/* harmony import */ var _extensions_arrays_extensions_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_extensions_arrays_extensions_js__WEBPACK_IMPORTED_MODULE_3__);





// Main application entry point
function initializeGame() {
    try {
        const canvas = document.getElementById("canvas");
        const gameInitializer = new _services_game_initializer_js__WEBPACK_IMPORTED_MODULE_0__["default"](canvas, window.serverArgs);
        gameInitializer.start();
    } catch (error) {
        console.error("Game Initialization Error:", error);
    }
}

// Ensure DOM is fully loaded before initializing game
document.addEventListener('DOMContentLoaded', initializeGame);
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map