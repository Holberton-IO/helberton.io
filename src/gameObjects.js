import Block from './ui/objects/block.js';

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

    isPlayerExist(player) {
        return player.id in this.players;
    }

    addBlock(block) {
        return Block.getBlockAt(block.position, this.blocks);
    }


}

export default GameObjects;