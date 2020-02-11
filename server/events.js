let {PythonShell} = require('python-shell')

module.exports = {
    'k': function(socket, data) {
        if (!data) return;
        PythonShell.run('./controls/press.py',
        {
            args: [data]
        }, function (err, results) {
            if (err) throw err;
        });
        socket.write('k|' + data);
    }
};
