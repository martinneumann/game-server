import * as PIXI from 'pixi.js';
const socketio = require("socket.io-client");
/**
 * Pose type.
 */
class Pose {
    x;
    y;
    w;  // orientation in whatever unit game maker provides
    constructor(x: number, y: number, w: number) {
        this.x = x;
        this.w = w;
        this.y = y;
    }
}

/**
 * State of a player's character. Only pose for now.
 */
class PlayerState {
    pose: Pose;
    color: string;
    name: string;
    constructor(name: string, pose: Pose, color: string) {
        this.name = name;
        this.pose = pose;
        this.color = color;
    }
}

// Log in
// eslint-disable-next-line no-unused-vars
function login_function() {
    var name = document.getElementById("name1")!.innerText
    var pwd = document.getElementById("pwd1")!.innerText
    console.log("Name " + name)
    console.log(" Pwd " + pwd)

    socket.emit('login', { name, pwd })
}

document.getElementById("login")?.addEventListener("click", login_function, false);
document.getElementById("register")?.addEventListener("click", register_function, false);

// register
// eslint-disable-next-line no-unused-vars
function register_function() {
    var name = document.getElementById("name2")!.innerText
    var pwd = document.getElementById("pwd2")!.innerText
    console.log(name)
    console.log(pwd)

    socket.emit('register', { name, pwd })
}




/**
 * Sets up the canvas according to screen size.
 */
function setUpPIXI() {
    let app = new PIXI.Application({width: 1024, height: 1024, forceCanvas: true});
    app.renderer.backgroundColor = 0x061639;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.view);
}

 window.onload = () => setUpPIXI();

/**
 * Draws the grid???
 * @param GlobalOffsetX 
 * @param GlobalOffsetY 
 * @param cellWidth 
 * @param lineWidth 
 */


/**
 * Draw function ???
 */

var diffPose = new Pose(0, 0, 0);
const socket = socketio();

// State of this connected player.
var player: PlayerState | undefined;

// States of all connected players.
let gameState: { [index: string]: PlayerState } = {};
var dirUp = false;
var dirDown = false;
var dirLeft = false;
var dirRight = false;


function sendUpdate() {
    diffPose.x = 0
    diffPose.y = 0
    diffPose.y += dirDown ? 10 : 0
    diffPose.y += dirUp ? -10 : 0
    diffPose.x += dirRight ? 10 : 0
    diffPose.x += dirLeft ? -10 : 0
    socket.emit('keypressed', diffPose);
}

window.setInterval(sendUpdate, 100);

// New user connects.
socket.on('newuser', (userid: any) => {
    console.log(`New user ${userid} connected.`);
    document.getElementById("login_window")!.hidden = false;
});



/**
 * General key press or movement or whatever.
 **/
socket.on('movement', function (msg: string) {
    // debugger
    var gameStateJSONObject = JSON.parse(msg);
    for (let playerId in gameStateJSONObject) {
        let value = gameStateJSONObject[playerId];
        let pose = new Pose(value["pose"]["x"], value["pose"]["y"], value["pose"]["w"])
        if (!(playerId in gameState)) {
            gameState[playerId] = new PlayerState(value["name"], pose, value["color"])
        } else {
            gameState[playerId].pose = pose;
        }
    }
    return
});

socket.on('loginsuccessful', function (msg: any) {
    document.getElementById("login_window")!.hidden = true;
    console.log(`Log in successful: ${JSON.stringify(msg)}`)
    player = new PlayerState(msg["name"], new Pose(0, 0, 0), "red");
    // Store player state in gamestate referenced by socketId
    gameState[msg["socketId"]] = player;
});

// Register was successful
socket.on('registersuccessful', function (msg: any) {
    document.getElementById("login_window")!.hidden = true;
    console.log(`Register successful: ${JSON.stringify(msg)}`)
});



window.addEventListener('keydown', function (e) {
    e.preventDefault();
    dirUp = dirUp || (e.key.toLowerCase() == 'w')
    dirDown = dirDown || (e.key.toLowerCase() == 's')
    dirLeft = dirLeft || (e.key.toLowerCase() == 'a')
    dirRight = dirRight || (e.key.toLowerCase() == 'd')
})

window.addEventListener('keyup', function (e) {
    e.preventDefault();
    dirUp = dirUp && !(e.key.toLowerCase() == 'w')
    dirDown = dirDown && !(e.key.toLowerCase() == 's')
    dirLeft = dirLeft && !(e.key.toLowerCase() == 'a')
    dirRight = dirRight && !(e.key.toLowerCase() == 'd')
});
