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
 * execute rules with fact
 * @param {Array} facts
 * @param {function} callback on facts
 */
RuleEngine.prototype.execute = function (facts, callback) {

    return callback(facts);
};

/**
 * infer new rules.
 */
RuleEngine.prototype.infer = function (facts) {
    console.log("TEST " + JSON.stringify(this.rules));
    inferRules([], facts.copy(), [], this.rules)
        .map(function (rule) {
            if (rule.length != 0) {
                this.rules.push(rule);
            }
        })
}

inferRules = function (store, facts, matched, remaining) {
    console.log("matched " + JSON.stringify(matched));
    console.log("remaining " + JSON.stringify(remaining));
    console.log("facts " + JSON.stringify(facts));
    if (remaining.length == 0) {
        if (matched.length == 1) { // no duplicate. we already know this rule
            return [];
        }
        var actions = [];
        matched.map(function (a) {
            actions.push(a.actions);
        });
        return actions;
    }
    for (var i = 0; i < remaining.length; i++) {
        var rem = remaining.splice(i, 1)[0];
        console.log("rem " + JSON.stringify(rem));
        if (rem.condition(facts)) {
            infered = {
                condition: rem.condition,
                actions: []
            };
            rem.actions(facts);
        }
        matched.push(rem);
        remaining.splice(rem, 1);
        infered.actions = inferRules(store, facts, matched, remaining);
    }
    return [];
}