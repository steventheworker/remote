const controller = require('./controller');

module.exports = {
    'k': function(socket, data) {
        controller.press(data);
        socket.write('k|' + data);
    }
};