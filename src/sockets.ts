import * as SockJS from 'sockjs-client';
export const Socket:WebSocket = new SockJS(`http://${window.location.host.replace('8080', '8000')}/sockets`);
Socket.onopen = function() {
    console.log('open');
};
console.log(window.app)
Socket.onmessage = function(e: any) {
    const data = e.data.split('|');
    const event = data.shift();
    if (event === "r") { //refresh screen pic
        this.app.refreshScreen();
    }
    console.log('message', event, data);
};
Socket.onclose = function() {
    document.write('disconnection screen - socket died');
    console.log('close');
};
