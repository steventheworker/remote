import * as path from 'path';
import * as sockjs from 'sockjs';
import * as http from 'http';
import * as node_static from 'node-static';
import {events} from './events';

function processData(socketid:string, message:string) {
    const data = message.split('|');
    const event = data.splice(0, 1)[0];
    data.push(event);
    let fn = events[event];
    if (fn) {
        if (typeof fn === 'string') fn = events[fn];
        const sock = sockets.get(socketid);
        try {
            fn.apply(null, [sock, ...data]);
        } catch(e) {
    		const err = '|' + ('' + e.stack).replace(/\n/g, '\n|');
    		sock.write('|<< error: ' + e.message + '\n' + err);
        }
    }
    console.log("<=" + message)
}

const sockets = new Map();
let socketCounter = 0;
const sockjs_echo = sockjs.createServer({sockjs_url: "./sockjs.min.js"});
sockjs_echo.on('connection', socket => {
    if (!socket) return;
    if (!socket.remoteAddress) {/* SockJS sometimes fails to be able to cache the IP, port, and address from connection request headers. */
        try {socket.destroy();} catch (e) {}
        return;
    }
    const socketid = '' + (++socketCounter);
    sockets.set(socketid, socket);
    let socketip = socket.remoteAddress;
    socket.on('data', message => {
        if (!message) return;
        if (message.length > (100 * 1024)) {
            console.log(`Dropping client message ${message.length / 1024} KB...`);
            console.log(message.slice(0, 160));
            return;
        }
        const pipeIndex = message.indexOf('|');
        if (pipeIndex < 0/* || pipeIndex === message.length - 1 */) return;
        processData(socketid, message);
    });
    socket.once('close', () => {
        console.log('... exit ...')
        sockets.delete(socketid);
    });
});

const static_directory = new node_static.Server(path.join(__dirname, '../../'));
const server = http.createServer();
server.addListener('request', function(req, res) {
    static_directory.serve(req, res);
});
server.addListener('upgrade', function(req,res){
    res.end();
});
sockjs_echo.installHandlers(server, {prefix:'/sockets'});
console.log(' [*] Listening on 0.0.0.0:8000' );
server.listen(8000, '0.0.0.0');
