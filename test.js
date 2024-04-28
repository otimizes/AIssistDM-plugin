const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
  console.log('A new client connected!');
  ws.send(JSON.stringify({from: 'CLIENT', content: 'Id like objective functions to reduce number of attributes. Answer with few words!'}));

  ws.on('message', function incoming(message) {
    console.log('received: ', message.toString());
    wss.clients.forEach(c => {
      if (c !== ws && c.readyState === WebSocket.OPEN) {
        c.send(message.toString())
      }
    })
      // ws.send(message.toString());
  });

  ws.on('close', function close() {
    console.log('A client disconnected');
  });

  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
  });
});

console.log('WebSocket server started on ws://localhost:8080');
