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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _globals_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals.js */ \"./src/globals.js\");\n/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/math.js */ \"./src/utils/math.js\");\n/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ui/utils.js */ \"./src/ui/utils.js\");\n/* harmony import */ var _ui_objects_camera_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ui/objects/camera.js */ \"./src/ui/objects/camera.js\");\n/* harmony import */ var _ui_objects_block_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ui/objects/block.js */ \"./src/ui/objects/block.js\");\n/* harmony import */ var _ui_objects_point_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ui/objects/point.js */ \"./src/ui/objects/point.js\");\n/* harmony import */ var _gameEngine__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./gameEngine */ \"./src/gameEngine.js\");\n\n\n\n\n\n\n\n\n\n\nconst camera = new _ui_objects_camera_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"]();\nconst gameEngine = new _gameEngine__WEBPACK_IMPORTED_MODULE_6__[\"default\"](60);\nwindow.gameEngine = gameEngine;\nwindow.camera = camera;\nwindow.requestAnimationFrame(gameEngine.loop.bind(gameEngine));\n\n\nlet canvas = document.getElementById(\"canvas\");\nlet ctx = canvas.getContext(\"2d\");\n\n\nconst draw = () => {\n    gameEngine.scaleCanvas(ctx);\n    ctx.fillStyle = \"#3a3428\";\n    ctx.fillRect(0, 0,100, canvas.height);\n\n    camera.loop()\n    gameEngine.camTransform(ctx);\n}\ngameEngine.setDrawFunction(draw);\n\n\n//\n// let blocks = [];\n// let block = Block.getBlockAt(new Point(0, 0), blocks);\n//\n// block.draw(\"\",true);\n//\n//\n// console.log(block);\n\n//# sourceURL=webpack:///./src/app.js?");

/***/ }),

/***/ "./src/gameEngine.js":
/*!***************************!*\
  !*** ./src/gameEngine.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/math.js */ \"./src/utils/math.js\");\n/* harmony import */ var _ui_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui/utils.js */ \"./src/ui/utils.js\");\n\n\n\n\nclass GameEngine {\n    constructor(fps) {\n        this.lastFrameTimeStamp = 0\n        this.currentFrameTimeStamp = 0\n        this.totalDeltaTimeCap = 0\n        this.fps = fps\n        this.deltaTime = 1000 / this.fps;\n\n\n        this.timesCap = [0, 6.5, 16, 33, 49, 99];\n        this.currentCapIndex = 0;\n        this.processFrames = [];\n        this.missedFrames = [];\n\n        this.drawFunction = () => {\n        };\n    }\n\n    setDrawFunction(drawFunction) {\n        this.drawFunction = drawFunction;\n    }\n\n\n    getCap(cap) {\n        return this.timesCap[_utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(cap, 0, this.timesCap.length - 1)];\n    }\n\n    checkIncreasingInFramesProcess() {\n        // This function checks if the game is running at the right speed.\n        // If the game is running too fast, it will decrease the currentCapIndex.\n        // if currentFrameTimeStamp < 90% of the currentCapIndex, then decrease the currentCapIndex.\n        if (this.currentFrameTimeStamp < _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.linearInterpolate(\n            this.getCap(this.currentCapIndex), this.getCap(this.currentCapIndex + 1),\n            0.9\n        )) {\n            this.processFrames.push(Date.now());\n\n            // If Draw More than 190 frames in 10 seconds, then remove the first frame.\n            while (this.processFrames.length > 190) {\n                if (Date.now() - this.processFrames[0] > 10_000) {\n                    this.processFrames.slice(0, 1)\n                } else {\n                    // if first frame happen in less than 10 seconds, decrease the currentCapIndex.\n                    this.currentCapIndex--;\n                    this.processFrames = [];\n                    this.currentCapIndex = _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(this.currentCapIndex, 0, this.timesCap.length - 1);\n                }\n            }\n        }\n    }\n\n    checkDecreaseInFramesProcess() {\n        // This function checks if the game is running at the right speed.\n        // If the game is running too slow, it will increase the currentCapIndex.\n        // if currentFrameTimeStamp > 5% of the currentCapIndex, then increase the currentCapIndex.\n        if (this.currentFrameTimeStamp > _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.linearInterpolate(\n            this.getCap(this.currentCapIndex), this.getCap(this.currentCapIndex + 1),\n            0.05\n        )) {\n            this.missedFrames.push(Date.now());\n            this.processFrames = [];\n            // If Draw Less than 5 frames in 5 seconds, then remove the first frame.\n            while (this.missedFrames.length > 5) {\n                if (Date.now() - this.missedFrames[0] > 5_000) {\n                    this.missedFrames.slice(0, 1)\n                } else {\n                    // if first frame happen in less than 5 seconds, increase the currentCapIndex.\n                    this.currentCapIndex++;\n                    this.missedFrames = [];\n                    this.currentCapIndex = _utils_math_js__WEBPACK_IMPORTED_MODULE_0__.clamp(this.currentCapIndex, 0, this.timesCap.length - 1);\n                }\n            }\n        }\n    }\n\n\n    loop(timeStamp) {\n        this.currentFrameTimeStamp = timeStamp - this.lastFrameTimeStamp;\n        this.checkIncreasingInFramesProcess();\n        this.checkDecreaseInFramesProcess();\n        this.deltaTime = this.currentFrameTimeStamp + this.totalDeltaTimeCap;\n        this.lastFrameTimeStamp = timeStamp;\n        if (this.deltaTime < this.getCap(this.currentCapIndex)) {\n            this.totalDeltaTimeCap += this.currentFrameTimeStamp;\n        } else {\n            this.totalDeltaTimeCap = 0;\n            this.drawFunction();\n        }\n        window.requestAnimationFrame(this.loop.bind(this));\n    }\n\n\n\n    camTransform(ctx,changeSize=false)\n    {\n        if(changeSize)\n        {\n            this.scaleCanvas(ctx);\n        }\n        ctx.save();\n        let canvas = ctx.canvas;\n        ctx.translate(canvas.width / 2, canvas.height / 2);\n        const camera = window.camera;\n        camera.calZoom(ctx);\n\n\n    }\n    scaleCanvas(ctx, w=_ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.getWidth(), h=_ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.getHeight()){\n        let MAX_PIXEL_RATIO = (0,_ui_utils_js__WEBPACK_IMPORTED_MODULE_1__.calculate_pixel_ratio)();\n        let drawingQuality = 1;\n        let c = ctx.canvas;\n        c.width = w * drawingQuality * MAX_PIXEL_RATIO;\n        c.height = w * drawingQuality * MAX_PIXEL_RATIO;\n        let styleRatio = 1;\n        c.style.width = w * styleRatio + \"px\";\n\t    c.style.height = h * styleRatio + \"px\";\n    }\n\n}\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameEngine);\n\n//# sourceURL=webpack:///./src/gameEngine.js?");

/***/ }),

/***/ "./src/globals.js":
/*!************************!*\
  !*** ./src/globals.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\nconst globals =  {\n    gameSpeed: 0.006,\n    viewPortRadius: 30,\n    maxZoom: 430,\n    maxBlocksNumber: 1100,\n    usernameLength: 6,\n    maxWaitingSocketTime: 1_000,\n};\n\nwindow.game = {};\n// Adding to window object\nObject.entries(globals).forEach(([key, value]) => {\n    window.game[key] = value;\n});\n\n\n\n//# sourceURL=webpack:///./src/globals.js?");

/***/ }),

/***/ "./src/ui/objects/block.js":
/*!*********************************!*\
  !*** ./src/ui/objects/block.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point.js */ \"./src/ui/objects/point.js\");\n\n\nclass Block {\n    constructor(p) {\n        this.position = p\n        this.currentBlock = -1;\n        this.nextBlock = -1;\n        this.animDirection = 0;\n        this.animProgress = 0;\n        this.animDelay = 0;\n        this.lastSetTime = Date.now()\n    }\n\n    setBlockId(id, delay) {\n        this.lastSetTime = Date.now();\n        if (!delay) {\n            this.currentBlock = this.nextBlock = id;\n            this.animDirection = 0;\n            this.animProgress = 1;\n        } else {\n\n            this.animDelay = delay;\n\n            let isCurrentBlock = id === this.currentBlock;\n            let isNextBlock = id === this.nextBlock;\n\n            if (isCurrentBlock && isNextBlock) {\n                if (this.animDirection === -1) {\n                    this.animDirection = 1;\n                }\n            }\n\n            if (isCurrentBlock && !isNextBlock) {\n                this.animDirection = 1;\n                this.nextBlock = this.currentBlock;\n            }\n\n            if (!isCurrentBlock && isNextBlock) {\n                if (this.animDirection === 1) {\n                    this.animDirection = -1;\n                }\n            }\n\n            if (!isCurrentBlock && !isNextBlock) {\n                this.nextBlock = id;\n                this.animDirection = -1;\n            }\n        }\n\n    }\n\n    static getBlockAt(p, blocks) {\n        for (let block of blocks) {\n            if (block.position.equals(p)) {\n                return block;\n            }\n        }\n        let block = new Block(p);\n        blocks.push(block);\n        return block;\n\n    }\n\n\n    draw(ctx, checkViewport) {\n        if (checkViewport && window.camera.checkObjectInCamera(this.position)) {\n            console.log(\"not in camera\");\n            return;\n        }\n\n\n    }\n\n}\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Block);\n\n//# sourceURL=webpack:///./src/ui/objects/block.js?");

/***/ }),

/***/ "./src/ui/objects/camera.js":
/*!**********************************!*\
  !*** ./src/ui/objects/camera.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point.js */ \"./src/ui/objects/point.js\");\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ \"./src/ui/utils.js\");\n/* harmony import */ var _utils_math_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/math.js */ \"./src/utils/math.js\");\n\n\n\n\nclass Camera {\n    constructor() {\n        this.zoom = 5;\n        this.camPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n        this.camRotationOffset = 0;\n        this.camPositionOffset = new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n        this.camPrevPosition = new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n\n\n        this.camShakeBuffer = [];\n        //\n    }\n\n\n    // TODO ADD VIEWPORT RADIUS\n    checkObjectInCamera(point) {\n        return (\n            point.x < this.position.x ||\n            point.x > this.position.x ||\n            point.y < this.position.y ||\n            point.y > this.position.y\n        )\n    }\n\n    shakeCamera(p, rotate = true) {\n        this.camShakeBuffer.push([\n            p, 0, !!rotate\n        ]);\n    }\n\n    shakeCameraDirection(dir, amount = 6, rotate = true) {\n        let x, y = 0;\n        switch (dir) {\n            case 0:\n                x = amount;\n                break;\n            case 1:\n                y = amount;\n                break;\n            case 2:\n                x = -amount;\n                break;\n            case 3:\n                y = -amount;\n                break;\n        }\n        this.shakeCamera(new _point_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x, y), rotate);\n    }\n\n    calCameraOffset() {\n        for (let i = this.camShakeBuffer.length - 1; i >= 0; i--) {\n            let shake = this.camShakeBuffer[i];\n            shake[1] = window.gameEngine.deltaTime * 0.003;\n            let shakeTime = shake[1];\n            let shakeTime2 = 0;\n            let shakeTime3 = 0;\n            if (shakeTime < 1) {\n                shakeTime2 = _utils_js__WEBPACK_IMPORTED_MODULE_1__.ease.out(shakeTime);\n                shakeTime3 = _utils_js__WEBPACK_IMPORTED_MODULE_1__.ease.inout(shakeTime);\n\n            } else if (shakeTime < 8) {\n                shakeTime2 = _utils_js__WEBPACK_IMPORTED_MODULE_1__.ease.inout(_utils_math_js__WEBPACK_IMPORTED_MODULE_2__.inverseLinearInterpolate(8, 1, shakeTime));\n                shakeTime3 = _utils_js__WEBPACK_IMPORTED_MODULE_1__.ease.in(_utils_math_js__WEBPACK_IMPORTED_MODULE_2__.inverseLinearInterpolate(8, 1, shakeTime));\n            } else {\n                this.camShakeBuffer.splice(i, 1);\n            }\n            this.camPositionOffset.x += shake[0].x * shakeTime2;\n            this.camPositionOffset.y += shake[0].y * shakeTime2;\n\n            this.camPositionOffset.x += shake[0] * Math.cos(shakeTime * 8) * 0.04 * shakeTime3;\n            this.camPositionOffset.y += shake[0] * Math.cos(shakeTime * 7) * 0.04 * shakeTime3;\n            if (shake[2]) {\n                this.camRotationOffset += Math.cos(shakeTime * 9) * 0.003 * shakeTime3;\n            }\n            console.log( this.camShakeBuffer.length);\n        }\n\n        let limit = 80;\n        let x = this.camPositionOffset.x;\n        let y = this.camPositionOffset.y;\n        x /= limit;\n        y /= limit;\n        x = _utils_math_js__WEBPACK_IMPORTED_MODULE_2__.smoothLimit(x);\n        y = _utils_math_js__WEBPACK_IMPORTED_MODULE_2__.smoothLimit(y);\n        x *= limit;\n        y *= limit;\n        this.camPositionOffset.x = x;\n        this.camPositionOffset.y = y;\n\n    }\n\n    calZoom(ctx) {\n        const canvas = ctx.canvas;\n        const maxDimension = Math.max(canvas.width, canvas.height);\n        const zoomEdge = maxDimension / window.game.maxZoom;\n        const screenPixels = canvas.width * canvas.height;\n        const blockPixels = screenPixels / window.game.maxBlocksNumber;\n        const zoomBlocks = Math.sqrt(blockPixels) / 10;\n        this.zoom = Math.max(zoomEdge, zoomBlocks);\n        ctx.rotate(this.camRotationOffset);\n        ctx.scale(this.zoom, this.zoom);\n\n        ctx.translate(-this.camPrevPosition.x * 10 - this.camPositionOffset.x, -this.camPrevPosition.y * 10 - this.camPositionOffset.y);\n    }\n\n\n    loop() {\n        this.camPrevPosition = this.camPosition;\n        this.calCameraOffset();\n    }\n\n\n}\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Camera);\n\n//# sourceURL=webpack:///./src/ui/objects/camera.js?");

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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   calculate_pixel_ratio: () => (/* binding */ calculate_pixel_ratio),\n/* harmony export */   ease: () => (/* binding */ ease),\n/* harmony export */   getHeight: () => (/* binding */ getHeight),\n/* harmony export */   getWidth: () => (/* binding */ getWidth)\n/* harmony export */ });\nconst getHeight = () => window.innerHeight;\nconst getWidth = () => window.innerWidth;\n\nconst calculate_pixel_ratio = () => {\n    let context = document.createElement(\"canvas\").getContext(\"2d\");\n    let dpr = window.devicePixelRatio || 1;\n    let bsr = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;\n    return dpr / bsr;\n}\n\nconst ease = {\n\tin: function (t) {\n\t\treturn t * t * t * t;\n\t},\n\tout: function (t) {\n\t\treturn 1 - Math.pow(1 - t, 4);\n\t},\n\tinout: function (t) {\n\t\treturn t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;\n\t},\n};\n\n\n\n\n\n\n\n\n//# sourceURL=webpack:///./src/ui/utils.js?");

/***/ }),

/***/ "./src/utils/math.js":
/*!***************************!*\
  !*** ./src/utils/math.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   adaptedConLinearInterpolate: () => (/* binding */ adaptedConLinearInterpolate),\n/* harmony export */   adaptedLinearInterpolate: () => (/* binding */ adaptedLinearInterpolate),\n/* harmony export */   clamp: () => (/* binding */ clamp),\n/* harmony export */   inverseLinearInterpolate: () => (/* binding */ inverseLinearInterpolate),\n/* harmony export */   linearInterpolate: () => (/* binding */ linearInterpolate),\n/* harmony export */   smoothLimit: () => (/* binding */ smoothLimit)\n/* harmony export */ });\nconst linearInterpolate = (a, b, t) => {\n    return a + (b - a) * t;\n}\n\nconst inverseLinearInterpolate = (a, b, v) => {\n    return (v - a) / (b - a);\n}\n\nconst adaptedLinearInterpolate = (a, b, val1, val2) => {\n    let x = 1 - Math.pow((1 - val1), val2);\n    return linearInterpolate(a, b, x);\n};\n\nconst adaptedConLinearInterpolate = (val2) => (a, b, val1) => {\n    return adaptedLinearInterpolate(a, b, val1, val2);\n}\n\nconst clamp = (val, min, max) => {\n    return Math.max(min, Math.min(max, val));\n}\n\n\nconst smoothLimit = (v) => {\n    let negative = v < 0;\n    if (negative) {\n        v *= -1;\n    }\n    v = 1 - Math.pow(2, -v);\n    if (negative) {\n        v *= -1;\n    }\n    return v;\n}\n\n\n\n//# sourceURL=webpack:///./src/utils/math.js?");

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