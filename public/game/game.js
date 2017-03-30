/**
 * Grid based game engine
 */

/**
 * 
 * @param {Object} components of the game : these are the drawn components of the game
 */
function Game(grid, vue, data, sprites, components) {
    this.grid = grid;
    this.vue = vue;
    this.data = data;
    this.sprites = sprites;
    this.components =  components;
}

Game.prototype.show = function () {
    this.grid.show(this.components);
}

Game.prototype.moveTo = function (name, oldPosition, newPosition) {
    if (this.grid.isInsideGrid(newPosition)) {
        this.components.hero.pos = newPosition;
        this.data.pathUser.push(newPosition);
    }
}

Game.prototype.step = function () {
    this.grid.drawBoard(gContext);
    this.grid.drawComponents(this.components);
}