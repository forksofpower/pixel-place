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

class Bitmap {
    constructor() {
        this._updateQueue = [];
        this._dataBuffer = null;
        this._colorData = null;
        this._clampedColorData = null;
    }

    set data(buffer) {
        console.log(buffer)
        let packed = new Uint8Array(buffer);
        let unpacked = unpack(packed);
        this._colorData = new Uint32Array(unpacked.map(x => COLORS[x]));
        this._dataBuffer = this._colorData.buffer;
        this._clampedColorData = new Uint8ClampedArray(this._dataBuffer);
    }

    get Uint8ClampedData() {
        return this._clampedColorData;
    }

    get updateQueue() {
        return this._updateQueue;
    }

    queueUpdate(data) {
        this._updateQueue.push(data);
    }

    getUpdatesAndClear() {
        let updates = [...this._updateQueue];
        this._updateQueue = [];

        return updates;
    }

    paintPixel(x, y, color) {
        // set data in the Uint32Array
        let offset = (x + 1000 * y)
        this._colorData[offset] = COLORS[color];
    }
    
}
function expand(num) {
    return [(num & 0xf0) >> 4, (num & 0x0f)]
}
function unpack(array) {
    let unpacked = [];

    for (let i = 0; i < array.length; i++) {
        let codes = expand(array[i]);
        unpacked.push(...codes);
    }

    return unpacked;
}

export let bitmap = new Bitmap();

// BITWISE FUNCTIONS
// NO LONGER NEEDED
// function splitLow4Bits(num) {
//     return (num & parseInt('00001111', 2))
// }

// function splitHigh4Bits(num) {
//     return (num & parseInt('11110000', 2)) >> 4
// }

// All this is no longer needed because of
//   the magic of ArrayBuffer and TypedArrays
//
// function assign32BitColors(array) {
//     return new Uint32Array(array.map(x => COLORS[x]))
// }
// function convertToUint8ClampedArray(array) {
//     let test = array.reduce((arr, num) => {
//         let bytes = toBytesInt32(num);
//         arr.push(bytes[0])
//         arr.push(bytes[1])
//         arr.push(bytes[2])
//         arr.push(bytes[3])
//         return arr;
//     }, []);
//     return new Uint8ClampedArray(test)
// }
// // split 32bits into 4 x 8bits
// function toBytesInt32 (num) {
//     let arr = new Uint8Array([
//          (num & 0xff000000) >> 24,
//          (num & 0x00ff0000) >> 16,
//          (num & 0x0000ff00) >> 8,
//          (num & 0x000000ff)
//     ]);
//     return arr;
// }