function RuleEngine(rules) {
    this.rules = rules;
}

/**
 * assert condition == triggerOn
 * @param {Object} fact
 * @param {Array} facts
 */
function condition (fact, facts) {
    return fact.condition(facts) == fact.triggerOn;
}

/**
 * do actions 
 * @param {Object} fact
 * @param {Array} facts
 */
function actions (fact, facts) {
    return fact.actions(facts);
}

/**
 * execute rules with fact
 * @param {Array} facts
 * @param {function} callback on facts
 */
RuleEngine.prototype.execute = function (facts, callback) {
    var old_facts_cp = JSON.parse(JSON.stringify(facts));
    var facts_cp = JSON.parse(JSON.stringify(facts));
    done = false;
    while (!done && facts_cp.length != 0) {
        
    }
    return callback(facts);
};

FACTS : {
    column: ,
    row: ,
    monster: {
        true,
        cf: 0,25
    } ...
}