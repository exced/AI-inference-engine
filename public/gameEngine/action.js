
/**
 * @param {String} name
 */
function Action(name) {
    this.name = name;
}

/**
 * Creates a new move action
 */
Action.prototype.move = function (fromRow, fromCol, toRow, toCol) {
    return {
        action: 'move',
        from: {
            row: fromRow,
            column: fromCol
        },
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
        action: 'attack',
        on: name,
        to: {
            row: toRow,
            column: toCol
        }
    }
}