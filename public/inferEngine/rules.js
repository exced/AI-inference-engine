/** Creates a tile with the given coordinates
 * @param {int} column
 * @param {int} row
 */
function createTile(column, row) {
    return {column:column, row:row};
}

/** Returns true if two tiles are equal, else false
 * @param {Tile} tile1
 * @param {Tile} tile2
 */
function equalTiles(tile1, tile2) {
    return tile1.column == tile2.column && tile1.row == tile2.row;
}

/** Returns the list of reachable tiles
 * @param {Tile} tile
 */
function reachableTiles(tile){
    var reachable = [];
    var oldColumn = tile.column;
    var oldRow = tile.row;
    reachable.push({column:oldColumn-1, row:oldRow}, {column:oldColumn, row:oldRow-1},
    {column:oldColumn+1, row:oldRow}, {column:oldColumn, row:oldRow+1});
    for(var i=0; i<reachable.length; i++) {
        if (!validTile(reachable[i])) {
            reachable.splice(i, 1);
            i--;
        }
    }
    return reachable;
}

/** Returns true if the tile position is valid, else false
 * @param {Tile} tile
 */
function validTile(tile) {
    return tile.column >= 0 && tile.row >=0 && tile.column < nbCols && tile.row < nbRows ;
}

// =================================== KNOWLEDGES ===================================
/** Adds a knowledge to the table
 * @param {Tile} tile
 * @param {int} probMonster
 * @param {int} probHole
 * @param {boolean} passedon
 */
function addKnowledge(tile, probMonster, probHole, passedon) {
    knowledgeTable.push({tile, probMonster, probHole, passedOn});
}

/** Gets the value of a knowledge attribute, for a given tile
 * @param {Tile} tile
 * @param {string} attribute
 */
function getKnowledgeValue(tile, attribute) {
    var nbKnowledge = knowledgeTable.length;
    var knowledge = undefined;
    for(var i=0; i<nbKnowledge ; i++) {
        knowledge = knowledgeTable[i];
        if (equalTiles(tile, createTile(knowledge.column, knowledge.row))) {
            return knowledge[attribute];
        }
    }
    return undefined;
}

/** Monster probability
 * @param {Tile} tile 
 */
function getProbMonster(tile) {
    return getKnowledgeValue(tile, "probMonster");
}

/** Hole probability
 * @param {Tile} tile 
 */
function getProbHole(tile) {
    return getKnowledgeValue(tile, "probHole");
}

/** True if the tile has already been passed on, else false
 * @param {Tile} tile 
 */
function passedOn(tile) {
    return getKnowledgeValue(tile, "passedOn");
}

/** True if the tile contains a monster (100% sure)
 * @param {Tile} tile 
 */
function isMonster(tile) {
    return getProbMonster() == 1;
}

/** True if the tile contains a hole (100% sure)
 * @param {Tile} tile 
 */
function isHole(tile) {
    return getProbHole() == 1;
}

/** True if the tile is safe (no monster, hole, 100% sure)
 * @param {Tile} tile 
 */
function isSafe(tile) {
    return !isMonster() && !isHole();
}

var tile = {column:0, row:0}
console.log(reachableTiles(tile));
