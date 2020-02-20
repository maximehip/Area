const config = require('./config.json');
var OAuth = require('oauth');

async function postTwitt(status, user_secret, access_token) {
    var oauth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        config.twitterApiKey,
        config.twitterSecretKey,
        '1.0A',
        null,
        'HMAC-SHA1'
    );
    
    var postBody = {
        'status': status
    };
    
    console.log('Ready to Tweet article:\n\t', postBody.status);
    oauth.post('https://api.twitter.com/1.1/statuses/update.json',
        access_token,
        user_secret,
        postBody,
        '',
        function(err, data, res) {
            if (err) {
                console.log(err);
            } else {
                console.log(data);
            }
        });
}