/**
 * @param {Array} initial facts
 * @param {function} equality function between 2 knowledges
 */
function Facts(facts, equal) {
    this.facts = facts;
    this.equal = equal;
}

function mergeBindings(oldFact, newFact) {
    for (n in newFact) {
        oldFact[n] = newFact[n];
    }
    return oldFact;
}

/**
 * 
 * @param {Object} fact 
 */
Facts.prototype.add = function (fact) {
    if (this.facts.length == 0) {
        this.facts.push(fact);
    } else {
        for (var i = 0; i < this.facts.length; i++) {
            if (this.equal(this.facts[i], fact)) {
                this.facts[i] = mergeBindings(this.facts[i], fact);
            }
        }
    }
}