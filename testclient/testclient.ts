
import * as net from 'net';
import * as fs from 'fs';
/*
 * A client for testing multiple connections, since game maker only runs one instance at a time during debug.
 */



var client = new net.Socket();
client.connect(1337, '192.168.178.61', function () {
    console.log('Connected');
    fs.readFile('./../testjson/newplayer.json', 'utf8', (err, data) => {
        console.log(`Read data: ${data}`);
        client.write(JSON.stringify(data));    

    });
});

client.on('data', function (data) {
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
});

client.on('close', function () {
    console.log('Connection closed');
});