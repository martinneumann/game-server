const socketio = require("socket.io-client");

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

class PlayerState {
    id;
    pose;
    constructor(id: any, pose: Pose) {
        this.id = id;
        this.pose = pose;
    }
}

function setUpCanvas() {
    const canvas = <HTMLCanvasElement>document.getElementById("game");
    const ctx = canvas?.getContext('2d');
    ctx?.translate(0.5, 0.5);

    // Set display size (vw/vh).
    var sizeWidth = 100 * window.innerWidth / 100,
        sizeHeight = 100 * window.innerHeight / 100 || 766;

    //Setting the canvas site and width to be responsive 
    canvas.width = sizeWidth;
    canvas.height = sizeHeight;
    canvas.style.width = sizeWidth.toString();
    canvas.style.height = sizeHeight.toString();
}

window.onload = () => setUpCanvas();


function gridLines(GlobalOffsetX: number, GlobalOffsetY: number, cellWidth = 64, lineWidth = 2) {
    const offsetX = GlobalOffsetX % cellWidth
    const offsetY = GlobalOffsetY % cellWidth
    // const swapColors = offsetX > cellWidth & offsetY > cellWidth
    const numCellsX = Math.ceil(canvas?.width / cellWidth) + 1
    const numCellsY = Math.ceil(canvas?.height / cellWidth) + 1
    if (ctx != undefined) {
        ctx.fillStyle = "#222222"
        for (let i = -1; i < numCellsX; i++) {
            ctx?.fillRect(i * cellWidth - offsetX, 0,
                lineWidth, canvas.height)
        }
        for (let i = -1; i < numCellsY; i++) {
            ctx?.fillRect(0, i * cellWidth - offsetY,
                canvas.width, lineWidth)
        }
    }
}

function draw() {
    //ctx.fillStyle = "#222222"
    if (ctx != undefined && player != undefined) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const canvasCenter = [canvas.width / 2, canvas.height / 2]
        const camPos = [player.pose.x + mouseOffset[0] / 2, player.pose.y + mouseOffset[1] / 2]
        gridLines(camPos[0], camPos[1])
        ctx.font = "12px Impact"
        ctx.textAlign = "center"

        if (ctx != undefined) {
            for (var playerId in gameState) {
                const playerCanvasX = canvasCenter[0] + gameState[playerId]["pose"]["x"] - camPos[0]
                const playerCanvasY = canvasCenter[1] + gameState[playerId]["pose"]["y"] - camPos[1]
                /**
                 * @todo: check gameState objects.
                 **/
                ctx.fillStyle = gameState[playerId]["color"]["x"];
                // draw "Test text" at X = 10 and Y = 30   
                ctx.fillText(gameState["playerId"]["name"]["x"], playerCanvasX + 20, playerCanvasY - 25);
                ctx.fillRect(playerCanvasX,
                    playerCanvasY,
                    40,
                    40);
            }
        }
    }
}

var diffPose = new Pose(0, 0, 0);
const socket = socketio();
var player: PlayerState | undefined;
var mouseOffset = [0, 0];
var gameState: { [x: string]: { [x: string]: { [x: string]: any; }; }; };
var dirUp = false;
var dirDown = false;
var dirLeft = false;
var dirRight = false;

var canvas = <HTMLCanvasElement>document.getElementById('game');
var ctx = canvas.getContext("2d");

canvas.addEventListener('mouseover', function () {
    addCanvasEventListeners();
})

canvas.addEventListener('mouseout', function () {
    removeCanvasEventListeners();
})

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

function mousemoveEventListener(e: { offsetX: number; offsetY: number; }) {
    mouseOffset = [e.offsetX - canvas.width / 2, e.offsetY - canvas.height / 2];
}


function keydownEventListener(event: KeyboardEvent) {
    event.preventDefault();

    /**
     * @todo check deprecations.
     */
    dirUp = dirUp || (event.key.toLowerCase() == 'w')
    dirDown = dirDown || (event.key.toLowerCase() == 's')
    dirLeft = dirLeft || (event.key.toLowerCase() == 'a')
    dirRight = dirRight || (event.key.toLowerCase() == 'd')
}

function keyupEventListener(event: KeyboardEvent) {
    event.preventDefault();
    dirUp = dirUp && !(event.key.toLowerCase() == 'w')
    dirDown = dirDown && !(event.key.toLowerCase() == 's')
    dirLeft = dirLeft && !(event.key.toLowerCase() == 'a')
    dirRight = dirRight && !(event.key.toLowerCase() == 'd')
}

function sendUpdate() {
    diffPose.x = 0
    diffPose.y = 0
    diffPose.y += dirDown ? 10 : 0
    diffPose.y += dirUp ? -10 : 0
    diffPose.x += dirRight ? 10 : 0
    diffPose.x += dirLeft ? -10 : 0
    socket.emit('keypressed', diffPose);

}

window.setInterval(draw, 33);
window.setInterval(sendUpdate, 100);

// New user connects.
socket.on('newuser', (userid: any) => {
    console.log(`New user ${userid} connected.`);

    document.getElementById("transparent-background")!.hidden = false;
    document.getElementById("login")!.hidden = false;
    player = new PlayerState(userid, new Pose(0, 0, 0));
});



// General key press or movement or whatever.
socket.on('movement', function (msg: string) {
    gameState = JSON.parse(msg)
    if (player != undefined) {
        player.pose.x = gameState[player.id]["pose"]["x"]
        player.pose.y = gameState[player.id]["pose"]["y"]
    }
});

socket.on('loginsuccessful', function (msg: any) {
    document.getElementById("transparent-background")!.hidden = true;
    document.getElementById("login")!.hidden = true;
    console.log(`Log in successful: ${JSON.stringify(msg)}`)
});

// Register was successful
socket.on('registersuccessful', function (msg: any) {
    document.getElementById("transparent-background")!.hidden = true;
    document.getElementById("login")!.hidden = true;
    console.log(`Register successful: ${JSON.stringify(msg)}`)
});

// Log in
// eslint-disable-next-line no-unused-vars
function login() {
    var name = document.getElementById("name1")!.innerText
    var pwd = document.getElementById("pwd1")!.innerText
    console.log(name)
    console.log(pwd)

    socket.emit('login', { name, pwd })
}

// register
// eslint-disable-next-line no-unused-vars
function register() {
    var name = document.getElementById("name2")!.innerText
    var pwd = document.getElementById("pwd2")!.innerText
    console.log(name)
    console.log(pwd)

    socket.emit('register', { name, pwd })
}




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
