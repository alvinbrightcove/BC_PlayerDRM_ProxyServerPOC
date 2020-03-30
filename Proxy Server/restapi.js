const request = require('request');
let promise = require('promise')

function callRestAPI(method, url, headers, body) {
    return new promise((resolve, reject) => {
        // console.log("sending req ", body.length);
        let options = {
            method: method,
            url: url,
            headers: headers,
            form: body
        }
        // request.post({
        //     headers: headers,
        //     url: url,
        //     body: body
        //   }, function(error, response, body){
        //     if (error) {
        //                 return reject(error)
        //             } else {
        //                 return resolve(response)
        //             }
        //   });          
        request(options, function (error, response) {
            if (error) {
                return reject(error)
            } else {
                return resolve(response)
            }
        })
    })
}
function callRestDRMAPI(method, url, headers, body) {
    return new promise((resolve, reject) => {
        console.log("sending req ", body.length);
        // let options = {
        //     method: method,
        //     url: url,
        //     headers: headers,
        //     body: body
        // }
        request.post({
            headers: headers,
            url: url,
            body: body
        }, function (error, response, body) {
            if (error) {
                return reject(error)
            } else {
                return resolve(response)
            }
        });
        // request(options, function (error, response) {
        //     if (error) {
        //         return reject(error)
        //     } else {
        //         return resolve(response)
        //     }
        // })
    })
}

module.exports = { callRestAPI, callRestDRMAPI }