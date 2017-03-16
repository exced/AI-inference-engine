function parser(tokens) {
    var current, done, scope;

    function next() {
        var next = tokens.next();
        current = next.value;
        done = next.done;
    }

    function parseAtom() {
        var name = current;
        if (!/^[A-Za-z0-9_]+$/.test(name)) {
            throw new SyntaxError('Bad atom name: ' + name);
        }
        next();
        return name;
    }

    function parseTerm() {
        if (current === '(') {
            next(); // eat (
            var args = [];
            while (current !== ')') {
                args.push(parseTerm());
                if (current !== ',' && current !== ')') {
                    throw new SyntaxError('Expected , or ) in term but got ' + current);
                }
                if (current === ',') {
                    next(); // eat ,
                }
            }
            next(); // eat )
            return new Conjunction(args);
        }
        var functor = parseAtom();
        if (/^[A-Z_][A-Za-z0-9_]*$/.test(functor)) {
            if (functor === '_') {
                return new Variable('_');
            }
            // variable X in the same scope should point to the same object
            var variable = scope[functor];
            if (!variable) {
                variable = scope[functor] = new Variable(functor);
            }
            return variable;
        }
        if (current !== '(') {
            return new Term(functor);
        }
        next(); // eat (
        var args = [];
        while (current !== ')') {
            args.push(parseTerm());
            if (current !== ',' && current !== ')') {
                throw new SyntaxError('Expected , or ) in term but got ' + current);
            }
            if (current === ',') {
                next(); // eat ,
            }
        }
        next(); // eat )
        return new Term(functor, args);
    }

    function parseRule() {
        var head = parseTerm();
        if (current === '.') {
            next(); // eat .
            return new Rule(head, Term.TRUE);
        }
        if (current !== ':-') {
            throw new SyntaxError('Expected :- in rule but got ' + current);
        }
        next(); // eat :-
        var args = [];
        while (current !== '.') {
            args.push(parseTerm());
            if (current !== ',' && current !== '.') {
                throw new SyntaxError('Expected , or ) in term but got ' + current);
            }
            if (current === ',') {
                next(); // eat ,
            }
        }
        next(); // eat .
        var body;
        if (args.length === 1) {
            // body is a regular Term
            body = args[0];
        } else {
            // body is a conjunction of all terms
            body = new Conjunction(args);
        }
        return new Rule(head, body);
    }
    
    next(); // start the tokens iterator
    return {
        parseRules: function () {
            var rules = [];
            while (!done) {
                // each rule gets its own scope for variables
                scope = {};
                rules.push(parseRule());
            }
            return rules;
        },
        parseTerm: function () {
            scope = {};
            return parseTerm();
        }
    };
}
