const getHeight = () => window.innerHeight;
const getWidth = () => window.innerWidth;

const calculate_pixel_ratio = () => {
    let context = document.createElement("canvas").getContext("2d");
    let dpr = window.devicePixelRatio || 1;
    let bsr = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    return dpr / bsr;
}

const ease = {
    in: function (t) {
        return t * t * t * t;
    },
    out: function (t) {
        return 1 - Math.pow(1 - t, 4);
    },
    inout: function (t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    },
};


const drawInCtxRec = (ctx, point, size, color, spacing = 0) => {
    ctx.fillStyle = color;
    ctx.fillRect(point.x + spacing, point.y + spacing, size, size);
}


const convertIntColorToHex = (color) => {
    return "#" + ("000000" + color.toString(16)).slice(-6);
}


const isOppositeDir = (newDir, OldDir) => {
    if (newDir === 'up' && OldDir === 'down')
        return true;
    else if (newDir === 'down' && OldDir === 'up')
        return true;
    else if (newDir === 'left' && OldDir === 'right')
        return true;
    else return newDir === 'right' && OldDir === 'left';

}

const isVerticalDir = (dir) => {
    return dir === 'up' || dir === 'down';
}

const isMovingToPositiveDir = (dir) => {
    return dir === 'down' || dir === 'right';

}

export {isMovingToPositiveDir,isVerticalDir,isOppositeDir, convertIntColorToHex, getHeight, getWidth, calculate_pixel_ratio, ease, drawInCtxRec}