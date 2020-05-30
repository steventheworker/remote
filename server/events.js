let {PythonShell} = require('python-shell');
const generatePic = require('./generatePic');
generatePic();

module.exports = {
    'init': function(socket, event) {
        generatePic(function() {
            socket.write('r');
        });
    },
    'ku': 'k',
    'kd': 'k',
    'k': function(socket, key, shift, event) {
        if (!key) return;
        let fnType = 'press-release';
        if (event === 'ku') fnType = 'release';
        if (event === 'kd') fnType = 'press';
        PythonShell.run('./controls/'+fnType+'.py', {
            args: [key, shift ? true : false]
        }, function (err, results) {
            if (err) throw err;
        });
        socket.write(event + '|' + key);
    },
    'es': function(socket, data) {
        PythonShell.run('./controls/es.py', {
            args: [data]
        }, function (err, results) {
            if (err) throw err;
        });
        generatePic();
    }
};
