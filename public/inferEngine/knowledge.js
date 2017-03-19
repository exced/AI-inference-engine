/**
 * 
 * @param {Array} Knowledges 
 * @param {function} equality function between 2 knowledges
 */
function Knowledge(Knowledges, equal) {
    this.knowledges = knowledges;
    this.equal = equal;
}

/**
 * 
 * @param {Object} knowledge 
 */
function add(knowledge) {
    var i = this.knowledges.indexOf(knowledge, this.equal);
    if (i != -1) {
        this.knowledges.push(knowledge);
    } else {
        this.knowledge[i] = knowledge;
    }
}