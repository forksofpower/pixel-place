function disableSmoothing(ctx) {
    ctx.imageSmoothingEnabled       = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled    = false;
    ctx.msImageSmoothingEnabled     = false;
    ctx.oImageSmoothingEnabled      = false;
}

function setupCanvas(width, height) {
    let canvas = document.createElement('canvas');
    canvas.id = 'place-canvas'

    canvas.width  = width;
    canvas.height = height;
    document.getElementById('place-inner').appendChild(canvas);

    return canvas;
}

const getData = async (url) => {
    const resp = await fetch(url);
    let buffer = await resp.arrayBuffer();
    return buffer;
}

function keyDownToVector(key, motionVector) {
    switch (key) {
        case 87: // W
            if (motionVector[1] < 1) motionVector[1] += 1
            break;
        case 65: // A
            if (motionVector[0] < 1) motionVector[0] += 1
            break;
        case 83: // S
            if (motionVector[1] > -1) motionVector[1] -= 1
            break
        case 68: // D
            if (motionVector[0] > -1) motionVector[0] -= 1
            break;
        default:
            break;
    }
    return motionVector;
}

function keyUpToVector(key, motionVector) {
    switch (key) {
        case 87: // W
            if (motionVector[1] > -1) motionVector[1] -= 1
            break;
        case 65: // A
            if (motionVector[0] > -1) motionVector[0] -= 1
            break;
        case 83: // S
            if (motionVector[1] < 1) motionVector[1] += 1
            break
        case 68: // D
            if (motionVector[0] < 1) motionVector[0] += 1
            break;
        default:
            break;
    }
    return motionVector
}


export {
    disableSmoothing,
    setupCanvas,
    getData,
    keyDownToVector,
    keyUpToVector
}