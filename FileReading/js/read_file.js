var control;
window.onload= function (){
    control = document.getElementById("your-files");
    console.log(control);
    control.onloadend = onChangeFile(event);
};
function onChangeFile (event) {

    console.log("Changes");
    console.log(event);
    // Когда происходит изменение элементов управления, значит появились новые файлы
    var i = 0,
        files = control.files,
        len = files.length;
    console.log("len is %d", len);
    for (; i < len; i++) {
        console.log("Filename: %s and i: %d", files[i].name, i);
        console.log("Type: " + files[i].type);
        console.log("Size: " + files[i].size + " bytes");
    }
    if (len > 0) {
        console.log("Start read");
        reader.readAsArrayBuffer(control.files[0]);
        var readResult = reader.result;
        var key;
        for (i = 0; i < readResult.length, i < 5; i++) {
            console.log()
        }
    }
}

var reader = new FileReader();
reader.onload = function(event) {
    var contents = event.target.result;
    console.log("Содержимое файла: " + contents);
    console.log("String contents " + contents.toString());
    var key;
    for (key in contents) {
        console.log("in for")
        console.log(contents[key]);
    }
};

reader.onerror = function(event) {
    console.error("Файл не может быть прочитан! код " + event.target.error.code);
};


