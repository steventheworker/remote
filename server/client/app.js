var app = {};
app.init = function() {
    app.initializeDom();
};
app.send = function(data) {
    if (!app.socket) return;
    app.socket.send(data);
    console.log("=>\""+data+'"');
};
app.initializeDom = function() {
    document.body.onkeypress = function(e) {
        app.send('k|' + e.key);
    };    
};
window.onload = app.init;
