let {PythonShell} = require('python-shell');

module.exports = {
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
    'ks': function(socket, data) {
        PythonShell.run('./controls/ks.py', {
            args: [data]
        }, function (err, results) {
            if (err) throw err;
        });
    }
};
