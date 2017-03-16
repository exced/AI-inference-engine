function mergeBindings(bindings1, bindings2) {
    if (!bindings1 || !bindings2) {
        return null;
    }
    var conflict = false;
    var bindings = new Map;
    bindings1.forEach(function (value, variable) {
        bindings.set(variable, value);
    });
    bindings2.forEach(function (value, variable) {
        var other = bindings.get(variable);
        if (other) {
            var sub = other.match(value);
            if (!sub) {
                conflict = true;
            } else {
                sub.forEach(function (value, variable) {
                    bindings.set(variable, value);
                });
            }
        } else {
            bindings.set(variable, value);
        }
    });
    if (conflict) {
        return null;
    }
    return bindings;
};

function Variable(name) {
    this.name = name;
}

Variable.prototype.match = function (other) {
    var bindings = new Map;
    if (this !== other) {
        bindings.set(this, other);
    }
    return bindings;
};

Variable.prototype.substitute = function (bindings) {
    var value = bindings.get(this);
    if (value) {
        // if value is a compound term then substitute
        // variables inside it too
        return value.substitute(bindings);
    }
    return this;
};

function Term(functor, args) {
    this.functor = functor;
    this.args = args || [];
}

function zip(arrays) {
    return arrays[0].map(function (element, index) {
        return arrays.map(function (array) {
            return array[index];
        });
    });
}

Term.prototype.match = function (other) {
    if (other instanceof Term) {
        if (this.functor !== other.functor) {
            return null;
        }
        if (this.args.length !== other.args.length) {
            return null;
        }
        return zip([this.args, other.args]).map(function (args) {
            return args[0].match(args[1]);
        }).reduce(mergeBindings, new Map);
    }
    return other.match(this);
};

Term.prototype.substitute = function (bindings) {
    return new Term(this.functor, this.args.map(function (arg) {
        return arg.substitute(bindings);
    }));
};

Term.prototype.query = function* (database) {
    yield* database.query(this);
};

Term.TRUE = new Term('true');

Term.TRUE.substitute = function () {
    return this;
};

Term.TRUE.query = function* () {
    yield this;
};

function Rule(head, body) {
    this.head = head;
    this.body = body;
}

function Conjunction(args) {
    this.args = args;
}

Conjunction.prototype = Object.create(Term.prototype);

Conjunction.prototype.query = function* (database) {
    var self = this;
    function* solutions(index, bindings) {
        var arg = self.args[index];
        if (!arg) {
            yield self.substitute(bindings);
        } else {
            for (var item of database.query(arg.substitute(bindings))) {
                var unified = mergeBindings(arg.match(item), bindings);
                if (unified) {
                    yield* solutions(index + 1, unified);
                }
            }
        }
    }
    yield* solutions(0, new Map);
};

Conjunction.prototype.substitute = function (bindings) {
    return new Conjunction(this.args.map(function (arg) {
        return arg.substitute(bindings);
    }));
};

function Disjunction(args) {
    this.args = args;
}

function Database(rules) {
    this.rules = rules;
}

Database.prototype.addRule = function* (rule) {
    this.rules.push(rule);
}

Database.prototype.query = function* (goal) {
    for (var i = 0, rule; rule = this.rules[i]; i++) {
        var match = rule.head.match(goal);
        if (match) {
            var head = rule.head.substitute(match);
            var body = rule.body.substitute(match);
            for (var item of body.query(this)) {
                yield head.substitute(body.match(item));
            }
        }
    }
};
