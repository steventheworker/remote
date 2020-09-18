import {PythonShell} from 'python-shell';
import { Connection } from 'sockjs';
import {generatePic} from './generatePic';

generatePic();

interface Events {
    [index: string]: any;
    heartbeat: { (socket: Connection , ...data: any): void },
    init: { (socket: Connection, ...data: any): void },
    es: { (socket: Connection, es: string, ...data: any): void }
}
export const events:Events = {
    'init': function(socket, event) {
        generatePic(() => {
            socket.write('r');
        });
    },
    'es': function(socket, data) {
        PythonShell.run('../../controls/es.py', {
            args: [data]
        }, function (err, results) {
            if (err) {const fs = require('fs');fs.writeFileSync('es.txt', err + '|||' + results);}
            generatePic(() => {
                socket.write('r');
            });
        });
    },
    heartbeat: (socket, event) => {
        generatePic(() => {
            socket.write('r');
        });
    }
};
