parser = require('./parser');
lexer = require('./lexer');

var rulesText = 'mother_child(stephanie, thorne).' +
    'mother_child(stephanie, kristen).' +
    'mother_child(stephanie, felicia).';

var rules = parser(lexer(rulesText)).parseRules();

var db = new Database(rules);

var goalText = 'mother_child(X, kristen)';

var goal = parser(lexer(goalText)).parseTerm();

var x = goal.args[0]; // variable X

for (var item of db.query(goal)) {
    print(item);
    print('value of X = ' + goal.match(item).get(x));
}
