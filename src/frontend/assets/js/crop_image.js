let endwidth = 0;
let endheight = 0;
let endPosX = 0;
let endPosY = 0;

function startCroping(canvas, rectx, recty, side) {
    var isMouseDown = false;
    var rect_lastposX = rectx;
    var rect_lastposY = recty;
    document.onmousedown = function (e) { isMouseDown = true; };
    document.onmouseup = function (e) { isMouseDown = false; };
    document.onmousemove = function (e) {
        if (isMouseDown) {
            //Check if in Canvas
            canvas_coordinates = canvas.getBoundingClientRect();

            if (e.clientX >= canvas_coordinates.x && e.clientX <= (canvas_coordinates.x + canvas_coordinates.width) && e.clientY >= canvas_coordinates.y && e.clientY <= (canvas_coordinates.y + canvas_coordinates.height)) {
                mouseXinCanvas = (e.clientX - canvas_coordinates.x);
                mouseYinCanvas = (e.clientY - canvas_coordinates.y);

                console.log("X: ", mouseXinCanvas, ", Y: ", mouseYinCanvas, rectx, side);

                // if (mouseXinCanvas >= rectx && mouseXinCanvas <= (rectx + side) && mouseYinCanvas >= recty && mouseYinCanvas <= (recty + side)) {
                //     console.log("true");
                // }
            }
            //console.log(e.clientX, e.clientY);
        }
    };
}

function zoomImage() {
    slider = document.getElementById("slider-resize-image");

    if (slider.value == slider.min) {
        document.getElementById("little-image-resize").style.opacity = "0.6";
    }
    else {
        document.getElementById("little-image-resize").style.opacity = "1";
    }

    if (slider.value == slider.max) {
        document.getElementById("big-image-resize").style.opacity = "0.6";
    }
    else {
        document.getElementById("big-image-resize").style.opacity = "1";
    }



}