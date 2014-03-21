'use strict';

/**
 * Main application file
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000;

// Application Config
var config = require('./lib/config/config');

//var app = express();

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);


// Expose app
exports = module.exports = app;

// Server for client websockets
var server = http.createServer(app);
server.listen(port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');
wss.on('connection', function(ws) {

  console.log('websocket connection open');

  ws.on('close', function() {
    console.log('websocket connection close');
  });
});
wss.broadcast = function(data) {
  for(var i in this.clients)
  this.clients[i].send(data);
};


// Connect to streamtools websocket
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket client connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            wss.broadcast(message.utf8Data);
        }
    });
});

client.connect('ws://ec2-54-186-152-112.us-west-2.compute.amazonaws.com:7070/ws/10', null);