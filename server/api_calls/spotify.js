var cookie = require('cookie-parser');
const axios = require('axios');

function getNowPlaying(req) {
	return new Promise((resolve ,reject) => { 
		axios.get('https://api.spotify.com/v1/me/player', {headers :  {"Authorization" : "Bearer " + req.body.spotifytoken}}).then(function (data){
			if (data.data != "") {
				resolve(data.data.item.name + " of " + data.data.item.artists[0].name);
			} else {
				resolve("No music");
			}
		})
  });
}

module.exports.getNowPlaying = getNowPlaying;