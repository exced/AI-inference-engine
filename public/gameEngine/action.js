
/**
 * @param {Unit} unit
 */
function Action(unit) {
    this.unit = unit;
}

/**
 * Creates a new move action
 */
Action.prototype.move = function (toRow, toCol) {
    return {
        unit: this.unit,
        action: 'move',
        to: {
            row: toRow,
            column: toCol
        }
    }
}

/**
 * Creates a new attack action
 */
Action.prototype.attack = function (name, toRow, toCol) {
    return {
        unit: this.unit,
        action: 'attack',
        on: name,
        to: {
            row: toRow,
            column: toCol
        }
    }
}
