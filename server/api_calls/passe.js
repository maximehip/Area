var { callSteam } = require('./steam');
var { callWeather } = require('./weather');
var { callChuck } = require('./chuck_norris');
var { get_upcoming_movies,  get_trending_movies} = require('./movieDB');
var { callMail } = require('./mail');
var { getNowPlaying } = require('./spotify');
var { send_dm } = require('./discord');
var { get_song } = require('./lyrics');

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

function sender(result, reaction, infos, params) {
	if (reaction == "emails") {
		callMail(infos.sender_email, infos.appPassword, params);
	} else if (reaction == "discord") {
		send_dm(infos.to_discord, params[1]);
	}
}

async function reaction(action, reaction, infos, spotifyApi) {
	if (action == "weather") {
		getWeather(infos.city).then(function(result) {
			var params = [infos.to_email, "today's temperature is " + result.data[0].temp];
			sender(result, reaction, infos, params);
		})
	} else if (action == "chucknorris") {
		getChuckNorris().then(function(result) {
			var params = [infos.to_email, result];
			sender(result, reaction, infos, params);
		});
	} else if (action == "UpcomingMovie") {
		getUpcomingMovies().then(function(result) {
			var params = [infos.to_email, result];
			sender(result, reaction, infos, params);
		});
	} else if (action == "TrendingMovie") {
		getTrendingMovies().then(function(result) {
			var params = [infos.to_email, result];
			sender(result, reaction, infos, params);
		});
	} else if (action == "steam") {
		getSteam(infos.steam_game).then(function(result) {
			var params = [infos.to_email, "There is " + result + " players"];
			sender(result, reaction, infos, params);
		});
	} else if (action == "spotify") {
		spotifyApi.getMyCurrentPlaybackState({}).then(function(data) {
			var params = [infos.to_email, data.body.item.name + " of " + data.body.item.artists[0].name];
			sender(result, reaction, infos, params);
		}, function(err) {
			console.log('Something went wrong!', err);
		});
	} else if (action == "lyrics") {
		get_song(infos.song, infos.artist).then(function(result) {
			var params = [infos.to_email, result];
		//	console.log(result);
			sender(result, reaction, infos, params);
		})
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
module.exports.reaction = reaction;