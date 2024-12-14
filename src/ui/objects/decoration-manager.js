import Block from "./block";
import Tree from "./tree";
import SnowHat from "./snow-hat";
import {SnowMan,ShakySnowman} from "./snow-man";
import PresentBox from "./present-box";
import AlxBanner from "./alx-banner";
import Lights from "./lights";

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


        const boardWidth = mapSize * Block.BorderBlockWidth;
        const boardHeight = mapSize * Block.BorderBlockWidth;
        const midWidth = boardWidth / 2;


        this.decorationPositions = [



            {x: -2, y: -4, type: SnowHat, scale: 0.4, rotation: -Math.PI / 16},
            {x: boardWidth + 2, y: -4, type: SnowHat, scale: 0.4, rotation: Math.PI / 16},
            {x: midWidth - 40, y: -25, type: AlxBanner, scale: 0.4, rotation: 0},

            {x: 50, y: -20, type: ShakySnowman, scale: 0.4, rotation: Math.PI / 8},
            {x: boardWidth - 50, y: -20, type: ShakySnowman, scale: 0.4, rotation: -Math.PI / 8},
            {x: -30, y: boardHeight + 57, type: ShakySnowman, scale: 0.4, rotation: Math.PI / 8},


            {x: 0, y: 4, type: Lights, scale: 0.4, rotation: Math.PI / 2},
            {x: 0, y: 84, type: Lights, scale: 0.4, rotation: Math.PI / 2},
            {x: 0, y: 164, type: Lights, scale: 0.4, rotation: Math.PI / 2},
            {x: 0, y: 80 * 3 + 4, type: Lights, scale: 0.4, rotation: Math.PI / 2},
            {x: -5, y: 80, type: Tree, scale: 1, rotation: -Math.PI / 2},
            {x: -5, y: 160, type: Tree, scale: 1, rotation: -Math.PI / 2},
            {x: -5, y: 80 * 3, type: Tree, scale: 1, rotation: -Math.PI / 2},


            {x: boardWidth + 5, y: 80, type: Tree, scale: 1, rotation: Math.PI / 2},
            {x: boardWidth + 35, y: 80, type: SnowHat, scale: .25, rotation: Math.PI - Math.PI / 2},
            {x: boardWidth + 5, y: 160, type: Tree, scale: 1, rotation: Math.PI / 2},
            {x: boardWidth + 35, y: 160, type: SnowHat, scale: .25, rotation: Math.PI - Math.PI / 2},

            {x: boardWidth + 5, y: 240, type: Tree, scale: 1, rotation: Math.PI / 2},
            {x: boardWidth + 35, y: 240, type: SnowHat, scale: .25, rotation: Math.PI - Math.PI / 2},


            // Present boxes
            {x: 20, y: boardHeight + 9, type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#228B22', boxColor: '#FF4500'},
            {x: 20 + 17, y: boardHeight + 9, type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#FFD700', boxColor: '#1E90FF'},
            {x: 20 + (17 * 2), y: boardHeight + 9, type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#32CD32', boxColor: '#FF69B4'},
            {x: 20 + (17 * 3), y: boardHeight + 9, type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#00CED1', boxColor: '#9370DB'},
            {x: 20 + (17 * 4), y: boardHeight + 9, type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#FF4500', boxColor: '#20B2AA'},
            {x: 20 + (17 * 5), y: boardHeight + 9, type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#1E90FF', boxColor: '#FF6347'},
            {x: 20 + (17 * 6), y: boardHeight + 9, type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#FF69B4', boxColor: '#32CD32'},
            {x: 20 + (17 * 7), y: boardHeight + 9, type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#20B2AA', boxColor: '#FFD700'},



            {x: 20 + (17 * 1), y: boardHeight + 9 + (17 * 1), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#9370DB', boxColor: '#00CED1'},
            {x: 20 + (17 * 2), y: boardHeight + 9 + (17 * 1), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#FF6347', boxColor: '#1E90FF'},
            {x: 20 + (17 * 3), y: boardHeight + 9 + (17 * 1), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#20B2AA', boxColor: '#FF69B4'},
            {x: 20 + (17 * 4), y: boardHeight + 9 + (17 * 1), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#FFD700', boxColor: '#32CD32'},
            {x: 20 + (17 * 5), y: boardHeight + 9 + (17 * 1), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#00CED1', boxColor: '#9370DB'},
            {x: 20 + (17 * 6), y: boardHeight + 9 + (17 * 1), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#32CD32', boxColor: '#FF4500'},

            {x: 20 + (17 * 2), y: boardHeight + 9 + (17 * 2), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#1E90FF', boxColor: '#20B2AA'},
            {x: 20 + (17 * 3), y: boardHeight + 9 + (17 * 2), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#FF69B4', boxColor: '#FFD700'},
            {x: 20 + (17 * 4), y: boardHeight + 9 + (17 * 2), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#9370DB', boxColor: '#FF6347'},
            {x: 20 + (17 * 5), y: boardHeight + 9 + (17 * 2), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#32CD32', boxColor: '#00CED1'},

            {x: 20 + (17 * 3), y: boardHeight + 9 + (17 * 3), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#FFD700', boxColor: '#1E90FF'},
            {x: 20 + (17 * 4), y: boardHeight + 9 + (17 * 3), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#20B2AA', boxColor: '#FF69B4'},

            {x: 20 + (17 * 3.5), y: boardHeight + 9 + (17 * 4), type: PresentBox, scale: 0.4, rotation: Math.PI, ribbonColor: '#9370DB', boxColor: '#32CD32'},



            {x: midWidth, y: boardHeight + 15, type: SnowMan, scale: 0.4, rotation: Math.PI},
            {x: midWidth + 40, y: boardHeight + 12, type: SnowMan, scale: 0.3, rotation: Math.PI},
            {x: midWidth + 40 + 27, y: boardHeight + 10, type: SnowMan, scale: 0.2, rotation: Math.PI},
            {x: midWidth + 40 + 27 + 16, y: boardHeight + 8, type: SnowMan, scale: 0.1, rotation: Math.PI},
            {x: boardWidth + 20, y: boardHeight -40, type: ShakySnowman, scale: 0.4, rotation: Math.PI/2},

        ]

        this.prepareObjects()
    }


}

export default DecorationManager;