/*
* find token in array by eq (equality) function.
* @return true:found, false: not found
*/
Array.prototype.findMatch = function (token, eq) {
    for (var i = 0; i < this.length; i++) {
        if (eq(this[i], token)) {
            return true;
        }
    }
    return false;
}

/*
* find token in array
* @return token or null
*/
Array.prototype.find = function (token, eq) {
    for (var i = 0; i < this.length; i++) {
        if (eq(this[i], token)) {
            return this[i];
        }
    }
    return null;
}
