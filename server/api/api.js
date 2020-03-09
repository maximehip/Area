var express = require('express');
var app = express();
var route = express.Router();
var mongoose = require('mongoose');

var db = require('../config/db').url;

var User = require('../models/User');

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
var cookie = require('cookie-parser');
var server = require('http').Server(app);

var Passe = require('../api_calls/passe');
const fs = require('fs');
var { GetTrigger } = require('../trigger');

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
						data.push(json.name);
					}
				});
				res.json({success: true, widgets: data});
			}
		})
	} else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

 /**
 * @api {get} /api/sender/list Get list of senders
 * @apiName Senders
 * @apiGroup Senders
 *
 * @apiHeader {String} access-token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "sender": {
 *       	"sender1",
 *			"sender2"
 *  	}
 *     }
 */

route.get('/api/sender/list', (req, res) => {
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
				fs.readdirSync('sender/').forEach(folder => {
					if (folder[0] != '.') {
						var contents = fs.readFileSync("sender/" + folder + "/config.json");
						let json = JSON.parse(contents);
						data.push(json.name);
					}
				});
				res.json({success: true, sender: data});
			}
		})
	} else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

/**
 * @api {get} /api/getsender Add Sender in user acoount
 * @apiName Get Senders
 * @apiGroup Senders
 *
 * @apiHeader {String} access-token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "sender": "done",
 *     }
 */

route.post('/api/getsender', (req, res) => {
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
						user.senderAdd.push(req.body.widget);
						user.save((error, done) => { 
							res.send({success: true, message: 'done'});
						});
					})
				} else {
					res.send({success: false, message: 'Sender not found'});
				}
			}
		})
	} else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

/**
 * @api {get} /api/sender/delete Delete Sender in user acoount
 * @apiName Delete Senders
 * @apiGroup Senders
 *
 * @apiHeader {String} access-token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "sender": "done",
 *     }
 */

route.post('/api/sender/delete', function(req, res) {
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
					user.senderAdd.pull(req.body.widget);
					user.save().then(user => { 
						res.send({success: true, message: 'Done'});
					});
				})
			}
		})
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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
	} else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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
	} else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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
	} else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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
	} else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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

route.get('/api/getToken', function(req, res) {
    var token = jwt.sign(req.user.toJSON(), 'auth', {
    	expiresIn: 86400
    });
    res.redirect('/api/token/' + token);
})

 /**
 * @api {post} /api/reaction Use reaction of an widget
 * @apiName Reaction
 * @apiGroup Widgets
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

route.post('/api/reaction', function(req, res) {
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
				var trig = GetTrigger(req, res, decoded, req.body.index);
				trig.then(function(result) {
					if (result == 1) {
						res.send({success: true, message: 'Trigger failed'});
					} else {
						var index = req.body.index;
						var infos = decoded.infos[index];
						Passe.reaction(req.body.action, req.body.reaction, infos, 0, res, index, 0, 1);
						res.send({success: true, message: 'done'});
					}
				});
			}
		})
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

/**
 * @api {post} /api/widgets/spotify/nowplaying Get current playing music in Spotify
 * @apiName Spotify
 * @apiGroup Widgets
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "music": "Music of Artist name"
 *     }
 */


route.post('/api/widgets/spotify/nowplaying', (req, res) => {
	var getted = Passe.callnowplaying(req).then(function(data) {
		res.send({success: true, music: data});
	})
})

/**
 * @api {post} /api/widgets/discord Send a message to user
 * @apiName Spotify
 * @apiGroup Widgets
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "done"
 *     }
 */

route.post('/api/widgets/discord', (req, res) => {
	var getted = Passe.send_dm(req.body.discord_name, req.body.discord_message).then(function(result) {
		res.send({success: true, message: result});
	})
})

/**
 * @api {post} /api/widgets/email Send email to someone
 * @apiName Email
 * @apiGroup Widgets
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

route.post('/api/widgets/email', (req, res) => {
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
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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

route.get('/api/widgets/add', (req, res) => {
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
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

/**
 * @api {get} /api/widgets/remove Remove action in user account
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

route.post('/api/widgets/remove', (req, res) => {
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
					var index = parseInt(req.body.id, 10);
					user.infos = user.infos.slice(1, index)
					user.actions = user.actions.slice(1, index)
					user.trigger = user.trigger.slice(1, index)
					user.save().then(user => { 
						res.json({success: true, data: "done"});
					});
				})
			}
		})
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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

route.get('/api/widgets/lyrics', (req, res) => {
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
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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

route.post('/api/action/edit', (req, res) => {
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
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
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

route.post('/api/action/remove', (req, res) => {
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
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

/**
 * @api {get} /api/widgets/options Add option to your widget
 * @apiName Add option
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 * @apiParam {String} nameOfOption value
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": done,		
 *     }
 */

route.post('/api/widgets/options', (req, res) => {
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
					var index = parseInt(req.body.index, 10);
					delete req.body.index;
					if (user.infos[index]) {
						for (var key of Object.keys(req.body)) {
							user.infos[index][key] = req.body[key];
						}
						var array = user.infos[index];
						user.infos.set(index, array);
					} else {
						user.infos.set(index, req.body);
					}
					user.save().then(user => { 
						res.send({success: true, data: "done"});
					});
				})
			}
		})
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

/**
 * @api {get} /api/trigger/list Get list of all triggers
 * @apiName Trigger List
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 * @apiParam {String} nameOfOption value
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "trigger": {trigger1, trigger2..},		
 *     }
 */

route.get('/api/trigger/list', (req, res) => {
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
					var data = [];
					fs.readdirSync('trigger/').forEach(folder => {
						if (folder[0] != '.') {
							var contents = fs.readFileSync("trigger/" + folder + "/config.json");
							let json = JSON.parse(contents);
							data.push(json.name);
						}
					});
				res.json({success: true, trigger: data});
				})
			}
		})
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

/**
 * @api {get} /api/gettrigger Add trigger to user
 * @apiName Trigger List
 * @apiGroup Widgets
 *
 * @apiHeader {String} access-token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "trigger": {trigger1, trigger2..},		
 *     }
 */

route.post('/api/gettrigger', (req, res) => {
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
				if (req.body.widgets) {
					User.findOne({ email: decoded.email}, (err, user) => {
						user.triggerAdd.push(req.body.widget);
						user.save((error, done) => { 
							res.send({success: true, message: 'done'});
						});
				})
				}
			}
		})
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

route.get('/api/trigger/list', (req, res) => {
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
					var data = [];
					fs.readdirSync('trigger/').forEach(folder => {
						if (folder[0] != '.') {
							var contents = fs.readFileSync("trigger/" + folder + "/config.json");
							let json = JSON.parse(contents);
							data.push(json.name);
						}
					});
				res.json({success: true, trigger: data});
				})
			}
		})
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

route.post('/api/trigger/edit', (req, res) => {
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
					user.trigger.pull(req.body.index);
					user.trigger.set(req.body.index, req.body.str);
					user.save().then(user => { 
						res.send({success: true, data: "done"});
					});
				})
			}
		})
	}else {
		res.send({success: false, message: 'Authentication failed. Access token invalid'})
	}
})

module.exports = route;