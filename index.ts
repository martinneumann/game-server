import * as net from 'net';

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
    x: 10;
    y: 10;
    w: 0;  // orientation in whatever unit game maker provides
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

class GameWorld {
    connectedClients: Array<Player> = [];
    serverObject: net.Server;
    ip: string = '127.0.0.1';
    port: number = 1337;

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
     * Starts the game server.
     */
    public startServer() {
        this.serverObject = net.createServer(socket => {
            socket.on('data', data => {

                // console.log(`Received data: ${String.fromCharCode.apply(0, data)}`);
                this.parseData(String.fromCharCode.apply(0, data));
            });

            socket.on('end', data => {
                console.log(`A player disconnected: ${JSON.stringify(data)}`);
                this.disconnectPlayer(undefined);
            });
        });
        this.serverObject.listen(this.port, '127.0.0.1');
    }


    public closeServer() {
        this.serverObject.close();
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

console.log(`Starting server.`)

/**
 * 1) Create new world object
 * 2) Run server
 * 3) Wait for clients
 */

const mainWorld: GameWorld = new GameWorld();
mainWorld.startServer();


