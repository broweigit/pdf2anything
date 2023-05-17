const { spawn } = require('child_process');
const path = require('path');

const pythonProcess = spawn('python', [path.join(__dirname, 'path/to/python_script.py')]);

function callPythonFunction(functionName, ...args) {
  return new Promise((resolve, reject) => {
    pythonProcess.stdout.once('data', (data) => {
      const result = JSON.parse(data.toString().trim());
      if (result.error) {
        reject(result.error);
      } else {
        resolve(result.value);
      }
    });

    pythonProcess.stdin.write(JSON.stringify({ functionName, args }) + '\n');
  });
}

export default callPythonFunction;