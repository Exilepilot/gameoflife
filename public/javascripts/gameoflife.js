
var socket = io();

// Utility function for getting accurate mouse coordinates relative to canvas position.
function relMouseCoords(event){
    let totalOffsetX = 0;
    let totalOffsetY = 0;
    let canvasX = 0;
    let canvasY = 0;
    let currentElement = this;
    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    } while(currentElement = currentElement.offsetParent)
    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;
    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
let ctx = canvas.getContext("2d");
let startBtn = document.createElement("button");
let stopBtn = document.createElement("button");
let genCounter = document.createElement("p");
let resetBtn = document.createElement("button");

genCounter.innerHTML = "";
startBtn.appendChild(document.createTextNode("Start!"));
resetBtn.appendChild(document.createTextNode("Reset"));
stopBtn.appendChild(document.createTextNode("Stop!"));

document.body.appendChild(startBtn);
document.body.appendChild(stopBtn);
document.body.appendChild(resetBtn);
document.body.appendChild(genCounter);

const padding = 100;
let MAX_W = 50;
let MAX_H = 50;

/*
* Drawing
*/

// Set canvas size to window size
function canvasSetFullscreen(ctx){
    let width = $(window).width() - padding;
    let height = $(window).height() - padding;
    ctx.canvas.width = width;
    ctx.canvas.height = height;
}

// FIX: styling
// TODO: Make optional
// Draw canvas grid
function canvasDrawGrid(ctx){
    let cellWidth = parseInt(ctx.canvas.width / MAX_W);
    //let cellHeight = parseInt(ctx.canvas.height / MAX_H);
    let cellHeight = cellWidth

    for (let y = 0; y <= MAX_H; y++)
    {
        ctx.moveTo(0, y * cellHeight);
        ctx.lineTo(ctx.canvas.width, y * cellHeight)
        ctx.stroke();
    }

    for (let x = 0; x <= MAX_W; x++)
    {
        ctx.moveTo(x * cellWidth, 0);
        ctx.lineTo(x * cellWidth, ctx.canvas.height)
        ctx.stroke();
    }
}

// TODO: Draw a cell at x, y on the board.
function canvasDrawCell(ctx, x, y){
    let cellWidth = parseInt(ctx.canvas.width / MAX_W);
    //let cellHeight = parseInt(ctx.canvas.height / MAX_H);
    let cellHeight = cellWidth

    let startX = cellWidth * x;
    let startY = cellHeight * y;
    ctx.fillRect(startX, startY, cellWidth, cellHeight);
}

function canvasDrawBoard(ctx, aliveCells){
    for (let i = 0; i <= aliveCells.length - 1; i++){
        canvasDrawCell(ctx, aliveCells[i][0], aliveCells[i][1]);
    }
}

// TODO: Draw game of life on canvas
function canvasDrawGame(ctx, aliveCells){
    // Set to fullscreen
    canvasSetFullscreen(ctx);
    // Draw grid
    //canvasDrawGrid(ctx);
    // Draw cells from current state
    canvasDrawBoard(ctx, aliveCells);
}

function canvasUpdate(aliveCells)
{
    console.log(aliveCells);
    canvasDrawGame(ctx, aliveCells);
}
socket.on('canvas update', canvasUpdate)
/*
* Events
*/

// Window resize event
function onWindowResize(){
    canvasSetFullscreen(ctx);
}
$(window).on('resize', onWindowResize);

// Canvas click event
function onCanvasClick(e){
    let cellWidth = parseInt(ctx.canvas.width / MAX_W);
    //let cellHeight = parseInt(ctx.canvas.height / MAX_H);
    let cellHeight = cellWidth
    console.log('Position: ('+ e.clientX +', ' + e.clientY + ')');
    let coords = this.relMouseCoords(e)
    let cellX = parseInt(coords.x / cellWidth);
    let cellY = parseInt(coords.y / cellHeight);
    console.log('Cell: ('+ cellX +', '+ cellY +')');
    socket.emit('clicked', {x:cellX, y:cellY});
}
$(canvas).on('click', onCanvasClick);

function start(){
    console.log("clicked start")
    socket.emit('start')
}
$(startBtn).on("click", start);

function stop(){
    socket.emit('stop')
}
$(stopBtn).on("click", stop);

function reset(){
    socket.emit('reset')
}
$(resetBtn).on("click", reset);

canvasUpdate([]);
