/**
 * Grid based game engine
 */

/**
 * @param {Vue} VueJS Observable dashboard
 * @param {Object} Datas of the game that are not drawn 
 * @param {Context} canvas context
 * @param {Object} sprites: name - url
 * @param {Object} components of the game : these are the drawn components of the game
 */
function Game(context, vue, data, sprites, components) {
    this.grid = grid;
    this.vue = vue;
    this.data = data;
    this.sprites = sprites;
    this.components = components;
}

/**
 * aggregate all components at a position by name
 * @param {String} name
 * @param {Number} row
 * @param {Number} column
 */
Game.prototype.getComponentsAt = function (name, row, column) {
    
}

/**
 * aggregate all components at a position
 * @param {Number} row
 * @param {Number} column
 */
Game.prototype.getAllComponentsAt = function (row, column) {
    for (var i = 0; i < this.components.length;) {

    }
}

/**
 * @param {String} component name
 * @param {Number} component row
 * @param {Number} component column
 * @param {Boolean} superposable with another component
 */
Game.prototype.addComponentAt = function (name, row, column, superposable) {
    if (superposable) {
        this.components.name.addComponentAt(row, column);
    } else {
        if (getComponentsAt(row, column).length == null) {
            this.components.name.addComponentAt(row, column);
        }
    }
}

/**
 * @param {String} component name
 * @param {Boolean} superposable with another component
 */
Game.prototype.addComponentAtRandom = function (name, superposable) {
    if (superposable) {

    }
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
    loadImages(sprites, function (imgs) {
        images = imgs;

    });
    this.components.reduce((h, t) => {
        return
    }, [])
    this.grid.drawComponents(this.components);
}

/**
 * move Component from old position to new position
 */
Game.prototype.moveComponentTo = function (name, oldPosition, newPosition) {
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