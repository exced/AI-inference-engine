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

/**
 * init matrix and fill with zero
 * @param {*} rows 
 * @param {*} cols 
 */
function zero2D(rows, cols) {
    var array = [], row = [];
    while (cols--) row.push(0);
    while (rows--) array.push(row.slice());
    return array;
}

/**
 * init matrix and fill it with input
 * @param {*} rows 
 * @param {*} cols 
 * @param {Object} input
 */
function fill2D(rows, cols, fill) {
    var array = [], row = [];
    while (cols--) row.push(fill);
    while (rows--) array.push(row.slice());
    return array;
}

function fill2D(rows, cols, fill) {
    var arr = []; 
    for (var i = 0; i < rows; i++) {
        arr[i] = []; 
        for (var j = 0; j < cols; j++) {
            arr[i][j] = JSON.parse(JSON.stringify(fill));
        }
    }
    return arr;
}
