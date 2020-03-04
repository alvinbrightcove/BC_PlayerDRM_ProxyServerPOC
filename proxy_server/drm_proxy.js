let express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
let auth = require('./auth')
let midstream = require('./midstreamcheck')
const tokengenerator = require('./tokengenerator')
let bodyParser = require('body-parser')
const promise = require('promise');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const options = {
    key: fs.readFileSync('/Users/pradeep.nanjappan/Documents/Certificate/TVMATP1987D.key', 'utf8'),
    cert: fs.readFileSync('/Users/pradeep.nanjappan/Documents/Certificate/TVMATP1987D.crt', 'utf8')
};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

app.post('/getlicense', (req, resp) => {
    console.log(req.body);
    console.log(req.query.id);
    return new promise((resolve, reject) => {
        midstream.getCurrentLocation(req.body.ipaddress)
        .then(currentzip => {
            this.currentzip = currentzip
            tokengenerator.getAccessToken()
            .then(accesstoken => midstream.getPlaybackRights(req.body.accountId, req.body.playback_right_id, accesstoken))
            .then(allowedzip => midstream.midstreamCheck(currentzip, allowedzip))
            .then(result => {
                auth.getAuthToken(req.query.id)
                .then(headers => auth.PostReq(headers.customData, headers.token))
                .then(drmKey => resp.send(drmKey))
            }).catch(err => {
                console.log("Not Authorised in your location")
                resp.send("Not Authorised in your location")
            })
        })
    })
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
httpServer.listen(3080);
httpsServer.listen(3443);