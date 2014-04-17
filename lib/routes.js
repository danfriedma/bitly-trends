'use strict';

var index = require('./controllers');
require('./models');


/**
 * Application routes
 */
module.exports = function(app) {

  app.get('/lines/:range', function(req, res) {

    var time = (new Date).getTime();
    time = Math.floor(time/1000) - req.params.range;

    Line.find(
      { $query: {}, $min: { latest_time: time } },
      {},
      {
        limit: 60 
      },
      function(err, lines) {
      if (err) {
        res.send(err);
      }
      else {
        res.json(lines);
      }
    });
  });

  app.get('/about', index.about);

  app.get('/*', index.index);

};