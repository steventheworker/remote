import events from './events';
import {Connection} from 'sockjs';

export class Sesh {
    user: User;
    ip: string;
    socketid: string;
    connection: Connection;
    connected: boolean;
    constructor(socketid: string, socket: Connection, ip: string | null, user?: User) {
		this.socketid = socketid;
        this.connection = socket;
        this.connected = true;
        this.ip = ip || '';
        this.user = user!;
    }
    send(msg: string) {this.connection.write(msg);}
}
export class User {
    user: User;
    name: string;
    connected: boolean;
    ips: string[];
    connections: Sesh[] = [];
    constructor(connection: Sesh) {
		this.user = this;
		this.connected = true;
		Users.online++;
		if (connection.user) connection.user = this;
		this.connections = [connection];
		this.ips = [connection.ip];
        this.name = `Guest ${connection.socketid}`;
        users.set(this.name, this);
    }
    send(msg: string) {
        this.connections.forEach(connection => {
            connection.send(msg);
        });
    }
    onDisconnect(connection: Sesh) {
        for (const [i, connected] of this.connections.entries()) {
            if (connected === connection) {
                this.connections.splice(i, 1);
                // for (const roomid of connection.rooms) this.leave(Rooms.get(roomid)!, connection);
                break;
            }
        }
        if (!this.connections.length) this.destroy();
    }
    destroy() {
        users.delete(this.name);
        Users.online--;
    }
}

//sockets
function socketProcessReceivedData(socketid: string, message: string) {
	const connection = connections.get(socketid);
	if (!connection) return;
	const user = connection.user;
	if (!user) return;

    const data = message.split('|');
    const event = data.splice(0, 1)[0];
    data.push(event);
    let fn = events[event];
    if (fn) {
        console.log(Users.online + " users online. =")
        if (typeof fn === 'string') fn = events[fn];
        try {
            (fn as Function).apply(null, [user, ...data]);
        } catch(e) {
    		const err = '|' + ('' + e.stack).replace(/\n/g, '\n|');
    		user.send('|<< error: ' + e.message + '\n' + err);
        }
    }
    console.log("<=" + message)
}
function socketConnect(socketid: string, socket: Connection, ip: string) {
	const connection = new Sesh(socketid, socket, ip);
	connections.set(socketid, connection);
	const user = new User(connection);
    connection.user = user;
    console.log(Users.online + " users online. +1")
}
function socketDisconnect(socketid: string) {
    const connection = connections.get(socketid);
    if (connection.user) connection.user.onDisconnect(connection);
    connection.user = null!;
    connections.delete(socketid);
    console.log(Users.online + " users online. -1")
}
//definitions
const users = new Map<ID, User>();
const connections = new Map<ID, Sesh>();
//exports
export interface GlobalUsersTypes {
    online: number;
    users: Map<ID, User>;
    User: typeof User;
    connections: Map<ID, Sesh>;
    socketConnect: {(socketid: string, socket: Connection, ip: string): void};
    socketDisconnect: {(socketid: string): void};
    socketProcessReceivedData: {(socketid: string, message: string): void};
}
export const Users:GlobalUsersTypes = {
    online: 0,
    users, User, connections,
    socketConnect, socketDisconnect, socketProcessReceivedData,
};
