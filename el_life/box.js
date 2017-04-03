/**
 * Created by Наташа on 28.12.2016.
 */
// It is not for this project. just need if for practise

var box = {
    locked: true,
    unlock: function() { this.locked = false; },
    lock: function() { this.locked = true;  },
    _content: [],
    get content() {
        if (this.locked) throw new Error("Заперто!");
        return this._content;
    }
};

console.log(box.locked);
console.log(box.unlock());
console.log(box.locked);

function withBoxUnlocked(body) {
    box.unlock();

    try {
        return body();
    } catch(e) {
        throw e;
    }finally {
        box.lock();
    }
}

withBoxUnlocked(function() {
    console.log("in body ", box.locked);
    box.content.push("золотишко");
});
box.unlock();
box._content[2]="123";
console.log(box._content);
// → true