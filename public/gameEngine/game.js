/**
 * Grid based game engine
 */

/**
 * @param {Context} canvas context
 * @param {Object} sprites: name - url
 * @param {Object} components of the game : these are the drawn components of the game
 */
function Game(context, vue, data, sprites, components) {
    this.grid = grid;
    this.vue = vue;
    this.data = data;
    this.sprites = sprites;
    this.components =  components;
}

/**
 * @param {String} component name
 * @param {Number} component row
 * @param {Number} component column
 */
Game.prototype.addComponentAt = function (name, row, column) {
    this.components.name.addComponentAt(row, column);
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
 * show components.
 */
Game.prototype.show = function () {
    this.grid.init();
    this.components.map(loadImages)
    this.grid.drawComponents(this.components);
}

/**
 * move Component from old position to new position
 */
Game.prototype.moveTo = function (name, oldPosition, newPosition) {
    if (this.grid.isInsideGrid(newPosition)) {
        this.components.name.moveTo(oldPosition, newPosition);
    }
}
/**
 * update game state
 */
Game.prototype.step = function () {
    this.grid.drawComponents(this.components);
}