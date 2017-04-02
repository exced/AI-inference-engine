/**
 * Grid based game engine. The hero is unique and should be named 'hero'. 
 */

/**
 * @param {Number} rows number
 * @param {Number} columns number
 * @param {Context} canvas context
 */
function Game(images, canvas, rows, columns) {
    this.images = images;
    this.canvas = canvas;
    this.rows = rows;
    this.columns = columns;
    this.screenHeight = screen.availHeight;
    this.kPieceWidth = ~~((this.screenHeight - 250) / columns);
    this.kPieceHeight = ~~((this.screenHeight - 250) / rows);
    this.kPixelWidth = 1 + (columns * this.kPieceWidth);
    this.kPixelHeight = 1 + (rows * this.kPieceHeight);
    this.canvas.width = this.kPixelWidth;
    this.canvas.height = this.kPixelHeight;
    this.context = this.canvas.getContext("2d");
    this.units = fill2D(rows, columns, {});
    this.initPos;
}

/** is position inside grid ?
 * @param {int} column
 * @param {int} row
 */
Game.prototype.isInsideGrid = function (row, column) {
    return (row >= 0 && row < this.rows) && (column >= 0 && column < this.columns);
}

/**
 * aggregate all units by name
 */
Game.prototype.getUnits = function (name) {
    var agg = [];
    for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.columns; c++) {
            var unit = this.getUnitsAt(name, r, c);
            if (unit) {
                agg.push(unit);
            }
        }
    }
    return agg;
}

/**
 * filter units by name and position
 */
Game.prototype.getUnitsAt = function (name, row, column) {
    return this.getAllUnitsAt(row, column)[name];
}

/**
 * aggregate all units at given position
 */
Game.prototype.getAllUnitsAt = function (row, column) {
    return this.units[row][column];
}

/**
 * @param {String} unit name
 * @param {Number} unit row
 * @param {Number} unit column
 * @param {Boolean} superposable with another component
 */
Game.prototype.addUnitAt = function (name, row, column, superposable) {
    if (this.canAddAt(row, column)) {
        (this.units[row][column])[name] = new Unit(name, row, column, superposable);
        if (name == 'hero') { // save the initial position of the hero
            this.initPos = {
                row: row,
                column: column
            }
        }
    }
}

/**
 * returns true if there are no unit that does not accepect superposition at given position
 */
Game.prototype.canAddAt = function (row, column) {
    var units = this.getAllUnitsAt(row, column);
    for (var property in units) {
        if (units.hasOwnProperty(property)) {
            if (!units[property].superposable) {
                return false;
            }
        }
    }
    return true;
}

/**
 * add unit at random position in grid
 * @param {String} component name
 * @param {Number} quantity 
 * @param {Boolean} superposable with another component
 */
Game.prototype.addUnitsAtRandom = function (name, quantity, superposable) {
    var row;
    var column;
    var added = 0;
    if (quantity > 0) {
        while (added < quantity) {
            row = getRandomIntInclusive(0, this.rows - 1);
            column = getRandomIntInclusive(0, this.columns - 1);
            if (this.canAddAt(row, column)) {
                this.addUnitAt(name, row, column, superposable);
                added++;
            }
        }
    }
}

/**
 * add unit at safe  random position in grid
 * @param {String} component name
 * @param {Number} quantity 
 * @param {Boolean} superposable with another component
 */
Game.prototype.addUnitsAtSafeRandom = function (name, quantity, superposable) {
    var row;
    var column;
    var added = 0;
    if (quantity > 0) {
        while (added < quantity) {
            row = getRandomIntInclusive(0, this.rows - 1);
            column = getRandomIntInclusive(0, this.columns - 1);
            if (Object.keys(this.getAllUnitsAt(row, column)).length == 0) {
                this.addUnitAt(name, row, column, superposable);
                added++;
            }
        }
    }
}

Game.prototype.posCardinal = function (row, column) {
    return [
        { row: row - 1, column: column },
        { row: row + 1, column: column },
        { row: row, column: column - 1 },
        { row: row, column: column + 1 }
    ];
}

Game.prototype.accessible_from = function (row, column) {
    return this.posCardinal(row, column).filter((pos) => {
        return this.isInsideGrid(pos.row, pos.column);
    });
}

/**
 * add units around given position
 */
Game.prototype.addUnitAround = function (name, row, column, superposable) {
    this.accessible_from(row, column).map((pos) => {
        this.addUnitAt(name, pos.row, pos.column, superposable);
    })
}

/**
 * remove unit at given position
 */
Game.prototype.removeUnitAt = function (name, row, column) {
    delete this.units[row][column][name];
}

/**
 * move Component from old position to new position
 */
Game.prototype.moveUnitTo = function (name, oldRow, oldCol, newRow, newCol) {
    if (this.isInsideGrid(newRow, newCol)) {
        this.removeUnitAt(name, oldRow, oldCol);
        this.addUnitAt(name, newRow, newCol);
    }
}

/**
 * @param {String} name
 * @param {Action} action description object
 */
Game.prototype.doAction = function (action) {
    switch (action.action) {
        case 'move':
            this.moveUnitTo(action.unit, action.from.row, action.from.column, action.to.row, action.to.column);
            break;
        case 'restart':
            this.addUnitAt(action.unit, action.to.row, action.to.column, true);
            break;            
        case 'attack':
            this.removeUnitAt(action.on, action.to.row, action.to.column);
            break;
        default:
            break;
    }
}

/**
 * show components.
 */
Game.prototype.show = function () {
    this.drawBoard();
    this.drawAllUnits();
}

Game.prototype.drawBoard = function () {
    this.context.clearRect(0, 0, this.kPixelWidth, this.kPixelHeight);
    this.context.beginPath();
    /* vertical lines */
    for (var x = 0; x <= this.kPixelWidth; x += this.kPieceWidth) {
        this.context.moveTo(0.5 + x, 0);
        this.context.lineTo(0.5 + x, this.kPixelHeight);
    }
    /* horizontal lines */
    for (var y = 0; y <= this.kPixelHeight; y += this.kPieceHeight) {
        this.context.moveTo(0, 0.5 + y);
        this.context.lineTo(this.kPixelWidth, 0.5 + y);
    }
    this.context.closePath();
    /* draw */
    this.context.strokeStyle = 'black';
    this.context.stroke();
}

/**
 * @param {Image} image to draw
 * @param {Number} column
 * @param {Number} row
 */
Game.prototype.drawImage = function (img, row, column) {
    var x = (column * this.kPieceWidth);
    var y = (row * this.kPieceHeight);
    this.context.drawImage(img, x, y, this.kPieceWidth, this.kPieceHeight);
}

/**
 * draw all units
 */
Game.prototype.drawAllUnits = function () {
    var unit;
    for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.columns; c++) {
            var units = this.getAllUnitsAt(r, c);
            for (var property in units) {
                if (units.hasOwnProperty(property)) {
                    unit = units[property];
                    this.drawImage(this.images[unit.name], r, c);
                }
            }
        }
    }
}

/**
 * next game : new game with bigger map
 */
Game.prototype.nextGame = function () {
    return new Game(this.images, this.canvas, this.rows + 1, this.columns + 1);
}