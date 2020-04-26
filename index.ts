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
    socket: net.Socket = new net.Socket();


    constructor(name: String, socket: net.Socket) {
        this.name = name;
        this.socket = socket;
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
 * 
 */
function createFormattedMessage(messagePurpose: String, sender: String, payload: String) {
    return JSON.stringify(`{ "sender": ${sender}, "messagePurpose": ${messagePurpose}, "payload": ${payload} }`);
}


class GameWorld {
    connectedClients: Array<Player> = [];
    serverObject: net.Server = new net.Server;
    ip: string = 'localhost';
    port: number = 1337;
    buffer: string = "";

    constructor(ip: string) {
        this.ip = ip;
    }

    /**
     * Parses the received data from the client.
     * @param data Received data as a string, in JSON format. Data has the following format:
     * messagePurpose: pose, chat, newplayer
     */
    private parseData(data: string, sendingPlayer: Player, socket: net.Socket) {

        data = data.split("<start>")[1].split("<end>")[0];
        data = data.replace(/[\n\r\0]+/g, '');
        const dataAsJson = JSON.parse(data);
        console.log(JSON.stringify(dataAsJson))
        console.log(dataAsJson.messagePurpose)
        switch (dataAsJson.messagePurpose) {
            case 'pose':
                console.log(`Updating pose`);
                this.updateGameInfo(sendingPlayer, dataAsJson.payload)
                break;
            case 'chat':
                this.broadcastChatMessage(dataAsJson.payload);
                break;
            case 'newplayer':
                console.log(`Player ${dataAsJson} connected!`);
                this.updatePlayerName(dataAsJson.payload, socket);
                break;
            default:
                console.error(`Error while parsing a client's message`, `Unknown message purpose`);
                return;
        }
    }

    updatePlayerName(name: string, socket: net.Socket) {
        this.findPlayerBySocket(socket).name = name;
        console.log(`Updated player name: ${name}`);
        /**
         * Notify others of newly connected client and/or name change
         * @todo use broadcast method
         */
        this.connectedClients.forEach(client => {
            if (!this.isSameClient(client.socket, name)) {
                client.socket.write(createFormattedMessage('connectedPlayer', name, JSON.stringify(client.pose)), err => {
                    if (err)
                        console.log(`This was the client's response: ${JSON.stringify(err)}`)
                });
            } else {
                console.log(`Not sending because it was the same client: ${name} and ${socket.remotePort}`)
            }
        });
    }

    /**
     * Returns the player that is linked to the socket.
     * @param socket 
     */
    findPlayerBySocket(socket: net.Socket): Player {
        const returnPlayer = this.connectedClients.find(x => x.socket.remoteAddress === socket.remoteAddress &&
            x.socket.remotePort === socket.remotePort);
        if (returnPlayer !== undefined) {
            return returnPlayer;
        } else {
            throw new Error(`Error while finding player in list by socket: Player not found`);
        }
    }

    /**
     * Returns whether a socket belongs to a client name or not.
     * @param socket 
     */
    isSameClient(socket: net.Socket, name: String): boolean {
        const socketClient = this.connectedClients.find(x => x.socket.remoteAddress === socket.remoteAddress &&
            x.socket.remotePort === socket.remotePort);
        if (socketClient !== undefined) {
            return (socketClient.name === name) ? true : false;
        } else {
            throw new Error(`Player not found in player list.`)
        }

    }

    /**
     * Starts the game server.
     */
    public startServer() {
        const decoder = new TextDecoder('utf-8');
        this.serverObject = net.createServer(socket => {

            socket.on('connect', (_data: any) => {
                console.log(`A new connection was established: ${JSON.stringify(_data)}`);
            });

            socket.on('data', data => {
                // console.log(`Received data: ${data}`);
                this.buffer += data;
                if (this.buffer.includes("<start>") && this.buffer.includes("<end>")) {
                    const sendingPlayer = this.findPlayerBySocket(socket);
                    if (sendingPlayer !== undefined) {

                        console.log(`Received data from: ${JSON.stringify(sendingPlayer.name)}`)
                        /**
                         * Parse data to find out purpose
                         */
                        this.parseData(decoder.decode(data), sendingPlayer, socket);
                        this.buffer = "";
                    } else {
                        console.log(`Error while receiving data:`, `Player disconnected.`);
                    }
                } else {
                    console.error(`Error while receiving data:`, `Malformed tags.`)
                }
            });

            socket.on('end', (_data: any) => {
                console.log(`A player disconnected: ${JSON.stringify(_data)}`);
            });

            socket.on('error', error => {
                console.error(`A player has caused an error:`, error);
            });

            socket.on('close', data => {
                console.log(`Client socket closed connection: ${JSON.stringify(data)}`)
                this.disconnectPlayer(this.findPlayerBySocket(socket));
            });

        });
        console.log(`Listening on ${this.ip}:${this.port}`)
        this.serverObject.listen(this.port, this.ip);

        /**
         * Connection event - add new client
         */
        this.serverObject.on('connection', connection => {
            console.log(`New client connected: ${JSON.stringify(connection.remoteAddress)}:${JSON.stringify(connection.remotePort)}`);

            /**
             * Check whether client exists in client list
             */
            if (connection.remoteAddress && connection.remotePort && this.connectedClients.find(x => x.name === (connection.remoteAddress + `:` + connection.remotePort)) === undefined)
                this.connectPlayer((connection.remoteAddress + `:` + connection.remotePort), connection);
            else {
                console.error(`Error during connection:`, `Client already exists.`);
            }


        });


    }


    /**
     * Sends a message to all the other connected clients, for example movement updates.
     * @param message The message to send.
     * @param sendingClient The client that is sending the message. The message will not be sent to them.
     */
    public broadcastMessageToOtherClients(message: any, sendingClient: Player) {
        console.log(`Sending message from ${sendingClient.name} to others.`);
        this.connectedClients.forEach(player => {
            if (!this.isSameClient(sendingClient.socket, player.name)) {
                console.log(`Sending to ${player.name}`)
                player.socket.write(message);
            } else {
                console.log(`Did not send to ${player.name}`)
            }
        });
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
        const foundPlayer = this.connectedClients.find(player => player.name === sendingPlayer.name);
        if (foundPlayer !== undefined) {
            foundPlayer.pose = data;
            console.log(`${JSON.stringify(foundPlayer.pose)}`);
            this.broadcastMessageToOtherClients(`${JSON.stringify(foundPlayer.pose)}`, sendingPlayer)
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
    connectPlayer(name: string, socket: net.Socket): Player {

        /**
         * Add new player to connected player list
         */
        const newPlayer: Player = new Player(name, socket);
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

console.log(`Starting server.`)

/**
 * 1) Create new world object
 * 2) Run server
 * 3) Wait for clients
 */
require('dns').lookup(require('os').hostname(), function (err: any, add: string) {
    if (err) console.error(`Error during dns lookup:`, err)
    const mainWorld: GameWorld = new GameWorld(add);
    mainWorld.startServer();
});

process.on('SIGTERM', () => {
    console.log(`Closing connections...`);
    // @todo add call to mainworld.closeserver()
});

