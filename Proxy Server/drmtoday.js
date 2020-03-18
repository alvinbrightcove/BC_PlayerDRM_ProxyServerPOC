var jwt = require('jwt-simple');
var uuid = require('uuid');
var base64 = require('nodejs-base64');
var http = require('http');
var request = require('request');
var querystring = require('querystring');
const promise = require('promise');
let restapi = require('./restapi')
const DRM_TODAY_BASEURL = 'https://lic.staging.drmtoday.com/license-proxy-widevine/cenc/';
let getAuthforDRMrequest = (assetId) => {
    return new promise((resolve, reject) => {
        d = new Date();
        parsedDate = new Date(Date.parse(d));
        var now = new Date;
        
        var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());

        let custom_data = {
            'merchant': 'brightcove_testing',
            'userId': 'rental1',
            'sessionId': 'default',
        }
        let crt = {
            "accountingId": "accId",
            "assetId": "0f89a3f8-4195-40e9-bb56-3e70fa21df99",
            "profile": {
                "rental": {
                    "absoluteExpiration":"2020-12-19T11:40:00.000Z", "playDuration": 5000
                }
            },
            "outputProtection": {
                "digital": false,
                "analogue": false,
                "enforce": false
            }
        }
        var payload = {
            "optData": JSON.stringify(custom_data),
            "crt": JSON.stringify([crt]),
            "iat": Math.floor(utc_timestamp / 1000),
            "jti": uuid.v4(),
        }
        var customData = base64.base64encode(JSON.stringify(custom_data));
        // console.log("Custom data for DRM request: " + customData, "\n")
        module.exports.customData = base64.base64encode(JSON.stringify(custom_data));
        var secret = Buffer.from('d9387367c896d7a1026abd04b242669b83a8ed72d9fc59b480cd9a902c290a85a7e0264b5e618de7bc7d6a7964d759d9216d3ff86d51235342af9ccadebd44ae', 'hex');
        var token = jwt.encode(payload, secret, 'HS512');
        // console.log("Auth token for DRM request: " + token, "\n")
        module.exports.token = jwt.encode(payload, secret, 'HS512');
        var headers = { customData, token }
        console.log(headers);
        return resolve(headers)
    })
}

var normalizeCustomData = function normalizeCustomData(options) {
    return options.customDataIsB64 ? options.customData : window$1.btoa(options.customData);
};

let getlicensefromDRMlicenseServer = (custom_data, auth_token, keyMessage) => {
    return new promise((resolve, reject) => {
        url = DRM_TODAY_BASEURL
        method = 'POST'
        headers = {
            'Accept-Encoding': 'gzip, deflate, br',
            'x-dt-auth-token': auth_token,
            'x-dt-custom-data': custom_data
        }
        body = keyMessage
        restapi.callRestAPI(method, url, headers, body).then(response => {
            var drmKey
            response.setEncoding('base64');
            drmKey = response.body
            console.log("drmkey = "+drmKey)
            return resolve(drmKey)
        }).catch(error => {
            return reject("DRM license request failed");
        })
    })
}

module.exports = { getAuthforDRMrequest, getlicensefromDRMlicenseServer }

