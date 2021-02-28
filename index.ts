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
    name: String; // Must be unique
    pose: Pose = { x: 3, y: 3, w: 3 };


    constructor(name: String) {
        this.name = name;
    }
}

/**
 * Main server class.
 */
// eslint-disable-next-line no-unused-vars
class GameWorld {
    connectedClients: Array<Player> = [];

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
    connectPlayer(name: string): Player {

        /**
         * Add new player to connected player list
         */
        const newPlayer: Player = new Player(name);
        this.connectedClients.push(newPlayer)
        const connectedPlayers = this.connectedClients.map(client => client.name)
        console.log(`Connected players: ${connectedPlayers}`)


        return newPlayer;
    }

    /**
     * Removes a player from the client list.
     * @param disconnectingPlayer The disconnecting player.
     */
    disconnectPlayer(disconnectingPlayer: Player) {
        this.connectedClients = this.connectedClients.filter(player => player !== disconnectingPlayer);
        console.log(`Connected clients are: ${this.connectedClients.map(client => client.name)}`)
    }
}


const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req: any, res: { sendFile: (arg0: string) => void; }) => {
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

    socket.on('keypressed', (msg: Pose) => {
        console.log(`player ${socket.id} sent pose: ${JSON.stringify(msg)}`);

        // gameWorld.updatePlayerPose(gameWorld.connectedClients.find(x => x.id == socket.id), msg);

        socket.emit('movement',)
    });
});
