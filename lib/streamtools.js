var models = require('./models');


module.exports = function(app) {
// Connect to streamtools websocket
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('Streamtools opened');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('Streamtools closed');
            setTimeout(function() {
              client.connect('ws://ec2-54-186-152-112.us-west-2.compute.amazonaws.com:7070/ws/3', null);
            }, 2500);
        
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            //wss.broadcast(message.utf8Data);
            message = JSON.parse(message.utf8Data);
            if(!message.data) {
                console.log(message);
            }
            else {
                for (var i = 0; i < message.data.phrases.length; i++) {
                    
                    var time = {
                        time: message.data.time, 
                        rate: message.data.phrases[i].rate
                    }

                    Line.findOneAndUpdate(
                        { phrase: message.data.phrases[i].phrase },
                        { $push: { times: time } },
                        { safe: true, upsert: true },
                        function(err, line) {
                            // Handle err
                        }
                    );

                    if(!message.data.phrases[i].urls[0]) {
                        console.log('no urls');
                    }
                    else {
                        Line.findOne(
                            { phrase: message.data.phrases[i].phrase },
                            { $set: { url: message.data.phrases[i].urls[0].aggregate_url } },
                            function(err, line) {
                                // Handle err
                            }
                        );
                    }   
                }
            }
        }
        
    });
});

client.connect('ws://ec2-54-186-152-112.us-west-2.compute.amazonaws.com:7070/ws/3', null);
};