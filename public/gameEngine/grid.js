/**
 * Canvas abstract. Based on grid game
 */

/**
 * @param {number} number of rows 
 * @param {number} number of columns
 * @param {Context} canvas context
 */
function Grid(rows, columns, context) {
    this.rows = rows;
    this.columns = columns;
    this.screenHeight = screen.availHeight;
    this.kPieceWidth = ~~((this.screenHeight - 250) / nbCols);
    this.kPieceHeight = ~~((this.screenHeight - 250) / nbRows);
    this.context = context;
}
/**
 * grid init.
 */
Grid.prototype.init = function () {
    this.drawBoard();
}

Grid.prototype.drawBoard = function () {
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
Grid.prototype.drawImage = function (img, column, row) {
    var x = (column * this.kPieceWidth);
    var y = (row * this.kPieceHeight);
    this.context.drawImage(img, x, y, this.kPieceWidth, this.kPieceHeight);
}

/**
 * @param {String} text to draw
 * @param {Number} column
 * @param {Number} row
 */
Grid.prototype.drawText = function (text, column, row) {
    this.context.font = "10px Arial";
    var x = this.kPieceWidth * (1 + column) - this.kPieceWidth;
    var y = this.kPieceHeight * (1 + row);
    this.context.fillText(text, x, y);
}

/** Returns true if the tile position is valid, else false
 * @param {int} column
 * @param {int} row
 */
Grid.prototype.isInsideGrid = function (position) {
    return (position.row >= 0 && position.row < nbRows) && (position.column >= 0 && position.column < nbCols);
}

/**
 * Returns the Cardinal positions : North / South / West / East
 * @param {Object}
 */
function posCardinal(pos) {
    return [
        { column: pos.column, row: pos.row - 1 },
        { column: pos.column, row: pos.row + 1 },
        { column: pos.column - 1, row: pos.row },
        { column: pos.column + 1, row: pos.row }
    ];
}

/**
 * @param {Boolean}
 */
Grid.prototype.randomPos = function () {
    return {
        column: getRandomIntInclusive(0, this.column - 1),
        row: getRandomIntInclusive(0, this.row - 1)
    }
}
