const https = require('https');
let restapi = require('./restapi')
const drm_proxy = require('./drm_proxy')
const promise = require('promise');
let bc_tokengenerator = require('./bc_tokengenerator')
const BC_PLAYBACKRIGHTS_BASEURL = 'https://playback-rights.api.brightcove.com/v1/accounts/';
const BC_CMSAPI_BASEURL = 'https://cms.api.brightcove.com/v1/accounts/';
const IPLOC_FINDER_URL = 'https://tools.keycdn.com/geo.json?host=';

let getCurrentLocation = (ipaddress) => {
    return new promise((resolve, reject) => {
        method = 'GET'
        url = IPLOC_FINDER_URL + ipaddress
        headers = ''
        body = ''
        restapi.callRestAPI(method, url, headers, body).then(response => {
            var currentzip
            var loc = JSON.parse(response.body);
            currentzip = loc.data.geo['postal_code']
            console.log("\nCurrent zip code: " + currentzip+"\n");
            return resolve(currentzip);
        }).catch(error => {
            return reject("Zip not resolved");
        })

    })
}

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
                    allowedzip = ['US-123456', 'US-456789', 'US-20149', 'US-987654']
                    // console.log("Allowed zip codes: " + allowedzip)
                    allowedzip_striped = []
                    for (zip of allowedzip) {
                        stripedzip = zip.replace('US-', '')
                        allowedzip_striped.push(stripedzip)
                    }
                    // console.log("allowedzip_striped = " + allowedzip_striped+"\n")
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
            // console.log("Playback right ID: "+playbackrightId+"\nAsset ID: "+assetId+"\n")
            return resolve(playbackrightId)
        }).catch(error =>{
            return reject("Playback rights id request failed");
        })
    })
}

let midstreamCheck = (currentzip, allowedzip) => {
    return new promise((resolve, reject) => {
        const count = allowedzip.indexOf(currentzip)
        if (count > 0) {
            console.log("\nMidstream check status: false\n")
            return reject("Not Authorised in your location");
        }
        else {
            console.log("\nMidstream check status: true\n")
            return resolve(true);
        }
    })
}

module.exports = { getCurrentLocation, getPlaybackRights, midstreamCheck}