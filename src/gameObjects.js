import Block from './ui/objects/block.js';

class GameObjects {
    constructor() {
        this.players = {};
        this.blocks = [];
        this.myPlayer = null;
        this.mapSize = 0;
    }

    addMyPlayer(player) {
        this.myPlayer = player;
        this.players[player.id] = player;
    }


    addPlayer(player) {
        if (this.players[player.id])
            return
        this.players[player.id] = player;
    }

    addBlock(block) {
        return Block.getBlockAt(block.position, this.blocks);
    }


}

export default GameObjects;