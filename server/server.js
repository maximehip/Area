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

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => console.log('DB connected'))
	.catch(err => console.log(err));

var spotifyApi = new SpotifyWebApi({
  clientId: '4b7c2f7dcf2a45349c4c9b0b0b4cc8a4',
  clientSecret: '749288d1c7a641bbb4aed6aeb4eabb42',
  redirectUri: 'http://localhost:8080/spotify'
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
	res.render('me', {user: req.user});
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

route.get('/widgets', ensureLogin, async (req, res) => {
	if (req.query.add) {
		User.findOne({ email: req.user.email}, (err, user) => {
			user.widgets.push(req.query.add);
			user.save().then(user => {
				req.flash('success', req.query.add + " added");
				res.redirect('/widgets');
			});
		})
	} else if (req.query.remove) {
		User.findOne({ email: req.user.email}, (err, user) => {
			user.widgets.pull(req.query.remove);
			user.save().then(user => { 
				req.flash('success', req.query.remove + " removed");
				res.redirect('/widgets');
			});
		})
	} else {
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

route.post('/save', ensureLogin, (req, res) => {
	var button = req.body.send;
	if (button == 'delete') {
		var str = req.body.widgets[0] + '0' + req.body.widgets[1];
		User.findOne({ email: req.user.email}, (err, user) => {
			user.actions.pull(str);
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
			user.save().then(user => { 
				req.flash('success', req.query.remove + " removed");
				res.redirect('/me');
			});
		})
	} else if (button == "run") {
		User.findOne({ email: req.user.email}, (err, user) => {	
			var index = parseInt(req.body.id, 10);
			spotifyApi.setAccessToken(req.cookies['spotify']);
			Passe.reaction(req.body.widgets[0], req.body.widgets[1], user.infos[index], spotifyApi);
			req.flash('success', 'Send');
			res.redirect('/me');

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

route.get('/mail', (req, res) => {
	Passe.callMail("oui");
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
	  '&redirect_uri=' + encodeURIComponent("http://localhost:8080/spotify"));
})
var code;

app.get('/spotify', (req, res) => {
	var url =  req.originalUrl;
	url = url.split("=");
	code = url[1];
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

app.get('/about.json', (req, res) => {
	var ipInfo = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var date = Math.floor(new Date() / 1000);
	var widgets = [];
	var index = 0;
	fs.readdirSync('widgets/').forEach(folder => {
		if (folder[0] != '.') {
			var getted = JSON.parse(fs.readFileSync("widgets/" + folder + "/config.json"));
			var widg = new Widget(getted.name, getted.description, index);
			widgets.push(widg);
			index++;
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

// API 

/**
 * @api {post} /api/register Create User account
 * @apiName Area
 * @apiGroup User
 *
 * @apiParam {String} email Users users address email.
 * @apiParam {String} password Users users password.
 * @apiParam {String} username Users users pseudo.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "msg": "Your account has been created",
 *     }
 */

route.post('/api/register', (req, res) => {
	var { username, email, password} = req.body;
	if (!username || !email || !password) {
		console.log(req.body);
		res.json({success: false, msg: 'Please fill in all fields'});
	} else {
		User.findOne({ email: email })
			.then(user => {
				if (user) {
					res.json({success: false, msg: 'Email already exist'});
				} else {
					var newUser = new User({
						username,
						email,
						password
					});
					bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						newUser.save()
							.then(user => {
								res.json({success: true, msg: 'Your account has been created'});
							})
							.catch(err => console.log(err));
					}))
				}
			})
	}
})

 /**
 * @api {post} /api/login Login User/Get request token
 * @apiName Login
 * @apiGroup User
 *
 * @apiParam {String} email Users users address email.
 * @apiParam {String} password Users users password.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "token": "JWT token",
 *     }
 */

route.post('/api/login', (req, res) => {
User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          var token = jwt.sign(user.toJSON(), 'auth', {
          	expiresIn: 86400
          });
          res.json({ success: true, token: 'JWT ' + token });
        } else {
          res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
})

 /**
 * @api {get} /api/me Get information about user
 * @apiName Me
 * @apiGroup User
 *
 * @apiHeader {String} access-token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "infos": {
 *       	"_id": user id,
 *       	"email": user email,
 *       	"password": user password,
 *      	"date": creation date,
 *			"widgets": {
 *				"widget1",
 *				"widget2"
 *  		}
 *  	}
 *     }
 */

route.get('/api/me', (req, res) => {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				console.log('Error token');
				res.send({success: false, message: 'Error token'});
			} else {
				User.findOne({ email: decoded.email}, (err, user) => {
					if (err) throw err;
					if (user) {
						res.json({success: true, infos: user.toJSON()});
					} else {
						res.json({success: false, message: 'User not found'});
					}
				})
			}
		})
	} else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

 /**
 * @api {post} /api/widgets Add widget to user
 * @apiName AddWidget
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 * @apiParam {String} widget Widget name
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "done",
 *     }
 */

route.post('/api/getwidget', (req, res) => {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				console.log('Error token');
				res.send({success: false, message: 'Error token'});
			} else {
				if (req.body.widget) {
					User.findOne({ email: decoded.email}, (err, user) => {
						user.widgets.push(req.body.widget);
						user.save((error, done) => { 
							res.send({success: true, message: 'done'});
						});
					})
				} else {
					res.send({success: false, message: 'Widget not found'});
				}
			}
		})
	} else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

 /**
 * @api {get} /api/widgets/list Get list of widgets
 * @apiName Widgets
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "widgets": {
 *       	"widget1",
 *			"widget2"
 *  	}
 *     }
 */

route.get('/api/widgets/list', (req, res) => {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				console.log('Error token');
				res.send({success: false, message: 'Error token'});
			} else {
				var data = [];
				fs.readdirSync('widgets/').forEach(folder => {
					if (folder[0] != '.') {
						var contents = fs.readFileSync("widgets/" + folder + "/config.json");
						let json = JSON.parse(contents);
						data.push(json);
					}
				});
				res.json({success: true, widgets: data});
			}
		})
	}
})

 /**
 * @api {post} /api/widgets/steam Get number of player in steam games
 * @apiName Steam
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 * @apiParam {String} game Game Name
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "nb": 2
 *     }
 */

route.post('/api/widgets/steam', function (req, res) {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				console.log('Error token');
				res.send({success: false, message: 'Error token'});
			} else {
				if (req.body.game) {
					Passe.getSteam(req.body.game).then(function(result) {
				   		res.json({success: true, nb: result});
					})
				} else {
					res.json({success: false, message: 'game not found'});
				}
			}
		})
	}
})

 /**
 * @api {post} /api/widgets/weather Get infos about weather in city
 * @apiName Weather
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 * @apiParam {String} city City Name
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": [
        {
            "rh": 72,
            "pod": "d",
            "lon": 2.3488,
            "pres": 1000.3,
            "timezone": "Europe/Paris",
            "ob_time": "2020-01-17 16:17",
            "country_code": "FR",
            "clouds": 49,
            "ts": 1579277820,
            "solar_rad": 18.7,
            "state_code": "11",
            "city_name": "Paris",
            "wind_spd": 1.79,
            "last_ob_time": "2020-01-17T16:17:00",
            "wind_cdir_full": "southwest",
            "wind_cdir": "SW",
            "slp": 1019.9,
            "vis": 5,
            "h_angle": 72,
            "sunset": "16:24",
            "dni": 158.8,
            "dewpt": 4.2,
            "snow": 0,
            "uv": 2.01596,
            "precip": 0,
            "wind_dir": 227,
            "sunrise": "07:36",
            "ghi": 20.09,
            "dhi": 22.53,
            "aqi": 34,
            "lat": 48.85341,
            "weather": {
                "icon": "c02d",
                "code": "802",
                "description": "Scattered clouds"
            },
            "datetime": "2020-01-17:16",
            "temp": 8.9,
            "station": "C1292",
            "elev_angle": 2.44,
            "app_temp": 8.9
        }
    ],
    "count": 1
 *  }
 */

route.post('/api/widgets/weather', function (req, res) {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				console.log('Error token');
				res.send({success: false, message: 'Error token'});
			} else {
				if (req.body.city) {
					Passe.getWeather(req.body.city).then(function(result) {
				   		res.send(result);
					})
				} else {
					res.send({success: false, message: 'City not found'});
				}
			}
		})
	}
})

 /**
 * @api {get} /api/widgets/chucknorris Get random Chuck Norris Joke
 * @apiName Chuck Nurris
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       RANDROM JOKE
 *     }
 */

route.get('/api/widgets/chucknorris', function(req, res) {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				console.log('Error token');
				res.send({success: false, message: 'Error token'});
			} else {
				Passe.getChuckNorris().then(function(result) {
				  	res.send(result);
				})
			}
		})
	}
})

 /**
 * @api {post} /api/widgets/delete Delete widget in user account
 * @apiName Delete
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 * @apiParam {String} widget widget name
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Done"
 *     }
 */

route.post('/api/widgets/delete', function(req, res) {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				console.log('Error token');
				res.send({success: false, message: 'Error token'});
			} else {
				User.findOne({ email: decoded.email}, (err, user) => {
					user.widgets.pull(req.body.widget);
					user.save().then(user => { 
						res.send({success: true, message: 'Done'});
					});
				})
			}
		})
	}
})

 /**
 * @api {post} /api/widgets/actions Get widget actions
 * @apiName Actions
 * @apiGroup Widgets
 *
 * @apiParam {String} widget widget name
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "0": "Action 1"
 *     }
 */

route.post('/api/widgets/actions', function(req, res) {
	var data = [];
	var contents = fs.readFileSync("widgets/" + req.body.widget + "/actions.json");
	let json = JSON.parse(contents);
	data.push(json);
	res.json({success: true, actions: data});
})

 /**
 * @api {get} /api/widgets/movie/list Get 5 movies soon available
 * @apiName MoviesList
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *			movie1,
 *			movie2
 *			]
 *     }
 */

route.get('/api/widgets/movie/upcoming', function(req, res) {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				res.send({success: false, message: 'Error token'});
			} else {
				Passe.getUpcomingMovies().then(function(result) {
				   		res.send({success: true, data: result});
				})
			}
		})
	}
})

 /**
 * @api {get} /api/widgets/movie/trending Get 5 trending movies
 * @apiName MoviesTrending
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *			movie1,
 *			movie2
 *			]
 *     }
 */

route.get('/api/widgets/movie/trending', function(req, res) {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				res.send({success: false, message: 'Error token'});
			} else {
				Passe.getTrendingMovies().then(function(result) {
				   		res.send({success: true, data: result});
				})
			}
		})
	}
})

 /**
 * @api {get} /api/getToken Get user token
 * @apiName Token
 * @apiGroup User
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": "JWT token"
 *     }
 */

app.get('/api/getToken', function(req, res) {
    var token = jwt.sign(req.user.toJSON(), 'auth', {
    	expiresIn: 86400
    });
    res.redirect('/api/token/' + token);
})

 /**
 * @api {post} /api/reaction Use reaction of an widget
 * @apiName Reaction
 * @apiGroup Widget
 *
 * @apiHeader {String} access-token
 * @apiParam {String} action Name of the first action
 * @apiParam {String} reaction Name of the second action
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "done"
 *     }
 */

app.post('/api/reaction', function(req, res) {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				res.send({success: false, message: 'Error token'});
			} else {
				Passe.reaction(req.body.action, req.body.reaction, decoded.infos[req.body.index], spotifyApi);
				res.send({success: true, message: 'done'});
			}
		})
	}
})

/**
 * @api {post} /api/widgets/spotify/nowplaying Get current playing music in Spotify
 * @apiName Spotify
 * @apiGroup Widget
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "music": "Music of Artist name"
 *     }
 */


app.post('/api/widgets/spotify/nowplaying', (req, res) => {
	var getted = Passe.callnowplaying(req).then(function(data) {
		res.send({success: true, music: data});
	})
})

/**
 * @api {post} /api/widgets/discord Send a message to user
 * @apiName Spotify
 * @apiGroup Widget
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "done"
 *     }
 */

app.post('/api/widgets/discord', (req, res) => {
	var getted = Passe.send_dm(req.body.discord_name, req.body.discord_message).then(function(result) {
		res.send({success: true, message: result});
	})
})

/**
 * @api {post} /api/widgets/email Send email to someone
 * @apiName Email
 * @apiGroup Widget
 *
 * @apiHeader {String} access-token
 * @apiParam {String} sender's adress
 * @apiParam {String} app password
 * @apiParam {String} receipent's adress
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Email sent to .."
 *     }
 */

app.post('/api/widgets/email', (req, res) => {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				res.send({success: false, message: 'Error token'});
			} else {
				var infos = [req.body.recipent, req.body.message];
				Passe.callMail(req.body.adress, req.body.password, infos).then(function(result) {
				   	res.send({success: true, data: result});
				})
			}
		})
	}
});

/**
 * @api {get} /api/widgets/add Add action in user account
 * @apiName Add Widget
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": "done"
 *     }
 */

app.get('/api/widgets/add', (req, res) => {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				res.send({success: false, message: 'Error token'});
			} else {
				var str = "weather0weather";
				User.findOne({ email: decoded.email}, (err, user) => {
					user.actions.push(str);
					user.save((error, done) => { 
						res.json({success: true, data: "done"})
					});
				})
			}
		})
	}
})

/**
 * @api {get} /api/widgets/add Remove action in user account
 * @apiName Remove Widget
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 * @apiParam {String} widget1 Name of the first widget
 * @apiParam {String} widget2 Name of the second widget
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": "done"
 *     }
 */

app.post('/api/widgets/remove', (req, res) => {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				res.send({success: false, message: 'Error token'});
			} else {
				//var str = req.body.widget1 + '0' + req.body.widget2;
				User.findOne({ email: decoded.email}, (err, user) => {
					user.actions.pull(req.body.widget);
					user.save().then(user => { 
						res.json({success: true, data: "done"});
					});
				})
			}
		})
	}
})

/**
 * @api {get} /api/widgets/lyrics Remove action in user account
 * @apiName Lyrics
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 * @apiParam {String} title Song name
 * @apiParam {String} artiste Artist name
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "lyrics": " bla bla bla"
 *     }
 */

app.get('/api/widgets/lyrics', (req, res) => {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				res.send({success: false, message: 'Error token'});
			} else {
				Passe.get_song(req.body.title, req.body.artiste).then(function(result) {
					res.send({success: true, lyrics: result});
				})
			}
		})
	}
})

/**
 * @api {get} /api/action/edit Edit specific action/reaction
 * @apiName Edit Action
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 * @apiParam {String} index Index of action
 * @apiParam {String} str String with widget0widget
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": done,		
 *     }
 */

app.post('/api/action/edit', (req, res) => {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				res.send({success: false, message: 'Error token'});
			} else {
				User.findOne({ email: decoded.email}, (err, user) => {
					user.actions.pull(req.body.index);
					user.actions.set(req.body.index, req.body.str);
					user.save().then(user => { 
						res.send({success: true, data: "done"});
					});
				})
			}
		})
	}
})

/**
 * @api {get} /api/action/remove Remove specific action/reaction
 * @apiName Remove Action
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 * @apiParam {String} index Index of action
 * @apiParam {String} str String with widget0widget
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": done,		
 *     }
 */

app.post('/api/action/remove', (req, res) => {
	var token = req.headers.authorization;
	if (token) {
		token = token.split(" ");
		if (!token[1]) {
			token = token[0];
		} else {
			token = token[1];
		}
		jwt.verify(token, 'auth', (err, decoded) => {
			if (err) {
				res.send({success: false, message: 'Error token'});
			} else {
				User.findOne({ email: decoded.email}, (err, user) => {
					user.actions.pull(req.body.index);
					user.save().then(user => { 
						res.send({success: true, data: "done"});
					});
				})
			}
		})
	}
})

app.use('/', route);
app.use(express.static(__dirname+'/public'));
app.listen(8080);
/*app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});*/