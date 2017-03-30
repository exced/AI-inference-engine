/**
 * Grid based game engine
 */

/**
 * @param {Number} rows number
 * @param {Number} columns number
 * @param {Context} canvas context
 * @param {Object} Datas of the game that are not drawn
 * @param {Object} sprites
 */
function Game(canvas, rows, columns, data, sprites) {
    this.canvas = canvas;
    this.screenHeight = screen.availHeight;
    this.kPieceWidth = ~~((this.screenHeight - 250) / columns);
    this.kPieceHeight = ~~((this.screenHeight - 250) / rows);
    this.kPixelWidth = 1 + (columns * this.kPieceWidth);
    this.kPixelHeight = 1 + (rows * this.kPieceHeight);
    this.canvas.width = this.kPixelWidth;
    this.canvas.height = this.kPixelHeight;    
    this.context = this.canvas.getContext("2d");    
    this.data = data;
    this.sprites = sprites;
    this.images = [];
    this.units = fill2D(rows, columns, []);    
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
/**
 * remove unit at given position
 */
Game.prototype.removeUnitAt = function (name, row, column) {
    this.units[row][column] = this.units[row][column].filter((u) => {
        return u.name != name;
    })
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

/**
 * move Component from old position to new position
 */
Game.prototype.moveUnitTo = function (name, oldRow, oldCol, newRow, newCol) {
    if (this.isInsideGrid(newRow, newCol)) {
        this.removeUnitAt(name, oldRow, oldCol);
        this.addUnitAt(name, oldRow, oldCol);
    }
}

/** is position inside grid ?
 * @param {int} column
 * @param {int} row
 */
Game.prototype.isInsideGrid = function (row, column) {
    return (row >= 0 && row < this.rows) && (column >= 0 && column < this.columns);
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
            this.getUnitsAt(r, c).map((u) => {
                this.drawImage(this.images[u.name], r, c);
            })
        }
    }
}