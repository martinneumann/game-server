import { Engine, Scene, ArcRotateCamera, HemisphericLight, Color4 } from 'babylonjs';
import { Vector3 } from 'babylonjs';
// eslint-disable-next-line no-unused-vars
import { CustomMeshData } from '../data objects/data-objects';
import { Environment } from './environment';

class App {
    private _canvas: HTMLCanvasElement;
    private _scene!: Scene;
    private _engine: Engine;
    private _environment!: Environment;

    constructor() {
        // create the canvas html element and attach it to the webpage
        this._canvas = <HTMLCanvasElement>document.getElementById("gameCanvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);
        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._setUpGame();
        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });
        // run the main render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
        window.addEventListener('resize', () => {
            this._engine.resize();
        })
    }

    private _setUpGame() {
        this._scene = new Scene(this._engine);
        this._scene.clearColor = new Color4(0.2, 0.0, 0.2, 1);
        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
        camera.attachControl(this._canvas, true);
        new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
        this._environment = new Environment(this._scene);
    }

    public createGroundMesh(msg: CustomMeshData) {
        this._environment.createMesh(msg);
    }
}

const app = new App();


const socketio = require("socket.io-client");

// window.onload = () => createScene();
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

document.getElementById("loginbutton")?.addEventListener("click", login_function, false);
document.getElementById("registerbutton")?.addEventListener("click", register_function, false);

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


/**
 * Receive mesh data for a custom mesh. Contains vertices and indices.
 * Then used to create a custom mesh.
 */
socket.on('custommeshdata', (msg: CustomMeshData) => {
    console.log(`Received mesh data`)
    app.createGroundMesh(msg);
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
