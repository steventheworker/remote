let {PythonShell} = require('python-shell')

PythonShell.run('press.py',
{
  args: ['k']
}, function (err, results) {
  if (err) throw err;
  // results is an array consisting of messages collected during execution
  console.log('results: %j', results);
});
