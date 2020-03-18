const request = require('request');
let promise = require('promise')

function callRestAPI(method, url, headers, body) {
    return new promise((resolve, reject) => {
        let options = {
            method: method,
            url: url,
            headers: headers,
            form: body
        }
        request(options, function (error, response) {
            if (error) {
                return reject(error)
            } else {
                return resolve(response)
            }
        })
    })
}

module.exports = { callRestAPI }