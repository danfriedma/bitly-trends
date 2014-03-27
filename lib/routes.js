'use strict';

var index = require('./controllers');
var models = require('./models');


/**
 * Application routes
 */
module.exports = function(app) {
/*
  // Server API Routes
  app.get('/api/awesomeThings', api.awesomeThings);
  

  // All undefined api routes should return a 404
  app.get('/api/*', function(req, res) {
    res.send(404);
  });
  




  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);*/


    // use mongoose to get all todos in the database
  app.get('/api/lines', function(req, res) {

    Line.find(function(err, lines) {

      // if there is an error retrieving, send the error. nothing after res.send(err) will execute
      if (err)
        res.send(err);

      res.json(lines); // return all todos in JSON format
    });
  });


  app.get('/*', index.index);




};