function RuleEngine(rules) {
    this.rules = rules;
}

/**
 * assert condition == triggerOn
 * @param {Object} fact
 * @param {Array} facts
 */
function condition(fact, facts) {
    return fact.condition(facts) == fact.triggerOn;
}

/**
 * do actions 
 * @param {Object} fact
 * @param {Array} facts
 */
function actions(fact, facts) {
    return fact.actions(facts);
}

/**
 * infer new rules. Forward chaining
 * @param {Fact}
 */
RuleEngine.prototype.infer = function (facts) {
    for (var i = 0; i < this.rules.length; i++) {
        
    }
}
