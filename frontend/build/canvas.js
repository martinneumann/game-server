var socketio = require("socket.io-client");
/**
 * Pose type.
 */
var Pose = /** @class */ (function () {
    function Pose(x, y, w) {
        this.x = x;
        this.w = w;
        this.y = y;
    }
    return Pose;
}());
/**
 * State of a player's character. Only pose for now.
 */
var PlayerState = /** @class */ (function () {
    function PlayerState(id, pose) {
        this.id = id;
        this.pose = pose;
    }
    return PlayerState;
}());
/**
 * Sets up the canvas according to screen size.
 */
function setUpCanvas() {
    var canvas = document.getElementById("game");
    var ctx = canvas === null || canvas === void 0 ? void 0 : canvas.getContext('2d');
    ctx === null || ctx === void 0 ? void 0 : ctx.translate(0.5, 0.5);
    // Set display size (vw/vh).
    var sizeWidth = 100 * window.innerWidth / 100, sizeHeight = 100 * window.innerHeight / 100 || 766;
    //Setting the canvas site and width to be responsive 
    canvas.width = sizeWidth;
    canvas.height = sizeHeight;
    canvas.style.width = sizeWidth.toString();
    canvas.style.height = sizeHeight.toString();
}
window.onload = function () { return setUpCanvas(); };
/**
 * Draws the grid???
 * @param GlobalOffsetX
 * @param GlobalOffsetY
 * @param cellWidth
 * @param lineWidth
 */
function gridLines(GlobalOffsetX, GlobalOffsetY, cellWidth, lineWidth) {
    if (cellWidth === void 0) { cellWidth = 64; }
    if (lineWidth === void 0) { lineWidth = 2; }
    var offsetX = GlobalOffsetX % cellWidth;
    var offsetY = GlobalOffsetY % cellWidth;
    // const swapColors = offsetX > cellWidth & offsetY > cellWidth
    var numCellsX = Math.ceil((canvas === null || canvas === void 0 ? void 0 : canvas.width) / cellWidth) + 1;
    var numCellsY = Math.ceil((canvas === null || canvas === void 0 ? void 0 : canvas.height) / cellWidth) + 1;
    if (ctx != undefined) {
        ctx.fillStyle = "#222222";
        for (var i = -1; i < numCellsX; i++) {
            ctx === null || ctx === void 0 ? void 0 : ctx.fillRect(i * cellWidth - offsetX, 0, lineWidth, canvas.height);
        }
        for (var i = -1; i < numCellsY; i++) {
            ctx === null || ctx === void 0 ? void 0 : ctx.fillRect(0, i * cellWidth - offsetY, canvas.width, lineWidth);
        }
    }
}
/**
 * Draw function ???
 */
function draw() {
    //ctx.fillStyle = "#222222"
    if (ctx != undefined && player != undefined) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var canvasCenter_1 = [canvas.width / 2, canvas.height / 2];
        var camPos_1 = [player.pose.x + mouseOffset[0] / 2, player.pose.y + mouseOffset[1] / 2];
        gridLines(camPos_1[0], camPos_1[1]);
        ctx.font = "12px Impact";
        ctx.textAlign = "center";
        if (ctx != undefined && gameState != undefined) {
            gameState.forEach(function (player) {
                var playerCanvasX = canvasCenter_1[0] + player.pose.x - camPos_1[0];
                var playerCanvasY = canvasCenter_1[1] + player.pose.y - camPos_1[1];
                /**
                 * @todo: check gameState objects.
                 **/
                ctx.fillStyle = gameState.playerId.color.x;
                // draw "Test text" at X = 10 and Y = 30   
                ctx.fillText(gameState["playerId"]["name"]["x"], playerCanvasX + 20, playerCanvasY - 25);
                ctx.fillRect(playerCanvasX, playerCanvasY, 40, 40);
            });
        }
    }
}
var diffPose = new Pose(0, 0, 0);
var socket = socketio();
// State of this connected player.
var player;
var mouseOffset = [0, 0];
// States of all connected players.
var gameState = [];
var dirUp = false;
var dirDown = false;
var dirLeft = false;
var dirRight = false;
var canvas = document.getElementById('game');
var ctx = canvas.getContext("2d");
/**
 * Adds event listeners on mouseover.
 */
canvas.addEventListener('mouseover', function () {
    addCanvasEventListeners();
});
/**
 * Removes event listeners on mouseout.
 */
canvas.addEventListener('mouseout', function () {
    removeCanvasEventListeners();
});
function addCanvasEventListeners() {
    window.addEventListener('mousemove', mousemoveEventListener);
    window.addEventListener('keydown', keydownEventListener);
    window.addEventListener('keyup', keyupEventListener);
}
function removeCanvasEventListeners() {
    window.removeEventListener('mousemove', mousemoveEventListener);
    window.removeEventListener('keydown', keydownEventListener);
    window.removeEventListener('keyup', keyupEventListener);
}
function mousemoveEventListener(e) {
    mouseOffset = [e.offsetX - canvas.width / 2, e.offsetY - canvas.height / 2];
}
/**
 * Event listener for keyboard press movement (WASD).
 * @param event Keyboard event this handles.
 */
function keydownEventListener(event) {
    event.preventDefault();
    /**
     * @todo check deprecations.
     */
    dirUp = dirUp || (event.key.toLowerCase() == 'w');
    dirDown = dirDown || (event.key.toLowerCase() == 's');
    dirLeft = dirLeft || (event.key.toLowerCase() == 'a');
    dirRight = dirRight || (event.key.toLowerCase() == 'd');
}
function keyupEventListener(event) {
    event.preventDefault();
    dirUp = dirUp && !(event.key.toLowerCase() == 'w');
    dirDown = dirDown && !(event.key.toLowerCase() == 's');
    dirLeft = dirLeft && !(event.key.toLowerCase() == 'a');
    dirRight = dirRight && !(event.key.toLowerCase() == 'd');
}
function sendUpdate() {
    diffPose.x = 0;
    diffPose.y = 0;
    diffPose.y += dirDown ? 10 : 0;
    diffPose.y += dirUp ? -10 : 0;
    diffPose.x += dirRight ? 10 : 0;
    diffPose.x += dirLeft ? -10 : 0;
    socket.emit('keypressed', diffPose);
}
window.setInterval(draw, 33);
window.setInterval(sendUpdate, 100);
// New user connects.
socket.on('newuser', function (userid) {
    console.log("New user " + userid + " connected.");
    document.getElementById("transparent-background").hidden = false;
    document.getElementById("login").hidden = false;
    //  player = new PlayerState(userid, new Pose(0, 0, 0));
});
// General key press or movement or whatever.
socket.on('movement', function (msg) {
    console.log(JSON.stringify(msg));
    // debugger
    gameState = JSON.parse(msg);
    if (player != undefined) {
        player.pose.x = gameState[player.id]["pose"]["x"];
        player.pose.y = gameState[player.id]["pose"]["y"];
    }
});
socket.on('loginsuccessful', function (msg) {
    document.getElementById("transparent-background").hidden = true;
    document.getElementById("login").hidden = true;
    console.log("Log in successful: " + JSON.stringify(msg));
});
// Register was successful
socket.on('registersuccessful', function (msg) {
    document.getElementById("transparent-background").hidden = true;
    document.getElementById("login").hidden = true;
    console.log("Register successful: " + JSON.stringify(msg));
});
// Log in
// eslint-disable-next-line no-unused-vars
function login() {
    var name = document.getElementById("name1").innerText;
    var pwd = document.getElementById("pwd1").innerText;
    console.log(name);
    console.log(pwd);
    socket.emit('login', { name: name, pwd: pwd });
}
// register
// eslint-disable-next-line no-unused-vars
function register() {
    var name = document.getElementById("name2").innerText;
    var pwd = document.getElementById("pwd2").innerText;
    console.log(name);
    console.log(pwd);
    socket.emit('register', { name: name, pwd: pwd });
}
window.addEventListener('keydown', function (e) {
    e.preventDefault();
    dirUp = dirUp || (e.key.toLowerCase() == 'w');
    dirDown = dirDown || (e.key.toLowerCase() == 's');
    dirLeft = dirLeft || (e.key.toLowerCase() == 'a');
    dirRight = dirRight || (e.key.toLowerCase() == 'd');
});
window.addEventListener('keyup', function (e) {
    e.preventDefault();
    dirUp = dirUp && !(e.key.toLowerCase() == 'w');
    dirDown = dirDown && !(e.key.toLowerCase() == 's');
    dirLeft = dirLeft && !(e.key.toLowerCase() == 'a');
    dirRight = dirRight && !(e.key.toLowerCase() == 'd');
});
