window.app = {};

import {fn} from "./frankenquery.js";
window.$ = fn;

import {codes} from "./KeyMapping.js";
app.keyCodes = codes;

app.send = function(data) {
    if (!app.socket) return;
    app.socket.send(data);
    console.log("=>\""+data+'"');
};
app.listenKeys = function(e) {
    console.log(e.type)
    const char = e.data;
    let key = e.code || (char && char.charCodeAt(0));
    if (e.type === "keydown") $('#is_mobile').attr('disabled', true);
    /*
    alert(e.key + '::' + e.which)
    const key = e.code || e.keyCode || e.charCode;
    alert(key)
    */
    if (!key || key === "WakeUp") return; //python library has no fn (aka WakeUp)
    app.send('k|' + key);
};

app.initializeDom = function() {
    $('body')
    .keydown(app.listenKeys)
    .on("textInput", "#is_mobile", app.listenKeys)
    .on('click touchend', function() {
        $('#is_mobile')[0].focus();
    });
};

$(function() {
    app.initializeDom();
});
