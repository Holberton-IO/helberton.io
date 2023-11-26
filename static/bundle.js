/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _ui_objects_camera_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ui/objects/camera.js */ \"./src/ui/objects/camera.js\");\n/* harmony import */ var _gameEngine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gameEngine */ \"./src/gameEngine.js\");\n/* harmony import */ var _network_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./network/client */ \"./src/network/client.js\");\n/* harmony import */ var _globals_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./globals.js */ \"./src/globals.js\");\n\n\n\n\n\nconst camera = new _ui_objects_camera_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\nconst gameEngine = new _gameEngine__WEBPACK_IMPORTED_MODULE_1__[\"default\"](60);\nwindow.gameEngine = gameEngine;\nwindow.camera = camera;\nwindow.game = gameEngine;\n\n\nlet canvas = document.getElementById(\"canvas\");\nlet ctx = canvas.getContext(\"2d\");\nlet blocks = [];\n\n\n\n\n\nconst draw = () => {\n    gameEngine.scaleCanvas(ctx);\n    ctx.fillStyle = \"#3a3428\";\n    ctx.fillRect(0, 0, canvas.width, canvas.height);\n    camera.loop()\n    gameEngine.camTransform(ctx);\n    for (let b of blocks) {\n        b.draw(ctx, false);\n    }\n\n\n    ctx.restore();\n}\n\n\ngameEngine.setDrawFunction(draw);\nwindow.requestAnimationFrame(gameEngine.loop.bind(gameEngine));\n\nlet client = new _network_client__WEBPACK_IMPORTED_MODULE_2__.Client('ws://127.0.0.1:5000/game', (client) => {\n    client.setPlayerName(\"Test\");\n});\n\n\n\n\n//# sourceURL=webpack:///./src/app.js?");

/***/ }),

/***/ "./src/gameEngine.js":
/*!***************************!*\
  !*** ./src/gameEngine.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/math.js */ \"./src/utils/math.js\");\n/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui/utils.js */ \"./src/ui/utils.js\");\n/* harmony import */ var _gameObjects_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./gameObjects.js */ \"./src/gameObjects.js\");\n\n\n\n\n\n\nclass GameEngine {\n    constructor(fps) {\n        this.lastFrameTimeStamp = 0\n        this.currentFrameTimeStamp = 0\n        this.totalDeltaTimeCap = 0\n        this.fps = fps\n        this.deltaTime = 1000 / this.fps;\n\n\n        this.timesCap = [0, 6.5, 16, 33, 49, 99];\n        this.currentCapIndex = 0;\n\n        this.processFrames = [];\n        this.missedFrames = [];\n\n\n        this.gameObjects = new _gameObjects_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"]();\n\n        this.drawFunction = () => {\n        };\n    }\n\n    setDrawFunction(drawFunction) {\n        this.drawFunction = drawFunction;\n    }\n\n\n    getCap(cap) {\n        return this.timesCap[_utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(cap, 0, this.timesCap.length - 1)];\n    }\n\n    checkIncreasingInFramesProcess() {\n        // This function checks if the game is running at the right speed.\n        // If the game is running too fast, it will decrease the currentCapIndex.\n        // if currentFrameTimeStamp < 90% of the currentCapIndex, then decrease the currentCapIndex.\n        if (this.currentFrameTimeStamp < _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.linearInterpolate(\n            this.getCap(this.currentCapIndex), this.getCap(this.currentCapIndex - 1),\n            0.9\n        )) {\n            this.processFrames.push(Date.now());\n\n            // If Draw More than 190 frames in 10 seconds, then remove the first frame.\n            while (this.processFrames.length > 190) {\n                if (Date.now() - this.processFrames[0] > 10_000) {\n                    this.processFrames.splice(0, 1)\n                } else {\n                    // if first frame happen in less than 10 seconds, decrease the currentCapIndex.\n                    this.currentCapIndex--;\n                    this.processFrames = [];\n                    this.currentCapIndex = _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(this.currentCapIndex, 0, this.timesCap.length - 1);\n                }\n            }\n        }\n    }\n\n    checkDecreaseInFramesProcess() {\n        // This function checks if the game is running at the right speed.\n        // If the game is running too slow, it will increase the currentCapIndex.\n        // if currentFrameTimeStamp > 5% of the currentCapIndex, then increase the currentCapIndex.\n        if (this.currentFrameTimeStamp > _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.linearInterpolate(\n            this.getCap(this.currentCapIndex), this.getCap(this.currentCapIndex + 1),\n            0.05\n        )) {\n            this.missedFrames.push(Date.now());\n            this.processFrames = [];\n            // If Draw Less than 5 frames in 5 seconds, then remove the first frame.\n            while (this.missedFrames.length > 5) {\n                if (Date.now() - this.missedFrames[0] > 5_000) {\n                    this.missedFrames.splice(0, 1)\n                } else {\n                    // if first frame happen in less than 5 seconds, increase the currentCapIndex.\n                    this.currentCapIndex++;\n                    this.missedFrames = [];\n                    this.currentCapIndex = _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(this.currentCapIndex, 0, this.timesCap.length - 1);\n                }\n            }\n        }\n    }\n\n\n    loop(timeStamp) {\n        window.game.timeStamp = timeStamp;\n        this.currentFrameTimeStamp = timeStamp - this.lastFrameTimeStamp; // 16\n        this.checkIncreasingInFramesProcess();\n        this.checkDecreaseInFramesProcess();\n        this.deltaTime = this.currentFrameTimeStamp + this.totalDeltaTimeCap;\n        this.lastFrameTimeStamp = timeStamp;\n        if (this.deltaTime < this.getCap(this.currentCapIndex)) {\n            this.totalDeltaTimeCap += this.currentFrameTimeStamp;\n\n        } else {\n            this.totalDeltaTimeCap = 0;\n            this.drawFunction();\n        }\n        window.requestAnimationFrame(this.loop.bind(this));\n    }\n\n\n\n    camTransform(ctx,changeSize=false)\n    {\n        if(changeSize)\n        {\n            this.scaleCanvas(ctx);\n        }\n\n        ctx.save();\n        let canvas = ctx.canvas;\n        ctx.translate(canvas.width / 2, canvas.height / 2);\n        const camera = window.camera;\n        camera.calZoom(ctx);\n\n\n    }\n\n    scaleCanvas(ctx, w=_ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.getWidth(), h=_ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.getHeight()){\n        let MAX_PIXEL_RATIO = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.calculate_pixel_ratio)();\n        let drawingQuality = 1;\n        let c = ctx.canvas;\n        c.width = w * drawingQuality * MAX_PIXEL_RATIO;\n        c.height = h * drawingQuality * MAX_PIXEL_RATIO;\n        let styleRatio = 1;\n        c.style.width = w * styleRatio + \"px\";\n\t    c.style.height = h * styleRatio + \"px\";\n    }\n\n}\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameEngine);\n\n//# sourceURL=webpack:///./src/gameEngine.js?");

/***/ }),

/***/ "./src/gameObjects.js":
/*!****************************!*\
  !*** ./src/gameObjects.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nclass GameObjects {\n    constructor() {\n        this.players = [];\n        this.blocks = [];\n        this.myPlayer = null;\n        this.mapSize = 0;\n    }\n\n    addMyPlayer(player) {\n        this.myPlayer = player;\n        this.players.push(player);\n    }\n\n\n    addPlayer(player) {\n        this.players.push(player);\n    }\n\n    setBlocks(blocks) {\n        this.blocks = blocks;\n    }\n\n    setPlayers(players) {\n        this.players = players;\n    }\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameObjects);\n\n//# sourceURL=webpack:///./src/gameObjects.js?");

/***/ }),

/***/ "./src/globals.js":
/*!************************!*\
  !*** ./src/globals.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ui/objects/point.js */ \"./src/ui/objects/point.js\");\n\n\nconst globals = {\n    timeStamp: 0,\n    gameSpeed: 0.006,\n    viewPortRadius: 30,\n    maxZoom: 430,\n    maxBlocksNumber: 2500, //1100 50 * 50\n    usernameLength: 6,\n    maxWaitingSocketTime: 1_000,\n    drawingOffset: 10,\n    calDrawingOffset: (p) => {\n        return new _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](p.x * globals.drawingOffset, p.y * globals.drawingOffset);\n    },\n    calBlocksGap: (p, size) => {\n        return new _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](p.x * size, p.y * size);\n    }\n};\n\n\n\n\nwindow.game = {};\n// Adding to window object\nObject.entries(globals).forEach(([key, value]) => {\n    window.game[key] = value;\n});\n\n\n\n//# sourceURL=webpack:///./src/globals.js?");

/***/ }),

/***/ "./src/network/client.js":
/*!*******************************!*\
  !*** ./src/network/client.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Client: () => (/* binding */ Client),\n/* harmony export */   ConnectionStatus: () => (/* binding */ ConnectionStatus),\n/* harmony export */   PlayerStatus: () => (/* binding */ PlayerStatus)\n/* harmony export */ });\n/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./socket.js */ \"./src/network/socket.js\");\n/* harmony import */ var _utils_reader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/reader.js */ \"./src/network/utils/reader.js\");\n/* harmony import */ var _packets_packets__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./packets/packets */ \"./src/network/packets/packets.js\");\n/* harmony import */ var _packets_namePacket_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./packets/namePacket.js */ \"./src/network/packets/namePacket.js\");\n\n\n\n\n\nconst ConnectionStatus = {\n    CONNECTING: 0,\n    OPEN: 1,\n    CLOSING: 2,\n    CLOSED: 3\n};\n\nconst PlayerStatus = {\n    WAITING: -1,\n    CONNECTED: 0,\n    READY: 1,\n    PLAYING: 2,\n    DISCONNECTED: 3\n};\n\n\n\n\n\nclass Client {\n    constructor(server,onConnect, ) {\n        this.server = server;\n        this.ws = new _socket_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](this.server, this);\n        this.ws.iniSocket();\n        this.onConnect = onConnect;\n\n\n        this.connectionStatus = ConnectionStatus.CONNECTING;\n        this.playerStatus = PlayerStatus.WAITING;\n        this.username = \"\";\n\n\n    }\n\n\n    send(packet) {\n        this.ws.send(packet);\n    }\n\n    onReceive(messageEvent) {\n        if (typeof messageEvent.data !== \"object\")\n            return;\n\n        this.packetHandler(messageEvent.data);\n\n\n    }\n\n    onOpen(onOpenEvent) {\n        console.log(\"Connected to server\");\n        console.log(onOpenEvent);\n        this.connectionStatus = ConnectionStatus.OPEN;\n        this.playerStatus = PlayerStatus.CONNECTED;\n        this.onConnect(this);\n        // let p = new namePacket(this.username);\n\n\n\n    }\n\n    onClose(onCloseEvent) {\n        console.log(\"OnClose to server\");\n        console.log(onCloseEvent);\n        this.connectionStatus = ConnectionStatus.CLOSED;\n    }\n\n    packetHandler(data) {\n        let x = new Uint8Array(data);\n        const reader = new _utils_reader_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"](x);\n        const packetSize = reader.readInt2();\n        const packetId = reader.readInt2();\n        const packetClass = _packets_packets__WEBPACK_IMPORTED_MODULE_2__[\"default\"][packetId];\n        const packet = packetClass.parsePacketData(packetSize, reader, packetClass);\n        packet.handleReceivedPacket(packet,this);\n    }\n\n    setPlayerName(name) {\n        let p = new _packets_namePacket_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"](name);\n        this.send(p);\n    }\n\n}\n\n\n\n//# sourceURL=webpack:///./src/network/client.js?");

/***/ }),

/***/ "./src/network/packet.js":
/*!*******************************!*\
  !*** ./src/network/packet.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _utils_reader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/reader.js */ \"./src/network/utils/reader.js\");\n/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/writer.js */ \"./src/network/utils/writer.js\");\n\n\n\nclass Packet {\n    constructor() {\n        this.data = null;\n        this.packetId = -1;\n        this.packetSize = 0;\n        this.reader = null\n    }\n\n\n    setPacketData(data) {\n        this.data = data;\n    }\n\n\n    toHexString(){\n        if(this.reader === null)\n            throw new Error(\"Reader is null\");\n\n        return this.reader.toHexString();\n    }\n\n\n    static parsePacket(p) {\n         throw new Error(\"Not implemented\");\n    }\n\n    static parsePacketData(packetSize,reader,packet) {\n        let p = new packet();\n        p.reader = reader;\n        p.data = reader.data;\n        p.packetSize = packetSize;\n        return packet.parsePacket(p);\n    }\n\n    handleReceivedPacket(packet,client) {\n        throw new Error(\"Not implemented\");\n    }\n\n    finalize() {\n        throw new Error(\"Not implemented\");\n    }\n\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Packet);\n\n//# sourceURL=webpack:///./src/network/packet.js?");

/***/ }),

/***/ "./src/network/packets/namePacket.js":
/*!*******************************************!*\
  !*** ./src/network/packets/namePacket.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ \"./src/network/packet.js\");\n/* harmony import */ var _utils_reader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/reader.js */ \"./src/network/utils/reader.js\");\n/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/writer.js */ \"./src/network/utils/writer.js\");\n/* harmony import */ var _client_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../client.js */ \"./src/network/client.js\");\n/* harmony import */ var _ready__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ready */ \"./src/network/packets/ready.js\");\n\n\n\n\n\n\n\nclass NamePacket extends _packet_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n\n    constructor(name) {\n        super();\n        this.name = name;\n        this.packetId = 1001;\n        this.isVerified = false;\n    }\n\n\n    // Handel Server Response\n    static parsePacket(p) {\n        const nameLength = p.reader.readInt2();\n        p.name = p.reader.readStringFromBytes(nameLength);\n        p.isVerified = p.reader.readInt1() === 1;\n        return p;\n    }\n\n    finalize() {\n        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"](this.packetId);\n        writer.writeStringInBytes(this.name);\n        writer.writeIntInBytes(this.isVerified ? 1 : 0, 1)\n        return writer.finalize();\n    }\n\n\n    handleReceivedPacket(packet, client) {\n        console.log(\"Received Name Packet\");\n        console.log(packet.toHexString());\n        console.log(packet);\n\n        if (packet.isVerified) {\n            client.isVerified = packet.isVerified;\n            client.username = packet.name;\n            client.playerStatus = _client_js__WEBPACK_IMPORTED_MODULE_3__.PlayerStatus.READY;\n            client.send(new _ready__WEBPACK_IMPORTED_MODULE_4__[\"default\"]());\n        }else\n        {\n            //TODO Handle Not Verified Name\n        }\n\n    }\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (NamePacket);\n\n//# sourceURL=webpack:///./src/network/packets/namePacket.js?");

/***/ }),

/***/ "./src/network/packets/packets.js":
/*!****************************************!*\
  !*** ./src/network/packets/packets.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _namePacket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./namePacket */ \"./src/network/packets/namePacket.js\");\n/* harmony import */ var _ready__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ready */ \"./src/network/packets/ready.js\");\n\n\n\nconst PacketsDictionary = {\n    1001: _namePacket__WEBPACK_IMPORTED_MODULE_0__[\"default\"],\n    1002: _ready__WEBPACK_IMPORTED_MODULE_1__[\"default\"]\n}\n\n\n\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PacketsDictionary);\n\n//# sourceURL=webpack:///./src/network/packets/packets.js?");

/***/ }),

/***/ "./src/network/packets/ready.js":
/*!**************************************!*\
  !*** ./src/network/packets/ready.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _packet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../packet.js */ \"./src/network/packet.js\");\n/* harmony import */ var _utils_reader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/reader.js */ \"./src/network/utils/reader.js\");\n/* harmony import */ var _utils_writer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/writer.js */ \"./src/network/utils/writer.js\");\n/* harmony import */ var _client_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../client.js */ \"./src/network/client.js\");\n/* harmony import */ var _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/objects/player.js */ \"./src/ui/objects/player.js\");\n\n\n\n\n\n\nclass Ready extends _packet_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n\n    constructor(userId, mapSize) {\n        super();\n        this.userId = userId;\n        this.packetId = 1002;\n        this.mapSize = mapSize;\n        this.player_name = \"\";\n    }\n\n\n    // Handel Server Response\n    static parsePacket(p) {\n        p.userId = p.reader.readInt4();\n        p.mapSize = p.reader.readInt2();\n        p.player_name = p.reader.readString();\n        return p;\n    }\n\n    finalize() {\n        // Handle Server Request\n        // Send Empty Packet As Ask For Ready\n        const writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"](this.packetId);\n        return writer.finalize();\n    }\n\n\n    handleReceivedPacket(packet, client) {\n        const player = new _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_4__[\"default\"](null, packet.userId);\n        player.isMyPlayer = true;\n        player.name = packet.player_name;\n        window.gameEngine.gameObjects.addMyPlayer(player);\n        window.gameEngine.gameObjects.mapSize = packet.mapSize;\n        console.log(\"Ready\");\n        console.log(window.gameEngine.gameObjects);\n    }\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Ready);\n\n//# sourceURL=webpack:///./src/network/packets/ready.js?");

/***/ }),

/***/ "./src/network/socket.js":
/*!*******************************!*\
  !*** ./src/network/socket.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nclass Socket{\n    constructor(server,client) {\n        this.server = server;\n        this.onReceive = client.onReceive.bind(client);\n        this.onOpen = client.onOpen.bind(client);\n        this.onClose = client.onClose.bind(client);\n        this.ws = null;\n    }\n\n    iniSocket() {\n        this.ws = new WebSocket(this.server);\n        let ws = this.ws;\n        ws.binaryType = \"arraybuffer\";\n        ws.onopen = this.onOpen;\n        ws.onmessage = this.onReceive;\n        ws.onclose = this.onClose;\n    }\n\n    send(packet) {\n        this.ws.send(packet.finalize());\n    }\n\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Socket);\n\n//# sourceURL=webpack:///./src/network/socket.js?");

/***/ }),

/***/ "./src/network/utils/bytesUtils.js":
/*!*****************************************!*\
  !*** ./src/network/utils/bytesUtils.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   bytesToInt: () => (/* binding */ bytesToInt),\n/* harmony export */   intToBytes: () => (/* binding */ intToBytes),\n/* harmony export */   toHexString: () => (/* binding */ toHexString)\n/* harmony export */ });\nconst intToBytes = (value, byteorder = 'little', signed = false, numBytes = 4) => {\n    const littleEndian = (byteorder === 'little');\n    const bytes = new Uint8Array(numBytes);\n    const view = new DataView(bytes.buffer);\n\n    if (signed && value < 0) {\n        // Convert negative value to 2's complement representation\n        value = (1 << (8 * numBytes)) + value;\n    }\n\n    for (let i = 0; i < numBytes; i++) {\n        const shift = littleEndian ? i * 8 : (numBytes - 1 - i) * 8;\n        view.setUint8(i, (value >> shift) & 0xFF);\n    }\n\n    return bytes;\n}\nconst bytesToInt = (bytes, byteorder = 'little', signed = false) => {\n    const view = new DataView(bytes.buffer);\n    const littleEndian = (byteorder === 'little');\n\n    if (bytes.length <= 0 || bytes.length > 8) {\n        throw new Error('Unsupported number of bytes');\n    }\n    let value = 0;\n\n    for (let i = 0; i < bytes.length; i++) {\n        const shift = littleEndian ? i * 8 : (bytes.length - 1 - i) * 8;\n        value |= view.getUint8(i) << shift;\n    }\n    if (signed) {\n        const signBit = 1 << (8 * bytes.length - 1);\n        if (value & signBit) {\n            value = value - (signBit << 1);\n        }\n    }\n    return value;\n}\n\n\nconst toHexString = (data) => {\n    return Array.from(data)\n        .map(byte => '0x' + byte.toString(16).padStart(2, '0'))\n        .join(' ');\n}\n\n\n\n//# sourceURL=webpack:///./src/network/utils/bytesUtils.js?");

/***/ }),

/***/ "./src/network/utils/reader.js":
/*!*************************************!*\
  !*** ./src/network/utils/reader.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bytesUtils.js */ \"./src/network/utils/bytesUtils.js\");\n\n\n\nclass Reader {\n    constructor(data) {\n        this.data = data;\n        this.position = 0;\n    }\n\n    readIntFromBytes(bytesNumber = 2) {\n        const bytes = this.data.slice(this.position, this.position + bytesNumber);\n        this.position += bytesNumber;\n        return (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.bytesToInt)(bytes, 'little', false);\n    }\n\n    readStringFromBytes(stringLength) {\n        const bytes = this.data.slice(this.position, this.position + stringLength);\n        this.position += stringLength;\n        return new TextDecoder().decode(bytes);\n    }\n\n    readString() {\n        const stringLength = this.readInt2();\n        return this.readStringFromBytes(stringLength);\n    }\n\n\n    readInt1() {\n        return this.readIntFromBytes(1);\n    }\n    readInt4() {\n        return this.readIntFromBytes(4);\n    }\n    readInt2() {\n        return this.readIntFromBytes(2);\n    }\n    readInt8() {\n        return this.readIntFromBytes(8);\n    }\n    readInt16() {\n        return this.readIntFromBytes(16);\n    }\n    readInt32() {\n        return this.readIntFromBytes(32);\n    }\n\n\n    toHexString()\n    {\n        return (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.toHexString)(this.data);\n    }\n\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Reader);\n\n//# sourceURL=webpack:///./src/network/utils/reader.js?");

/***/ }),

/***/ "./src/network/utils/writer.js":
/*!*************************************!*\
  !*** ./src/network/utils/writer.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bytesUtils.js */ \"./src/network/utils/bytesUtils.js\");\n\n\nclass Writer {\n    // Infinity\n    constructor(packetId = -1) {\n        this.packetSize = 20;\n        this.packetId = packetId;\n\n        this.data = new Uint8Array(this.packetSize);\n        this.position = 0;\n        this.setPacketId();\n    }\n\n    setPacketId() {\n        this.position = 2;\n        this.writeIntInBytes(this.packetId);\n        this.updatePacketSize()\n\n    }\n\n    updatePacketSize() {\n        this.packetSize = this.position;\n        const currentOffset = this.position;\n        this.position = 0;\n        const b = (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.intToBytes)(this.packetSize, 'little', false, 2);\n        this.data.set(b, this.position);\n        this.position = currentOffset;\n    }\n\n    writeIntInBytes(number, bytesNumber = 2) {\n        let bytes = (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.intToBytes)(number, 'little', false, bytesNumber);\n        this.ensureCapacity(bytesNumber);\n        this.data.set(bytes, this.position);\n        this.position += bytesNumber;\n        this.updatePacketSize();\n    }\n\n\n    writeStringInBytes(string) {\n        let stringLength = string.length;\n        this.writeIntInBytes(stringLength, 2);\n        let bytes = new TextEncoder().encode(string);\n        this.ensureCapacity(stringLength);\n        this.data.set(bytes, this.position);\n        this.position += stringLength;\n        this.updatePacketSize();\n    }\n\n    ensureCapacity(requiredSize) {\n\n        if (this.position + requiredSize > this.data.length) {\n            const newSize = requiredSize + (this.data.length) * 2;\n            const newData = new Uint8Array(newSize);\n            newData.set(this.data);\n            this.data = newData;\n        }\n\n    }\n\n    finalize() {\n        return this.data.slice(0, this.position);\n    }\n\n    toHexString() {\n        return (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.toHexString)(this.finalize());\n    }\n\n\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Writer);\n\n//# sourceURL=webpack:///./src/network/utils/writer.js?");

/***/ }),

/***/ "./src/ui/objects/camera.js":
/*!**********************************!*\
  !*** ./src/ui/objects/camera.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point.js */ \"./src/ui/objects/point.js\");\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ \"./src/ui/utils.js\");\n/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/math.js */ \"./src/utils/math.js\");\n\n\n\n\nclass Camera {\n    constructor() {\n        this.zoom = 5;\n        this.camPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n        this.camRotationOffset = 0;\n        this.camPositionOffset = new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n        this.camPrevPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n\n\n        this.camShakeBuffer = [];\n        //\n    }\n\n\n    // TODO ADD VIEWPORT RADIUS\n    checkObjectInCamera(point) {\n        return (\n            point.x < this.camPosition.x - window.game.viewPortRadius ||\n            point.x > this.camPosition.x + window.game.viewPortRadius ||\n            point.y < this.camPosition.y - window.game.viewPortRadius ||\n            point.y > this.camPosition.y + window.game.viewPortRadius\n        )\n    }\n\n    shakeCamera(p, rotate = true) {\n        this.camShakeBuffer.push([\n            p, 0, !!rotate\n        ]);\n    }\n\n    shakeCameraDirection(dir, amount = 6, rotate = true) {\n        let x, y = 0;\n        switch (dir) {\n            case 0:\n                x = amount;\n                break;\n            case 1:\n                y = amount;\n                break;\n            case 2:\n                x = -amount;\n                break;\n            case 3:\n                y = -amount;\n                break;\n        }\n        this.shakeCamera(new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x, y), rotate);\n    }\n\n    calCameraOffset() {\n        for (let i = this.camShakeBuffer.length - 1; i >= 0; i--) {\n            let shake = this.camShakeBuffer[i];\n            shake[1] = window.gameEngine.deltaTime * 0.003;\n            let shakeTime = shake[1];\n            let shakeTime2 = 0;\n            let shakeTime3 = 0;\n            if (shakeTime < 1) {\n                shakeTime2 = _utils_js__WEBPACK_IMPORTED_MODULE_1__.ease.out(shakeTime);\n                shakeTime3 = _utils_js__WEBPACK_IMPORTED_MODULE_1__.ease.inout(shakeTime);\n\n            } else if (shakeTime < 8) {\n                shakeTime2 = _utils_js__WEBPACK_IMPORTED_MODULE_1__.ease.inout(_utils_math_js__WEBPACK_IMPORTED_MODULE_2__.inverseLinearInterpolate(8, 1, shakeTime));\n                shakeTime3 = _utils_js__WEBPACK_IMPORTED_MODULE_1__.ease.in(_utils_math_js__WEBPACK_IMPORTED_MODULE_2__.inverseLinearInterpolate(8, 1, shakeTime));\n            } else {\n                this.camShakeBuffer.splice(i, 1);\n            }\n            this.camPositionOffset.x += shake[0].x * shakeTime2;\n            this.camPositionOffset.y += shake[0].y * shakeTime2;\n\n            this.camPositionOffset.x += shake[0] * Math.cos(shakeTime * 8) * 0.04 * shakeTime3;\n            this.camPositionOffset.y += shake[0] * Math.cos(shakeTime * 7) * 0.04 * shakeTime3;\n            if (shake[2]) {\n                this.camRotationOffset += Math.cos(shakeTime * 9) * 0.003 * shakeTime3;\n            }\n            console.log( this.camShakeBuffer.length);\n        }\n\n        let limit = 80;\n        let x = this.camPositionOffset.x;\n        let y = this.camPositionOffset.y;\n        x /= limit;\n        y /= limit;\n        x = _utils_math_js__WEBPACK_IMPORTED_MODULE_2__.smoothLimit(x);\n        y = _utils_math_js__WEBPACK_IMPORTED_MODULE_2__.smoothLimit(y);\n        x *= limit;\n        y *= limit;\n        this.camPositionOffset.x = x;\n        this.camPositionOffset.y = y;\n\n    }\n\n    calZoom(ctx) {\n        const canvas = ctx.canvas;\n        const maxDimension = Math.max(canvas.width, canvas.height);\n        const zoomEdge = maxDimension / window.game.maxZoom;\n        const screenPixels = canvas.width * canvas.height;\n        const blockPixels = screenPixels / window.game.maxBlocksNumber;\n        const zoomBlocks = Math.sqrt(blockPixels) / 10;\n        this.zoom = Math.max(zoomEdge, zoomBlocks);\n        ctx.rotate(this.camRotationOffset);\n        ctx.scale(this.zoom, this.zoom);\n\n        ctx.translate(-this.camPrevPosition.x * 10 - this.camPositionOffset.x, -this.camPrevPosition.y * 10 - this.camPositionOffset.y);\n    }\n\n\n    loop() {\n        this.camPrevPosition = this.camPosition;\n        this.calCameraOffset();\n    }\n\n\n}\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Camera);\n\n//# sourceURL=webpack:///./src/ui/objects/camera.js?");

/***/ }),

/***/ "./src/ui/objects/player.js":
/*!**********************************!*\
  !*** ./src/ui/objects/player.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point.js */ \"./src/ui/objects/point.js\");\n/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/math.js */ \"./src/utils/math.js\");\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ \"./src/ui/utils.js\");\n\n\n\n\nclass Player {\n    constructor(position = new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0,0), id) {\n        this.id = id\n        this.position = position\n        this.drawPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](-1, -1);\n        this.drawPosSet = false;\n        this.serverPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0,0);\n        this.dir = 0;\n        this.isMyPlayer = false;\n        this.isDead = false;\n        this.deathWasCertain = false;\n        this.didUncertainDeathLastTick = false;\n        this.isDeathTimer=0;\n        this.uncertainDeathPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0,0);\n        this.deadAnimParts =[];\n        this.deadAnimPartsRandDist =[];\n        this.hitLines =[];\n        this.moveRelativeToServerPosNextFrame =[];\n\n\n\n\n        this.color = \"#ffffff\";\n        this.trails = [];\n        this.name = \"\";\n\n    }\n\n    equals(player){\n        return this.id === player.id;\n    }\n\n    static getPlayerById(id, players){\n        for(let p of players){\n            if(p.id === id)\n                return p;\n        }\n    }\n\n\n\n    drawPlayerTiles(ctx)\n    {\n        if(this.trails.length > 0){\n\n        }\n\n    }\n\n    drawHitLines(ctx) {\n        if (this.hitLines.length <= 0)\n            return;\n\n        \n    }\n\n\n\n    draw(ctx){\n        this.drawPlayerTiles(ctx);\n        this.drawHitLines(ctx);\n\n    }\n\n\n}\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Player);\n\n//# sourceURL=webpack:///./src/ui/objects/player.js?");

/***/ }),

/***/ "./src/ui/objects/point.js":
/*!*********************************!*\
  !*** ./src/ui/objects/point.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nclass Point {\n    constructor(x, y) {\n        this.x = x;\n        this.y = y;\n    }\n\n    equals(otherPoint) {\n        return this.x === otherPoint.x && this.y === otherPoint.y;\n    }\n\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Point);\n\n//# sourceURL=webpack:///./src/ui/objects/point.js?");

/***/ }),

/***/ "./src/ui/utils.js":
/*!*************************!*\
  !*** ./src/ui/utils.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   calculate_pixel_ratio: () => (/* binding */ calculate_pixel_ratio),\n/* harmony export */   drawInCtxRec: () => (/* binding */ drawInCtxRec),\n/* harmony export */   ease: () => (/* binding */ ease),\n/* harmony export */   getHeight: () => (/* binding */ getHeight),\n/* harmony export */   getWidth: () => (/* binding */ getWidth)\n/* harmony export */ });\nconst getHeight = () => window.innerHeight;\nconst getWidth = () => window.innerWidth;\n\nconst calculate_pixel_ratio = () => {\n    let context = document.createElement(\"canvas\").getContext(\"2d\");\n    let dpr = window.devicePixelRatio || 1;\n    let bsr = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;\n    return dpr / bsr;\n}\n\nconst ease = {\n    in: function (t) {\n        return t * t * t * t;\n    },\n    out: function (t) {\n        return 1 - Math.pow(1 - t, 4);\n    },\n    inout: function (t) {\n        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;\n    },\n};\n\n\nconst drawInCtxRec = (ctx, point, size, color, spacing = 0) => {\n    ctx.fillStyle = color;\n    ctx.fillRect(point.x + spacing, point.y + spacing, size , size);\n}\n\n\n\n\n//# sourceURL=webpack:///./src/ui/utils.js?");

/***/ }),

/***/ "./src/utils/math.js":
/*!***************************!*\
  !*** ./src/utils/math.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   adaptedConLinearInterpolate: () => (/* binding */ adaptedConLinearInterpolate),\n/* harmony export */   adaptedLinearInterpolate: () => (/* binding */ adaptedLinearInterpolate),\n/* harmony export */   calPercentage: () => (/* binding */ calPercentage),\n/* harmony export */   clamp: () => (/* binding */ clamp),\n/* harmony export */   inverseLinearInterpolate: () => (/* binding */ inverseLinearInterpolate),\n/* harmony export */   linearInterpolate: () => (/* binding */ linearInterpolate),\n/* harmony export */   smoothLimit: () => (/* binding */ smoothLimit)\n/* harmony export */ });\nconst linearInterpolate = (a, b, v) => {\n    return a + (b - a) * v;\n}\n\n\nconst inverseLinearInterpolate = (a, b, v) => {\n    return (v - a) / (b - a);\n}\n\nconst adaptedLinearInterpolate = (a, b, val1, val2) => {\n    let x = 1 - Math.pow((1 - val1), val2);\n    return linearInterpolate(a, b, x);\n};\n\nconst adaptedConLinearInterpolate = (val2) => (a, b, val1) => {\n    return adaptedLinearInterpolate(a, b, val1, val2);\n}\n\nconst smoothLimit = (v) => {\n    let negative = v < 0;\n    if (negative) {\n        v *= -1;\n    }\n    v = 1 - Math.pow(2, -v);\n    if (negative) {\n        v *= -1;\n    }\n    return v;\n}\n\nconst clamp = (val, min, max) => {\n    return Math.max(min, Math.min(max, val));\n}\n\n\nconst calPercentage = (a, percentage) => a * percentage;\n\n\n\n//# sourceURL=webpack:///./src/utils/math.js?");

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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/app.js");
/******/ 	
/******/ })()
;