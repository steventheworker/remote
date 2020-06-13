let {PythonShell} = require('python-shell');
const generatePic = require('./generatePic');

const fs = require('fs')
const pythonPath = 'C:\\Users\\steven\\AppData\\Local\\Programs\\Python\\Python38-32\\python.exe';

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
            args: [key, shift ? true : false],
            pythonPath
        }, function (err, results) {
            if (err) fs.writeFileSync('es.txt', err + '|||' + results);
        });
        socket.write(event + '|' + key);
    },
    'es': function(socket, data) {
        PythonShell.run('./controls/es.py', {
            args: [data],
            pythonPath
        }, function (err, results) {
            if (err) fs.writeFileSync('es.txt', err + '|||' + results);
        });
        generatePic();
    }
};
