// class Bitmap {
//     constructor() {
//         this.test = "Hello, World!";

//         this.init();
//     }

//     async init() {
//         console.log(this.test);
//     }

// }
// export default Bitmap;

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