/**
 * Created by Наташа on 15.10.2016.
 */
var buffer;
var fs = require("fs");
fs.readFile("fr", function(error, buffer) {
    if (error) {
        throw error;
    }
    console.log("I've read", buffer.length, "bytes\n", buffer[0], buffer[1], buffer[2], buffer[3], typeof(buffer));
})

//console.log("I've read", buffer.length, "bytes\n", buffer[0], buffer[1], buffer[2], buffer[3], typeof(buffer));