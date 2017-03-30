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
    return pos1.column == pos2.column && pos1.row == pos2.row
}

/**
 * add at position
 * @param {Number} colum
 * @param {Number} row
 */
Component.prototype.addAt = function (column, row) {
    if (!this.positions.findMatch({ column: column, row: row }, eqPos)) {
        this.positions.push({ column: column, row: row });
    }
}

/**
 * remove at position
 * @param {Number} colum
 * @param {Number} row
 */
Component.prototype.removeAt = function (column, row) {
    this.positions = this.positions.filter((p) => {
        return eqPos({ column: column, row: row }, p);
    });
}

/**
 * move from old position to new position
 * @param {Number} colum from
 * @param {Number} row from
 * @param {Number} colum to
 * @param {Number} row to
 */
Component.prototype.moveTo = function (colFrom, rowFrom, colTo, rowTo) {
    if (this.movable) {
        this.removeAt(colFrom, rowFrom);
        this.addAt(colTo, rowTo);
    }
}