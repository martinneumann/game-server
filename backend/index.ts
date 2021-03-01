// eslint-disable-next-line no-unused-vars
import { Socket } from 'socket.io';
import * as express from 'express';

/**
 * Central server because I'm lazy.
 * @author Martin Neumann
 */

/*******
 * Types
 *******/

const COLORS = ["red", "blue", "green", "orange", "purple"];

interface Pose {
    x: number;
    y: number;
    w: number;  // orientation in whatever unit game maker provides
}

/**
 * Player object that contains relevant data for a connected actor
 */
class Player {
    name: string; // Must be unique
    pose: Pose = { x: 3, y: 3, w: 3 };
    color: string = COLORS[Math.floor(Math.random() * COLORS.length)];
    socketId: string;

    constructor(name: string, socketId: string) {
        this.name = name;
        this.socketId = socketId;
    }
}

function mapToJSON(map: Map<string, Object>): string {
    let jsonObj: { [key: string]: Object } = {};
    map.forEach((value: Object, key: string) => {
        jsonObj[key] = value;
    })
    return JSON.stringify(jsonObj);
}
/**
 * Main server class.
 */
// eslint-disable-next-line no-unused-vars
class GameWorld {
    connectedClients: Map<string, Player> = new Map<string, Player>();
    clientSockets: Map<string, Socket> = new Map<string, Socket>();

    /**
     * Changes a Player's pose based on the data that arrived.
     * @param sendingPlayer 
     * @param difference 
     */
    public updatePlayerPose(sendingPlayer: Player, difference: Pose) {
        sendingPlayer.pose.x += difference.x;
        sendingPlayer.pose.y += difference.y;
        sendingPlayer.pose.w += difference.w;
    }

    /**
     * Relays a chat message.
     * @param message 
     */
    public broadcastChatMessage(message: string) {
        console.log(`Received chat message: '${message}'`)
    }


    /**
     * Connects a new player.
     * Called when a new client connects to the server.
     */
    connectPlayer(name: string, socket: Socket): Player {

        /**
         * Add new player to connected player list
         */
        var newPlayer: Player = new Player(name, socket.id);
        this.clientSockets.set(name, socket);
        this.connectedClients.set(name, newPlayer);
        console.log(`Connected clients are: ${this.connectedClients}`)

        return newPlayer;
    }

    /**
    private authenticatePlayer(name: string, password: string): bool {

    } */

    /**
     * Removes a player from the client list.
     * @param disconnectingPlayer The disconnecting player.
     */
    disconnectPlayer(disconnectingPlayerId: string) {
        this.connectedClients.delete(disconnectingPlayerId);
        console.log(`Connected clients are: ${mapToJSON(this.connectedClients)}`)
    }
}


const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req: any, res: { sendFile: (arg0: string) => void; }) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('styles.css'));

console.log(`Creating game world...`);
const gameWorld = new GameWorld();

http.listen(3000, () => {
    console.log('Server listening on *:3000');

});

io.on('connection', (socket: Socket) => {
    socket.emit('newuser', socket.id);

    console.log(`A user connected. Socket: ${socket.id} `);
    var newPlayer = gameWorld.connectPlayer(socket.id, socket);
    console.log(`New Player: ${JSON.stringify(newPlayer)} `);


    socket.on('disconnect', () => {
        console.log(`user disconnected. Socket: ${socket.id}`);
        gameWorld.disconnectPlayer(socket.id);
    });

    socket.on('keypressed', (msg: Pose) => {
        var sendingPlayer = gameWorld.connectedClients.get(socket.id);
        if (sendingPlayer != null) {
            gameWorld.updatePlayerPose(sendingPlayer, msg);
        }
        gameWorld.clientSockets.forEach((value: Socket) => {
            value.emit('movement', mapToJSON(gameWorld.connectedClients));
        });

    });

    socket.on('login', (msg: any) => {
        console.log(`Received login message: ${JSON.stringify(msg)}`);
    });


    socket.on('register', (msg: any) => {
        console.log(`Received register message: ${JSON.stringify(msg)}`);
    });
});
