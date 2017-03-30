/**
 * Canvas abstract
 */

/**
 * @param {number} number of rows 
 * @param {number} number of columns
 * @param {number} screen available height
 * @param {Context} canvas context
 */
function Grid(rows, columns, height, context) {
    this.nbRows = nbRows;
    this.nbColumn = nbColumn;
    this.height = height;
    this.kPieceWidth = ~~((height - 250) / nbCols);
    this.kPieceHeight = ~~((height - 250) / nbRows);
    this.context = context;
}

    /** Draws the grid
     */
    function drawGrid() {
        for (var i = 0; i < this.nbRow; i++) {
            for (var j = 0; j < this.nbColumn; j++) {
                this.drawTile(i, j);
            }
        }
    }

    /** Returns true if the tile position is valid, else false
     * @param {int} column
     * @param {int} row
     */
    function isInsideGrid(position) {
        return (position.row >= 0 && position.row < nbRows) && (position.column >= 0 && position.column < nbCols);
    }

    // ======================================== KNOWLEDGES ========================================
    /** Adds a knowledge
     * @param {number} row 
     * @param {number} column 
     * @param {Knowledge} knowledge 
     */
    function addKnowledges(row, column, knowledge) {
        this.knowledges[row][column].push(knowledge);
    }

    /**
     * @param {number} row 
     * @param {number} column
     * @return {Knowledges} knowledges
     */
    function getKnowledges(row, column) {
        return this.knowledges[row][column];
    }

}

/** Loads all images
 * @param {*} sources 
 * @param {*} callback 
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

function drawImage(ctx, img, column, row, nbSprites) {
    var imageWidth = tileWidth / nbSprites;
    var imageHeight = tileHeight / nbSprites;
    var x = (column * kPieceWidth);
    var y = (row * kPieceHeight);
    gContext.drawImage(images[img], x, y, imageWidth, imageHeight);
}
