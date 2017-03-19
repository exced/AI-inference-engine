/**
 * 
 * @param {Array} conditions
 * @param {Array} actions 
 */
function Rule(conditions, actions) {
    this.conditions = conditions;
    this.actions = actions;
}

/**
 * 
 * @param {Knowledge} knowledges
 */
function assertC(knowledges) {
    return this.conditions.reduce((f, g) => {
        return f(knowledges) && g(knowledges);
    }, true)
}

/**
 * 
 * @param {Knowledge} knowledges
 */
function apply(knowledges) {
    if (assertC(this.conditions)) {
        this.actions.map((f) => {
            f(knowledges)
        })
    }
}

/**
 * 
 * @param {Rule} other 
 */
function infer(other) {

}