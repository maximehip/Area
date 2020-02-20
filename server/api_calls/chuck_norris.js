const axios = require('axios');

module.exports = {
	callChuck: function() {
		return new Promise((resolve ,reject) => { 
            axios.get('https://api.chucknorris.io/jokes/random')
            .then(async function (response) {
                resolve(response.data.value)
            })
            .catch(function (error) {
                console.log(error);
                resolve('Something went wrong. Try again')
            });
	    });
	}
}