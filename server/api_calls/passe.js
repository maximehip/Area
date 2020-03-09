var { callSteam } = require('./steam');
var { callWeather } = require('./weather');
var { callChuck } = require('./chuck_norris');
var { get_upcoming_movies,  get_trending_movies} = require('./movieDB');
var { callMail } = require('./mail');
var { getNowPlaying } = require('./spotify');
var { send_dm } = require('./discord');
var { get_song } = require('./lyrics');
var { postTweet } = require('./twitter');

async function getSteam(game) {
	return await callSteam(game);
}

async function getWeather(city) {
	return await callWeather(city);
}

async function getChuckNorris() {
	return await callChuck();
}

async function getUpcomingMovies() {
	return await get_upcoming_movies();
}

async function getTrendingMovies() {
	return await get_trending_movies();
}
async function callMail(mail, password, infos) {
	await callMail(mail, password, infos);
}
async function callnowplaying(req) {
	return await getNowPlaying(req);
}

async function send_dm(name, message) {
	return await send_dm(name, message);
}

async function get_song(title, artiste) {
	return await get_song(title, artiste);
}

async function send_tweet(tweet, infos) {
	return await postTweet(tweet, infos);
}

function sender(reaction, infos, params, req) {
	if (reaction == "emails") {
		callMail(infos.sender_email, infos.appPassword, infos.to_email, params);
	} else if (reaction == "discord") {
		send_dm(infos.to_discord, params);
	} else if (reaction == "twitter") {
		send_tweet(params, req.user);
	}
}

function endOfAction(index, params, api, req, res) {
	if (api == 0) {
		req.flash('success', 'Send');
		req.session.index = index;
		req.session.output = params;
		res.redirect('/me');
	} else if (api == 1) {
		res.send({success: true, message: params});
	}
}

function reaction(action, reaction, infos, req, res, index, spotifyApi, api) {
	if (action == "weather") {
		try {
		   getWeather(infos.city).then(function(result) {
			var params = "today's temperature is " + result.data[0].temp;
			if (reaction != "no")
				sender(reaction, infos, params, req);
			endOfAction(index, params, api, req, res);
			});
		} catch(e) {
			var params = "City not found";
			endOfAction(index, params, api, req, res);
		}
	} else if (action == "chucknorris") {
		getChuckNorris().then(function(result) {
			if (reaction != "no") {
				sender(reaction, infos, result, req);
			}
			endOfAction(index, result, api, req, res);
		});
	} else if (action == "upcomingmovie") {
		getUpcomingMovies().then(function(result) {
			if (reaction != "no")
				sender(reaction, infos, result, req);
			endOfAction(index, result, api, req, res);
		});
	} else if (action == "trendingmovie") {
		getTrendingMovies().then(function(result) {
			if (reaction != "no")
				sender(reaction, infos, result, req);
			endOfAction(index, result, api, req, res);
		});
	} else if (action == "steam") {
		try {
			getSteam(infos.steam_game).then(function(result) {
			var params = "There is " + result + " players";
			if (reaction != "no")
				sender(reaction, infos, params, req);
			endOfAction(index, params, api, req, res);
			});
		} catch(e) {
			var params = "Game not found";
			endOfAction(index, params, api, req, res);
		}
	} else if (action == "spotify") {
		spotifyApi.getMyCurrentPlaybackState({}).then(function(data) {
			var params = data.body.item.name + " of " + data.body.item.artists[0].name;
			if (reaction != "no")
				sender(reaction, infos, params, req);
			endOfAction(index, params, api, req, res);
		}, function(err) {
			console.log('Something went wrong!', err);
		});
	} else if (action == "lyrics") {
		try {
			get_song(infos.song, infos.artist).then(function(result) {
				if (reaction != "no")
					sender(reaction, infos, result, req);
				endOfAction(index, result, api, req, res);
			})
		} catch(e) {
			var params = "Lyrics/artist not found";
			endOfAction(index, params, api, req, res);
		}
		
	}
}

module.exports.getSteam = getSteam;
module.exports.getWeather = getWeather;
module.exports.getChuckNorris = getChuckNorris;
module.exports.getUpcomingMovies = getUpcomingMovies;
module.exports.getTrendingMovies = getTrendingMovies;
module.exports.callMail = callMail;
module.exports.callnowplaying = callnowplaying;
module.exports.send_dm = send_dm;
module.exports.sender = sender;
module.exports.reaction = reaction;