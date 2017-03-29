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
 * prioritize
 */
function prioritize(rules) {
    var res = [];
    for (var i = 1; i < rules.length; i++) {
        var pack = rules.filter(function(rule) {
            return rule.priority == i;
        });
        if (pack.length >= 1) {
            res.push(pack);
        }
    }
    return res;
}

/**
 * infer new rules. Forward chaining
 * @param {Fact}
 */
RuleEngine.prototype.infer = function (facts) {
    /* prioritize rules */
    var rulesByPriority = prioritize(this.rules);
    for (var i = 0; i < rulesByPriority.length; i++) {
        
    }
}
