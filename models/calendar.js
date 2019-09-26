
var mongoose = require('mongoose');

var CalendarSchema = mongoose.Schema({
	text:{
		type : String
	},
    start_date:{
		type : Date
	},
    end_date:{
		type : Date
	},
	color: { 
		type:String,
		defualt :"#DD8616"
	},
	user:{
		type:String,
		required:true
	},
	id:{
		type:String
	}
});

var Calendar = module.exports=mongoose.model('Calendar',CalendarSchema);
