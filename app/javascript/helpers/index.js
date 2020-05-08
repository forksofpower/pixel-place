function toggleBlur(el) {
    if (blurred) {
        el.style.webkitFilter = "";
        blurred = false
    } else {
        el.style.webkitFilter = "blur(0.2px)";
        blurred = true;
    }
}

function disableSmoothing(ctx) {
    ctx.imageSmoothingEnabled       = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled    = false;
    ctx.msImageSmoothingEnabled     = false;
    ctx.oImageSmoothingEnabled      = false;
}


export {
    disableSmoothing,
    toggleBlur,
    // getPlaceData
}