let {PythonShell} = require('python-shell');

const queue = [];
const LAPSE_MS = 333;
let lastT = 0;
let isProcessing = false;
function processQueue() {
    if (isProcessing) return;
    const t = new Date() / 1;
    const firstT = queue[0][0];
    if (t - firstT < LAPSE_MS) {
        isProcessing = true;
        return setTimeout(function() {
            isProcessing = false;
            processQueue();
        }, LAPSE_MS - (t - firstT));
    }
    //create the picture
    PythonShell.run('./controls/screeny.py', {}, function (err, results) {
        if (err) throw err;
        lastT = new Date() / 1;
        queue.forEach(el => el[1] ? el[1]() : 0); //perform callbacks
        queue.splice(0, queue.length); //reset array(queue = []) but keeping const!!! ugh
    });
}
function generatePic(callback) {
    const t = new Date() / 1;
    queue.push([t, callback]);
    processQueue();
}
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
