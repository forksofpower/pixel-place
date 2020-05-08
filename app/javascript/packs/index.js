import { bitmap } from '../bitmap';
import { 
    disableSmoothing,
    setupCanvas,
    getData,
    keyDownToVector,
    keyUpToVector
} from '../helpers';

// TEST DATA
let randColor = Math.floor(Math.random() * 15)
let nextPoint = [0,0];
let movementBorder = 50;
// /TEST DATA

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
let userColor = 15;
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

function handlePaintClick(event) {
    if (!disableControls) {
        let [x, y] = getPixelCoordinates(event);
        fetch(`http://localhost:3000/paints/${x}/${y}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ color: Math.floor(Math.random() * 15) })
        })
    }
}

function handleMenuToggle(event) {
    let canvas = document.getElementById('place-canvas');
    if (displayMenu) {
        toggleBlur(canvas);
        // toggleShadow(event.target);
        displayMenu = false;
        disableControls = false;
        // canvas.style.display = "block"

    } else {
        toggleBlur(event.target);
        // toggleShadow(event.target);
        displayMenu = true;
        disableControls = true;
        // canvas.style.display = 'none'
    }
}

function toggleBlur(el) {
    if (blurred) {
        el.style.filter = "blur(0.0px)";
        el.style.webkitFilter = "blur(0.0px)";
        blurred = false
    } else {
        el.style.filter = "blur(0.2px)";
        el.style.webkitFilter = "blur(0.2px)";
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

function drawBitmap(ctx, data) {
    ctx.putImageData(new ImageData(data, 1000, 1000), 0, 0);
}

function drawControls(ctx) {
    ctx.beginPath();
    ctx.arc(100, 75, 50, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'red';
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

function getPixelCoordinates(event) {
    return [event.offsetX - 1, event.offsetY - 1]
}

async function init() {
    let canvas = setupCanvas(1000, 1000);

    bitmap.data = await getData('http://localhost:3000/bitmap');

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