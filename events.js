let {PythonShell} = require('python-shell');
const fs = require('fs')
const pythonPath = 'C:\\Users\\steven\\AppData\\Local\\Programs\\Python\\Python38-32\\python.exe';

const generatePic = require('./generatePic');
/*
function generatePic() {
    function ts() { //timestamp
        let d = new Date();
        return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    }
    fs.writeFile('./client/beb.txt',`${ts()}`, () => {});
    PythonShell.run('./controls/screeny.py', {}, err => {if (err) throw err; else 1; });
}
*/
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
    },
    'heartbeat': function(socket, event) {
        generatePic(() => {
            socket.write('r');
        });
    }
};