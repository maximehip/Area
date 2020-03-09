var Passe = require('./api_calls/passe');

module.exports = {
	GetTrigger: function(req, res, user, index) {
		return new Promise(function(resolve, reject) {
			if (user.trigger[index] == "tc" || user.trigger[index] == "td" || user.trigger[index] == "ti") {
				try {
					Passe.getWeather(user.infos[index].city).then(function(result) {
						if (!req.cookies['tc'] || !req.cookies['tc'] ) {
							res.cookie('tc', result.data[0].temp);
							resolve(0);
						} else {
							if (user.trigger[index] == "tc") {
								if (!req.cookies['tc']) {
									res.cookie('tc', result.data[0].temp);
									resolve(0);
								}
								if (req.cookies['tc'] != result.data[0].temp) {
									res.clearCookie("tc");
									console.log("")
									res.cookie('tc', result.data[0].temp);
									resolve(0);
								} else {
									resolve(1);
								}
							} else if (user.trigger[index] == "td") {
								if (!req.cookies['td']) {
									res.cookie('td', result.data[0].temp);
									resolve(0);
								}
								if (req.cookies['td'] > result.data[0].temp) {
									res.clearCookie("td");
									console.log("")
									res.cookie('td', result.data[0].temp);
									resolve(0);
								} else {
									resolve(1);
								}
							} else if (user.trigger[index] == "ti") {
								if (!req.cookies['ti']) {
									res.cookie('ti', result.data[0].temp);
									resolve(0);
								}
								if (req.cookies['ti'] < result.data[0].temp) {
									res.clearCookie("td");
									console.log("")
									res.cookie('td', result.data[0].temp);
									resolve(0);
								} else {
									resolve(1);
								}
							}
						}
					});
				} catch(e) {
					resolve(1);
				}
			} else if (user.trigger[index] == "stc" || user.trigger[index] == "std" || user.trigger[index] == "sti") {
				try {
					Passe.getSteam(user.infos[index].steam_game).then(function(result) {
					if (user.trigger[index] == "stc") {
							if (!req.cookies['stc']) {
								res.cookie('stc', result);
								resolve(0);
							}
							if (req.cookies['stc'] != result) {
								res.clearCookie("stc");
								console.log("")
								res.cookie('stc', result);
								resolve(0);
							} else {
								resolve(1);
							}
						} else if (user.trigger[index] == "std") {
							if (!req.cookies['std']) {
								res.cookie('std', result);
								resolve(0);
							}
							if (req.cookies['std'] > result) {
								res.clearCookie("std");
								console.log("")
								res.cookie('std', result);
								resolve(0);
							} else {
								resolve(1);
							}
						} else if (user.trigger[index] == "sti") {
							if (!req.cookies['sti']) {
								res.cookie('sti', result);
								resolve(0);
							}
							if (req.cookies['sti'] < result) {
								res.clearCookie("sti");
								console.log("")
								res.cookie('sti', result);
								resolve(0);
							} else {
								resolve(1);
							}
						}
					});
				} catch(e) {
					var params = "Game not found";
					endOfAction(index, params, api, req, res);
				}
			} else if (user.trigger[index] == "sc") {
				try {
					Passe.callnowplaying(req).then(function(result) {
					if (!req.cookies['sc']) {
						res.cookie('sc', data.item.name);
						resolve(0);
					}
					if (req.cookies['sc'] != data.item.name) {
						res.clearCookie("sc");
						console.log("")
						res.cookie('sc', data.item.name);
						resolve(0);
					} else {
						resolve(1);
					}
					})
				} catch(e) {
					var params = "Music not found";
					endOfAction(index, params, api, req, res);
				}
			} else if (user.trigger[index] == "no" || !user.trigger[index]) {
				resolve(0);
			}
		})
	}
}