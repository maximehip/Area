var local = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var facebook = require('passport-facebook').Strategy;
var User = require('../models/User.js');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function (passport) {
	passport.use(
		new local({ usernameField: 'email'}, (email, password, done) => {
			User.findOne({ email : email})
				.then(user => {
					if (!user) {
						return done(null, false, { error : 'That email is not registered'});
					}
					bcrypt.compare(password, user.password, (err, match) => {
						if (err) throw err;
						if (match) {
							return done(null, user);
						} else {
							return done(null, false, { error : 'Password incorrect'});
						}
					});
				})
				.catch(err => console.log(err));
		})
	);
	passport.use(new facebook({
	    clientID: "519378595343801",
	    clientSecret: "25b87fa70689e857b14706f8729f8bbd",
	    callbackURL: "https://area-oui.herokuapp.com/auth/facebook/callback",
	    profileFields: ['id', 'email', 'name']
  	},
	  function(accessToken, refreshToken, profile, done) {
	    process.nextTick(function(){
	    		User.findOne({email: profile.emails[0].value}, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user)
	    				return done(null, user);
	    			else {
	    				var newUser = new User();
	    				newUser.email = profile.emails[0].value;
	    				newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
						newUser.token = accessToken;
						newUser.connected_w = "facebook";
						newUser.id = profile.id;

	    				newUser.save(function(err){
	    					if(err)
	    						throw err;
	    					return done(null, newUser);
	    				})
	    			}
	    		});
	    	});
	  }
	));
	passport.use(new GoogleStrategy({
		clientID: "764100195498-lnd4gglabgo9kurr737lk2odlas91sj1.apps.googleusercontent.com",
		clientSecret: "XIChl9DnKuNZ3HB26ASfEfql",
		callbackURL: "https://area-oui.herokuapp.com/api/auth/google/callback"
	}, async function(accessToken, refreshToken, profile, done) {
		User.findOne({email: profile.email}, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user)
	    				return done(null, user);
	    			else {
	    				var newUser = new User();
	    				newUser.id = profile.id;
	    				newUser.token = accessToken;
	    				newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
	    				newUser.email = profile.email;

	    				newUser.save(function(err){
	    					if(err)
	    						throw err;
	    					return done(null, newUser);
	    				})
	    			}
	    		});
		return done(createdError, createdUser)
	}));
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
	  User.findById(id, (err, user) => {
	    done(err, user);
	  });
	});
}