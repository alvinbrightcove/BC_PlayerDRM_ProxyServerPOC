let express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
let drmtoday = require('./drmtoday')
let midstreamcheck = require('./midstreamcheck')
let bodyParser = require('body-parser')
const promise = require('promise');
var cors = require('cors');

let app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const options = {
    key: fs.readFileSync('Certificate/TVMATP1987D.key', 'utf8'),
    cert: fs.readFileSync('Certificate/TVMATP1987D.crt', 'utf8')
};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

function decode(base64) {
    try {
        return Buffer.from(str, "base64");
    } catch (err) {
        log.Warning('Body decode error: ', err);
    }
    return Buffer.from([]);
};

function hexdump(buffer, blockSize) {

    if (typeof buffer === 'string') {
        console.log("buffer is string");
    } else if (buffer instanceof ArrayBuffer && buffer.byteLength !== undefined) {
        console.log("buffer is ArrayBuffer");
        buffer = String.fromCharCode.apply(String, [].slice.call(new Uint8Array(buffer)));
    } else if (Array.isArray(buffer)) {
        console.log("buffer is Array");
        buffer = String.fromCharCode.apply(String, buffer);
    } else if (buffer.constructor === Uint8Array) {
        console.log("buffer is Uint8Array");
        buffer = String.fromCharCode.apply(String, [].slice.call(buffer));
    } else {
        console.log("Error: buffer is unknown...");
        return false;
    }
    blockSize = blockSize || 16;
    var lines = [];
    var hex = "0123456789ABCDEF";
    for (var b = 0; b < buffer.length; b += blockSize) {
        var block = buffer.slice(b, Math.min(b + blockSize, buffer.length));
        var addr = ("0000" + b.toString(16)).slice(-4);
        var codes = block.split('').map(function (ch) {
            var code = ch.charCodeAt(0);
            return " " + hex[(0xF0 & code) >> 4] + hex[0x0F & code];
        }).join("");
        codes += "   ".repeat(blockSize - block.length);
        var chars = block.replace(/[\x00-\x1F\x20]/g, '.');
        chars += " ".repeat(blockSize - block.length);
        lines.push(addr + " " + codes + "  " + chars);
    }
    return lines.join("\n");
}
app.post('/getlicense', (req, resp) => {
    console.log("RequestBody", decode(req.body.body));
    let reqBody = decode(req.body.body);
    // let base64data = reqBody.toString('base64');
    let payload = String.fromCharCode.apply(null, new Uint8Array(reqBody));
    console.log(hexdump(payload,16));
    console.log("Type Of Payload ", typeof payload);
    return new promise((resolve, reject) => {
        midstreamcheck.getCurrentLocation(req.body.ipaddress)
            .then(currentzip => {
                this.currentzip = currentzip
                midstreamcheck.getPlaybackRights(req.body.videoId, req.body.accountId)
                    .then(allowedzip => midstreamcheck.midstreamCheck(currentzip, allowedzip))
                    .then(result => {
                        drmtoday.getAuthforDRMrequest(midstreamcheck.assetId)
                            .then(headers => drmtoday.getlicensefromDRMlicenseServer(headers.customData, headers.token, payload))
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
