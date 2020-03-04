const request = require('request');
const client_id = "235b7c67-54cc-4507-9644-96d2e73aa976";
const client_secret = "3B_7-IhbwvK43zXShAT2ZXV7VKt12en5gZ3FCYC2zu_IVpn4QmTtZyydYFw-Z_aR8J8VJXePtxcHM0oUkRL_xA";
const { base64encode, base64decode } = require('nodejs-base64');
const auth_string = base64encode(client_id + ":" + client_secret);
const promise = require('promise');

let getAccessToken = () => {
    return new promise((resolve, reject) => {
        let options = {
            method: 'POST',
            url: 'https://oauth.brightcove.com/v4/access_token',
            headers: {

                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + auth_string
            },
            form: {
                "grant_type": 'client_credentials'
            }
        };
        let access_token;
        request(options, function (error, response) {
            if (error) {
                return reject("Auth token generation failed");
            }
            else {
                resp = JSON.parse(response.body)
                return resolve(resp.access_token);
            }
        });
    })
}
module.exports = { getAccessToken }

