/**
 * 
 *
var http = require('http');
var static = require('node-static');
var file = new static.Server('.');

http.createServer(function(req, res) {
    file.serve(req, res);
}).listen(8080);
*/
console.log('Server running on port 8080');



var i = 0;
for (i = 0; i < 10; i++) {
    if (i % 2) {
        console.log(i);
    }
}

var arr = [[1, 2, 3], [4, 5], [6]];
console.log(typeof (arr));
//var previosValue = [];
var arr2=[];
console.log(arr.reduce(function(previousValue, current) {
    console.log(previousValue, "pr_Value", typeof (previousValue));
    console.log(current+" curr "+typeof (current));
    return previousValue.concat(current);
}));
console.log("____")


function every(myarr, cond) {
    console.log(myarr.forEach(cond), "in every");
    if (myarr.forEach(cond) == false) {
        return false;
    }
    return true;
}
console.log(every([NaN, NaN, NaN], function (a) {
    return a;
}));
console.log(every([NaN, NaN, 4], isNaN));

console.log(isNaN(4));
