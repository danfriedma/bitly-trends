cronJob = require('cron').CronJob;
require('./models');

module.exports = function(app) {

  var job = new cronJob({
    cronTime: '00 00 */1 * * *',
    onTick: function() {

    var time = (new Date).getTime();
    time = Math.floor(time/1000) - 3600;

    Line.remove(
      { $query: {}, 
        $max: { latest_time: time }
      }
    );
    },
    start: true
  });
  job.start();

};