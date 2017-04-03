/**
 * Created by Наташа on 30.10.2016.
 */

function  billingFunction() {
    var b = document.getElementById("same")
    console.log("this.checked = "+b.checked);
    console.log("this.type = "+b.type);
    if (b.checked === true) {
        console.log("I've checked");
        document.getElementById("billingName").value = document.getElementById("shippingName").value;
        document.getElementById("billingZip").value = document.getElementById("shippingZip").value;
    } else {
        document.getElementById("billingName").value = "";
        document.getElementById("billingZip").value = "";
        document.getElementById("billingName").removeAttribute("required");
        document.getElementById("billingZip").removeAttribute("required");
    }
}