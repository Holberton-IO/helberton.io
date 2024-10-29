/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

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
    if(keyVal && window.client && window.client.player){
        const dir = _ui_objects_player__WEBPACK_IMPORTED_MODULE_0__["default"].mapControlsToDir(keyVal);
        window.client.player.requestChangeDir(dir);
    }
};


/***/ }),

/***/ "./src/extensions/arraysExtensions.js":
/*!********************************************!*\
  !*** ./src/extensions/arraysExtensions.js ***!
  \********************************************/
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

/***/ "./src/gameEngine.js":
/*!***************************!*\
  !*** ./src/gameEngine.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/math.js */ "./src/utils/math.js");
/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui/utils.js */ "./src/ui/utils.js");
/* harmony import */ var _gameObjects_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./gameObjects.js */ "./src/gameObjects.js");
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


        this.gameObjects = new _gameObjects_js__WEBPACK_IMPORTED_MODULE_2__["default"]();

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

/***/ "./src/gameObjects.js":
/*!****************************!*\
  !*** ./src/gameObjects.js ***!
  \****************************/
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
        if (player.isMyPlayer)
            this.myPlayer = player;
        else
            player.isReady = true;

        this.players[player.id] = player;
        return player;
    }


    removePlayer(player) {
        if (player.id in this.players)
            delete this.players[player.id];
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
        console.log("Connected to server");
        console.log(onOpenEvent);
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
        console.log("Received Fill Area Packet");

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
    static parsePacket() {
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
        console.log("PlayerState Ready Packet");

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



        if (player.waitingBlocks.length > 0) {
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

        player.waitingBlocks.push({
            vanishTimer: 0,
            blocks: []
        });


    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (StopDrawingWaitingBlocksPacket);

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

                if (player.waitingBlocks.length > 0) {
                    const lastBlock = player.waitingBlocks.getLast;
                    if (lastBlock.blocks.length <= 0 && this.blocks.length > 0) {
                        // this call will cause to replace the waiting blocks with the new blocks coming from server
                        player.requestWaitingBlocks();

                    }
                }
            }
        }


        if (replaceWaitingBlocks) {
            if (player.waitingBlocks.length > 0) {
                const lastBlock = player.waitingBlocks.getLast;
                lastBlock.blocks = [...this.blocks];
                lastBlock.vanishTimer = 0;
            } else {
                replaceWaitingBlocks = false;
            }
        }

        if (!replaceWaitingBlocks) {
            player.waitingBlocks.push({
                vanishTimer: 0,
                blocks: [...this.blocks]
            });
        }

        console.log("Waiting Blocks", [...player.waitingBlocks]);

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

/***/ "./src/network/utils/bytesUtils.js":
/*!*****************************************!*\
  !*** ./src/network/utils/bytesUtils.js ***!
  \*****************************************/
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
/* harmony import */ var _bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bytesUtils.js */ "./src/network/utils/bytesUtils.js");



class Reader {
    constructor(data) {
        this.data = data;
        this.position = 0;
    }

    readIntFromBytes(bytesNumber = 2) {
        const bytes = this.data.slice(this.position, this.position + bytesNumber);
        this.position += bytesNumber;
        return (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.bytesToInt)(bytes, 'little', false);
    }

    readStringFromBytes(stringLength) {
        const bytes = this.data.slice(this.position, this.position + stringLength);
        this.position += stringLength;
        return new TextDecoder().decode(bytes);
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
        return (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.toHexString)(this.data);
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
/* harmony import */ var _bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bytesUtils.js */ "./src/network/utils/bytesUtils.js");


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
        const b = (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.intToBytes)(this.packetSize, 'little', false, 2);
        this.data.set(b, this.position);
        this.position = currentOffset;
    }

    writeIntInBytes(number, bytesNumber = 2) {
        let bytes = (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.intToBytes)(number, 'little', false, bytesNumber);
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
        return (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.toHexString)(this.finalize());
    }


}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Writer);

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


        /////////////////////// SHADOW ////////////////////////
        if (this.animation.progress > .8) {
            _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, darkColor, spacingTwenty);
        }

        ctx.fillStyle = brightColor;
        if (this.animation.progress === 1) {
            _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, brightColor, spacingTen);
        } else if (this.animation.progress < .4) {
            animProgress = this.animation.progress * 2.5;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTwenty, newP.y + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingNinty, spacingTwenty, animProgress));
            ctx.lineTo(newP.x + spacingTwenty, newP.y + spacingNinty);
            ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingNinty);
            ctx.fill();
        } else if (this.animation.progress < 0.8) {
            animProgress = this.animation.progress * 2.5 - 1;
            ctx.beginPath();
            ctx.moveTo(newP.x + spacingTwenty, newP.y + spacingTwenty);
            ctx.lineTo(newP.x + spacingTwenty, newP.y + 9);
            ctx.lineTo(newP.x + spacingNinty, newP.y + spacingNinty);
            ctx.lineTo(newP.x + spacingNinty, newP.y + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingNinty, spacingTwenty, animProgress));
            ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingTwenty);
            ctx.fill();
        } else {

            animProgress = this.animation.progress * 5 - 4;
            _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, brightColor, _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(2, 1, animProgress));
        }
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

    draw(ctx, checkViewport) {
        if (checkViewport && window.camera.checkObjectInCamera(this.position)) {
            console.log("not in camera");
            return;
        }

        let canDraw = this.handleAnimation();
        if (!canDraw) {
            return;
        }

        this.drawBorderBlock(ctx, "#420707", 10);
        this.drawEmptyBlock(ctx, "#2d2926", "#4e463f", 7);
        this.drawRegularBlock(ctx, "#2d2926", "#4e463f", 9);

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


    // TODO ADD VIEWPORT RADIUS
    checkObjectInCamera(point) {
        return (
            point.x < this.camPosition.x - window.game.viewPortRadius ||
            point.x > this.camPosition.x + window.game.viewPortRadius ||
            point.y < this.camPosition.y - window.game.viewPortRadius ||
            point.y > this.camPosition.y + window.game.viewPortRadius
        )
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








class Player {

    constructor(position = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](1, 1), id) {
        this.id = id
        this.drawPosSet = false; // from PlayerState Packet

        this.isMyPlayer = false;
        this.deathWasCertain = false;
        this.didUncertainDeathLastTick = false;
        this.isDeathTimer = 0;
        this.uncertainDeathPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
        this.deadAnimParts = [];
        this.deadAnimPartsRandDist = [];
        this.hitLines = [];

        this.position = position
        this.drawPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](-1, -1);
        this.serverPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
        this.lastChangedDirPos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);


        this.name = "";


        // Colors
        this.colorBrighter = 0;
        this.colorDarker = 0;
        this.colorSlightlyBrighter = 0
        this.colorPattern = 0
        this.colorPatternEdge = 0


        // Movements
        this.hasReceivedPosition = false; // from PlayerState Packet it set position
        this.moveRelativeToServerPosNextFrame = false; // from PlayerState Packet
        this.lastServerPosSentTime = 0;


        this.isReady = false;
        this.isDead = false;

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

        this.serverPos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
        this.serverDir = '';


        this.waitingForPing = false;
        this.lastPingTime = 0;
        this.severLastPing = 0;
        this.serverAvgPing = 0;
        this.serverDiffPing = 0;


        this.isGettingWaitingBlocks = false;
        this.skipGettingWaitingBlocksRespose = false;
        this.waitingPushedDuringReceiving = [];


        // animation and drawing
        this.nameAlphaTimer = 0;
        this.isDeadTimer = 0;

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


        console.log("Position Passed")
        // Check If Last Direction Complete passed .55 Of Current Block
        let changeDirectionCurrentFrame = false;

        const blockProgress = valueToRound - Math.floor(valueToRound);
        if (_utils_js__WEBPACK_IMPORTED_MODULE_2__.isMovingToPositiveDir(dir)) {
            if (blockProgress < .45)
                changeDirectionCurrentFrame = true;
        } else if (blockProgress > .55)
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
/* harmony import */ var _ui_objects_camera_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ui/objects/camera.js */ "./src/ui/objects/camera.js");
/* harmony import */ var _gameEngine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gameEngine */ "./src/gameEngine.js");
/* harmony import */ var _network_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./network/client */ "./src/network/client.js");
/* harmony import */ var _globals_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./globals.js */ "./src/globals.js");
/* harmony import */ var _controls_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./controls.js */ "./src/controls.js");
/* harmony import */ var _extensions_arraysExtensions_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./extensions/arraysExtensions.js */ "./src/extensions/arraysExtensions.js");
/* harmony import */ var _extensions_arraysExtensions_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_extensions_arraysExtensions_js__WEBPACK_IMPORTED_MODULE_5__);








const camera = new _ui_objects_camera_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
const gameEngine = new _gameEngine__WEBPACK_IMPORTED_MODULE_1__["default"](60);

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let blocks = gameEngine.gameObjects.blocks;
let players = gameEngine.gameObjects.players;

let helperCanvas = document.createElement("canvas");
let helperCtx = helperCanvas.getContext("2d");

window.game.helperCtx = helperCtx;
window.gameEngine = gameEngine;
window.camera = camera;
window.game.canvas = canvas;

let client = null;
let myPlayer = null;

const draw = () => {
    if (client && client.player) myPlayer = client.player;

    gameEngine.scaleCanvas(ctx);
    ctx.fillStyle = "#3a3428";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    camera.loop()
    gameEngine.camTransform(ctx);


    // console.log("Blocks: " + blocks.length);
    for (let b of blocks) {
        b.draw(ctx, false);
    }

    for (let p in players) {
        players[p].draw(ctx);
    }

    if (client && client.player) myPlayer.removeBlocksOutsideCamera();

}


gameEngine.setDrawFunction(draw);


window.requestAnimationFrame(gameEngine.loop.bind(gameEngine));

client = new _network_client__WEBPACK_IMPORTED_MODULE_2__.Client('ws://127.0.0.1:5000/game', (client) => {
    client.setPlayerName("Test");
});



})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map