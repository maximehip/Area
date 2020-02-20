const axios = require('axios');

module.exports = {
	callWeather: function(city) {
		return new Promise((resolve ,reject) => { 
		axios.get('https://api.weatherbit.io/v2.0/current?city=' + city + '&key=7ded8414cffa4a67bd1da5da9509b93a').then(async function (response) {
			resolve(response.data);
		}).catch(function (error) {
			console.log(error);
			return('0')
		});
	});
	}
}