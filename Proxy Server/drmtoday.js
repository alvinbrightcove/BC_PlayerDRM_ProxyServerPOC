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
            "assetId": assetId,
            "profile": {
                "rental": {
                    "absoluteExpiration": new Date(parsedDate.getTime() + 10000), "playDuration": 1000
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
        var secret = Buffer.from('c009b03906932775d49eaf463b11d4aa96e54263143c51fe627b4640f303d9323b758aef057994c190aaf2d6d11c0b272fef6a909cc1df5b6b2ffef45b33e8e6', 'hex');
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
            'x-dt-auth-token': auth_token,
            'x-dt-custom-data': custom_data
        }
        body = keyMessage
        restapi.callRestAPI(method, url, headers, body).then(response => {
            var drmKey
            response.setEncoding('utf8');
            drmKey = response.body
            console.log("drmkey = "+drmKey)
            return resolve(drmKey)
        }).catch(error => {
            return reject("DRM license request failed");
        })
    })
}

module.exports = { getAuthforDRMrequest, getlicensefromDRMlicenseServer }

