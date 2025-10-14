const { spawn } = require('child_process');

console.log('Testing resource reading directly...');

const server = spawn('node', ['lib/src/server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

server.stderr.on('data', (data) => {
  console.log('ERROR:', data.toString());
});

server.stdout.on('data', (data) => {
  console.log('OUTPUT:', data.toString());
});

// Initialize
const initRequest = JSON.stringify({
  jsonrpc: "2.0",
  method: "initialize", 
  params: {
    protocolVersion: "2024-11-05",
    capabilities: { resources: {} }
  },
  id: 1
}) + '\n';

console.log('Sending init request...');
server.stdin.write(initRequest);

// Test config resource
setTimeout(() => {
  const configRequest = JSON.stringify({
    jsonrpc: "2.0",
    method: "resources/read",
    params: { uri: "file://config.json" },
    id: 2
  }) + '\n';
  
  console.log('Sending config request...');
  server.stdin.write(configRequest);
}, 1000);

setTimeout(() => {
  server.kill();
}, 3000);