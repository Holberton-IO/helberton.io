/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/controls.js":
/*!*************************!*\
  !*** ./src/controls.js ***!
  \*************************/
/***/ (() => {

var keyMapper = {
  //In Circle Way
  ArrowUp: 1,
  ArrowDown: 3,
  ArrowLeft: 4,
  ArrowRight: 2
};
window.onkeyup = function (e) {
  //console.log(keyMapper[e.key]);
  var keyVal = keyMapper[e.key];
  if (keyVal && window.client && window.client.player) {
    window.client.player.requestChangeDir(keyVal);
  }
};

/***/ }),

/***/ "./src/extensions/arraysExtensions.js":
/*!********************************************!*\
  !*** ./src/extensions/arraysExtensions.js ***!
  \********************************************/
/***/ (() => {

Object.defineProperty(Array.prototype, 'getLast', {
  get: function get() {
    if (this.length === 0) {
      throw new Error("No elements in array");
    }
    return this[this.length - 1];
  }
});
Object.defineProperty(Array.prototype, 'first', {
  get: function get() {
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }





var GameEngine = /*#__PURE__*/function () {
  function GameEngine(fps) {
    _classCallCheck(this, GameEngine);
    this.lastFrameTimeStamp = 0;
    this.currentFrameTimeStamp = 0;
    this.totalDeltaTimeCap = 0;
    this.fps = fps;
    this.deltaTime = 1000 / this.fps;
    this.interpoatedDeltaTime = 1000 / this.fps;
    this.timesCap = [0, 6.5, 16, 33, 49, 99];
    this.currentCapIndex = 0;
    this.processFrames = [];
    this.missedFrames = [];
    this.canvanQaulity = 1;
    this.gameObjects = new _gameObjects_js__WEBPACK_IMPORTED_MODULE_2__["default"]();
    this.drawFunction = function () {};
  }
  return _createClass(GameEngine, [{
    key: "setDrawFunction",
    value: function setDrawFunction(drawFunction) {
      this.drawFunction = drawFunction;
    }
  }, {
    key: "getCap",
    value: function getCap(cap) {
      return this.timesCap[_utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(cap, 0, this.timesCap.length - 1)];
    }
  }, {
    key: "checkIncreasingInFramesProcess",
    value: function checkIncreasingInFramesProcess() {
      // This function checks if the game is running at the right speed.
      // If the game is running too fast, it will decrease the currentCapIndex.
      // if currentFrameTimeStamp < 90% of the currentCapIndex, then decrease the currentCapIndex.
      if (this.currentFrameTimeStamp < _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.linearInterpolate(this.getCap(this.currentCapIndex), this.getCap(this.currentCapIndex - 1), 0.9)) {
        this.processFrames.push(Date.now());

        // If Draw More than 190 frames in 10 seconds, then remove the first frame.
        while (this.processFrames.length > 190) {
          if (Date.now() - this.processFrames[0] > 10000) {
            this.processFrames.splice(0, 1);
          } else {
            // if first frame happen in less than 10 seconds, decrease the currentCapIndex.
            this.currentCapIndex--;
            this.processFrames = [];
            this.currentCapIndex = _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(this.currentCapIndex, 0, this.timesCap.length - 1);
          }
        }
      }
    }
  }, {
    key: "checkDecreaseInFramesProcess",
    value: function checkDecreaseInFramesProcess() {
      // This function checks if the game is running at the right speed.
      // If the game is running too slow, it will increase the currentCapIndex.
      // if currentFrameTimeStamp > 5% of the currentCapIndex, then increase the currentCapIndex.
      if (this.currentFrameTimeStamp > _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.linearInterpolate(this.getCap(this.currentCapIndex), this.getCap(this.currentCapIndex + 1), 0.05)) {
        this.missedFrames.push(Date.now());
        this.processFrames = [];
        // If Draw Less than 5 frames in 5 seconds, then remove the first frame.
        while (this.missedFrames.length > 5) {
          if (Date.now() - this.missedFrames[0] > 5000) {
            this.missedFrames.splice(0, 1);
          } else {
            // if first frame happen in less than 5 seconds, increase the currentCapIndex.
            this.currentCapIndex++;
            this.missedFrames = [];
            this.currentCapIndex = _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(this.currentCapIndex, 0, this.timesCap.length - 1);
          }
        }
      }
    }
  }, {
    key: "handleServerTiming",
    value: function handleServerTiming(timeStamp) {
      if (!window.client || !window.client.player) return;
      var myPlayer = window.client.player;
      var maxWaitTimeForDisconnect = window.game.maxWaitingSocketTime;
      var clientSideSetPosPassedTime = Date.now() - myPlayer.lastMyPostSetClientSendTime;
      var lastConfirmationPassedTime = Date.now() - myPlayer.lastConfirmedTimeForPos;
      var serverSideSetPosPassed = Date.now() - myPlayer.lastPosServerSentTime;
      var timeTookToConfirmation = serverSideSetPosPassed - clientSideSetPosPassedTime;

      // console.log(`Last Confirmation Passed Time: ${lastConfirmationPassedTime}ms`);
      // console.log(`Time Took To Confirmation: ${timeTookToConfirmation}ms`);
      if (lastConfirmationPassedTime > maxWaitTimeForDisconnect && timeTookToConfirmation > maxWaitTimeForDisconnect) {
        console.log("Check Your Internet Connection");
      } else {}
      var maxPingTime = myPlayer.waitingForPing ? 10000 : 5000;
      var pingPassedTime = Date.now() - myPlayer.lastPingTime;
      if (pingPassedTime > maxPingTime) {
        myPlayer.waitingForPing = true;
        myPlayer.lastPingTime = Date.now();
        var pingPacket = new _network_packets_ping__WEBPACK_IMPORTED_MODULE_3__["default"]();
        window.client.send(pingPacket);
      }
    }
  }, {
    key: "loop",
    value: function loop(timeStamp) {
      window.game.timeStamp = timeStamp;
      this.currentFrameTimeStamp = timeStamp - this.lastFrameTimeStamp; // 16

      if (this.currentFrameTimeStamp > this.interpoatedDeltaTime) {
        this.interpoatedDeltaTime = this.currentFrameTimeStamp;
      } else {
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
  }, {
    key: "camTransform",
    value: function camTransform(ctx) {
      var changeSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (changeSize) {
        this.scaleCanvas(ctx);
      }
      ctx.save();
      var camera = window.camera;
      camera.calZoom(ctx);
    }
  }, {
    key: "scaleCanvas",
    value: function scaleCanvas(ctx) {
      var w = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.getWidth();
      var h = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.getHeight();
      var MAX_PIXEL_RATIO = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.calculate_pixel_ratio)();
      var drawingQuality = 1;
      var c = ctx.canvas;
      c.width = w * drawingQuality * MAX_PIXEL_RATIO;
      c.height = h * drawingQuality * MAX_PIXEL_RATIO;
      var styleRatio = 1;
      c.style.width = w * styleRatio + "px";
      c.style.height = h * styleRatio + "px";
    }
  }]);
}();
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var GameObjects = /*#__PURE__*/function () {
  function GameObjects() {
    _classCallCheck(this, GameObjects);
    this.players = {};
    this.blocks = [];
    this.myPlayer = null;
    this.mapSize = 0;
  }
  return _createClass(GameObjects, [{
    key: "addPlayer",
    value: function addPlayer(player) {
      console.log(this.players);
      console.log(player);
      console.log("On Add Player");
      if (player.id in this.players) return this.players[player.id];
      if (player.isMyPlayer) this.myPlayer = player;else player.isReady = true;
      this.players[player.id] = player;
      return player;
    }
  }, {
    key: "removePlayer",
    value: function removePlayer(player) {
      if (player.id in this.players) delete this.players[player.id];
    }
  }, {
    key: "addBlock",
    value: function addBlock(block) {
      return _ui_objects_block_js__WEBPACK_IMPORTED_MODULE_0__["default"].getBlockAt(block.position, this.blocks);
    }
  }]);
}();
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
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }

var globals = {
  timeStamp: 0,
  gameSpeed: 0.006,
  viewPortRadius: 30,
  maxZoom: 430,
  maxBlocksNumber: 2500,
  //1100 50 * 50
  usernameLength: 6,
  maxWaitingSocketTime: 1000,
  drawingOffset: 10,
  calDrawingOffset: function calDrawingOffset(p) {
    return new _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_0__["default"](p.x * globals.drawingOffset, p.y * globals.drawingOffset);
  },
  calBlocksGap: function calBlocksGap(p, size) {
    return new _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_0__["default"](p.x * size, p.y * size);
  }
};
window.game = {};
// Adding to window object
Object.entries(globals).forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
    key = _ref2[0],
    value = _ref2[1];
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }




var ConnectionStatus = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};
var PlayerStatus = {
  WAITING: -1,
  CONNECTED: 0,
  READY: 1,
  PLAYING: 2,
  DISCONNECTED: 3
};
var Client = /*#__PURE__*/function () {
  function Client(server, onConnect) {
    _classCallCheck(this, Client);
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
  return _createClass(Client, [{
    key: "send",
    value: function send(packet) {
      console.log("Sending Packet ->>>>>" + packet.constructor.name);
      this.ws.send(packet);
    }
  }, {
    key: "onReceive",
    value: function onReceive(messageEvent) {
      if (_typeof(messageEvent.data) !== "object") return;
      this.packetHandler(messageEvent.data);
    }
  }, {
    key: "onOpen",
    value: function onOpen(onOpenEvent) {
      console.log("Connected to server");
      console.log(onOpenEvent);
      this.connectionStatus = ConnectionStatus.OPEN;
      this.playerStatus = PlayerStatus.CONNECTED;
      this.onConnect(this);
    }
  }, {
    key: "onClose",
    value: function onClose(onCloseEvent) {
      console.log("OnClose to server");
      console.log(onCloseEvent);
      this.connectionStatus = ConnectionStatus.CLOSED;
    }
  }, {
    key: "packetHandler",
    value: function packetHandler(data) {
      var x = new Uint8Array(data);
      var reader = new _utils_reader_js__WEBPACK_IMPORTED_MODULE_1__["default"](x);
      var packetSize = reader.readInt2();
      var packetId = reader.readInt2();
      var packetClass = _packets_packets__WEBPACK_IMPORTED_MODULE_2__["default"][packetId];
      var packet = packetClass.parsePacketData(packetSize, reader, packetClass);
      packet.handleReceivedPacket(this);
    }
  }, {
    key: "setPlayerName",
    value: function setPlayerName(name) {
      var p = new _packets_namePacket_js__WEBPACK_IMPORTED_MODULE_3__["default"](name);
      this.send(p);
    }
  }]);
}();


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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


var Packet = /*#__PURE__*/function () {
  function Packet() {
    _classCallCheck(this, Packet);
    this.data = null;
    this.packetId = -1;
    this.packetSize = 0;
    this.reader = null;
  }
  return _createClass(Packet, [{
    key: "setPacketData",
    value: function setPacketData(data) {
      this.data = data;
    }
  }, {
    key: "toHexString",
    value: function toHexString() {
      if (this.reader === null) throw new Error("Reader is null");
      return this.reader.toHexString();
    }
  }, {
    key: "parsePacket",
    value: function parsePacket() {
      throw new Error("Not implemented");
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {
      throw new Error("Not implemented");
    }
  }, {
    key: "finalize",
    value: function finalize() {
      throw new Error("Not implemented");
    }
  }], [{
    key: "parsePacketData",
    value: function parsePacketData(packetSize, reader, packet) {
      var p = new packet();
      console.log("Received Packet <-----: " + p.constructor.name);
      p.reader = reader;
      p.data = reader.data;
      p.packetSize = packetSize;
      p.parsePacket();
      return p;
    }
  }]);
}();
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }





var DirectionPacket = /*#__PURE__*/function (_Packet) {
  function DirectionPacket(direction, position) {
    var _this;
    _classCallCheck(this, DirectionPacket);
    _this = _callSuper(this, DirectionPacket);
    _this.dir = direction;
    _this.packetId = 1006;
    _this.position = position;
    return _this;
  }

  // Handel Server Response
  _inherits(DirectionPacket, _Packet);
  return _createClass(DirectionPacket, [{
    key: "parsePacket",
    value: function parsePacket() {}
  }, {
    key: "finalize",
    value: function finalize() {
      // Handle Server Request
      // Send Empty Packet As Ask For Ready
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
      writer.writeStringInBytes(this.dir);
      writer.writeIntInBytes(this.position.x, 2);
      writer.writeIntInBytes(this.position.y, 2);
      return writer.finalize();
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {}
  }]);
}(_packet_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }







var FillAreaPacket = /*#__PURE__*/function (_Packet) {
  function FillAreaPacket() {
    var _this;
    _classCallCheck(this, FillAreaPacket);
    _this = _callSuper(this, FillAreaPacket);
    _this.packetId = 1003;
    // Shape
    _this.rectangle = null;
    _this.width = 0;
    _this.height = 0;
    _this.x = 0;
    _this.y = 0;

    // Colors
    _this.colorBrighter = 0;
    _this.colorDarker = 0;
    _this.colorSlightlyBrighter = 0;
    _this.colorPattern = 0;
    _this.colorPatternEdge = 0;
    _this.playerId = 0;
    return _this;
  }
  _inherits(FillAreaPacket, _Packet);
  return _createClass(FillAreaPacket, [{
    key: "finalize",
    value: function finalize() {
      // Handle Server Request
      // Send Empty Packet As Ask For Ready
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_2__["default"](this.packetId);
      return writer.finalize();
    }
  }, {
    key: "parsePacket",
    value: function parsePacket() {
      var reader = this.reader;
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
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {
      console.log("Received Fill Area Packet");
      var colorsWithId = {
        brighter: this.colorBrighter,
        darker: this.colorDarker,
        slightlyBrighter: this.colorSlightlyBrighter,
        pattern: this.colorPattern,
        patternEdge: this.colorPatternEdge,
        id: this.playerId
      };
      _ui_objects_block__WEBPACK_IMPORTED_MODULE_6__["default"].convertRectToBlock(this.rectangle, colorsWithId, window.gameEngine.gameObjects.blocks, window.gameEngine.gameObjects.myPlayer);
    }
  }]);
}(_packet__WEBPACK_IMPORTED_MODULE_0__["default"]);
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }







var NamePacket = /*#__PURE__*/function (_Packet) {
  function NamePacket(name) {
    var _this;
    _classCallCheck(this, NamePacket);
    _this = _callSuper(this, NamePacket);
    _this.name = name;
    _this.packetId = 1001;
    _this.isVerified = false;
    _this.userId = 0;
    return _this;
  }

  // Handel Server Response
  _inherits(NamePacket, _Packet);
  return _createClass(NamePacket, [{
    key: "parsePacket",
    value: function parsePacket() {
      var nameLength = this.reader.readInt2();
      this.name = this.reader.readStringFromBytes(nameLength);
      this.userId = this.reader.readInt4();
      this.isVerified = this.reader.readInt1() === 1;
    }
  }, {
    key: "finalize",
    value: function finalize() {
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_2__["default"](this.packetId);
      writer.writeStringInBytes(this.name);
      writer.writeIntInBytes(this.isVerified ? 1 : 0, 1);
      return writer.finalize();
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {
      console.log("Received Name Packet");
      if (this.isVerified) {
        var player = new _ui_objects_player__WEBPACK_IMPORTED_MODULE_5__["default"](new _ui_objects_point__WEBPACK_IMPORTED_MODULE_6__["default"](0, 0), this.userId);
        player.isMyPlayer = true;
        client.player = player;
        client.isVerified = this.isVerified;
        client.username = this.name;
        client.playerStatus = _client_js__WEBPACK_IMPORTED_MODULE_3__.PlayerStatus.READY;
        window.gameEngine.gameObjects.addPlayer(player);
        client.send(new _ready__WEBPACK_IMPORTED_MODULE_4__["default"]());
      } else {
        //TODO Handle Not Verified Name
      }
    }
  }]);
}(_packet_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
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











var PacketsDictionary = {
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
  1011: _stopDrawingWaitingBlocks__WEBPACK_IMPORTED_MODULE_10__["default"]
};
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }





var PingPacket = /*#__PURE__*/function (_Packet) {
  function PingPacket() {
    var _this;
    _classCallCheck(this, PingPacket);
    _this = _callSuper(this, PingPacket);
    _this.packetId = 1007;
    return _this;
  }

  // Handel Server Response
  _inherits(PingPacket, _Packet);
  return _createClass(PingPacket, [{
    key: "parsePacket",
    value: function parsePacket() {}
  }, {
    key: "finalize",
    value: function finalize() {
      // Handle Server Request
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
      return writer.finalize();
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {}
  }]);
}(_packet_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }





var PlayerRemovedPacket = /*#__PURE__*/function (_Packet) {
  function PlayerRemovedPacket() {
    var _this;
    _classCallCheck(this, PlayerRemovedPacket);
    _this = _callSuper(this, PlayerRemovedPacket);
    _this.userId = null;
    _this.packetId = 1010;
    _this.player = null;
    return _this;
  }

  // Handel Server Response
  _inherits(PlayerRemovedPacket, _Packet);
  return _createClass(PlayerRemovedPacket, [{
    key: "finalize",
    value: function finalize() {
      // Handle Server Request
      // Send Empty Packet As Ask For Ready
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
      return writer.finalize();
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {
      var player = window.gameEngine.gameObjects.players[this.userId];
      if (player) window.gameEngine.gameObjects.removePlayer(player);
    }
  }], [{
    key: "parsePacket",
    value: function parsePacket() {
      this.userId = this.reader.readInt4();
    }
  }]);
}(_packet_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }





var PlayerStatePacket = /*#__PURE__*/function (_Packet) {
  function PlayerStatePacket(userId, mapSize) {
    var _this;
    _classCallCheck(this, PlayerStatePacket);
    _this = _callSuper(this, PlayerStatePacket);
    _this.userId = userId;
    _this.packetId = 1004;
    _this.player = null;
    return _this;
  }

  // Handel Server Response
  _inherits(PlayerStatePacket, _Packet);
  return _createClass(PlayerStatePacket, [{
    key: "parsePacket",
    value: function parsePacket() {
      var reader = this.reader;
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
  }, {
    key: "finalize",
    value: function finalize() {
      // Handle Server Request
      // Send Empty Packet As Ask For Ready
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
      return writer.finalize();
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {
      console.log("PlayerState Ready Packet");
      var myPlayer = client.player;
      var player = new _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__["default"](new _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__["default"](0, 0), this.userId);
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
      var offset = player.calMoveOffset();
      var newPos = new _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__["default"](this.playerX, this.playerY);
      var newPosOffset = newPos.clone();
      var newDir = this.direction;
      newPosOffset = _ui_objects_player_js__WEBPACK_IMPORTED_MODULE_2__["default"].movePlayer(newPosOffset, newDir, offset);
      var serverSyncedWithClient = true;
      if (player.isMyPlayer) {
        player.lastPosServerSentTime = Date.now();

        // Check If Server Synced With Client
        // To Draw This Movement or Ignore It
        // if server predict the same movement
        // or the movement is to close to server
        serverSyncedWithClient = player.checkClientMovementSyncedWithServer(newDir, newPosOffset, newPos);
        if (serverSyncedWithClient) {
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
      if (serverSyncedWithClient) {
        player.position = newPosOffset.clone();
        player.addWaitingBlocks(newPos);
      }

      //Start To Handel Draw Position
      if (!player.drawPosSet) {
        player.drawPosSet = true;
        player.drawPosition = player.position.clone();
      }
    }
  }]);
}(_packet_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }






var PongPacket = /*#__PURE__*/function (_Packet) {
  function PongPacket() {
    var _this;
    _classCallCheck(this, PongPacket);
    _this = _callSuper(this, PongPacket);
    _this.packetId = 1008;
    return _this;
  }

  // Handel Server Response
  _inherits(PongPacket, _Packet);
  return _createClass(PongPacket, [{
    key: "parsePacket",
    value: function parsePacket() {}
  }, {
    key: "finalize",
    value: function finalize() {
      // Handle Server Request
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
      return writer.finalize();
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {
      var myPlayer = client.player;
      var ping = Date.now() - myPlayer.lastPingTime;
      var currentPingDiff = Math.abs(ping - myPlayer.severLastPing);
      myPlayer.serverPingDiff = Math.max(myPlayer.serverPingDiff, currentPingDiff);
      myPlayer.serverPingDiff = _utils_math__WEBPACK_IMPORTED_MODULE_5__.linearInterpolate(currentPingDiff, myPlayer.serverPingDiff, 0.5);
      myPlayer.serverAvgPing = _utils_math__WEBPACK_IMPORTED_MODULE_5__.linearInterpolate(myPlayer.serverAvgPing, ping, 0.5);
      myPlayer.severLastPing = ping;
      myPlayer.lastPingTime = Date.now();
      myPlayer.waitingForPing = false;
    }
  }]);
}(_packet_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }





var Ready = /*#__PURE__*/function (_Packet) {
  function Ready(userId, mapSize) {
    var _this;
    _classCallCheck(this, Ready);
    _this = _callSuper(this, Ready);
    _this.userId = userId;
    _this.packetId = 1002;
    _this.mapSize = mapSize;
    _this.playerName = "";
    _this.playerX = 0;
    _this.playerY = 0;
    _this.direction = 0;

    // Colors
    _this.colorBrighter = 0;
    _this.colorDarker = 0;
    _this.colorSlightlyBrighter = 0;
    _this.colorPattern = 0;
    _this.colorPatternEdge = 0;
    return _this;
  }

  // Handel Server Response
  _inherits(Ready, _Packet);
  return _createClass(Ready, [{
    key: "parsePacket",
    value: function parsePacket() {
      var reader = this.reader;
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
  }, {
    key: "finalize",
    value: function finalize() {
      // Handle Server Request
      // Send Empty Packet As Ask For Ready
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
      return writer.finalize();
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {
      console.log("Received Ready Packet");
      var player = client.player;
      player.name = this.playerName;
      player.colorBrighter = this.colorBrighter;
      player.colorDarker = this.colorDarker;
      player.colorSlightlyBrighter = this.colorSlightlyBrighter;
      player.colorPattern = this.colorPattern;
      player.colorPatternEdge = this.colorPatternEdge;
      // player.position = new Point(packet.playerX, packet.playerY);
      // player.dir = packet.direction;
      console.log("READY", player);
      window.gameEngine.gameObjects.mapSize = this.mapSize;
      player.isReady = true;
      console.log(window.gameEngine.gameObjects);
    }
  }]);
}(_packet_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }


var RequestWaitingBlockPacket = /*#__PURE__*/function (_Packet) {
  function RequestWaitingBlockPacket() {
    var _this;
    _classCallCheck(this, RequestWaitingBlockPacket);
    _this = _callSuper(this, RequestWaitingBlockPacket);
    _this.packetId = 1009;
    return _this;
  }

  // Handel Server Response
  _inherits(RequestWaitingBlockPacket, _Packet);
  return _createClass(RequestWaitingBlockPacket, [{
    key: "parsePacket",
    value: function parsePacket() {}
  }, {
    key: "finalize",
    value: function finalize() {
      // Handle Server Request
      // Send Empty Packet As Ask For Ready
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
      return writer.finalize();
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {
      console.log("RequestWaitingBlockPacket", this);
    }
  }]);
}(_packet_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }



var StopDrawingWaitingBlocksPacket = /*#__PURE__*/function (_Packet) {
  function StopDrawingWaitingBlocksPacket() {
    var _this;
    _classCallCheck(this, StopDrawingWaitingBlocksPacket);
    _this = _callSuper(this, StopDrawingWaitingBlocksPacket);
    _this.packetId = 1011;
    _this.player = null;
    _this.userId = null;
    _this.lastBlock = null;
    return _this;
  }

  // Handel Server Response
  _inherits(StopDrawingWaitingBlocksPacket, _Packet);
  return _createClass(StopDrawingWaitingBlocksPacket, [{
    key: "parsePacket",
    value: function parsePacket() {
      this.userId = this.reader.readInt4();
      var vec = new _ui_objects_point__WEBPACK_IMPORTED_MODULE_2__["default"](this.reader.readInt2(), this.reader.readInt2());
      this.lastBlock = vec;
    }
  }, {
    key: "finalize",
    value: function finalize() {
      // Handle Server Request
      // Send Empty Packet As Ask For Ready
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
      return writer.finalize();
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {
      var playerList = window.gameEngine.gameObjects.players;
      var player = null;
      if (this.userId in playerList) {
        player = playerList[this.userId];
      } else {
        throw new Error("Player Not Found We Need To Send Player Colors");
      }
      if (player.waitingBlocks.length > 0) {
        var playerWaitingBlocks = player.waitingBlocks.getLast.blocks;
        if (playerWaitingBlocks.length > 0) {
          playerWaitingBlocks.push(this.lastBlock);
        }
      }
      if (player.isMyPlayer && player.isGettingWaitingBlocks) {
        player.skipGettingWaitingBlocksRespose = true;
      }
      player.waitingBlocks.push({
        vanishTimer: 0,
        blocks: []
      });
    }
  }]);
}(_packet_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }





var WaitingBlocksPacket = /*#__PURE__*/function (_Packet) {
  function WaitingBlocksPacket() {
    var _this;
    _classCallCheck(this, WaitingBlocksPacket);
    _this = _callSuper(this, WaitingBlocksPacket);
    _this.packetId = 1005;
    _this.player = null;
    _this.userId = null;
    _this.blocks = [];
    return _this;
  }

  // Handel Server Response
  _inherits(WaitingBlocksPacket, _Packet);
  return _createClass(WaitingBlocksPacket, [{
    key: "parsePacket",
    value: function parsePacket() {
      var reader = this.reader;
      this.userId = reader.readInt4();
      var blocksCount = reader.readInt2();
      for (var i = 0; i < blocksCount; i++) {
        var vec = new _ui_objects_point__WEBPACK_IMPORTED_MODULE_4__["default"](reader.readInt2(), reader.readInt2());
        this.blocks.push(vec);
      }
    }
  }, {
    key: "finalize",
    value: function finalize() {
      // Handle Server Request
      // Send Empty Packet As Ask For Ready
      var writer = new _utils_writer_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.packetId);
      return writer.finalize();
    }
  }, {
    key: "handleReceivedPacket",
    value: function handleReceivedPacket(client) {
      var playerList = window.gameEngine.gameObjects.players;
      var player = null;
      if (this.userId in playerList) {
        player = playerList[this.userId];
      } else {
        throw new Error("Player Not Found We Need To Send Player Colors");
      }
      var replaceStack = false;
      if (player.isMyPlayer) {
        if (player.skipGettingWaitingBlocksRespose) {
          player.skipGettingWaitingBlocksRespose = false;
          player.waitingPushedDuringReceiving = [];
        } else {
          // If Player Requesting Waiting Blocks vai RequestWaitingBlocks Packet
          if (player.isGettingWaitingBlocks) {
            player.isGettingWaitingBlocks = false;
            replaceStack = true;
            for (var i = 0; i < player.waitingPushedDuringReceiving.length; i++) {
              var vec = player.waitingPushedDuringReceiving[i];
              this.blocks.push(vec);
            }
            player.waitingPushedDuringReceiving = [];
          }
          if (player.waitingBlocks.length > 0) {
            var lastBlock = player.waitingBlocks[player.waitingBlocks.length - 1];
            if (lastBlock.blocks.length <= 0 && this.blocks.length > 0) {
              player.requestWaitingBlocks();
            }
          }
        }
      }
      if (replaceStack) {
        if (player.waitingBlocks.length > 0) {
          var _lastBlock = player.waitingBlocks[player.waitingBlocks.length - 1];
          _lastBlock.blocks = this.blocks;
          _lastBlock.vanishTimer = 0;
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
      console.log("Waiting Blocks", _toConsumableArray(player.waitingBlocks));
    }
  }]);
}(_packet_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Socket = /*#__PURE__*/function () {
  function Socket(server, client) {
    _classCallCheck(this, Socket);
    this.server = server;
    this.onReceive = client.onReceive.bind(client);
    this.onOpen = client.onOpen.bind(client);
    this.onClose = client.onClose.bind(client);
    this.ws = null;
  }
  return _createClass(Socket, [{
    key: "iniSocket",
    value: function iniSocket() {
      this.ws = new WebSocket(this.server);
      var ws = this.ws;
      ws.binaryType = "arraybuffer";
      ws.onopen = this.onOpen;
      ws.onmessage = this.onReceive;
      ws.onclose = this.onClose;
    }
  }, {
    key: "send",
    value: function send(packet) {
      this.ws.send(packet.finalize());
    }
  }]);
}();
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
var intToBytes = function intToBytes(value) {
  var byteorder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'little';
  var signed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var numBytes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 4;
  var littleEndian = byteorder === 'little';
  var bytes = new Uint8Array(numBytes);
  var view = new DataView(bytes.buffer);
  if (signed && value < 0) {
    // Convert negative value to 2's complement representation
    value = (1 << 8 * numBytes) + value;
  }
  for (var i = 0; i < numBytes; i++) {
    var shift = littleEndian ? i * 8 : (numBytes - 1 - i) * 8;
    view.setUint8(i, value >> shift & 0xFF);
  }
  return bytes;
};
var bytesToInt = function bytesToInt(bytes) {
  var byteorder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'little';
  var signed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var view = new DataView(bytes.buffer);
  var littleEndian = byteorder === 'little';
  if (bytes.length <= 0 || bytes.length > 8) {
    throw new Error('Unsupported number of bytes');
  }
  var value = 0;
  for (var i = 0; i < bytes.length; i++) {
    var shift = littleEndian ? i * 8 : (bytes.length - 1 - i) * 8;
    value |= view.getUint8(i) << shift;
  }
  if (signed) {
    var signBit = 1 << 8 * bytes.length - 1;
    if (value & signBit) {
      value = value - (signBit << 1);
    }
  }
  return value;
};
var toHexString = function toHexString(data) {
  return Array.from(data).map(function (_byte) {
    return '0x' + _byte.toString(16).padStart(2, '0');
  }).join(' ');
};


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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var Reader = /*#__PURE__*/function () {
  function Reader(data) {
    _classCallCheck(this, Reader);
    this.data = data;
    this.position = 0;
  }
  return _createClass(Reader, [{
    key: "readIntFromBytes",
    value: function readIntFromBytes() {
      var bytesNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
      var bytes = this.data.slice(this.position, this.position + bytesNumber);
      this.position += bytesNumber;
      return (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.bytesToInt)(bytes, 'little', false);
    }
  }, {
    key: "readStringFromBytes",
    value: function readStringFromBytes(stringLength) {
      var bytes = this.data.slice(this.position, this.position + stringLength);
      this.position += stringLength;
      return new TextDecoder().decode(bytes);
    }
  }, {
    key: "readString",
    value: function readString() {
      var stringLength = this.readInt2();
      return this.readStringFromBytes(stringLength);
    }
  }, {
    key: "readInt1",
    value: function readInt1() {
      return this.readIntFromBytes(1);
    }
  }, {
    key: "readInt4",
    value: function readInt4() {
      return this.readIntFromBytes(4);
    }
  }, {
    key: "readInt2",
    value: function readInt2() {
      return this.readIntFromBytes(2);
    }
  }, {
    key: "readInt8",
    value: function readInt8() {
      return this.readIntFromBytes(8);
    }
  }, {
    key: "readInt16",
    value: function readInt16() {
      return this.readIntFromBytes(16);
    }
  }, {
    key: "readInt32",
    value: function readInt32() {
      return this.readIntFromBytes(32);
    }
  }, {
    key: "toHexString",
    value: function toHexString() {
      return (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.toHexString)(this.data);
    }
  }]);
}();
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var Writer = /*#__PURE__*/function () {
  // Infinity
  function Writer() {
    var packetId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
    _classCallCheck(this, Writer);
    this.packetSize = 20;
    this.packetId = packetId;
    this.data = new Uint8Array(this.packetSize);
    this.position = 0;
    this.setPacketId();
  }
  return _createClass(Writer, [{
    key: "setPacketId",
    value: function setPacketId() {
      this.position = 2;
      this.writeIntInBytes(this.packetId);
      this.updatePacketSize();
    }
  }, {
    key: "updatePacketSize",
    value: function updatePacketSize() {
      this.packetSize = this.position;
      var currentOffset = this.position;
      this.position = 0;
      var b = (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.intToBytes)(this.packetSize, 'little', false, 2);
      this.data.set(b, this.position);
      this.position = currentOffset;
    }
  }, {
    key: "writeIntInBytes",
    value: function writeIntInBytes(number) {
      var bytesNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
      var bytes = (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.intToBytes)(number, 'little', false, bytesNumber);
      this.ensureCapacity(bytesNumber);
      this.data.set(bytes, this.position);
      this.position += bytesNumber;
      this.updatePacketSize();
    }
  }, {
    key: "writeStringInBytes",
    value: function writeStringInBytes(string) {
      var stringLength = string.length;
      this.writeIntInBytes(stringLength, 2);
      var bytes = new TextEncoder().encode(string);
      this.ensureCapacity(stringLength);
      this.data.set(bytes, this.position);
      this.position += stringLength;
      this.updatePacketSize();
    }
  }, {
    key: "ensureCapacity",
    value: function ensureCapacity(requiredSize) {
      if (this.position + requiredSize > this.data.length) {
        var newSize = requiredSize + this.data.length * 2;
        var newData = new Uint8Array(newSize);
        newData.set(this.data);
        this.data = newData;
      }
    }
  }, {
    key: "finalize",
    value: function finalize() {
      return this.data.slice(0, this.position);
    }
  }, {
    key: "toHexString",
    value: function toHexString() {
      return (0,_bytesUtils_js__WEBPACK_IMPORTED_MODULE_0__.toHexString)(this.finalize());
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Writer);

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
/* harmony import */ var _rectangle_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./rectangle.js */ "./src/ui/objects/rectangle.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }




var Block = /*#__PURE__*/function () {
  function Block(p) {
    _classCallCheck(this, Block);
    this.position = p;
    this.currentBlock = -1;
    this.nextBlock = -1;
    this.animDirection = 0;
    this.animProgress = 0;
    this.animDelay = 0;
    this.colorsWithId = null;
    this.lastSetTime = Date.now();
  }
  return _createClass(Block, [{
    key: "setBlockId",
    value: function setBlockId(id, delay) {
      this.lastSetTime = Date.now();
      if (!delay) {
        this.currentBlock = this.nextBlock = id;
        this.animDirection = 0;
        this.animProgress = 1;
      } else {
        this.animDelay = delay;
        var isCurrentBlock = id === this.currentBlock;
        var isNextBlock = id === this.nextBlock;
        if (isCurrentBlock && isNextBlock) {
          if (this.animDirection === -1) {
            this.animDirection = 1;
          }
        }
        if (isCurrentBlock && !isNextBlock) {
          this.animDirection = 1;
          this.nextBlock = this.currentBlock;
        }
        if (!isCurrentBlock && isNextBlock) {
          if (this.animDirection === 1) {
            this.animDirection = -1;
          }
        }
        if (!isCurrentBlock && !isNextBlock) {
          this.nextBlock = id;
          this.animDirection = -1;
        }
      }
    }
  }, {
    key: "handleAnimation",
    value: function handleAnimation() {
      if (this.animDelay > 0) {
        this.animDelay -= window.gameEngine.deltaTime;
      } else {
        this.animProgress += window.gameEngine.deltaTime * this.animDirection * 0.003;
      }
      if (this.animProgress > 1) {
        this.animProgress = 1;
        this.animDirection = 0;
      }
      if (this.animProgress < 0) {
        this.animProgress = 0;
        this.animDirection = 1;
        this.currentBlock = this.nextBlock;
        return false;
      }
      return true;
    }
  }, {
    key: "drawBorderBlock",
    value: function drawBorderBlock(ctx, color, size) {
      if (this.currentBlock !== 0) return;
      ctx.fillStyle = color;
      // Calculate the new position Base Of the size
      var newP = window.game.calBlocksGap(this.position, size);
      ctx.fillRect(newP.x, newP.y, size, size);
    }
  }, {
    key: "drawEmptyBlock",
    value: function drawEmptyBlock(ctx, darkColor, brightColor, size) {
      if (this.currentBlock !== 1) return;
      var sizeFactor = 10 / 7;
      var newS = size * sizeFactor; // 10
      var animProgress = 0;
      var newP = window.game.calBlocksGap(this.position, newS);
      var spacingTwenty = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.2);
      var spacingTen = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.1); // 1
      var spacingNinty = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.9);

      /////////////////////// SHADOW ////////////////////////
      if (this.animProgress > .8) {
        _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, darkColor, spacingTwenty);
      }
      ctx.fillStyle = brightColor;
      if (this.animProgress === 1) {
        _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, brightColor, spacingTen);
      } else if (this.animProgress < .4) {
        animProgress = this.animProgress * 2.5;
        ctx.beginPath();
        ctx.moveTo(newP.x + spacingTwenty, newP.y + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingNinty, spacingTwenty, animProgress));
        ctx.lineTo(newP.x + spacingTwenty, newP.y + spacingNinty);
        ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingNinty);
        ctx.fill();
      } else if (this.animProgress < 0.8) {
        animProgress = this.animProgress * 2.5 - 1;
        ctx.beginPath();
        ctx.moveTo(newP.x + spacingTwenty, newP.y + spacingTwenty);
        ctx.lineTo(newP.x + spacingTwenty, newP.y + 9);
        ctx.lineTo(newP.x + spacingNinty, newP.y + spacingNinty);
        ctx.lineTo(newP.x + spacingNinty, newP.y + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingNinty, spacingTwenty, animProgress));
        ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTwenty, spacingNinty, animProgress), newP.y + spacingTwenty);
        ctx.fill();
      } else {
        animProgress = this.animProgress * 5 - 4;
        _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, brightColor, _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(2, 1, animProgress));
      }
    }
  }, {
    key: "drawRegularBlock",
    value: function drawRegularBlock(ctx, darkColor, brightColor, size) {
      if (this.currentBlock < 2) return;
      if (this.colorsWithId === null) {
        return;
      }
      var bcolor = this.colorsWithId.pattern;
      var dcolor = this.colorsWithId.patternEdge;
      var sizeFactor = 10 / 9;
      var newS = size * sizeFactor; // 10
      var animProgress = 0;
      var newP = window.game.calBlocksGap(this.position, newS);
      var spacingTwenty = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.2);
      var spacingTen = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.1); // 1
      var spacingNinty = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.calPercentage(newS, 0.9);
      if (this.animProgress > 0.8) {
        ctx.fillStyle = dcolor;
        ctx.fillRect(newP.x + spacingTen, newP.y + spacingTen, size, size);
      }
      ctx.fillStyle = bcolor;
      if (this.animProgress === 1) {
        _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, bcolor, spacingTen);
      } else if (this.animProgress < .4) {
        animProgress = this.animProgress * 2.5;
        ctx.beginPath();
        ctx.moveTo(newP.x + spacingTen, newP.y + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(newS, spacingTen, animProgress));
        ctx.lineTo(newP.x + spacingTen, newP.y + newS);
        ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTen, newS, animProgress), newP.y + newS);
        ctx.fill();
      } else if (this.animProgress < 0.8) {
        animProgress = this.animProgress * 2.5 - 1;
        ctx.beginPath();
        ctx.moveTo(newP.x + spacingTen, newP.y + spacingTen);
        ctx.lineTo(newP.x + spacingTen, newP.y + newS);
        ctx.lineTo(newP.x + newS, newP.y + newS);
        ctx.lineTo(newP.x + newS, newP.y + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(newS, spacingTen, animProgress));
        ctx.lineTo(newP.x + _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(spacingTen, newS, animProgress), newP.y + spacingTen);
        ctx.fill();
      } else {
        animProgress = this.animProgress * 5 - 4;
        _utils_js__WEBPACK_IMPORTED_MODULE_2__.drawInCtxRec(ctx, newP, size, bcolor, _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(1, 0, animProgress));
      }
    }
  }, {
    key: "draw",
    value: function draw(ctx, checkViewport) {
      if (checkViewport && window.camera.checkObjectInCamera(this.position)) {
        console.log("not in camera");
        return;
      }
      var canDraw = this.handleAnimation();
      if (!canDraw) {
        return;
      }
      this.drawBorderBlock(ctx, "#420707", 10);
      this.drawEmptyBlock(ctx, "#2d2926", "#4e463f", 7);
      this.drawRegularBlock(ctx, "#2d2926", "#4e463f", 9);
      //Ocuupited Block
    }
  }], [{
    key: "getBlockAt",
    value: function getBlockAt(p, blocks) {
      var _iterator = _createForOfIteratorHelper(blocks),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _block = _step.value;
          if (_block.position.equals(p)) {
            return _block;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var block = new Block(p);
      blocks.push(block);
      return block;
    }
  }, {
    key: "convertRectToBlock",
    value: function convertRectToBlock(rect, colorsWithId, listOfBlocks, myPlayer) {
      var viewPortRadius = window.game.viewPortRadius;
      if (myPlayer) {
        rect.min.x = Math.max(rect.min.x, Math.round(myPlayer.position.x - viewPortRadius));
        rect.min.y = Math.max(rect.min.y, Math.round(myPlayer.position.y - viewPortRadius));
        rect.max.x = Math.min(rect.max.x, Math.round(myPlayer.position.x + viewPortRadius));
        rect.max.y = Math.min(rect.max.y, Math.round(myPlayer.position.y + viewPortRadius));
      }
      var _iterator2 = _createForOfIteratorHelper(rect.for_each()),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _step2.value,
            x = _step2$value.x,
            y = _step2$value.y;
          var block = Block.getBlockAt(new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](x, y), listOfBlocks);
          block.colorsWithId = colorsWithId;
          block.setBlockId(colorsWithId.id, Math.random() * 400);
        }

        // console.log(listOfBlocks);
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }]);
}();
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }




var Camera = /*#__PURE__*/function () {
  function Camera() {
    _classCallCheck(this, Camera);
    this.zoom = 5;
    this.camPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
    this.camRotationOffset = 0;
    this.camPositionOffset = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
    this.camPrevPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
    this.camPosSet = false;
    this.camShakeBuffer = [];
  }

  // TODO ADD VIEWPORT RADIUS
  return _createClass(Camera, [{
    key: "checkObjectInCamera",
    value: function checkObjectInCamera(point) {
      return point.x < this.camPosition.x - window.game.viewPortRadius || point.x > this.camPosition.x + window.game.viewPortRadius || point.y < this.camPosition.y - window.game.viewPortRadius || point.y > this.camPosition.y + window.game.viewPortRadius;
    }
  }, {
    key: "shakeCamera",
    value: function shakeCamera(p) {
      var rotate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      this.camShakeBuffer.push([p, 0, !!rotate]);
    }
  }, {
    key: "shakeCameraDirection",
    value: function shakeCameraDirection(dir) {
      var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;
      var rotate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var x,
        y = 0;
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
  }, {
    key: "calCameraOffset",
    value: function calCameraOffset() {
      for (var i = this.camShakeBuffer.length - 1; i >= 0; i--) {
        var shake = this.camShakeBuffer[i];
        shake[1] = window.gameEngine.deltaTime * 0.003;
        var shakeTime = shake[1];
        var shakeTime2 = 0;
        var shakeTime3 = 0;
        if (shakeTime < 1) {
          shakeTime2 = _utils_js__WEBPACK_IMPORTED_MODULE_2__.ease.out(shakeTime);
          shakeTime3 = _utils_js__WEBPACK_IMPORTED_MODULE_2__.ease.inout(shakeTime);
        } else if (shakeTime < 8) {
          shakeTime2 = _utils_js__WEBPACK_IMPORTED_MODULE_2__.ease.inout(_utils_math_js__WEBPACK_IMPORTED_MODULE_3__.inverseLinearInterpolate(8, 1, shakeTime));
          shakeTime3 = _utils_js__WEBPACK_IMPORTED_MODULE_2__.ease["in"](_utils_math_js__WEBPACK_IMPORTED_MODULE_3__.inverseLinearInterpolate(8, 1, shakeTime));
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
      var limit = 80;
      var x = this.camPositionOffset.x;
      var y = this.camPositionOffset.y;
      x /= limit;
      y /= limit;
      x = _utils_math_js__WEBPACK_IMPORTED_MODULE_3__.smoothLimit(x);
      y = _utils_math_js__WEBPACK_IMPORTED_MODULE_3__.smoothLimit(y);
      x *= limit;
      y *= limit;
      this.camPositionOffset.x = x;
      this.camPositionOffset.y = y;
    }
  }, {
    key: "calZoom",
    value: function calZoom(ctx) {
      var maxPixelRatio = _utils_js__WEBPACK_IMPORTED_MODULE_2__.calculate_pixel_ratio();
      var quality = 1;
      var canvas = window.game.canvas;
      if (ctx.canvas === canvas || true) {
        var maxDimension = Math.max(canvas.width, canvas.height);
        var zoomEdge = maxDimension / window.game.maxZoom;
        var screenPixels = canvas.width * canvas.height;
        var blockPixels = screenPixels / window.game.maxBlocksNumber;
        var zoomBlocks = Math.sqrt(blockPixels) / 10;
        this.zoom = Math.max(zoomEdge, zoomBlocks);
        ctx.translate(window.game.canvas.width / 2, window.game.canvas.height / 2);
        var scaleFactor = 10;
        ctx.rotate(this.camRotationOffset);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.camPrevPosition.x * scaleFactor - this.camPositionOffset.x, -this.camPrevPosition.y * scaleFactor - this.camPositionOffset.y);
      } else {}
    }
  }, {
    key: "moveToPlayer",
    value: function moveToPlayer(player) {
      if (!player) return;
      if (this.camPosSet) {
        this.camPosition.x = _utils_math_js__WEBPACK_IMPORTED_MODULE_3__.linearInterpolate(this.camPosition.x, player.position.x, 0.03);
        this.camPosition.y = _utils_math_js__WEBPACK_IMPORTED_MODULE_3__.linearInterpolate(this.camPosition.y, player.position.y, 0.03);
      } else {
        this.camPosition = player.position.clone();
        this.camPosSet = true;
      }
    }
  }, {
    key: "loop",
    value: function loop() {
      this.camPrevPosition = this.camPosition;
      this.calCameraOffset();
    }
  }, {
    key: "getViewPortRec",
    value: function getViewPortRec(pos) {
      var viewPortRadius = window.game.viewPortRadius * 2;
      var leftSide = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](pos.x - viewPortRadius, pos.y - viewPortRadius);
      var rightSide = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](pos.x + viewPortRadius, pos.y + viewPortRadius);
      return new _rectangle_js__WEBPACK_IMPORTED_MODULE_1__["default"](leftSide, rightSide);
    }
  }]);
}();
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }






var Player = /*#__PURE__*/function () {
  function Player() {
    var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](1, 1);
    var id = arguments.length > 1 ? arguments[1] : undefined;
    _classCallCheck(this, Player);
    this.id = id;
    this.drawPosSet = false;
    this.isMyPlayer = false;
    this.deathWasCertain = false;
    this.didUncertainDeathLastTick = false;
    this.isDeathTimer = 0;
    this.uncertainDeathPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
    this.deadAnimParts = [];
    this.deadAnimPartsRandDist = [];
    this.hitLines = [];
    this.position = position;
    this.drawPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](-1, -1);
    this.serverPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
    this.lastChangedDirPos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
    this.waitingBlocks = [];
    this.name = "";

    // Colors
    this.colorBrighter = 0;
    this.colorDarker = 0;
    this.colorSlightlyBrighter = 0;
    this.colorPattern = 0;
    this.colorPatternEdge = 0;

    // Movements
    this.hasReceivedPosition = false;
    this.moveRelativeToServerPosNextFrame = false;
    this.lastServerPosSentTime = 0;
    this.isReady = false;
    this.isDead = false;

    ///
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
  }
  return _createClass(Player, [{
    key: "checkClientMovementSyncedWithServer",
    value:
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
    function checkClientMovementSyncedWithServer(newDir, newPosOffset, newPos) {
      // Check If dir and por are close to current
      var distVector = this.position.distanceVector(newPosOffset);
      if ((this.dir === newDir || this.myNextDir === newDir) && distVector.x < 1 && distVector.y < 1) {
        return false;
      }

      // check if last client side move is same as new
      // if server faster than client
      if (this.clientSideMoves.length > 0) {
        var lastClientSideMove = this.clientSideMoves.shift();
        if (lastClientSideMove.dir === newDir && lastClientSideMove.pos.equals(newPos)) {
          return false;
        } else {
          this.clientSideMoves = [];
        }
      }
      return true;
    }
  }, {
    key: "equals",
    value: function equals(player) {
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
  }, {
    key: "calMoveOffset",
    value: function calMoveOffset() {
      var offset = 0;
      if (!this.isMyPlayer || this.serverAvgPing <= 50) return offset;
      var gameSpeed = window.game.gameSpeed;
      offset = this.serverAvgPing / 2 * gameSpeed;
      return offset;
    }
  }, {
    key: "addWaitingBlocks",
    value: function addWaitingBlocks() {
      var pos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
      if (this.waitingBlocks.length <= 0) return;
      var lastBlock = this.waitingBlocks.getLast.blocks;
      if (lastBlock.length <= 0) return;
      if (!(lastBlock[0].x !== pos.x || lastBlock[0].y !== pos.y)) return;
      lastBlock.push(pos.clone());
      if (this.isMyPlayer && this.isGettingWaitingBlocks) {
        this.waitingPushedDuringReceiving.push(pos);
      }
    }

    /**
     * This Function Is Called Every Frame
     * It Moves The Draw Position To The Position
     */
  }, {
    key: "moveDrawPosToPos",
    value: function moveDrawPosToPos() {
      var target = this.position;
      this.drawPosition.x = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(this.drawPosition.x, target.x, 0.23);
      this.drawPosition.y = _utils_math_js__WEBPACK_IMPORTED_MODULE_1__.linearInterpolate(this.drawPosition.y, target.y, 0.23);
    }

    /**
     * Update Player Direction
     * @param dir
     */
  }, {
    key: "updatePlayerDirection",
    value: function updatePlayerDirection(dir) {
      this.dir = dir;
    }

    /**
     * Check If Player Is Moving Horizontally
     * @param direction
     * @returns {boolean}
     */
  }, {
    key: "isMovingHorizontally",
    value: function isMovingHorizontally() {
      var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.dir;
      return direction === 'left' || direction === 'right';
    }

    /**
     * Update Player Position
     * @param pos
     */
  }, {
    key: "updatePlayerPosition",
    value: function updatePlayerPosition(pos) {
      this.position = pos;
    }

    /**
     * This Is Called In PlayerState Message
     * To Remove Blocks Outside Camera
     */
  }, {
    key: "removeBlocksOutsideCamera",
    value: function removeBlocksOutsideCamera() {
      var camera = window.camera;
      var playerRect = camera.getViewPortRec(this.position);
      var blocks = window.gameEngine.gameObjects.blocks;
      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
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
  }, {
    key: "checkNextDirAndCamera",
    value: function checkNextDirAndCamera() {
      if (!this.isMyPlayer) return;
      var camera = window.camera;
      camera.moveToPlayer(this);
      if (this.myNextDir === this.dir) return;
      var isHorizontal = this.isMovingHorizontally(this.dir);
      if (this.changeDirAtIsHorizontal === isHorizontal) return;
      var changeDirNow = false;
      var currentCoord = isHorizontal ? this.position.x : this.position.y;

      // Check If Last Direction Complete passed .55 Of Current Block
      if (_utils_js__WEBPACK_IMPORTED_MODULE_2__.isMovingToPositiveDir(this.dir)) {
        if (this.changeDirAtCoord < currentCoord) changeDirNow = true;
      } else {
        if (this.changeDirAtCoord > currentCoord) changeDirNow = true;
      }
      if (changeDirNow) {
        var newPos = this.position.clone();
        var tooFar = Math.abs(this.changeDirAtCoord - currentCoord);
        if (isHorizontal) newPos.x = this.changeDirAtCoord;else newPos.y = this.changeDirAtCoord;
        this.changeCurrentDir(this.myNextDir, newPos);
        var offsetPosition = Player.movePlayer(this.position, this.dir, tooFar);
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
  }, {
    key: "changeCurrentDir",
    value: function changeCurrentDir(dir, pos) {
      var addWaitingBlocks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var clientDecision = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
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
          dir: dir,
          pos: pos.clone(),
          time: Date.now()
        });
      }
    }

    ////////////// DRAWING /////////////////
  }, {
    key: "drawPlayerHeadWithEye",
    value: function drawPlayerHeadWithEye(ctx) {
      var newDrawPos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](this.drawPosition.x * 10 + 4.5, this.drawPosition.y * 10 + 4.5);
      var bigEye = "#ffff";
      var smallEye = "#000";
      var radius = 6;
      var size = radius;
      var animationSpeed = 0.005;
      var eyeAnimation = Math.sin(Date.now() * animationSpeed) * 2;
      var r = 0.5;
      var gradient = ctx.createRadialGradient(newDrawPos.x - 3, newDrawPos.y - 3, 0, newDrawPos.x, newDrawPos.y, radius);
      gradient.addColorStop(0, this.colorSlightlyBrighter);
      gradient.addColorStop(1, this.colorBrighter);
      var c = ctx;
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
  }, {
    key: "drawWaitingBlocks",
    value: function drawWaitingBlocks(ctx) {
      if (this.waitingBlocks.length <= 0) return;
      var gameSpeed = window.game.gameSpeed;
      var deltaTime = window.gameEngine.deltaTime;
      for (var blockIndex = this.waitingBlocks.length - 1; blockIndex >= 0; blockIndex--) {
        var block = this.waitingBlocks[blockIndex];
        var isLastBlock = blockIndex === this.waitingBlocks.length - 1;
        if (!isLastBlock || this.isDead) {
          var speed = this.isDead && isLastBlock ? gameSpeed : 0.02;
          block.vanishTimer += deltaTime * speed;
          if (!isLastBlock && block.vanishTimer > 10) {
            this.waitingBlocks.splice(blockIndex, 1);
          }
        }
        var helperCanvas = window.game.helperCtx.canvas;
        var helperCtx = window.game.helperCtx;
        if (block.blocks.length <= 0) continue;
        var lastDrawPos = isLastBlock ? this.drawPosition : null;
        if (block.vanishTimer > 0 && false) {} else if (block.vanishTimer < 10) {
          this.drawWaitingBlockInCTX([{
            ctx: ctx,
            color: this.colorDarker,
            offset: 6
          }, {
            ctx: ctx,
            color: this.colorBrighter,
            offset: 4
          }], block.blocks, lastDrawPos);
        }
      }
    }
  }, {
    key: "drawWaitingBlockInCTX",
    value: function drawWaitingBlockInCTX(callback, blocks, lastPosition) {
      if (blocks.length <= 0) return;
      for (var ctxIndex = 0; ctxIndex < callback.length; ctxIndex++) {
        var b = callback[ctxIndex];
        var ctx = b.ctx;
        var offset = b.offset;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 6;
        ctx.strokeStyle = b.color;
        ctx.beginPath();
        ctx.moveTo(blocks[0].x * 10 + offset, blocks[0].y * 10 + offset);
        for (var i = 1; i < blocks.length; i++) {
          ctx.lineTo(blocks[i].x * 10 + offset, blocks[i].y * 10 + offset);
        }
        if (lastPosition !== null) {
          ctx.lineTo(lastPosition.x * 10 + offset, lastPosition.y * 10 + offset);
        }
        ctx.stroke();
      }
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (!this.isReady) return;
      if (!this.hasReceivedPosition) return;
      var gameSpeed = window.game.gameSpeed;
      var offset = window.gameEngine.deltaTime * gameSpeed;
      if (this.moveRelativeToServerPosNextFrame) {
        // When Receiving Player State
        // Next Frame Move Relative To Server Pos
        offset = (Date.now() - this.lastServerPosSentTime) * gameSpeed;
        this.moveRelativeToServerPosNextFrame = false;
      }
      if (this.isMyPlayer) {
        this.serverPos = Player.movePlayer(this.serverPos, this.serverDir, offset);
        if (this.serverDir === this.dir) {
          var clientSideDist = 0;
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
      var offsetPosition = Player.movePlayer(this.position, this.dir, offset);
      if (!this.positionInWalls(offsetPosition)) this.updatePlayerPosition(offsetPosition);
      this.moveDrawPosToPos();
      this.checkNextDirAndCamera();
      this.drawWaitingBlocks(ctx);
      this.drawPlayerHeadWithEye(ctx);
      this.parseDirQueue();
    }
  }, {
    key: "checkIfPositionSentEarlier",
    value: function checkIfPositionSentEarlier(pos) {
      return false; // TODO: Fix This
      // console.log(pos, this.lastChangedDirPos, "E");

      if (this.dir === 'up' && pos.y >= this.lastChangedDirPos.y) return true;else if (this.dir === 'down' && pos.y <= this.lastChangedDirPos.y) return true;else if (this.dir === 'left' && pos.x >= this.lastChangedDirPos.x) return true;else return this.dir === 'right' && pos.x <= this.lastChangedDirPos.x;
    }
  }, {
    key: "positionInWalls",
    value: function positionInWalls(pos) {
      var mapSize = window.gameEngine.gameObjects.mapSize - 1;
      var playerPositionFloored = pos.floorVector();
      var playerPositionCelled = pos.ceilVector();
      var minBoundary = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](0, 0);
      var maxBoundary = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](mapSize, mapSize);
      return playerPositionFloored.x <= minBoundary.x || playerPositionCelled.x >= maxBoundary.x || playerPositionFloored.y <= minBoundary.y || playerPositionCelled.y >= maxBoundary.y;
    }
  }, {
    key: "requestChangeDir",
    value: function requestChangeDir(value) {
      var skipQueue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var dir = Player.mapControlsToDir(value);
      var gameSpeed = window.game.gameSpeed;
      var timePassedFromLastSend = Date.now() - this.lastDirServerSentTime;
      var minTimeToWaitToSendDir = 0.7 / gameSpeed;
      if (true) {
        //check Player Socket Connection
      }

      // Prevent Sending Same Dir
      // Prevent Sending Dir Too Fast
      if (dir === this.myLastSendDir && timePassedFromLastSend < minTimeToWaitToSendDir) {
        console.log("dir === this.myLastSendDir || timePassedFromLastSend < minTimeToWaitToSendDir");
        return false;
      }
      this.myLastSendDir = dir;
      this.lastDirServerSentTime = Date.now();
      if (this.dir === dir) {
        console.log("this.dir === dir");
        this.addDirToQueue(dir, skipQueue);
        return false;
      }

      // Check If Dir Is Opposite Of Current Dir
      if (_utils_js__WEBPACK_IMPORTED_MODULE_2__.isOppositeDir(dir, this.dir)) {
        console.log("GameUtils.isOppositeDir(dir, this.dir)");
        this.addDirToQueue(dir, skipQueue);
        return false;
      }

      // Round Player Position To The Nearest Integer
      var isHorizontal = !this.isMovingHorizontally(this.dir);
      var valueToRound = isHorizontal ? this.position.y : this.position.x;
      var roundedValue = Math.round(valueToRound);
      var newPlayerPos = this.position.clone();
      if (isHorizontal) newPlayerPos.y = roundedValue;else newPlayerPos.x = roundedValue;
      // console.log("LastPos", this.position, "NewPos", newPlayerPos);

      // Check If Position Corrupted Since Last Send
      if (this.checkIfPositionSentEarlier(newPlayerPos)) {
        console.log("GameUtils.checkIfPositionSentEarlier(dir, this.dir)");
        this.addDirToQueue(dir, skipQueue);
        return false;
      }
      console.log("Position Passed");
      // Check If Last Direction Complete passed .55 Of Current Block
      var changeDirNow = false;
      var blockProgress = valueToRound - Math.floor(valueToRound);
      if (_utils_js__WEBPACK_IMPORTED_MODULE_2__.isMovingToPositiveDir(dir)) {
        if (blockProgress < .45) changeDirNow = true;
      } else if (blockProgress > .55) changeDirNow = true;

      // Check If Prediction Of Next Direction Will Touch Wall
      // We Change It Now Not in Next Frame
      // Because checkNextDirAndCamera function will not change the direction
      // Because the player is not moving to the next block
      // as it prevented from move in main update function
      var predictionVector = this.position.clone();
      predictionVector = Player.movePlayer(predictionVector, this.dir, 1);
      if (this.positionInWalls(predictionVector)) changeDirNow = true;
      if (changeDirNow) {
        console.log("changeDirNow");
        this.changeCurrentDir(dir, newPlayerPos);
      } else {
        console.log("Change It Next Frame");
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
      var packet = new _network_packets_direction__WEBPACK_IMPORTED_MODULE_3__["default"](dir, newPlayerPos);
      window.client.send(packet);
      return true;
    }
  }, {
    key: "parseDirQueue",
    value: function parseDirQueue() {
      if (this.sendDirQueue.length <= 0) return;
      var firstDir = this.sendDirQueue.first;
      var timePassed = Date.now() - firstDir.time;
      var gameSpeed = window.game.gameSpeed;
      var minTimeToWaitToSendDir = 1.2 / gameSpeed;
      if (timePassed < minTimeToWaitToSendDir || this.requestChangeDir(firstDir.dir, true)) {
        this.sendDirQueue.shift();
      }
    }
  }, {
    key: "addDirToQueue",
    value: function addDirToQueue(dir) {
      var skip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!skip && this.sendDirQueue.length < 3) {
        this.sendDirQueue.push({
          dir: dir,
          time: Date.now()
        });
      }
    }

    /**
     * Request Waiting Blocks For Two Reasons
     * 1- If server thinks player movement then some waiting blocks were missed so we request it
     */
  }, {
    key: "requestWaitingBlocks",
    value: function requestWaitingBlocks() {
      this.isGettingWaitingBlocks = true;
      this.waitingPushedDuringReceiving = [];
      var packet = new _network_packets_requestWaitingBlocks__WEBPACK_IMPORTED_MODULE_4__["default"]();
      window.client.send(packet);
    }
  }, {
    key: "drawPlayerHead",
    value: function drawPlayerHead(ctx) {
      var newDrawPos = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](this.drawPosition.x * 10 + 4.5, this.drawPosition.y * 10 + 4.5);
      var radius = 6;
      var shadowOffset = .3;
      var gradient = ctx.createRadialGradient(newDrawPos.x - 3, newDrawPos.y - 3, 0, newDrawPos.x, newDrawPos.y, radius);
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
  }], [{
    key: "getPlayerById",
    value: function getPlayerById(id, players) {
      var _iterator = _createForOfIteratorHelper(players),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          if (p.id === id) return p;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "isMovingHorizontally",
    value: function isMovingHorizontally(direction) {
      return direction === 'left' || direction === 'right';
    }
  }, {
    key: "movePlayer",
    value: function movePlayer(pos, dir, offset) {
      var workingPos = pos.clone();
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
  }, {
    key: "mapControlsToDir",
    value: function mapControlsToDir(controls) {
      if (controls === 1) return 'up';else if (controls === 3) return 'down';else if (controls === 4) return 'left';else if (controls === 2) return 'right';else return '';
    }
  }]);
}();
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Point = /*#__PURE__*/function () {
  function Point(x, y) {
    _classCallCheck(this, Point);
    this.x = x;
    this.y = y;
  }
  return _createClass(Point, [{
    key: "equals",
    value: function equals(otherPoint) {
      return this.x === otherPoint.x && this.y === otherPoint.y;
    }
  }, {
    key: "distanceVector",
    value: function distanceVector(otherPoint) {
      return new Point(Math.abs(this.x - otherPoint.x), Math.abs(this.y - otherPoint.y));
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Point(this.x, this.y);
    }
  }, {
    key: "floorVector",
    value: function floorVector() {
      return new Point(Math.floor(this.x), Math.floor(this.y));
    }
  }, {
    key: "ceilVector",
    value: function ceilVector() {
      return new Point(Math.ceil(this.x), Math.ceil(this.y));
    }
  }]);
}();
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var Rectangle = /*#__PURE__*/function () {
  function Rectangle(minVec, maxVec) {
    _classCallCheck(this, Rectangle);
    this.min = minVec;
    this.max = maxVec;
  }
  return _createClass(Rectangle, [{
    key: "toString",
    value: function toString() {
      return "<Rectangle min=".concat(this.min, " max=").concat(this.max, ">");
    }
  }, {
    key: "clamp",
    value: function clamp(rect) {
      var minVec = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](Math.max(this.min.x, rect.min.x), Math.max(this.min.y, rect.min.y));
      var maxVec = new _point_js__WEBPACK_IMPORTED_MODULE_0__["default"](Math.min(this.max.x, rect.max.x), Math.min(this.max.y, rect.max.y));
      return new Rectangle(minVec, maxVec);
    }
  }, {
    key: "for_each",
    value: /*#__PURE__*/_regeneratorRuntime().mark(function for_each() {
      var x, y;
      return _regeneratorRuntime().wrap(function for_each$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            x = this.min.x;
          case 1:
            if (!(x < this.max.x)) {
              _context.next = 12;
              break;
            }
            y = this.min.y;
          case 3:
            if (!(y < this.max.y)) {
              _context.next = 9;
              break;
            }
            _context.next = 6;
            return {
              x: x,
              y: y
            };
          case 6:
            y++;
            _context.next = 3;
            break;
          case 9:
            x++;
            _context.next = 1;
            break;
          case 12:
          case "end":
            return _context.stop();
        }
      }, for_each, this);
    })
  }, {
    key: "isRectOverlap",
    value: function isRectOverlap(rect) {
      return this.min.x < rect.max.x && this.max.x > rect.min.x && this.min.y < rect.max.y && this.max.y > rect.min.y;
    }
  }, {
    key: "isNotRectOverlap",
    value: function isNotRectOverlap(rect) {
      return this.max.x < rect.min.x || this.min.x > rect.max.x || this.max.y < rect.min.y || this.min.y > rect.max.y;
    }
  }, {
    key: "pointInRect",
    value: function pointInRect(point) {
      return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y;
    }
  }]);
}();
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
var getHeight = function getHeight() {
  return window.innerHeight;
};
var getWidth = function getWidth() {
  return window.innerWidth;
};
var calculate_pixel_ratio = function calculate_pixel_ratio() {
  var context = document.createElement("canvas").getContext("2d");
  var dpr = window.devicePixelRatio || 1;
  var bsr = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
  return dpr / bsr;
};
var ease = {
  "in": function _in(t) {
    return t * t * t * t;
  },
  out: function out(t) {
    return 1 - Math.pow(1 - t, 4);
  },
  inout: function inout(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }
};
var drawInCtxRec = function drawInCtxRec(ctx, point, size, color) {
  var spacing = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  ctx.fillStyle = color;
  ctx.fillRect(point.x + spacing, point.y + spacing, size, size);
};
var convertIntColorToHex = function convertIntColorToHex(color) {
  return "#" + ("000000" + color.toString(16)).slice(-6);
};
var isOppositeDir = function isOppositeDir(newDir, OldDir) {
  if (newDir === 'up' && OldDir === 'down') return true;else if (newDir === 'down' && OldDir === 'up') return true;else if (newDir === 'left' && OldDir === 'right') return true;else return newDir === 'right' && OldDir === 'left';
};
var isVerticalDir = function isVerticalDir(dir) {
  return dir === 'up' || dir === 'down';
};
var isMovingToPositiveDir = function isMovingToPositiveDir(dir) {
  return dir === 'down' || dir === 'right';
};


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
var linearInterpolate = function linearInterpolate(a, b, v) {
  return a + (b - a) * v;
};
var inverseLinearInterpolate = function inverseLinearInterpolate(a, b, v) {
  return (v - a) / (b - a);
};
var adaptedLinearInterpolate = function adaptedLinearInterpolate(a, b, val1, val2) {
  var x = 1 - Math.pow(1 - val1, val2);
  return linearInterpolate(a, b, x);
};
var adaptedConLinearInterpolate = function adaptedConLinearInterpolate(val2) {
  return function (a, b, val1) {
    return adaptedLinearInterpolate(a, b, val1, val2);
  };
};
var smoothLimit = function smoothLimit(v) {
  var negative = v < 0;
  if (negative) {
    v *= -1;
  }
  v = 1 - Math.pow(2, -v);
  if (negative) {
    v *= -1;
  }
  return v;
};
var clamp = function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
};
var calPercentage = function calPercentage(a, percentage) {
  return a * percentage;
};


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
/* harmony import */ var _controls_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_controls_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _extensions_arraysExtensions_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./extensions/arraysExtensions.js */ "./src/extensions/arraysExtensions.js");
/* harmony import */ var _extensions_arraysExtensions_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_extensions_arraysExtensions_js__WEBPACK_IMPORTED_MODULE_5__);
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }






var camera = new _ui_objects_camera_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
var gameEngine = new _gameEngine__WEBPACK_IMPORTED_MODULE_1__["default"](60);
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var blocks = gameEngine.gameObjects.blocks;
var players = gameEngine.gameObjects.players;
var helperCanvas = document.createElement("canvas");
var helperCtx = helperCanvas.getContext("2d");
window.game.helperCtx = helperCtx;
window.gameEngine = gameEngine;
window.camera = camera;
window.game.canvas = canvas;
var client = null;
var myPlayer = null;
var draw = function draw() {
  if (client && client.player) myPlayer = client.player;
  gameEngine.scaleCanvas(ctx);
  ctx.fillStyle = "#3a3428";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  camera.loop();
  gameEngine.camTransform(ctx);
  console.log("Blocks: " + blocks.length);
  var _iterator = _createForOfIteratorHelper(blocks),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var b = _step.value;
      b.draw(ctx, false);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  for (var p in players) {
    players[p].draw(ctx);
  }
  if (client && client.player) myPlayer.removeBlocksOutsideCamera();
};
gameEngine.setDrawFunction(draw);
window.requestAnimationFrame(gameEngine.loop.bind(gameEngine));
client = new _network_client__WEBPACK_IMPORTED_MODULE_2__.Client('ws://127.0.0.1:5000/game', function (client) {
  client.setPlayerName("Test");
});
})();

/******/ })()
;
//# sourceMappingURL=app.js.map