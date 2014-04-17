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
                    
                    if(!message.data.phrases[i].urls.length) {
                       console.log('no urls found');
                    }
                    else {

                        if(message.data.phrases[i].rate > .4) {
                            var time = new Time;

                            time.time = message.data.time;
                            time.rate = message.data.phrases[i].rate;
                            time.urls = message.data.phrases[i].urls.length;

                            Line.findOneAndUpdate(
                                { phrase: message.data.phrases[i].phrase },
                                { $set: 
                                    { latest_time: message.data.time,
                                      url: message.data.phrases[i].urls[0].aggregate_url 
                                    },
                                  $push: { times: time } },
                                { safe: true, upsert: true },
                                function(err, line) {
                                    if(err) {
                                        console.log('first find&update error: ' + err);
                                    }
                                }
                            );
                        }
                    }
/*
                    if(!message.data.phrases[i].urls.length) {
                       console.log('no urls found');
                    }
                    else {
                        Line.findOneAndUpdate(
                            { phrase: message.data.phrases[i].phrase },
                            { $set: { url: message.data.phrases[i].urls[0].aggregate_url } },
                            function(err, line) {
                                if(err) {
                                    console.log('second find&update error: ' + err);
                                }
                            }
                        );
                    }   */
                }
            }
        }
    });
});

client.connect('ws://ec2-54-186-152-112.us-west-2.compute.amazonaws.com:7070/ws/3', null);
};