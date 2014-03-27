'use strict';

/**
 * Main application file
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000
  , mongoose = require('mongoose'); 

// Application Config
var config = require('./lib/config/config');


console.log(config.url);
// Connect to database
mongoose.connect(config.url); // connect to our database

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

require('./lib/streamtools')(app);

// Expose app
exports = module.exports = app;



// Server for client websockets
var server = http.createServer(app);
server.listen(port);

var wss = new WebSocketServer({server: server});
console.log('Server created');
wss.on('connection', function(ws) {

  console.log('Client opened');

  ws.on('close', function() {
    console.log('Client closed');
  });
});
wss.broadcast = function(data) {
  for(var i in this.clients)
  this.clients[i].send(data);
};

