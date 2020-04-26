const sock = new SockJS('http://'+ window.location.host  +'/sockets');
sock.onopen = function() {
    app.socket = sock;
    console.log('open');
};
sock.onmessage = function(e) {
    const data = e.split('|');
    const event = data.shift();
    if (event === "r") { //refresh screen pic
        app.refreshScreen();
    }
    console.log('message', event, data);
};
sock.onclose = function() {
    $('body').html('disconnection screen - socket died');
    console.log('close');
};
