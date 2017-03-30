/**
 * Grid game based component. Duplicates are allowed and are stored in an Array set.
 */

/**
 * @param {String} component name
 * @param {String} sprite name
 * @param {Array} positions array
 * @param {Boolean} movable
 * @param {function} show function
 */
function Component(name, sprite, positions, movable, show) {
    this.name = name;
    this.sprite = sprite;
    this.positions = positions;
    this.movable = movable;
    this.show = show;
}

/**
 * equality function between 2 positions
 * @param {Number} row1 
 * @param {Number} col1 
 * @param {Number} row1 
 * @param {Number} col1 
 */
function eqPos(pos1, pos2) {
    return pos1.row == pos2.row && pos1.column == pos2.column;
}

/**
 * add at position
 * @param {Number} colum
 * @param {Number} row
 */
Component.prototype.addAt = function (row, column) {
    if (!this.positions.findMatch({ row: row, column: column }, eqPos)) {
        this.positions.push({ row: row, column: column });
    }
}

/**
 * aggregate components at a given position
 * @param {Number} row
 * @param {Number} column
 */
Component.prototype.getAt = function (row, column) {
    var pos = { row: row, column: column };
    return this.positions.reduce((acc, item, index, arr) => {
        return eqPos(pos, item) ? [item].concat(acc) : acc;
    }, [])
}

/**
 * remove at position
 * @param {Number} colum
 * @param {Number} row
 */
Component.prototype.removeAt = function (row, column) {
    this.positions = this.positions.filter((p) => {
        return eqPos({ row: row, column: column }, p);
    });
}

/**
 * move from old position to new position
 * @param {Number} row from
 * @param {Number} column from
 * @param {Number} row to
 * @param {Number} column to
 */
Component.prototype.moveTo = function (colFrom, rowFrom, rowTo, colTo) {
    if (this.movable) {
        this.removeAt(rowFrom, colFrom);
        this.addAt(rowTo, colTo);
    }
}