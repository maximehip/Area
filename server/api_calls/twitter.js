const config = require('../config/config.json');
var Twitter = require('twitter');

async function postTweet(status, user) {
    console.log("ici");
    var twitterApi = new Twitter({consumer_key: 'PSwKoBTySx8ltcFQN8GT80TvI', consumer_secret: 'OW1aFARbLqjT6bfSAHgNM5fTZ5G0XRnTUCY9vEAsPZcF0OdO5z', access_token_key: user.token, access_token_secret: user.secretToken});
    twitterApi.post('statuses/update', {status: status},  function(error, tweet, response) {
      if(error) throw error;
      console.log(tweet);  // Tweet body.
      console.log(response);  // Raw response object.
    });
}

module.exports.postTweet = postTweet;