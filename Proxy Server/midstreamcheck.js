const https = require('https');
let restapi = require('./restapi');
const promise = require('promise');
let bc_tokengenerator = require('./bc_tokengenerator');
const BC_PLAYBACKRIGHTS_BASEURL = 'https://playback-rights.api.brightcove.com/v1/accounts/';
const BC_CMSAPI_BASEURL = 'https://cms.api.brightcove.com/v1/accounts/';

let getPlaybackRights = (videoId, accountId) => {
    return new promise((resolve, reject) => {
        bc_tokengenerator.getAccessToken().then(accesstoken => {
            this.accesstoken = accesstoken
            getPlaybackRightsId(videoId, accountId, accesstoken).then(playbackrightId =>{
                method = 'GET'
                url = BC_PLAYBACKRIGHTS_BASEURL + accountId + '/playback_rights/' + playbackrightId
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accesstoken
                }
                body = ''
                restapi.callRestAPI(method, url, headers, body).then(response => {
                    resp = JSON.parse(response.body)
                    allowedzip = []
                    allowedzip = allowedzip.concat(resp.geo.allowed_zip_codes)
                    // allowedzip = ['US-123456', 'US-456789', 'US-20147', 'US-987654']
                    allowedzip_striped = []
                    for (zip of allowedzip) {
                        stripedzip = zip.replace('US-', '')
                        allowedzip_striped.push(stripedzip)
                    }
                    return resolve(allowedzip_striped);
                }).catch(error => {
                    return reject("Playback rights access failed");
                })
            })
        });
    })
}

let getPlaybackRightsId = (videoId, accountId, accesstoken) =>{
    return new promise((resolve, reject) => {
        method = 'GET'
        url = BC_CMSAPI_BASEURL + accountId + '/videos/' + videoId
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accesstoken
        }
        body = ''
        restapi.callRestAPI(method, url, headers, body).then(response => {
            resp = JSON.parse(response.body)
            var playbackrightId = resp.playback_rights_id
            var assetId = resp.reference_id
            module.exports.assetId = resp.reference_id
            return resolve(playbackrightId)
        }).catch(error =>{
            return reject("Playback rights id request failed");
        })
    })
}

let midstreamCheck = (currentzip, allowedzip) => {
    return new promise((resolve, reject) => {
        const count = allowedzip.indexOf(currentzip)
        if (count < 0) {
            console.log("\nMidstream check status: false\n")
            return reject("Not Authorised in your location");
        }
        else {
            console.log("\nMidstream check status: true\n")
            return resolve(true);
        }
    })
}

module.exports = {getPlaybackRights, midstreamCheck}
