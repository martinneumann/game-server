// eslint-disable-next-line no-unused-vars
import { Socket } from 'socket.io';
import * as express from 'express';

const graphqlHTTP = require('express-graphql')
const graphql = require('graphql')


import { WorldGenerator } from './world generation/world generation';
// eslint-disable-next-line no-unused-vars
import { CustomMeshData } from '../data objects/data-objects';

/**
 * GraphQL
 */

const QueryRoot = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        hello: {
            type: graphql.GraphQLString,
            resolve: () => "Hello world!"
        }
    })
});

const schema = new graphql.GraphQLSchema({ query: QueryRoot });

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

    terrain: WorldGenerator = new WorldGenerator();

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
        console.log(`Connected clients: ${JSON.stringify(this.connectedClients)}`)

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

app.use(express.static('dist/assets/css'));
app.use(express.static('dist/'));
app.use('/api', graphqlHTTP.graphqlHTTP({
    schema: schema,
    graphiql: true,
}));

app.get('/', (req: any, res: { sendFile: (arg0: string) => void; }) => {
    res.sendFile(__dirname + '/index.html');
});


console.log(`Creating game world...`);
const gameWorld = new GameWorld();
console.log(`Generating terrain.`);
let noiseMeshData: CustomMeshData;

gameWorld.terrain.generateMatrix(64, 64).then((result: CustomMeshData) => {
    noiseMeshData = result;
});

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
        var loggedInPlayer = gameWorld.connectPlayer(msg["name"], socket);
        socket.emit('loginsuccessful', loggedInPlayer);
    });


    socket.on('register', (msg: any) => {
        console.log(`Received register message: ${JSON.stringify(msg)}`);
        gameWorld.connectPlayer(msg["name"], socket);
        socket.emit('registersuccessful', msg["name"]);
    });

    socket.emit('custommeshdata',
        noiseMeshData);


});

/**
 * World generation
 */
/*
function generateWorld() {
    const worldTerrainMatrix = new WorldTerrainMatrix(480, 480);
    worldTerrainMatrix.generateMatrix(480, 480).then(result => {
        console.log(`World generation ${result}.`);
    });
}
*/
