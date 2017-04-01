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
Fact.prototype.certain = function (fact, field) {
    return (typeof e1 === 'number' && e1[field] == 1);
}

/**
 * returns true if fact field is not present
 * @param {Object} fact
 * @param {String} field name
 */
Fact.prototype.certainNot = function (fact, field) {
    return (typeof e1 === 'number' && e1[field] == 0);
}