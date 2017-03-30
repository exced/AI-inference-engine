/**
 * Grid game based component
 */

/**
 * @param {String} component name
 * @param {String} sprite name
 * @param {Array} positions array
 * @param {Boolean} movable
 * @param {function} show function
 */
function Component(name, sprite, positions, movable, show) {
    this.name = name;
    this.sprite = sprite;
    this.positions = positions;
    this.lookup = [[]];
    this.movable = movable;
    this.show = show;
}
