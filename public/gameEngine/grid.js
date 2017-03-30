/**
 * Canvas abstract. Based on grid game
 */

/**
 * @param {number} number of rows 
 * @param {number} number of columns
 * @param {Context} canvas context
 */
function Grid(rows, columns, context) {
    this.nbRows = nbRows;
    this.nbColumn = nbColumn;
    this.height = screen.availHeight;
    this.kPieceWidth = ~~((height - 250) / nbCols);
    this.kPieceHeight = ~~((height - 250) / nbRows);
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

function drawImage(ctx, img, column, row, nbSprites) {
    var imageWidth = tileWidth / nbSprites;
    var imageHeight = tileHeight / nbSprites;
    var x = (column * kPieceWidth);
    var y = (row * kPieceHeight);
    gContext.drawImage(images[img], x, y, imageWidth, imageHeight);
}

/** Returns true if the tile position is valid, else false
 * @param {int} column
 * @param {int} row
 */
Grid.prototype.isInsideGrid = function (position) {
    return (position.row >= 0 && position.row < nbRows) && (position.column >= 0 && position.column < nbCols);
}

function posCardinal(pos) {
    return [
        { column: pos.column, row: pos.row - 1 },
        { column: pos.column, row: pos.row + 1 },
        { column: pos.column - 1, row: pos.row },
        { column: pos.column + 1, row: pos.row }
    ];
}

function accessible_from(pos) {
    return pos.filter((p) => {
        return isInsideGrid(p);
    });
}
