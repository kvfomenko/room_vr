const fs = require('fs'),
    static = require('node-static'),
	http = require('http'),
	https = require('https'),
    conf = require('./static_conf.json');

let file = new static.Server(conf.root_path);


const options = {
   key: fs.readFileSync('./cert/private.key', 'utf8'),
   cert: fs.readFileSync('./cert/certificate.crt', 'utf8')
};

http.createServer(function (request, response) {
    request.addListener('end', function () {
	log(response.statusCode + ' ' + request.method + ' ' + request.url /*+ ' '  + JSON.stringify(request.headers)*/ );

        file.serve(request, response);
    }).resume();

}).listen(conf.port);
console.log('server is listening on ' + conf.port);

https.createServer(options,function (request, response) {
    request.addListener('end', function () {
        log(response.statusCode + ' ' + request.method + ' ' + request.url /*+ ' '  + JSON.stringify(request.headers)*/ );

        file.serve(request, response);
    }).resume();

}).listen(conf.port_ssl);
console.log('server is listening on ' + conf.port_ssl);



function addLeadingZero(val, digits) {
    var k;
    for (k=digits; k>1; k--) {
        if (digits >= k && val < Math.pow(10, digits-1)) { val = "0" + val; }
    }
    return val;
}

function getFormattedTime() {
    var today = new Date();
    var yy = addLeadingZero(today.getFullYear(), 2);
    var mm = addLeadingZero(today.getMonth(), 2);
    var dd = addLeadingZero(today.getDate(), 2);
    var h = addLeadingZero(today.getHours(), 2);
    var m = addLeadingZero(today.getMinutes(), 2);
    var s = addLeadingZero(today.getSeconds(), 2);
    return yy + '.' + mm + '.' + dd + ' ' + h + ":" + m + ":" + s;
}

function log(val) {
    console.log(getFormattedTime() + ' ' + val);
}
