var mongoose = require('mongoose');
Schema = mongoose.Schema

var TimeModel = new Schema({
	time : Number,
	rate : Number
});

Time = mongoose.model('Time', TimeModel);



var LineModel = new Schema({

	phrase : String,
	url: String,
	times: [ TimeModel ]
});

Line = mongoose.model('Line', LineModel); 



module.exports = {
	Line: Line,
	Time: Time
}
