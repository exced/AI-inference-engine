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
    for (var i = 0; i < rules.length; i++) {
        var pack = rules.filter(function (rule) {
            return rule.priority == i;
        });
        if (pack.length >= 1) {
            res.push(pack);
        }
    }
    return res;
}

/**
 * select applicable non marked rules
 */
RuleEngine.prototype.selectRules = function (facts, flow, rules) {
    var selected = [];
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (!rule.conditions(facts, flow)) {
            rule.marked = true;
        } else {
            if (!rule.marked) {
                selected.push(rule);
            }
        }
    }
    return selected;
}

RuleEngine.prototype.markRulesFalse = function () {
    this.rules.map((r) => r.marked = false);
}

/**
 * any non marked rule
 */
RuleEngine.prototype.someNotMarked = function (rules) {
    return rules.some((r) => !r.marked)
}

/**
 * infer new rules. Forward chaining
 * @param {Object} facts 
 */
RuleEngine.prototype.infer = function (facts) {
    this.markRulesFalse();
    var flow;
    var selectedRules;
    var rule;
    /* prioritize rules */
    var rulesByPriority = prioritize(this.rules);
    for (var i = 0; i < rulesByPriority.length; i++) {
        while (this.someNotMarked(rulesByPriority[i])) {
            console.log("rules step" + JSON.stringify(rulesByPriority[i]));
            selectedRules = this.selectRules(facts, flow, rulesByPriority[i]);
            console.log("selected rules" + JSON.stringify(selectedRules));
            rule = selectedRules[0]; // arbitrary
            console.log("rule" + JSON.stringify(rule));
            console.log("flow" + JSON.stringify(flow));
            flow = rule.actions(facts, flow);
            rule.marked = true;
        }
    }
    return flow;
}
