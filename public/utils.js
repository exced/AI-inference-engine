/*
* find token in array by eq (equality) function
*/
Array.prototype.findMatch = function (token, eq) {
    for (var i = 0; i < this.length; i++) {
        if (eq(this[i], token)) {
            return true;
        }
    }
    return false;
}
