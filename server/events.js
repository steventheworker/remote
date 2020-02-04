// const controller = require('./controller');

// module.exports = {
//     'k': function(socket, data) {
//         controller.press(data);
//         socket.write('k|' + data);
//     }
// };
let {PythonShell} = require('python-shell')

module.exports = {
    'k': function(socket, data) {
          PythonShell.run('press.py', {
            args: ['value1', 'value2', 'value3']
          }, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
          });
        socket.write('k|' + data);
    }
};
