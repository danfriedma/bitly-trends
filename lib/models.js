var mongoose = require('mongoose');
Schema = mongoose.Schema;

var TimeSchema = new Schema({
	time: Number,
	rate: Number,
	urls: Number,
});

Time = mongoose.model('Time', TimeSchema);

var LineSchema = new Schema({
	phrase: String,
	latest_time: Number,
	url: String,
	times: [ TimeSchema ]
});

LineSchema.index({ phrase: 1 });

LineSchema.index({ latest_time: 1 });

Line = mongoose.model('Line', LineSchema); 

module.exports = {
	Line: Line,
	Time: Time
};