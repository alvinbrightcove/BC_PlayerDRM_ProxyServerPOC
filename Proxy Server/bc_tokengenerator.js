const request = require('request');
const client_id = "235b7c67-54cc-4507-9644-96d2e73aa976";
const client_secret = "3B_7-IhbwvK43zXShAT2ZXV7VKt12en5gZ3FCYC2zu_IVpn4QmTtZyydYFw-Z_aR8J8VJXePtxcHM0oUkRL_xA";
const { base64encode, base64decode } = require('nodejs-base64');
const auth_string = base64encode(client_id + ":" + client_secret);
const promise = require('promise');
let restapi = require('./restapi')
const BC_ACCESSTOKEN_URL = 'https://oauth.brightcove.com/v4/access_token';

let getAccessToken = () => {
    return new promise((resolve, reject) => {
        method = 'POST'
        url = BC_ACCESSTOKEN_URL
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + auth_string
        }
        body = {
            "grant_type": 'client_credentials'
        }
        restapi.callRestAPI(method, url, headers, body).then(response => {
            resp = JSON.parse(response.body)
            return resolve(resp.access_token);
        }).catch(error => {
            return reject("Auth token generation failed");
        })
    });
}
module.exports = { getAccessToken }

