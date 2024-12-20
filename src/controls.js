import Player from "./ui/objects/player";

const keyMapper = { //In Circle Way
    ArrowUp: 1,
    ArrowDown: 3,
    ArrowLeft: 4,
    ArrowRight: 2,
}

window.onkeyup = (e) => {
    //console.log(keyMapper[e.key]);
    const keyVal = keyMapper[e.key];
    if(keyVal && window.client && window.client.player && window.client.player.isReady){
        const dir = Player.mapControlsToDir(keyVal);
        window.client.player.requestChangeDir(dir);
    }
};
