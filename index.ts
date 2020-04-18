
/**
 * Central server because I'm lazy.
 * @author Martin Neumann
 */

console.log(`Starting server...`)

// Server module
var net = require('net')

var server = net.createServer(socket => {
	socket.write('Echo server\r\n');
	socket.pipe(socket);
});

server.listen(1337, '127.0.0.1');

/*******
 * Types
 *******/

class Pose {
    x;  
    y;
    w;  // orientation in whatever game maker gives
}

/**
 * Player object that contains relevant data for a connected actor
 */ 
class Player {



}

class GameWorld {
    connectedClients = [];


    }

/**
 * Functions
 */



