cronJob = require('cron').CronJob;
require('./models');

module.exports = function(app) {

  var job = new cronJob({
    cronTime: '00 00 */2 * * *',
    onTick: function() {

    var time = (new Date).getTime();
    time = Math.floor(time/1000) - 7200;

    Line.remove(
      { $query: {}, 
        $max: { latest_time: time }
      }
    );
    },
    start: false
  });
  job.start();

};