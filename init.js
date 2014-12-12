#!/usr/bin/env node
var spawn = require('child_process').spawn;
var fs = require('fs');

console.log('this platform: ' + process.platform)

//npm install
if (!fs.existsSync('node_modules')) {
  console.log('modules install start!');

  var install = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
  install.on('close', function(code) {
  	console.log('modules install complete!');
  	start();
  });
} else {
  console.log('modules install complete!');
  start();
}

//node app.js
function start() {
  console.log('server start -- app.js');

  var server;
  server = spawn('node', ['app.js'], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore']
  });
  server.unref();
  server.on('error', function(code, signal) {
    console.log('child process error with code: ' + code);
    server.kill(signal);
    server = start();
  });
  server.on('exit', function(code, signal) {
    console.log('child process exit with code: ' + code);
  })

  console.log('server pid  is ' + server.pid);
  return server;
}