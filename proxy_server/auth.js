var jwt = require('jwt-simple');
var uuid = require('uuid');
var base64 = require('nodejs-base64');
var http = require('http');
var request = require('request');
var querystring = require('querystring');
const promise = require('promise');

let getAuthToken = (assetId) => {
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
        console.log("Custom data: " + customData, "\n")
        module.exports.customData = base64.base64encode(JSON.stringify(custom_data));
        var secret = Buffer.from('c009b03906932775d49eaf463b11d4aa96e54263143c51fe627b4640f303d9323b758aef057994c190aaf2d6d11c0b272fef6a909cc1df5b6b2ffef45b33e8e6', 'hex');
        var token = jwt.encode(payload, secret, 'HS512');
        console.log("Auth token: " + token, "\n")
        module.exports.token = jwt.encode(payload, secret, 'HS512');
        var headers = {customData, token}
        return resolve(headers)
    })
}

var normalizeCustomData = function normalizeCustomData(options) {
    return options.customDataIsB64 ? options.customData : window$1.btoa(options.customData);
};

let PostReq = (custom_data, auth_token) => {
    return new promise((resolve, reject) => {
        
        var post_data = querystring.stringify({});
        var post_options = {
            hostname: 'lic.staging.drmtoday.com',
            path: '/license-proxy-widevine/cenc/',
            method: 'POST',
            headers: {
                'x-dt-auth-token': auth_token,
                'x-dt-custom-data': custom_data
            }
        };

        var post_req = http.request(post_options, function (res) {
            var drmKey
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
                drmKey = chunk
                return resolve(drmKey)
            });
        });
        post_req.write(post_data);
        post_req.end();
    })
}

module.exports = { getAuthToken, PostReq }

