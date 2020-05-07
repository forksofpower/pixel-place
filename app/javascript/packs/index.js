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

const xOffset = 0;
const yOffset = 0;

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

// function handleWindowResize() {
//     let ctx = document.getElementById('place-canvas');
//     resize(ctx);
//     draw();
// }

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
    let container = document.getElementById('place');

    container.appendChild(c);

    let data = await getPlaceData();
    let t = document.getElementById('place-canvas');
    let ctx = t.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // ctx.scale(1.5, 1.5)
    ctx.putImageData(new ImageData(data, 1000, 1000), 0, 0);
    // console.log(data);
})();




// function handleImageLoad(e) {
//     function loop() {
//         // check for changed data and redraw if necessary
//         // if no updates, dont redraw
//         draw();

//         window.setTimeout(window.requestAnimationFrame(loop), 100);
//     }
//     // this runs the loop on the next animation frame (~16ms)
//     window.requestAnimationFrame(loop);
// }