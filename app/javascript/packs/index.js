import { bitmap } from '../bitmap';
import { 
    // getPlaceData,
    toggleBlur,
    disableSmoothing
} from '../helpers';

let dataArray;
let nextPoint = [0,0];


// colors in ABGR!!!
const COLORS = [
    0xFF000000, // Black
    0xFFA9A9A9, // DarkGray
    0xFFD3D3D3, // LightGray
    0xFF0000FF, // Red
    0xFF00FFFF, // Yellow
    0xFF00A5FF, // Orange
    0xFF13458B, // Brown
    0xFF8CB4D2, // Tan
    0xFF008000, // Green
    0xFF00FF00, // Lime Green
    0xFFFFFF00, // Cyan
    0xFFFF0000, // Blue
    0xFFD30094, // Purple
    0xFFB469FF, // Pink,
    0xFFFFFFFF, // White
    0xFFFFBF00, // Lt.Blue
];
let randColor = Math.floor(Math.random() * 15)

// document.onkeydown = handleKeyPress;
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('wheel', handleScrollWheel);
window.addEventListener('place-queue-update', handleQueueUpdate);
window.addEventListener('DOMContentLoaded', init);

const ZOOM_MAX = 40;
const ZOOM_MIN = 5;
const ZOOM_SPEED = 0.25

let zoom      = 10;
let xOffset   = -2500; // 1000px * zoom:5 / 2 = center of image
let yOffset   = -2500;
let center    = { x: 0, y: 0 }

// stores the x,y values of the current motion
let motionVector = [0,0];
let motionSpeed = 1;

// application state
let blurred   = false;

function resize(ctx) {
    ctx.width  = window.innerWidth;
    ctx.height = window.innerHeight;
}

// function draw() {
//     let c = document.getElementById('place-canvas');
//     let ctx = c.getContext("2d");

//     ctx.beginPath();
//     ctx.rect(20, 20, 150, 100);
//     ctx.fillStyle = "red";
//     ctx.fill();
// }

// Movement functions
function handleQueueUpdate(e) {
    let el = document.getElementById('place-canvas');
    bitmap.queueUpdate(e.detail.message);
}
function handleScrollWheel(e) {
    // e.preventDefault();
    let deltaY = e.deltaY;
    if (deltaY > 0) zoomOut(ZOOM_SPEED);
    else if(deltaY < 0) zoomIn(ZOOM_SPEED);
}

const getPlaceData = async () => {
    const resp = await fetch('http://localhost:3000/bitmap');
    let buffer = await resp.arrayBuffer();
    // let packed = new Uint8Array(buffer);
    // let unpacked = unpack(packed);
    // let colorData = assign32BitColors(unpacked);
    
    // // console.log(colorData);
    // let clamped = convertToUint8ClampedArray(colorData);
    return buffer;
}

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

function zoomIn(delta=1) {
    if (zoom < ZOOM_MAX && zoom >= ZOOM_MIN) {
        setZoom(zoom + delta);
    }
}

function zoomOut(delta=1) {
    if (zoom <= ZOOM_MAX && zoom > ZOOM_MIN) {
        setZoom(zoom - delta);
    }
}

function setZoom(z) {
    let el = document.getElementById('place-inner');
    zoom = z
    el.style.transform = `scale(${z}, ${z})`
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


function setupCanvas(width, height) {
    let canvas = document.createElement('canvas');
    canvas.id = 'place-canvas'

    canvas.width  = width;
    canvas.height = height;
    document.getElementById('place-inner').appendChild(canvas);

    return canvas;
}

async function init() {
    let canvas = setupCanvas(1000, 1000);

    bitmap.data = await getPlaceData();

    // display image on canvas
    let ctx = canvas.getContext("2d");
    disableSmoothing(ctx);
    console.log(bitmap.Uint8ClampedData);
    ctx.putImageData(new ImageData(bitmap.Uint8ClampedData, 1000, 1000), 0, 0);

    // start the loop!
    runLoop(ctx);

    // test the updates
    setInterval(paintPixels, 2000); 
}
function paintPixels() {
    let [x, y] = nextPoint;
    fetch(`http://localhost:3000/paints/${x}/${y}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ color: randColor })
    })
    nextPoint[0]++;
}

function move() {
    let panContainer = document.getElementById("place-outer");

    // check if vector has direction
    if (motionVector[0] !== 0 || motionVector[1] !== 0) {
        // slow movement when zoomed out to prevent user from vomiting
        // movementSpeed = maxZoom / currentZoom * speedMultiplier
        let xSpeed = motionVector[0] * motionSpeed;
        let ySpeed = motionVector[1] * motionSpeed;
        let zoomRatio = ZOOM_MAX / zoom;

        let xDelta = zoomRatio * xSpeed;
        let yDelta = zoomRatio * ySpeed;

        // contrain Left & Up
        if (xOffset <= (0 - xDelta + 100)) xOffset += xDelta;
        if (yOffset <= (0 - yDelta + 100)) yOffset += yDelta;

        // contrain Right & Down
        if (xOffset < (-5000 + window.innerWidth - 100)) xOffset = (-5000 + window.innerWidth - 100)
        if (yOffset < (-5000 + window.innerHeight - 100)) yOffset = (-5000 + window.innerHeight - 100)

        // do transformation
        panContainer.style.transform = `translate(${xOffset}px, ${yOffset}px)`
    }
}

function runLoop(ctx) {
    function loop() {
        // update position
        move();
        // check for new paints and update bitmap
        if (bitmap.updateQueue.length > 0) {
            let updates = bitmap.getUpdatesAndClear();

            // loop through updates
            updates.forEach( ({x, y, c: color}) => {
                bitmap.paintPixel(x, y, color);
            });
            ctx.putImageData(new ImageData(bitmap.Uint8ClampedData, 1000, 1000), 0, 0);
        }
        // schedule loop to run again
        window.setTimeout(window.requestAnimationFrame(loop), 50);
    }
    // this runs the loop on the next animation frame (~16ms)
    window.requestAnimationFrame(loop);
}