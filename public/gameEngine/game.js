/**
 * Grid based game engine.
 */

/**
 * @param {Number} rows number
 * @param {Number} columns number
 * @param {Context} canvas context
 * @param {Object} sprites
 */
function Game(canvas, rows, columns, sprites) {
    this.canvas = canvas;
    this.screenHeight = screen.availHeight;
    this.kPieceWidth = ~~((this.screenHeight - 250) / columns);
    this.kPieceHeight = ~~((this.screenHeight - 250) / rows);
    this.kPixelWidth = 1 + (columns * this.kPieceWidth);
    this.kPixelHeight = 1 + (rows * this.kPieceHeight);
    this.canvas.width = this.kPixelWidth;
    this.canvas.height = this.kPixelHeight;    
    this.context = this.canvas.getContext("2d");    
    this.sprites = sprites;
    this.images = [];
    this.units = fill2D(rows, columns, []);    
}

/**
 * aggregate all units by name
 */
Game.prototype.getUnits = function (name) {
    var agg = [];
    for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.columns; c++) {
            agg.concat(this.getUnitsAt(r, c));
        }
    }
    return agg;
}

/**
 * filter units by name and position
 */
Game.prototype.getUnitsAt = function (name, row, column) {
    return this.getAllUnitsAt(row, column).filter((u) => {
        return u.name == name;
    })
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
    if (superposable || getUnitsAt(row, column) == 0) {
        this.units[row][column].push(new Unit(name, row, column));
    }
}

/**
 * add unit at random position in grid
 * @param {String} component name
 * @param {Boolean} superposable with another component
 */
Game.prototype.addUnitAtRandom = function (name, superposable) {
    var row;
    var column;
    do {
        row = getRandomIntInclusive(0, this.columns - 1);
        column = getRandomIntInclusive(0, this.rows - 1);
    } while (superposable || getUnitsAt(row, column) == 0)
    this.addUnitAt(name, row, column);
}

/**
 * add quantity of unit at ramdom position in grid
 * @param {String} component name
 * @param {Number} quantity
 * @param {Boolean} superposable with another component
 */
Game.prototype.addUnitsAtRandom = function (name, quantity, superposable) {
    for (var i = 0; i < quantity; i++) {
        this.addUnitAtRandom(name, superposable);
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
        return isInsideGrid(p.row, p.column);
    });
}

/**
 * add units around given position
 */
Game.prototype.addUnitAround = function (name, row, column, superposable) {
    this.accessible_from(row, column).map((pos) => {
        this.addUnitAt(name, pos.row, pow.column, superposable);
    })
}

/**
 * remove unit at given position
 */
Game.prototype.removeUnitAt = function (name, row, column) {
    this.units[row][column] = this.units[row][column].filter((u) => {
        return u.name != name;
    })
}

/** is position inside grid ?
 * @param {int} column
 * @param {int} row
 */
Game.prototype.isInsideGrid = function (row, column) {
    return (row >= 0 && row < this.rows) && (column >= 0 && column < this.columns);
}

/**
 * move Component from old position to new position
 */
Game.prototype.moveUnitTo = function (name, oldRow, oldCol, newRow, newCol) {
    if (this.isInsideGrid(newRow, newCol)) {
        this.removeUnitAt(name, oldRow, oldCol);
        this.addUnitAt(name, oldRow, oldCol);
    }
}

/** Loads all images
 * @param {String} sources
 * @param {function} callback
 */
function loadImages(sources, callback) {
    var nb = 0;
    var loaded = 0;
    var imgs = {};
    for (var i in sources) {
        if (sources.hasOwnProperty(i)) {
            nb++;
            imgs[i] = new Image();
            imgs[i].src = sources[i];
            imgs[i].onload = function () {
                loaded++;
                if (loaded == nb) {
                    callback(imgs);
                }
            }
        }
    }
}

/**
 * load images
 */
Game.prototype.init = function () {
    loadImages(this.sprites, function (imgs) {
        this.images = imgs;
    });
}

/**
 * show components.
 */
Game.prototype.show = function () {
    this.drawBoard();
    this.drawAllUnits();
}

Game.prototype.drawBoard = function () {
    context.clearRect(0, 0, this.kPixelWidth, this.kPixelHeight);
    context.beginPath();
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
    for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.columns; c++) {
            this.getAllUnitsAt(r, c).map((u) => {
                this.drawImage(this.images[u.name], r, c);
            })
        }
    }
}