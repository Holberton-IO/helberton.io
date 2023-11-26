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

    setBlocks(blocks) {
        this.blocks = blocks;
    }

    setPlayers(players) {
        this.players = players;
    }
}

export default GameObjects;