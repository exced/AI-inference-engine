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
 * infer new rules. Forward chaining
 * @param {Fact}
 */
RuleEngine.prototype.infer = function (facts) {
    return this.rules
        .reduce(function permute(res, item, key, arr) {
            return res.concat(arr.length > 1 && arr.slice(0, key).concat(arr.slice(key + 1))
                .reduce(permute, [])
                .map(function (perm) {
                    return [item].concat(perm);
                }) || item);
        }, []);
}
