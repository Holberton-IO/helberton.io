import Block from './ui/objects/block.js';

class GameObjects {
    constructor() {
        this.players = [];
        this.blocks = [];
        this.myPlayer = null;
        this.mapSize = 0;
    }

    addMyPlayer(player) {
        this.myPlayer = player;
        this.players.push(player);
    }


    addPlayer(player) {
        this.players.push(player);
    }

    addBlock(block) {
        return Block.getBlockAt(block.position, this.blocks);
    }


}

export default GameObjects;