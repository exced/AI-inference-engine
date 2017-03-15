var arr = [{ a: 2 }, {a: 3}];


Array.prototype.findMatch = function (token) {
    var count = this.length, matchFound = false;
    for (var i = 0; i < count; i++) {
        if (this[i] === token) {
            matchFound = true;
            break;
        }
    }
    return matchFound;
}

var isMatch = arr.findMatch({a: 3});
console.log(isMatch);
