import Block from './ui/objects/block.js';

class GameObjects {
    constructor() {
        this.players = {};
        this.blocks = [];
        this.myPlayer = null;
        this.mapSize = 0;
    }



    addPlayer(player) {
        if (player.id in this.players)
            return this.players[player.id];
        if (player.isMyPlayer)
            this.myPlayer = player;
        this.players[player.id] = player;
        return player;
    }

    addBlock(block) {
        return Block.getBlockAt(block.position, this.blocks);
    }


}

export default GameObjects;