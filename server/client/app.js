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
    document.body.onkeydown = function(e) {
        if (e.code === "WakeUp") return;
        app.send('k|' + e.code);
    };
};
window.onload = app.init;
