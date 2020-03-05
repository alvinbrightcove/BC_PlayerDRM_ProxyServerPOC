let express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
let drmtoday = require('./drmtoday')
let midstreamcheck = require('./midstreamcheck')
let bodyParser = require('body-parser')
const promise = require('promise');
var cors = require('cors')

let app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const options = {
    key: fs.readFileSync('Certificates/TVMATP2259D.key', 'utf8'),
    cert: fs.readFileSync('Certificates/TVMATP2259D.crt', 'utf8')
};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

app.post('/getlicense', (req, resp) => {
    return new promise((resolve, reject) => {
        midstreamcheck.getCurrentLocation(req.body.ipaddress)
        .then(currentzip => {
            this.currentzip = currentzip
            midstreamcheck.getPlaybackRights(req.body.videoId, req.body.accountId)
            .then(allowedzip => midstreamcheck.midstreamCheck(currentzip, allowedzip))
            .then(result => {
                drmtoday.getAuthforDRMrequest(midstreamcheck.assetId)
                .then(headers => drmtoday.getlicensefromDRMlicenseServer(headers.customData, headers.token, req.query.keyMessage))
                .then(drmKey => resp.send(drmKey))
            }).catch(err => {
                console.log(err)
                resp.send(err)
            })
        })
    })
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
httpServer.listen(3080);
httpsServer.listen(3443);