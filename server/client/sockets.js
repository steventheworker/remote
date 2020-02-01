var sock = new SockJS('http://localhost:8000/sockets');
sock.onopen = function() {
    app.socket = sock;
    console.log('open');
};
sock.onmessage = function(e) {
    console.log('message', e.data);
};
sock.onclose = function() {
    console.log('close');
};
