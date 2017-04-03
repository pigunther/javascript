/**
 * Created by Наташа on 12.11.2016.
 */
var exec = require("child_process").exec;

function start(response) {
    console.log("Request handler 'start' was called.");

    exec("ls", function (error, stdout, stderr) {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(stdout);
        response.end();
    });
}

function upload(response) {
    console.log("Request handler 'upload' was called.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello Upload");
    response.end();
}

exports.start = start;
exports.upload = upload;