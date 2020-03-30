const request = require('request');
let promise = require('promise')
let xmlHttp=require('xmlhttprequest');
// var xmlHttp=new XMLHttpRequest();
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
function restPlayReadyApi(url,headers,keyMessage){
    console.log("######## Play Ready key msg"+keyMessage);
    xmlHttp.open('POST',url);
    var xmlDoc;
    xmlHttp.onreadystatechange=function(){
        if(xmlHttp.readyState==4 && xmlHttp.status==200){
            xmlDoc=xmlHttp.responseXML;
            console.log("######## Play Ready Test"+xmlDoc);

        }
        else{
            console.log("###### Play Ready  else");
            xmlDoc=xmlHttp.responseXML;
        }
        xmlHttp.setRequestHeader('x-dt-auth-token',headers.auth-token);
        xmlHttp.setRequestHeader('x-dt-custom-data',headers.custom-data);
        xmlHttp.setRequestHeader('Content-Type','text/xml');
        xmlHttp.send(keyMessage);
    }
    return xmlDoc;
}

module.exports = { callRestAPI, callRestDRMAPI, restPlayReadyApi }
