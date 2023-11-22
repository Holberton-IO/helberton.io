const linearInterpolate = (a, b, v) => {
    return a + (b - a) * v;
}


const inverseLinearInterpolate = (a, b, v) => {
    return (v - a) / (b - a);
}

const adaptedLinearInterpolate = (a, b, val1, val2) => {
    let x = 1 - Math.pow((1 - val1), val2);
    return linearInterpolate(a, b, x);
};

const adaptedConLinearInterpolate = (val2) => (a, b, val1) => {
    return adaptedLinearInterpolate(a, b, val1, val2);
}

const smoothLimit = (v) => {
    let negative = v < 0;
    if (negative) {
        v *= -1;
    }
    v = 1 - Math.pow(2, -v);
    if (negative) {
        v *= -1;
    }
    return v;
}

const clamp = (val, min, max) => {
    return Math.max(min, Math.min(max, val));
}


const calPercentage = (a, percentage) => a * percentage;

export {
    linearInterpolate, inverseLinearInterpolate, adaptedLinearInterpolate, adaptedConLinearInterpolate
    , clamp , smoothLimit,calPercentage
};