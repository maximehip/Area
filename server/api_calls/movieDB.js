const axios = require('axios');

function get_upcoming_movies() {
        return new Promise((resolve ,reject) => { 
            axios.get('https://api.themoviedb.org/3/movie/upcoming?api_key=948439e3c2ae5fc3cad22666dc8cb716&language=en-US&page=1')
            .then(async function (response) {
            var result = response.data.results;
            var i = 0;
            var list = [];
            while (i <= 5) {
                list.push(result[i].original_title + ' ' + result[i].release_date);
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

function get_trending_movies() {
        return new Promise((resolve ,reject) => { 
            axios.get('https://api.themoviedb.org/3/trending/all/day?api_key=948439e3c2ae5fc3cad22666dc8cb716')
            .then(async function (response) {
            var result = response.data.results;
            var i = 0;
            var list = [];
            while (i <= 5) {
                list.push(result[i].original_title + ' ' + result[i].overview);
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

module.exports.get_upcoming_movies = get_upcoming_movies;
module.exports.get_trending_movies = get_trending_movies;