const config = require('../config/config.json');

var x = 0;

const axios = require('axios');

async function get_song(title, artiste) {
	return new Promise((resolve ,reject) => { 
		let track_id = '-1';
		let lyrics = '';
		
		if (artiste) {
			axios.get('http://api.musixmatch.com/ws/1.1/track.search?q_track=' + title + '&q_artist=' + artiste + '&apikey=' + config.MusicXMatchApiKey)
			.then(async function (response) {
				if (response.data.message.header.available === 0) {
					console.log("Paroles non trouvées, vérifier le titre et l'artiste")
					return("Paroles non trouvées, vérifier le titre et l'artiste")
				}
				//  console.log(response.data.message.body.track_list)
				// console.log(response.data.message.body.track_list[0].track.track_id)
				for (var x = 0; x < response.data.message.body.track_list.length; x++) {
					if (response.data.message.body.track_list[x].track.has_lyrics === 1) {
						track_id = response.data.message.body.track_list[x].track.track_id;
						x = 9999;
					}
					if (x != 9999 && response.data.message.body.track_list[x].track.instrumental === 1) {
					 	return("Musique instrumental")
					}
				}
				if (track_id === -1)
					return ("Pas de paroles pour la chanson " + title)
				axios.get('https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=' + track_id + '&apikey=' + config.MusicXMatchApiKey)
				.then(async function (response) {
					lyrics = response.data.message.body.lyrics.lyrics_body.substring(0, response.data.message.body.lyrics.lyrics_body.indexOf('\n...\n\n'));
					//console.log(lyrics)
					resolve (response.data.message.body.lyrics.lyrics_body)
				})
				.catch(function (error) {
					console.log(error);
					return("Paroles non trouvées, vérifier le titre et l'artiste")
				});
			})
			.catch(function (error) {
				console.log(error);
				return("Paroles non trouvées, vérifier le titre et l'artiste")
			});
		} else {
			axios.get('http://api.musixmatch.com/ws/1.1/track.search?q_track=' + title + '&apikey=' + config.MusicXMatchApiKey)
			.then(async function (response) {
				console.log(response.data.message.body)
				// console.log(response.data.message.body.track_list[0].track.track_id)
				track_id = response.data.message.body.track_list[0].track.track_id;
				axios.get('https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=' + track_id + '&apikey=' + config.MusicXMatchApiKey)
				.then(async function (response) {
					lyrics = response.data.message.body.lyrics.lyrics_body.substring(0, response.data.message.body.lyrics.lyrics_body.indexOf('\n...\n\n'));
					console.log(lyrics)
					return (response.data.message.body.lyrics.lyrics_body)
				})
				.catch(function (error) {
					console.log(error);
					return("Paroles non trouvées, vérifier le titre et l'artiste")
				});
			})
			.catch(function (error) {
				console.log(error);
				return("Paroles non trouvées, vérifier le titre et l'artiste")
			});
		}
	});
}

module.exports.get_song = get_song;
