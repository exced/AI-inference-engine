// Knowledge table
var knowledgeTable = [];
// Rules list
var rulesList = [];

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
