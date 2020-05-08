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
function RGBAToHexA(color) {
    let arr = new Uint8ClampedArray([
        (color & 0x000000ff),
        (color & 0x0000ff00) >> 8,
        (color & 0x00ff0000) >> 16,
        (color & 0xff000000) >> 24
    ]);
    let r = arr[0].toString(16);
    let g = arr[1].toString(16);
    let b = arr[2].toString(16);
    let a = arr[3].toString(16);
  
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
    if (a.length == 1)
      a = "0" + a;
  
    return "#" + r + g + b + "ff";
  }


export {
    disableSmoothing,
    setupCanvas,
    getData,
    keyDownToVector,
    keyUpToVector,
    RGBAToHexA
}