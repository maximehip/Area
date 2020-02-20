var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
	name : {
		type : String,
		require: true
	},
	email : {
		type : String,
		require: true
	},
	password : {
		type : String,
		require: true
	},
	date : {
		type : Date,
		default: Date.now,
	},
	widgets : {
		type : Array,
	},
	token: {
		type: String,
	},
	actions : {
		type : Array,
	},
	connected_w : String,
	infos :  {
		type : Array,
	}
});
UserSchema.methods.comparePassword = function(pw, cb) {  
  bcrypt.compare(pw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

var userModel = mongoose.model('User', UserSchema);

module.exports = userModel;