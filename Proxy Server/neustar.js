const https = require('https');
const promise = require('promise');
let restapi = require('./restapi');

NEUSTAR_ENDPOINT = 'http://neustar-gds-pbs.gri/gds/v1/ipinfo/'


let getCurrentLocation = (ipaddress) => {
    return new promise((resolve, reject) => {
        method = 'GET'
        url = NEUSTAR_ENDPOINT + ipaddress + '?format=json'
        headers = ''
        body = ''
        restapi.callRestAPI(method, url, headers, body).then(response => {
            var currentzip
            var loc = JSON.parse(response.body)
            currentzip = loc.ipinfo.Location.CityData["postal_code"]
//             console.log("\nCurrent zip code: " + currentzip+"\n");
            return resolve(currentzip);
        }).catch(error => {
            return reject("Zip not resolved");
        })

    })
}
module.exports = {getCurrentLocation}
