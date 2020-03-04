const https = require('https');
const request = require('request');
const drm_proxy = require('./drm_proxy')
const promise = require('promise');
let currentzip;

let getCurrentLocation = (ipaddress) => {
    return new promise((resolve, reject) => {
        https.get('https://tools.keycdn.com/geo.json?host=' + ipaddress, function (resp) {
            var body = ''
            resp.on('data', function (data) {
                body += data;
            });
            resp.on('end', function () {
                var currentzip
                var loc = JSON.parse(body);
                // currentzip = loc.data.geo['postal_code']
                currentzip = "123456"
                console.log("\nCurrent zip code: " + currentzip);
                return resolve(currentzip);
            });
            resp.on('error', function (data) {
                return reject("Zip not resolved");
            });
        });
    })
}

let getPlaybackRights = (accountId, playback_right_id, accesstoken) => {
    return new promise((resolve, reject) => {
        let options = {
            method: 'GET',
            url: 'https://playback-rights.api.brightcove.com/v1/accounts/' + accountId + '/playback_rights/' + playback_right_id,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accesstoken
            }
        };

        request(options, function (error, response) {
            if (error) {
                return reject("Playback rights access failed");
            }
            else {
                resp = JSON.parse(response.body)
                allowedzip = []
                // allowedzip = allowedzip.concat(resp.geo.allowed_zip_codes)
                allowedzip = ['US-123456', 'US-456789', 'US-20149', 'US-987654']
                console.log("Allowed zip codes: " + allowedzip)
                allowedzip_striped = []
                for (zip of allowedzip) {
                    stripedzip = zip.replace('US-', '')
                    allowedzip_striped.push(stripedzip)
                }
                console.log("allowedzip_striped = " + allowedzip_striped)
                return resolve(allowedzip_striped);
            }
        });
    })
}

let midstreamCheck = (currentzip, allowedzip) => {
    return new promise((resolve, reject) => {
        var count = 0;
        for (zip of allowedzip) {
            if (zip == currentzip) {
                count++;
            }
        }
        if (count > 0) {
            console.log("\nMidstream geo check status: true\n")
            return resolve(true);
        }
        else {
            console.log("\nMidstream geo check status: false\n")
            return reject(false);
        }
    })
}
module.exports = {getCurrentLocation, getPlaybackRights, midstreamCheck}