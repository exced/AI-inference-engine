const nbRows = 3
const nbColumns = 3

function reachableTiles(tile){
    var reachable = [];
    var oldColumn = tile.column;
    var oldRow = tile.row;
    reachable.push({column:oldColumn, row:oldRow}, {column:oldColumn, row:oldRow},
    {column:oldColumn, row:oldRow}, {column:oldColumn, row:oldRow});
    for(var i=0; i<reachable.length; i++){
        if (!validTile(reachable[i])) {
            reachable.push(newTile);
            i--;
        }
    }
    return reachable;
}

function validTile(tile) {
    return tile.row >=0 && tile.column >= 0 && tile.row < nbRows && tile.column < nbColumns;
}
