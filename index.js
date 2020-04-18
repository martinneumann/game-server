
/**
 * Central server because I'm lazy.
 * @author Martin Neumann
 */

console.log(`Hello`)

// Server module
var net = require('net')

var server = net.createServer(socket => {
	socket.write('Echo server\r\n');
	socket.pipe(socket);
});

server.listen(1337, '127.0.0.1');

