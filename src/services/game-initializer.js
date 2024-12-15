import Camera from '../ui/objects/camera.js';
import GameEngine from '../game-engine.js';
import Timer from '../ui/objects/timer.js';
import Leaderboard from '../ui/objects/leaderboard.js';
import MiniMap from '../ui/objects/minimap.js';
import { Client } from '../network/client.js';
import ConnectAsViewerPacket from '../network/packets/connectAsViewerPacket.js';
import gameConfig from '../config/game-config.js';
import PlayerNameInput from "../ui/objects/player-name-input";
import PlayerWidget from "../ui/objects/player-widget";
import DecorationManager from "../ui/objects/decoration-manager";
import SnowEffect from "../ui/objects/snow-particles";
import KillMessage from "../ui/objects/kill-message";

export default class GameInitializer {
    constructor(canvas, serverArgs) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.serverArgs = serverArgs;
        this.initializeGameComponents();
    }

    initializeGameComponents() {
        this.camera = new Camera();
        this.gameEngine = new GameEngine(gameConfig.GAME_FPS);
        this.gameTimer = new Timer();
        this.gameLeaderboard = new Leaderboard();
        this.gameMiniMap = new MiniMap();
        this.decorationManager = new DecorationManager();
        this.snowEffect = new SnowEffect({
            particleCount: gameConfig.SNOW_EFFECT_CONFIG.particleCount,
            camera: this.camera
        });


        // this.gameTimer.start();

        this.killMessageOverlay = new KillMessage({
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
            this.nameInput = new PlayerNameInput(this.onSubmitPlayerName);
        }
    }

    onSubmitPlayerName = (name) => {
        window.location.href = `/?name=${name}`;
    }

    initializeClient() {
        const { isViewing, playerSubmitName } = this.serverArgs;
        
        if (isViewing) {
            this.client = new Client(gameConfig.SERVER_URL, (c) => {
                c.send(new ConnectAsViewerPacket());
            });
        } else {
            this.client = new Client(gameConfig.SERVER_URL, (c) => {
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
                playerWidget = new PlayerWidget(myPlayer);
            }

            if (!this.decorationManager.isInitialized()) {
                this.decorationManager.initialize();
            }

            this.gameEngine.scaleCanvas(this.ctx);
            this.ctx.fillStyle = gameConfig.BACKGROUND_COLOR;
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
