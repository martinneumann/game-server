
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';

import { timer } from 'rxjs';
/*
 * A client for testing multiple connections, since game maker only runs one instance at a time during debug.
 */
const newClientString = '<start>{ "sender": "Dudebro", "messagePurpose\": \"newplayer\", \"payload\": \"Dudebro\" }<end>';

class GameClient {


    private client = new net.Socket();
    public writeToServer(data: any) {
        console.log(`Writing: ${data}`)
        this.client.write(data)
    }

    public connectToServer() {

        this.client.connect(1337, '192.168.178.55', function () {
            console.log('Connected');
            fs.readFile(path.join('./testjson/newplayer.json'), 'utf8', (err) => {
                if (err) {
                    console.error(`Error while parsing JSON:`, err);
                }

            });

        });

        this.client.on('data', data => {
            console.log('Received: ' + data);
            // this.writeToServer(JSON.parse(JSON.stringify(data)).id)
            // client.destroy(); // kill client after server's response
        });

        this.client.on('close', function () {
            console.log('Connection closed');
        });


        this.client.on('error', error => {
            console.error('Error happened:', error)
        });
    }
}

/**
 * Start
 */
const gameClient: GameClient = new GameClient()
timer(1000).subscribe(() => {

    gameClient.writeToServer(newClientString);
});

gameClient.connectToServer();