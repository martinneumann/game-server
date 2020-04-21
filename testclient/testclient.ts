
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
/*
 * A client for testing multiple connections, since game maker only runs one instance at a time during debug.
 */

 const newClientString = '<start>{ \"sender\": \"Dudebro\", \"messagePurpose\": \"newplayer\", \"payload\": \"Dudebro\" }<end>';


var client = new net.Socket();
client.connect(1337, '192.168.178.61', function () {
    console.log('Connected');
    fs.readFile(path.join('./testjson/newplayer.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(`Error while parsing JSON:`, err);
        }
        client.write(newClientString);    

    });
});

client.on('data', function (data) {
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
});

client.on('close', function () {
    console.log('Connection closed');
});


client.on('error', error => {
    console.error('Error happened:', error)
});