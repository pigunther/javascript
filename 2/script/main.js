/*var login = document.getElementById("loginID");
var password = document.getElementById("passwordID");

function change_log() {
	login = document.getElementById("loginID");
}
function change_pass() {
	password = document.getElementById("passwordID");
	alert(password.value);
}
*/

function click_log_in(){
	var login = document.getElementById("loginID");
	var password = document.getElementById("passwordID");
	if (login.value == "n" && password.value == "1") {
		alert("In if");
		window.open("http://htmlbook.ru/html/form/action");
	} else {
		alert("Bad login or password");
	}
}