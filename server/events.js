let {PythonShell} = require('python-shell');

module.exports = {
    'ku': 'k',
    'kd': 'k',
    'k': function(socket, data, shift, event) {
        if (!data) return;
        let fnType = 'press-release';
        if (event === 'ku') fnType = 'release';
        if (event === 'kd') fnType = 'press';
        PythonShell.run('./controls/'+fnType+'.py', {
            args: [data, shift ? true : false]
        }, function (err, results) {
            if (err) throw err;
        });
        socket.write(event + '|' + data);
    },
};
