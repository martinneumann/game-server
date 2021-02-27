// eslint-disable-next-line no-unused-vars
import { Socket } from 'socket.io';

/**
 * Central server because I'm lazy.
 * @author Martin Neumann
 * 
 * @description
 * Messages contain:
 * - sender
 * - messagePurpose
 * - payload
 * 
 * Payload may be:
 * - string (chat message)
 * - pose (x, y, w)
 * 
 * @todo
 * - unique player Ids instead of names
 * - use promises for everything instead of crashing
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
 * Chat Message type
 */
interface ChatMessage {
    content: String;
    from: String;
    to?: String;

}


/**
 * Main server class.
 */
// eslint-disable-next-line no-unused-vars
class GameWorld {
    connectedClients: Array<Player> = [];

    /**
     * Parses the received data from the client.
     * @param data Received data as a string, in JSON format. Data has the following format:
     * messagePurpose: pose, chat, newplayer
     */
    private parseData(data: string) {
        const dataAsJson = JSON.parse(data);
        switch (dataAsJson.messagePurpose) {
            case 'pose':
                this.updateGameInfo(this.connectedClients.find(client => client.id === dataAsJson.sender), dataAsJson.payload)
                break;
            case 'chat':
                this.broadcastChatMessage(dataAsJson.payload);
                break;
            case 'newplayer':
                console.log(`Player ${dataAsJson.payload} connected!`);
                this.connectPlayer(dataAsJson.payload);
                break;
            default:
                console.error(`Error while parsing a client's message`, `Unknown message purpose`);
                return;


        }
    }

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
        console.log(`player ${socket.id} pressed key: ` + msg);

        switch (msg) {
            case 'a':
            case 'A':
                gameWorld.updateGameInfo(gameWorld.connectedClients.find(x => x.id == socket.id), { x: 1, y: 2, w: 90 });
                break;
            default:
                console.log(`Command not valid.`);

        }
        socket.emit('movement',)
    });
});
