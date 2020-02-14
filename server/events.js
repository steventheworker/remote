let {PythonShell} = require('python-shell')

module.exports = {
    'k': function(socket, data, shift) {
        if (!data) return;
        PythonShell.run('./controls/press-release.py',
        {
            args: [data, shift ? true : false]
        }, function (err, results) {
            if (err) throw err;
        });
        socket.write('k|' + data);
    }
};
