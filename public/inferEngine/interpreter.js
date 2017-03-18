function Database(elts) {
    this.elts = elts;
}

Database.prototype.add = function* (elt) {
    this.elts.push(elt);
}

Database.prototype.find = function* (elt, eqFun) {
    return this.elts.findElement(elt, eqFun);
};