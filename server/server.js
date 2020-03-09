var express = require('express');
var app = express();
var route = express.Router();
var mongoose = require('mongoose');

var db = require('./config/db').url;

var User = require('./models/User');

var bcrypt = require('bcryptjs');

var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
require('./config/passport')(passport);
var { ensureLogin } = require('./config/login');
var jwt = require('jsonwebtoken');
var facebookMessage = require('fb-messenger-bot-api');
var SpotifyWebApi = require('spotify-web-api-node');
var cookie = require('cookie-parser');
var server = require('http').Server(app);

var Passe = require('./api_calls/passe');
const axios = require('axios');

const fs = require('fs');

var cron = require('node-cron');
var { GetTrigger } = require('./trigger');

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => console.log('DB connected'))
	.catch(err => console.log(err));

var spotifyApi = new SpotifyWebApi({
  clientId: '4b7c2f7dcf2a45349c4c9b0b0b4cc8a4',
  clientSecret: '749288d1c7a641bbb4aed6aeb4eabb42',
  redirectUri: 'https://area-oui.herokuapp.com/spotify'
});
class Action {
	constructor(name, description) {
    	this.name = name;
    	this.description = description;
  	}
}

class Widget {
	constructor(name, id, description, index) {
    	this.name = name;
    	this.id = id;
    	this.action = new Action(index, description);
  	}
}

class Trigger {
	constructor(name, id, description, index) {
    	this.name = name;
    	this.id = id;
    	this.action = new Action(index, description);
  	}
}

class Sender {
	constructor(name, id, description, index) {
    	this.name = name;
    	this.id = id;
    	this.action = new Action(index, description);
  	}
}

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(session({
  secret: 'cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookie());

app.use(flash());
app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next(); 
});

route.get('/', function(req, res) {
	res.render('home');
})

route.get('/register', function(req, res) {
	res.render('register');
})

route.post('/register', function(req, res) {
	var { username, email, password, password2} = req.body;
	var errors = [];

	if (!username || !email || !password || !password2) {
		errors.push({error : "Please fill in all fields"});
	} 
	if (password != password2) {
		errors.push({errors : "Password do not match"});
	} 
	if (password.lenght < 6) {
		errors.push({errors : "Password is too small"});
	}
	if (errors.length > 0) {
		res.render('register', {errors, username, email});
	} else {
		User.findOne({ email: email })
			.then(user => {
				if (user) {
					errors.push({errors : "Email already exist"});
					res.render('register', {errors, username, email});
				} else {
					var newUser = new User({
						username,
						email,
						password
					});
					newUser.triggerAdd.push("no");
					newUser.senderAdd.push("no");
					bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						newUser.save()
							.then(user => {
								req.flash('success', 'Your account has been created');
								res.redirect('/');
							})
							.catch(err => console.log(err));
					}))
				}
			})
	}
})

route.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/me',
		failureRedirect: '/',
		failureFlash: true,
	})(req, res, next);
})

route.get('/me', ensureLogin, (req, res) => {
	res.render('me', {user: req.user, index: req.session.index, output: req.session.output});
})

route.get('/logout', (req, res) => {
	res.clearCookie("spotify");
	req.logout();
	req.flash('success', 'Your are logged out');
	res.redirect('/');
})

route.get('/auth/facebook', passport.authenticate('facebook', {scope:"email"}));

route.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/me', failureRedirect: '/' }));

route.get('/api/auth/google', passport.authenticate('google', {
	scope: [
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/userinfo.email'
	]
	})
)

route.get('/api/auth/google/callback', passport.authenticate('google', { successRedirect: '/me', failureRedirect: '/' }));

route.get('/api/auth/twitter', passport.authenticate('twitter'));

route.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/me', failureRedirect: '/' }));

route.get('/widgets', ensureLogin, async (req, res) => {
	if (req.query.add || req.query.remove) {
		User.findOne({ email: req.user.email}, (err, user) => {
			if (req.query.add) {
				user.widgets.push(req.query.add);
			} else if (req.query.remove) {
				user.widgets.pull(req.query.remove);
			}
			user.save().then(user => {
				if (req.query.add)
					req.flash('success', req.query.add + " added");
				else if (req.query.remove)
					req.flash('success', req.query.add + " removed");
				res.redirect('/widgets');
			});
		})
	}  else {
		var widgets = [];
		var description = [];
		fs.readdirSync('widgets/').forEach(file => {
			if (file[0] != '.') {
				var getted = JSON.parse(fs.readFileSync("widgets/" + file + "/config.json"));
				var widg = new Widget(getted.name, getted.id, getted.description, 0);
				widgets.push(widg);
			}
		});
		res.render('widgets', {widgets: widgets, user: req.user});
	}
})

route.get('/trigger', ensureLogin, async (req, res) => {
	if (req.query.add || req.query.remove) {
		User.findOne({ email: req.user.email}, (err, user) => {
			if (req.query.add)
				user.triggerAdd.push(req.query.add);
			else if (req.query.remove)
				user.triggerAdd.pull(req.query.remove);
			user.save().then(user => {
				req.flash('success', req.query.add + " added");
				res.redirect('/trigger');
			});
		})
	} else {
		var triggers = [];
		fs.readdirSync('trigger/').forEach(file => {
			if (file[0] != '.') {
				var getted = JSON.parse(fs.readFileSync("trigger/" + file + "/config.json"));
				var trig = new Trigger(getted.name, getted.id, getted.description, 0);
				triggers.push(trig);
			}
		});
		res.render('trigger', {triggers: triggers, user: req.user});
	}
})

route.get('/sender', ensureLogin, async (req, res) => {
	if (req.query.add || req.query.remove) {
		User.findOne({ email: req.user.email}, (err, user) => {
			if (req.query.add)
				user.senderAdd.push(req.query.add);
			else if (req.query.remove)
				user.senderAdd.pull(req.query.remove);
			user.save().then(user => {
				req.flash('success', req.query.add + " added");
				res.redirect('/sender');
			});
		})
	} else {
		var senders = [];
		fs.readdirSync('sender/').forEach(file => {
			if (file[0] != '.') {
				var getted = JSON.parse(fs.readFileSync("sender/" + file + "/config.json"));
				var send = new Sender(getted.name, getted.id, getted.description, 0);
				senders.push(send);
			}
		});
		res.render('sender', {senders: senders, user: req.user});
	}
})

route.post('/save', ensureLogin, async (req, res) => {
	var button = req.body.send;
	if (button == 'delete') {
		var str = req.body.widgets[0] + '0' + req.body.widgets[1];
		User.findOne({ email: req.user.email}, (err, user) => {
			var index = parseInt(req.body.id, 10);
			user.infos = user.infos.slice(1, index)
			user.actions = user.actions.slice(1, index)
			user.trigger = user.trigger.slice(1, index)
			user.save().then(user => { 
				req.flash('success', "action removed");
				res.redirect('/me');
			});
		})
	} else if (button == 'save') {
		var str = req.body.widgets[0] + '0' + req.body.widgets[1];
		var index = parseInt(req.body.id, 10);
		User.findOne({ email: req.user.email}, (err, user) => {
			user.actions.pull(index);
			user.actions.set(index, str);
			user.trigger.pull(index);
			user.trigger.set(index, req.body.trigger);
			user.save().then(user => { 
				req.flash('success', req.query.remove + " edited");
				res.redirect('/me');
			});
		})
	} else if (button == "run") {
		User.findOne({ email: req.user.email}, (err, user) => {	
			var index = parseInt(req.body.id, 10);
			spotifyApi.setAccessToken(req.cookies['spotify']);
			var action = req.body.widgets[0];
			var reaction = req.body.widgets[1];
			var  infos = user.infos[index];
			var result;
			action = action.toLowerCase();
			var trig = GetTrigger(req, res, user, index, result, action);
			trig.then(function(result) {
				if (result == 1) {
					req.session.index = index;
					req.session.output = "Trigger failed";
					res.redirect('/me');
				} else {
					Passe.reaction(action, reaction, infos, req, res, index, spotifyApi, 0);
				}
			})
		})
	}
})

route.get('/addAction', ensureLogin, (req, res) => {
	var str = "weather0weather";
	User.findOne({ email: req.user.email}, (err, user) => {
		user.actions.push(str);
		user.save((error, done) => { 
			res.redirect('/me');
		});
	})
})

app.get('/webhook', (req, res) => {
	if (req.query['hub.verify_token'] === "/") {
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong token")
})

app.post('/webhook/', (req, res) => {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			sendText(sender, "Text echo: " + text.substring(0, 100))
		}
	}
	res.sendStatus(200)
})

app.get('/connect/spotify', (req, res) => {
	var scopes = 'user-read-private user-read-email user-read-playback-state';
	res.redirect('https://accounts.spotify.com/authorize' +
	  '?response_type=code' +
	  '&client_id=' + "4b7c2f7dcf2a45349c4c9b0b0b4cc8a4" +
	  (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
	  '&redirect_uri=' + encodeURIComponent("https://area-oui.herokuapp.com/spotify"));
})

app.get('/spotify', (req, res) => {
	var url =  req.originalUrl;
	url = url.split("=");
	var code = url[1];
	spotifyApi.authorizationCodeGrant(code).then(function(data) {
	    spotifyApi.setAccessToken(data.body['access_token']);
	    spotifyApi.setRefreshToken(data.body['refresh_token']); 
	    res.cookie('spotify', data.body['access_token'], { httpOnly:true });
	    res.redirect('/me');
	  },function(err) {
	    console.log('Something went wrong!', err);
	  }
	);
});

app.post('/edit', ensureLogin, (req, res) => {
	User.findOne({ email: req.user.email}, (err, user) => {
		var index = parseInt(req.body.id, 10);
    	user.infos.pull(index);
		user.infos.set(index, req.body);
		user.save().then(user => { 
			req.flash('success', "changes saved");
			res.redirect('/me');
		});
	})
})

route.get('/about.json', (req, res) => {
	var ipInfo = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var date = Math.floor(new Date() / 1000);
	var widgets = [];
	fs.readdirSync('./about/').forEach(folder => {
		if (folder[0] != '.') {
			var name = {"name": folder};
			widgets.push(folder);
			var getted = JSON.parse(fs.readFileSync("about/" + folder + "/actions.json"));
			var widg = new Action(getted.id, getted.action);
			var actions = {"actions" : [widg]};
			widgets.push(actions);
			if (fs.existsSync("about/" + folder + "/reaction.json")) {
				var get = JSON.parse(fs.readFileSync("about/" + folder + "/reaction.json"));
				var reaction = new Action(get.id, get.reaction);
				var reacjs = {"reaction" : [reaction]};
				widgets.push(reacjs);
			}
		}
	});
	res.json({
			client: { 
				host: ipInfo 
			},
			server: {
				current_time : date,
				services : widgets
			}
	});
})
var TwitterStrategy = require('passport-twitter').Strategy;
route.get('/twitter/', (req, res) => {
	 var strategy = new TwitterStrategy({
        consumerKey: "PSwKoBTySx8ltcFQN8GT80TvI",
	    consumerSecret: "OW1aFARbLqjT6bfSAHgNM5fTZ5G0XRnTUCY9vEAsPZcF0OdO5z",
      }, function(){});
	 strategy._oauth.getOAuthRequestToken = function(extraParams, callback) {
	 	callback(null, 'hh5s93j4hdidpola', 'hdhd0244k9j7ao03', {});
    }
})

app.use('/', route);
app.use(require('./api/api'));
app.use(express.static(__dirname+'/public'));
app.listen(8080);
app.listen(8081);
/*app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});*/