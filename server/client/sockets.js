var sock = new SockJS('http://'+ window.location.host  +'/sockets');
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
