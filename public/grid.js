/**
 * @param {number} nbRow 
 * @param {number} nbColumn
 */
function Grid(nbRow, nbColumn) {
    this.nbRow = nbRow;
    this.nbColumn = nbColumn;
    this.sprites = [];
    this.knowledges = []
    // Initializes the sprites and knwoledges matrix
    for (var i=0; i<nbRow; i++) {
        this.sprites.push([]);
        this.knowledges.push([]);
        for (var j=0; j< nbColumn; j++) {
            this.sprites[i].push([]);
            this.knowledges.push();
        }
    }

    // ============================================ GUI ===========================================
    /** Adds a sprite
     * @param {number} row 
     * @param {number} column 
     * @param {Image} sprite 
     */
    function addSprite(row, column, sprite) {
        this.sprites[row][column].push(sprite);
    }

    /** Draws all the sprites of a tile
     * @param {number} row 
     * @param {number} column 
     */
    function drawTile(row, column) {
        var sprites = this.sprites[row][column];
        sprites.map(function (sprite) {
            drawImage(gContext, sprite, column, row, nbSprites);
        });
    }

    /** Draws the grid
     */
    function drawGrid() {
        for(var i=0; i<this.nbRow; i++) {
            for (var j=0; j<this.nbColumn ; j++) {
                this.drawTile(i, j);
            }
        }
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

var height = screen.availHeight;
var tileWidth = ~~((height - 250) / nbCols);
var tileHeight = ~~((height - 250) / nbRows);
function drawImage(ctx, img, column, row, nbSprites) {
    var imageWidth = tileWidth / nbSprites;
    var imageHeight = tileHeight / nbSprites;
    var x = (column * kPieceWidth);
    var y = (row * kPieceHeight);
    gContext.drawImage(images[img], x, y, imageWidth, imageHeight);
}
