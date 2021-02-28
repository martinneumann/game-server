// eslint-disable-next-line no-unused-vars
import { Socket } from 'socket.io';

/**
 * Central server because I'm lazy.
 * @author Martin Neumann
 */

/*******
 * Types
 *******/

interface Pose {
    x: number;
    y: number;
    w: number;  // orientation in whatever unit game maker provides
}

/**
 * Player object that contains relevant data for a connected actor
 */
class Player {
    id: String; // Must be unique
    pose: Pose;


    constructor(name: String) {
        this.id = name;
    }
}

/**
 * Main server class.
 */
// eslint-disable-next-line no-unused-vars
class GameWorld {
    connectedClients: Array<Player> = [];

    /**
     * Called when a client sends new data, e.g. their pose.
     * @param sendingPlayer The player sending the data.
     * @param data The data package.
     * 
     */
    public updateGameInfo(sendingPlayer: Player, data: Pose) {
        console.log(`Updating game data.`);
        const foundPlayer = this.connectedClients.find(player => player.id === sendingPlayer.id);
        if (foundPlayer !== undefined) {
            foundPlayer.pose = data;
        } else {
            console.error(`Error while updating game info:`, `Tried to update an unknown player's pose.`);
        }
    }

    /**
     * Changes a Player's pose based on the data that arrived.
     * @param sendingPlayer 
     * @param difference 
     */
    public updatePlayerPose(sendingPlayer: Player, difference: Pose) {
        console.log(`Updating player pose by ${JSON.stringify(difference)}.`);
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
    connectPlayer(name: string) {
        this.connectedClients.push(new Player(name))
    }

    /**
     * Removes a player from the client list.
     * @param disconnectingPlayer The disconnecting player.
     */
    disconnectPlayer(disconnectingPlayer: Player) {
        this.connectedClients.filter(player => player !== disconnectingPlayer);
    }
}


const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

console.log(`Creating game world...`);
const gameWorld = new GameWorld();

http.listen(3000, () => {
    console.log('Server listening on *:3000');

});

io.on('connection', (socket: Socket) => {
    socket.emit('newuser', socket.id);

    console.log(`A user connected. Socket: ${socket.id} `);
    gameWorld.connectPlayer(socket.id);

    socket.on('disconnect', () => {
        console.log(`user disconnected. Socket: ${socket.id}`);
    });

    socket.on('keypressed', (msg) => {
        console.log(`player ${socket.id} sent pose: ${JSON.stringify(msg)}`);

        gameWorld.updatePlayerPose(gameWorld.connectedClients.find(x => x.id == socket.id), msg);

        socket.emit('movement',)
    });
});
