var arr = [{ x: 0, y: 0 }, { x: 1, y: 1 }];

Array.prototype.findMatch = function (token, eq) {
    for (var i = 0; i < this.length; i++) {
        if (eq(this[i], token)) {
            return true;
        }
    }
    return false;
}

function eqPos(pos1, pos2) {
    return pos1.x == pos2.x && pos1.y == pos2.y
}

console.log(eqPos(arr[0], arr[1]));

var isMatch = arr.findMatch({ x: 1, y: 0 }, eqPos);

console.log(isMatch);
