const axios = require('axios');

module.exports.get_top_headlines = {
	get_top_headlines: function() {
		return new Promise((resolve ,reject) => { 
            axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=9d64240a0bbc4b7396aefc3d7d514770')
            .then(async function (response) {
            var result = response.data.articles;
            var i = 0;
            var list = [];
            while (i <= 3) {
                list.push(result[i].title + ' ' + result[i].content);
                i++;
            }
			resolve(list);
            })
            .catch(function (error) {
                console.log(error);
                resolve('Something went wrong. Try again')
            });
	    });
    }
}

//All articles mentioning something from yesterday, sorted by popular publishers first
module.exports.get_popular_articles = {
    get_popular_articles: function(topic) {
        return new Promise((resolve ,reject) => { 
            axios.get('https://newsapi.org/v2/everything?q=' + topic + '&from=2020-01-26&to=2020-01-26&sortBy=popularity&apiKey=9d64240a0bbc4b7396aefc3d7d514770')
            .then(async function (response) {
            var result = response.data.articles;
            var i = 0;
            var list = [];
            while (i <= 3) {
                list.push(result[i].title + ' ' + result[i].content);
                i++;
            }
			resolve(list);
            })
            .catch(function (error) {
                console.log(error);
                resolve('Something went wrong. Try again')
            });
	    });
    }
}