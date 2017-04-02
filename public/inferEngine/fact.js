/**
 * 
 * @param {Object} fact
 */
function Fact(fact) {
    this.fact = fact;
}

/**
 * returns true if fact field is present
 * @param {Object} fact
 * @param {String} field name
 */
Fact.prototype.certain = function (field) {
    var prob = this.fact[field];
    return (typeof prob === 'number' && prob == 1);
}

/**
 * returns true if fact field is not present
 * @param {Object} fact
 * @param {String} field name
 */
Fact.prototype.certainNot = function (field) {
    var prob = this.fact[field];
    return (typeof prob === 'number' && prob == 0);
}