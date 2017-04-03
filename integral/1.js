/**
 * Created by Наташа on 01.12.2016.
 */


var prec = 10000;
var x = 0;
var sum = 0;
var dx = Math.PI*2/prec;
console.log(dx);
function integral() {
    for (var i = 0; i < prec; i++) {
        sum += dx * (Math.cos(x) * Math.cos(x) / 2 + Math.sin(x) * Math.sin(x) / 3 - Math.sin(2 * x) / Math.sqrt(6)) * Math.sqrt(1 + (2 + Math.sqrt(2)) * Math.sin(2 * x) / Math.sqrt(6) + Math.cos(x) * Math.cos(x) * (1 - 2 / 3 * Math.sqrt(2)));
        x += dx;
        if (i % 1000 == 0) {
            console.log(i, " -> ", sum);
            console.log((Math.cos(x) * Math.cos(x) / 2 + Math.sin(x) * Math.sin(x) / 3 - Math.sin(2 * x) / Math.sqrt(6))
                * Math.sqrt(1 + (2 + Math.sqrt(2)) * Math.sin(2 * x) / Math.sqrt(6) + Math.cos(x) * Math.cos(x) * (1 - 2 / 3 * Math.sqrt(2))));
        }
    }
}
var sq = 0;
for (var i = 0; i < prec; i++) {
    sq = 1 + (2+Math.sqrt(2))*Math.sin(2*x)/Math.sqrt(6) + Math.cos(x)*Math.cos(x)*(1-2/3*Math.sqrt(2));
    if (sq < 0) {
        console.log(x,"=>", sq);
        break;
    }
    x+=dx;
}

console.log(sum);