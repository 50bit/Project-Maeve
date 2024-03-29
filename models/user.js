var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');



var UserSchema = mongoose.Schema({
    username: {
		type: String,
		index:true,
		unique:true,
		required:true
	},
	password: {
		type: String,
		// minlength:[8,"can't be less than 8"],
		// maxlength:10,
		required:true
	},
	email: {
		type: String,
		unique:true,
		required:true
	},
	name: {
		type: String,
		required:true
	},
	fbStatus:{
		type:String,
		default:"unlinked"
	},
	fbUserID:{
		type:String,
		
	}
});

var User = module.exports = mongoose.model('User',UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
            newUser.save(callback);
	    });
	});
}


module.exports.getUserByUsername=function(username,callback){
    var query = {username:username};
    User.findOne(query,callback);
}

module.exports.getUserById=function(id,callback){   
    User.findById(id,callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}