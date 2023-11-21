const globals =  {
    gameSpeed: 0.006,
    viewPortRadius: 30,
    maxZoom: 430,
    maxBlocksNumber: 1100,
    usernameLength: 6,
    maxWaitingSocketTime: 1_000,
};

window.game = {};
// Adding to window object
Object.entries(globals).forEach(([key, value]) => {
    window.game[key] = value;
});

export {};