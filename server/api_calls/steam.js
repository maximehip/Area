const axios = require('axios');

module.exports = {
	callSteam: function(game_name) {
		return new Promise((resolve ,reject) => { 
		let appId = '';
		axios.get('http://api.steampowered.com/ISteamApps/GetAppList/v0002/')
		.then(async function (response) {
			appId = retrieveOui(response.data.applist, game_name);
			appId = appId.appid;
			await axios.get('https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?format=json&appid=' + appId)
		.then(function (response) {
			resolve(response.data.response.player_count);
		})
		.catch(function (error) {
			console.log(error);
			resolve(response.data.response.player_count);
		});
		})
		.catch(function (error) {
			console.log(error);
			return('0')
		});
	});
	}
}

function retrieveOui(data, nameSteam) {
	return data.apps.find(x => x.name.toString().trim().toLowerCase().split(' ').join('') === nameSteam.trim().toLowerCase().split(' ').join(''));
}