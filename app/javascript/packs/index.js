import Bitmap from '../bitmap';

let dataArray;

const COLORS = [
    0x000000FF, // Black
    0xA9A9A9FF, // DarkGray
    0xD3D3D3FF, // LightGray
    0xFF0000FF, // Red
    0xFFFF00FF, // Yellow
    0xFFA500FF, // Orange
    0x8B4513FF, // Brown
    0xD2B48CFF, // Tan
    0x008000FF, // Green
    0x00FF00FF, // Lime Green
    0x00FFFFFF, // Cyan
    0x0000FFFF, // Blue
    0x9400D3FF, // Purple
    0xFF69B4FF, // Pink,
    0xFFFFFFFF, // White
    0x00BFFFFF, // Lt.Blue
];


// document.onkeydown = handleKeyPress;
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

const ZOOM_MAX = 40;
const ZOOM_MIN = 5;
const center    = { x: 0, y: 0 }

let zoom      = 10;
let xOffset   = -2500;
let yOffset   = -2500;

// stores the x,y values of the current motion
let motionVector = [0,0];
let motionSpeed = 1;

function resize(ctx) {
    ctx.width  = window.innerWidth;
    ctx.height = window.innerHeight;
}

function draw() {
    let c = document.getElementById('place-canvas');
    let ctx = c.getContext("2d");

    ctx.beginPath();
    ctx.rect(20, 20, 150, 100);
    ctx.fillStyle = "red";
    ctx.fill();
}

const getPlaceData = async () => {
    const resp = await fetch('http://localhost:3000/bitmap');
    let buffer = await resp.arrayBuffer();

    let packed = new Uint8Array(buffer);
    let unpacked = unpack(packed);
    let colorData = assign32BitColors(unpacked);
    // console.log(colorData);
    let clamped = convertToUint8ClampedArray(colorData);
    return clamped;
}

// Movement functions
function handleKeyDown(e) {
    e.preventDefault();
    // check type of keypress for ←↑→↓
    switch (e.keyCode) {
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
}
function handleKeyUp(e) {
    e.preventDefault();
    switch (e.keyCode) {
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

}



function zoomIn(d=1) {
    if (zoom < ZOOM_MAX && zoom >= ZOOM_MIN) {
        let el = document.getElementById('place-inner');
        zoom += d;
        el.style.transform = `scale(${zoom}, ${zoom})`
    }
}

function zoomOut(d=1) {
    if (zoom <= ZOOM_MAX && zoom > ZOOM_MIN) {
        zoom -= d;
        setZoom(zoom);
    }
}

function setZoom(z) {
    let el = document.getElementById('place-inner');
    el.style.transform = `scale(${zoom}, ${zoom})`
}

// BITWISE FUNCTIONS
function splitLow4Bits(num) {
    return (num & parseInt('00001111', 2))
}

function splitHigh4Bits(num) {
    return (num & parseInt('11110000', 2)) >> 4
}

function unpack(array) {
    let unpacked = [];
    for (let i = 0; i < array.length; i++) {
        let num = array[i];
        let high = splitHigh4Bits(num);
        unpacked.push(high);
        let low = splitLow4Bits(num);
        unpacked.push(low);
    }
    return unpacked;
}

function assign32BitColors(array) {
    return new Uint32Array(array.map(x => COLORS[x]))
}

function convertToUint8ClampedArray(array) {
    // first order - 255
    // second order - 65280
    // third order - 16711680

    let test = array.reduce((arr, num) => {
        let bytes = toBytesInt32(num);
        arr.push(bytes[0])
        arr.push(bytes[1])
        arr.push(bytes[2])
        arr.push(bytes[3])
        return arr;
    }, []);

    return new Uint8ClampedArray(test)
}
function toBytesInt32 (num) {
    let arr = new Uint8Array([
         (num & 0xff000000) >> 24,
         (num & 0x00ff0000) >> 16,
         (num & 0x0000ff00) >> 8,
         (num & 0x000000ff)
    ]);
    return arr;
}


(async function init() {
    // load initial bitmap state
    // GET /bitmap
    let c = document.createElement('canvas');
    c.id = 'place-canvas'
    c.addEventListener('click', (e) => {
        console.log(e)
    });
    // resize(c);
    c.width  = 1000;
    c.height = 1000;
    let container = document.getElementById('place-inner');

    container.appendChild(c);

    let t = document.getElementById('place-canvas');
    let data = await getPlaceData();

    
    let ctx = t.getContext("2d");
    disableSmoothing(ctx);
    ctx.putImageData(new ImageData(data, 1000, 1000), 0, 0);

    runLoop();
})();

function disableSmoothing(ctx) {
    ctx.imageSmoothingEnabled       = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled    = false;
    ctx.msImageSmoothingEnabled     = false;
    ctx.oImageSmoothingEnabled      = false;
}


function moveImage() {
    let e = document.getElementById("place-outer");

    if (motionVector[0] !== 0 || motionVector[1] !== 0) {
        // movementSpeed = maxZoom / currentZoom * speedMultiplier
        let xSpeed = motionVector[0] * motionSpeed;
        let ySpeed = motionVector[1] * motionSpeed;
        let zoomRatio = ZOOM_MAX / zoom;

        xOffset += zoomRatio * xSpeed;
        yOffset += zoomRatio * ySpeed;

        e.style.transform = `translate(${xOffset}px, ${yOffset}px)`
    }
}

function runLoop(e) {
    function loop() {
        // check for changed data and redraw if necessary
        // if no updates, dont redraw
        moveImage();
        window.setTimeout(window.requestAnimationFrame(loop), 100);
    }
    // this runs the loop on the next animation frame (~16ms)
    window.requestAnimationFrame(loop);
}