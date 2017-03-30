/**
 * 
 */
Array.prototype.findMatch = function (token, eq) {
    for (var i = 0; i < this.length; i++) {
        if (eq(this[i], token)) {
            return true;
        }
    }
    return false;
}

/**
 * 
 */
Array.prototype.find = function (token, eq) {
    for (var i = 0; i < this.length; i++) {
        if (eq(this[i], token)) {
            return this[i];
        }
    }
    return null;
}

/**
 * 
 */
Array.prototype.indexOf = function (token, eq) {
    for (var i = 0; i < this.length; i++) {
        if (eq(this[i], token)) {
            return i;
        }
    }
    return -1;
}

/**
 * 
 * @param {*} min 
 * @param {*} max 
 */
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = ~~(max);
    return ~~(Math.random() * (max - min + 1)) + min;
}