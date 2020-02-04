
let {PythonShell} = require('python-shell')

PythonShell.run('press.py',   
{
  mode: 'text',
  pythonPath: 'C:\\Users\\steven\\AppData\\Local\\Programs\\Python\\Python38-32',
  pythonOptions: ['-u'], // get print results in real-time
  scriptPath: 'C:\\Users\\steven\\Desktop\\remote\\server',
  args: ['value1', 'value2', 'value3']
}, function (err, results) {
  if (err) throw err;
  // results is an array consisting of messages collected during execution
  console.log('results: %j', results);
});
