import { bitmap } from '../bitmap';
import { 
    disableSmoothing,
    setupCanvas,
    getData,
    keyDownToVector,
    keyUpToVector,
    RGBAToHexA,
    rgbToHex
} from '../helpers';

// TEST DATA
let randColor = Math.floor(Math.random() * 15)
let nextPoint = [0,0];
let movementBorder = 50;
// /TEST DATA

// colors
const COLORS = [
    0xFF000000, // 0 - Black
    0xFFA9A9A9, // 1 - DarkGray
    0xFFD3D3D3, // 2 - LightGray
    0xFF0000FF, // 3 - Red
    0xFF00FFFF, // 4 - Yellow
    0xFF00A5FF, // 5 - Orange
    0xFF13458B, // 6 - Brown
    0xFF8CB4D2, // 7 - Tan
    0xFF008000, // 8 - Green
    0xFF00FF00, // 9 - Lime Green
    0xFFFFFF00, // 10 - Cyan
    0xFFFF0000, // 11 - Blue
    0xFFD30094, // 12 - Purple
    0xFFB469FF, // 13 - Pink,
    0xFFFFBF00, // 14 - Lt.Blue
    0xFFFFFFFF, // 15 - White
];
const RBGACOLORS = [
    0x000000FF, // 0 - Black
    0xA9A9A9FF, // 1 - DarkGray
    0xD3D3D3FF, // 2 - LightGray
    0xFF0000FF, // 3 - Red
    0xFFFF00FF, // 4 - Yellow
    0xFFA500FF, // 5 - Orange
    0x8B4513FF, // 6 - Brown
    0xD2B48CFF, // 7 - Tan
    0x008000FF, // 8 - Green
    0x00FF00FF, // 9 - Lime Green
    0x00FFFFFF, // 10 - Cyan
    0x0000FFFF, // 11 - Blue
    0x9400D3FF, // 12 - Purple
    0xFF69B4FF, // 13 - Pink,
    0x00BFFFFF, // 14 - Lt.Blue
    0xFFFFFFFF, // 15 - White
];
// Values for tracking the current position
const ZOOM_MAX = 40;
const ZOOM_MIN = 10;
const ZOOM_SPEED = 1;
let zoom      = 10;
let xOffset   = -2500; // 1000px * zoom:5 / 2 = center of image
let yOffset   = -2500;
let center    = { x: 0, y: 0 }

// stores the x,y values of the current motion
let motionVector = [0,0];
let motionSpeed = 2;

// application state
let blurred   = true;
let displayMenu = true;
let userColor = 0;
let disableControls = true;
let buttonShadow = true;

// controls
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('wheel', handleScrollWheel);

// always on
window.addEventListener('place-queue-update', handleQueueUpdate);
window.addEventListener('DOMContentLoaded', init);

// function handleClick(e) {
//     console.log('click', e);
// }

// function handleDblClick(e) {
//     // console.log('double click', e);
//     let el = document.getElementById('place-canvas');
// }

function handleQueueUpdate(e) {
    let canvas = document.getElementById('place-canvas');
    // let ctx = canvas.getContext("2d");
    bitmap.queueUpdate(e.detail.message);
    // toggleBlur(canvas, blurred);
}
function handleScrollWheel(e) {
    // e.preventDefault();
    if (!disableControls) {
        let deltaY = e.deltaY;
        if (deltaY > 0) zoomOut(ZOOM_SPEED);
        else if(deltaY < 0) zoomIn(ZOOM_SPEED);
    }
}

// check type of keypress for ←↑→↓
function handleKeyDown(e) {
    e.preventDefault();
    if (!disableControls) {
        motionVector = [...keyDownToVector(e.keyCode, motionVector)];
    }
}
function handleKeyUp(e) {
    e.preventDefault();
    if (!disableControls) {
        motionVector = [...keyUpToVector(e.keyCode, motionVector)];
    }
}

async function handlePaintClick(event) {
    if (!disableControls) {
        // get current pixel position and color
        let [x, y, color] = getPixelData(event);
        // paint the pixel first
        bitmap.paintPixel(x, y, userColor)
        // update the server
        fetch(`/paints/${x}/${y}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ color: userColor })
        }).catch((error) => {
            // something went wrong
            // reset the pixel color
            bitmap.paintPixel(x, y, color)
        })
    }
}

function handleMenuToggle(event) {
    let canvas = document.getElementById('place-canvas');
    let el = document.querySelector('.color-picker-box');
    if (displayMenu) {
        toggleBlur(canvas);
        el.style.display = 'none';
        displayMenu = false;
        disableControls = false;
    } else {
        toggleBlur(canvas);
        el.style.display = 'block';
        displayMenu = true;
        disableControls = true;
    }
}

function toggleBlur(el) {
    if (blurred) {
        el.style.webkitFilter = "blur(0.0px)";
        el.style.filter = "blur(0.0px)";
        blurred = false
    } else {
        el.style.webkitFilter = "blur(0.5px)";
        el.style.filter = "blur(0.5px)";
        blurred = true;
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
    let innerEl = document.getElementById('place-inner');
    let outerEl = document.getElementById('place-outer');

    let lastZoom = zoom;

    // let deltaX = 
    innerEl.style.transform = `scale(${z}, ${z})`
    outerEl.style.transform = ``;
    zoom = z;
}

function handleAutoPaintPixels() {
    let [x, y] = nextPoint;
    fetch(`/paints/${x}/${y}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ color: randColor })
    })
    nextPoint[0]++;
}

function drawBitmap(ctx, data) {
    ctx.putImageData(new ImageData(data, 1000, 1000), 0, 0);
}

function drawControls(ctx) {
    ctx.beginPath();
    ctx.arc(100, 75, 50, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'red';
}

function handleChangeColor(event) {
    let code = parseInt(event.target.dataset.color);
    let el = document.querySelector('.color-picker-box');
    setUserColor(code);
    el.style.display = 'none';
}

function setUserColor(code) {
    let button = document.getElementById('color-picker-toggle');
    userColor = code;
    // update color-picker-button
    button.style.backgroundColor = RGBAToHexA(COLORS[code]);
    let canvas = document.getElementById('place-canvas');
    if (displayMenu) {
        toggleBlur(canvas);
        displayMenu = false;
        disableControls = false;
    } else {
        toggleBlur(canvas);
        displayMenu = true;
        disableControls = true;
    }
}

function createColorPicker() {
    let container = document.querySelector('.color-picker-list');

    COLORS.forEach( (color, index) => {
        let colorBox = document.createElement('div');

        let hex = RGBAToHexA(color);

        colorBox.dataset.color = index;
        colorBox.className = "color-picker-item";
        // console.log(`#${color.toString(16)}`)
        colorBox.style.backgroundColor = hex;

        colorBox.addEventListener('click', handleChangeColor);
        container.appendChild(colorBox);
    });
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
        if (xOffset <= (0 - xDelta + movementBorder)) xOffset += xDelta;
        if (yOffset <= (0 - yDelta + movementBorder)) yOffset += yDelta;

        // contrain Right & Down
        if (xOffset < (-5000 + window.innerWidth - movementBorder)) xOffset = (-5000 + window.innerWidth - movementBorder)
        if (yOffset < (-5000 + window.innerHeight - movementBorder)) yOffset = (-5000 + window.innerHeight - movementBorder)

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
            drawBitmap(ctx, bitmap.Uint8ClampedData);

            // drawControls(ctx);
        }
        // schedule loop to run again
        window.setTimeout(window.requestAnimationFrame(loop), 50);
    }
    // this runs the loop on the next animation frame (~16ms)
    window.requestAnimationFrame(loop);
}

function getPixelData(event) {
    let ctx = document.getElementById('place-canvas').getContext("2d")
    let x = event.offsetX - 1
    let y = event.offsetY - 1
    let color = ctx.getImageData(x, y, 1, 1).data
    console.log(color)
    let hex = "#" + ("00000000" + rgbToHex(...color)).slice(-8)
    return [x, y, color]
}

async function init() {
    createColorPicker();
    let canvas = setupCanvas(1000, 1000);

    bitmap.data = await getData('/bitmap');

    // display image on canvas
    let ctx = canvas.getContext("2d");
    disableSmoothing(ctx); // this doesn't do anything?
    // initial image
    drawBitmap(ctx, bitmap.Uint8ClampedData)

    // handle paint clicks
    canvas.addEventListener('click', handlePaintClick);

    let menuButton = document.getElementById("color-picker-toggle");
    menuButton.addEventListener('click', handleMenuToggle);

    // start the loop!
    runLoop(ctx);
}