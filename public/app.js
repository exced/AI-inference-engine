// Vue.config.debug = true;
var rows = 3;
var columns = 3;
var infer;
var facts;
var threshold = 0.5; // risk threshold
var learningRate = 0.01; // decision making threshold : agent learns the best threshold to maximize the score.

var vue = new Vue({
    el: '#scores',
    data: {
        /* scoreboard */
        score: 0,
        threshold: threshold,
        learningRate: learningRate
    },
    computed: {
    },
    methods: {
        stepInfer: function () {
            stepInfer();
        },
    }
});

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', WindowLoad, false);
}
else if (window.attachEvent) { // IE
    window.attachEvent('onload', WindowLoad);
}

document.addEventListener("keydown", function (e) {
    if (e.keyCode == 32) { // spacebar
        stepInfer();
    }
}, false);

/** Loads all images
 * @param {String} sources
 * @param {function} callback
 */
function loadImages(sources, callback) {
    var nb = 0;
    var loaded = 0;
    var imgs = {};
    for (var i in sources) {
        if (sources.hasOwnProperty(i)) {
            nb++;
            imgs[i] = new Image();
            imgs[i].src = sources[i];
            imgs[i].onload = function () {
                loaded++;
                if (loaded == nb) {
                    callback(imgs);
                }
            }
        }
    }
}

/**
 * Create and run a new game
 * @param {Event} window event
 */
function WindowLoad(event) {
    /* game */
    var sprites = {
        hero: "./assets/hero.png",
        hole: "./assets/hole.png",
        monster: "./assets/monster.png",
        portal: "./assets/portal.png",
        rainbow: "./assets/rainbow.png",
        cloud: "./assets/wind.png"
    }
    loadImages(sprites, function (imgs) {
        game = newGame(imgs, rows + 1, columns + 1);
        game.show();
        initFacts(game, 0, learningRate, threshold);
        ruleEngine = newRuleEngine();
    });
}

/** 
 * add units to the game
 */
function initUnits(game) {
    game.addUnitsAtRandom("portal", 1, false);
    game.addUnitsAtRandom("monster", (~~(game.rows * game.columns) / 50), false);
    /* rainbows around monster */
    game.getUnits("monster").map((c) => {
        game.addUnitAround("rainbow", c.row, c.column, true);
    });
    game.addUnitsAtRandom("hole", ~~(game.rows * game.columns) / 50, false);
    /* clouds around hole */
    game.getUnits("hole").map((c) => {
        game.addUnitAround("cloud", c.row, c.column, true);
    });
    game.addUnitsAtSafeRandom("hero", 1, true);
}

/**
 * initialize facts
 */
function initFacts(game, score, learningRate, threshold) {
    var fact = {
        visited: false,
        rainbow: 0,
        monster: 0,
        hole: 0,
        cloud: 0,
        danger: 0
    };
    var hero = game.getUnits("hero")[0];
    facts = {
        initPos: { // save the initial position of the hero
            row: hero.row,
            column: hero.column
        },
        hero: {
            row: hero.row,
            column: hero.column
        },
        score: score,
        learningRate: learningRate,
        threshold: threshold,
        grid: fill2DFact(game.rows, game.columns, fact),
        gridIterator: function* gridIterator(rows, cols) {
            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    yield { row: r, column: c };
                }
            }
        }
    }
}

/**
 * init and create a new game 
 * @param {Number} rows 
 * @param {Number} columns 
 * @param {Number} monsterRatio : ratio = quantity / (rows * columns)
 * @param {Number} holesRatio 
 */
function newGame(images, rows, columns) {
    /* canvas */
    var canvas = document.getElementById('canvas');
    var game = new Game(images, canvas, rows, columns);
    /* add units */
    initUnits(game);
    return game;
}

function countNeighborsNotVisited(row, column) {
    return game.accessible_from(row, column)
        .reduce((acc, e, i, arr) => {
            return !facts.grid[e.row][e.column].fact.visited ? 1 + acc : acc;
        }, 0);
}

function minDangerAround(row, column) {
    return game.accessible_from(row, column)
        .reduce((acc, e, i, arr) => {
            var danger = facts.grid[e.row][e.column].fact.danger;
            return danger < acc ? danger : acc;
        }, Number.MAX_VALUE);
}

function newRuleEngine() {
    /* rules + facts */
    /* rules have priority representing "step". Each rule is tested. Each step apply its conditions
    on the result of the previous "step" result (modified by previous actions). Warn with the dimensions and
    the attributes of the flow (chain of objects). The entrypoint is a set of facts.
    */
    var rules = [
        {
            name: "hero position and assertion",
            priority: 0,
            conditions: function (facts) { // flow == null
                return facts.hasOwnProperty('hero');
            },
            triggerOn: true,
            actions: function (facts) {
                var row = facts.hero.row;
                var column = facts.hero.column;
                /* assert facts at hero position */
                var fact = facts.grid[row][column].fact;
                Object.values(fact).map((v) => {
                    if (typeof v === 'number' && v != 1) {
                        v = 0;
                    }
                })
                return facts;
            }
        },
        {
            name: "accessible cardinal positions",
            priority: 1,
            conditions: function (facts) { // flow == hero { row: r, column: c}
                return facts.hasOwnProperty('hero') && facts.hero.hasOwnProperty('row') && facts.hero.hasOwnProperty('column');
            },
            triggerOn: true,
            actions: function (facts) {
                facts.accessible_from = game.accessible_from(facts.hero.row, facts.hero.column);
                return facts;
            }
        },
        {
            name: "empty is safe",
            priority: 2,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array. accessible_from
                var fact = facts.grid[facts.hero.row][facts.hero.column].fact;
                return (fact.hole == 0 && fact.cloud == 0 && fact.rainbow == 0 && fact.monster == 0);
            },
            triggerOn: true,
            actions: function (facts) {
                facts.grid[facts.hero.row][facts.hero.column].fact.danger = 0;
                facts.grid[facts.hero.row][facts.hero.column].fact.empty = 1;
                return facts;
            }
        },
        {
            name: "monster around rainbow",
            priority: 2,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array. accessible_from
                return (facts.grid[facts.hero.row][facts.hero.column].fact.rainbow == 1);
            },
            triggerOn: true,
            actions: function (facts) {
                var it = facts.gridIterator(game.rows, game.columns);
                var pos = it.next();
                var possibleMonster;
                var fact;
                while (!pos.done) {
                    possibleMonster =
                        game.accessible_from(pos.value.row, pos.value.column)
                            .filter((e, i, a) => {
                                fact = facts.grid[e.row][e.column];
                                return !fact.visited && fact.rainbow == 1;
                            });
                    possibleMonster.map((pos) => {
                        facts.grid[pos.row][pos.column].fact.monster = 1 / possibleMonster.length;
                    });
                    pos = it.next();
                }
                return facts;
            }
        },
        {
            name: "rainbow around monster",
            priority: 2,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array. accessible_from
                return (facts.grid[facts.hero.row][facts.hero.column].fact.monster == 1);
            },
            triggerOn: true,
            actions: function (facts) {
                facts.accessible_from.map((pos) => {
                    facts.grid[pos.row][pos.column].fact.rainbow = 1;
                })
                return facts;
            }
        },
        {
            name: "hole around cloud",
            priority: 2,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array. accessible_from
                return (facts.grid[facts.hero.row][facts.hero.column].fact.cloud == 1);
            },
            triggerOn: true,
            actions: function (facts) {
                var it = facts.gridIterator(game.rows, game.columns);
                var pos = it.next();
                var possibleHole;
                var fact;
                while (!pos.done) {
                    possibleHole =
                        game.accessible_from(pos.value.row, pos.value.column)
                            .filter((e, i, a) => {
                                fact = facts.grid[e.row][e.column];
                                return !fact.visited && fact.cloud == 1;
                            });
                    possibleHole.map((pos) => {
                        facts.grid[pos.row][pos.column].fact.hole = 1 / possibleHole.length;
                    });
                    pos = it.next();
                }
                return facts;
            }
        },
        {
            name: "cloud around hole",
            priority: 2,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array. accessible_from
                return (facts.grid[facts.hero.row][facts.hero.column].fact.hole == 1);
            },
            triggerOn: true,
            actions: function (facts) {
                facts.accessible_from.map((pos) => {
                    facts.grid[pos.row][pos.column].fact.cloud = 1;
                })
                return facts;
            }
        },
        {
            name: "portal is the last not visited",
            priority: 3,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array. accessible_from
                /* collect all non visited */
                var notVisited = [];
                var it = facts.gridIterator(game.rows, game.columns);
                var pos = it.next();
                var fact;
                while (!pos.done) {
                    fact = facts.grid[pos.value.row][pos.value.column].fact;
                    if (!fact.visited) {
                        notVisited.push({ row: pos.value.row, column: pos.value.column });
                    }
                    pos = it.next();
                } 
                return notVisited.length == 1;
            },
            triggerOn: true,
            actions: function (facts) {
                /* take the only one not visited */
                var notVisited;
                var it = facts.gridIterator(game.rows, game.columns);
                var pos = it.next();
                var fact;
                while (!pos.done) {
                    fact = facts.grid[pos.value.row][pos.value.column].fact;
                    if (!fact.visited) {
                        notVisited = { row: pos.value.row, column: pos.value.column };
                    }
                    pos = it.next();
                }
                facts.portal = notVisited;
                return facts;
            }
        },
        {
            name: "danger probabilities",
            priority: 4,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array
                return facts.hasOwnProperty('accessible_from') && facts.accessible_from.length > 0;
            },
            triggerOn: true,
            actions: function (facts) {
                facts.accessible_from.map((pos) => {
                    var fact = facts.grid[pos.row][pos.column].fact;
                    fact.danger = Math.max(fact.monster, fact.hole);
                })
                return facts;
            }
        },
        {
            name: "do not move to a hole if you are sure of its position",
            priority: 5,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array
                return facts.accessible_from
                    .reduce((acc, pos, i, arr) => {
                        return [facts.grid[pos.row][pos.column].fact].concat(acc);
                    }, [])
                    .some((fact) => {
                        return fact.hole == 1;
                    })
            },
            triggerOn: true,
            actions: function (facts) {
                facts.accessible_from = facts.accessible_from.filter((pos) => {
                    return facts.grid[pos.row][pos.column].certainNot('hole');
                });
                return facts;
            }
        },
        {
            name: "go to portal if you know where it is",
            priority: 6,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array
                return !facts.hasOwnProperty('action') && facts.hasOwnProperty('portal');
            },
            triggerOn: true,
            actions: function (facts) {
                facts.action = new Action(new Unit('hero', facts.hero.row, facts.hero.column, true)).move(facts.portal.row, facts.portal.column);
                return facts;
            }
        },
        {
            name: "discover new if danger is below threshold",
            priority: 6,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array
                var fact;
                var pos;
                if (!facts.hasOwnProperty('action')) {
                    for (var i = 0; i < facts.accessible_from.length; i++) {
                        pos = facts.accessible_from[i];
                        fact = facts.grid[pos.row][pos.column].fact;
                        if (!fact.visited && fact.danger <= facts.threshold) {
                            return true;
                        }
                    }
                }
                return false;
            },
            triggerOn: true,
            actions: function (facts) {
                var possible =
                    facts.accessible_from
                        .reduce((acc, pos, i, arr) => {
                            var fact = facts.grid[pos.row][pos.column].fact;
                            return !fact.visited && fact.danger <= facts.threshold ? [pos].concat(acc) : acc;
                        }, []);
                var posMinDanger = possible[0];
                var minDanger = facts.grid[posMinDanger.row][posMinDanger.column].fact.danger;
                for (var i = 1; i < possible.length; i++) {
                    var pos = possible[i];
                    var danger = facts.grid[pos.row][pos.column].fact.danger;
                    if (danger < minDanger) {
                        posMinDanger = pos;
                        minDanger = danger;
                    }
                }
                facts.action = new Action(new Unit('hero', facts.hero.row, facts.hero.column, true)).move(posMinDanger.row, posMinDanger.column);
                return facts;
            }
        },
        {
            name: "throws stone on monster",
            priority: 6,
            conditions: function (facts) { // flow = cardinal pos inside grid + danger coeff : Array
                var fact;
                var pos;
                if (!facts.hasOwnProperty('action')) {
                    for (var i = 0; i < facts.accessible_from.length; i++) {
                        pos = facts.accessible_from[i];
                        fact = facts.grid[pos.row][pos.column].fact;
                        if (!fact.visited && fact.monster >= facts.threshold) {
                            return true;
                        }
                    }
                }
                return false;
            },
            triggerOn: true,
            actions: function (facts) {
                /* collect positions */
                var possible =
                    facts.accessible_from
                        .reduce((acc, item, index, arr) => {
                            var fact = facts.grid[item.row][item.column].fact;
                            return fact.hasOwnProperty('monster') && fact.monster >= facts.threshold ? [item].concat(acc) : acc;
                        }, []);
                /* choose the most probable */
                var posMaxMonster = possible[0];
                var maxMonster = facts.grid[posMaxMonster.row][posMaxMonster.column].fact.monster;
                for (var i = 1; i < possible.length; i++) {
                    var pos = possible[i];
                    var monster = facts.grid[pos.row][pos.column].fact.monster;
                    if (monster < maxMonster) {
                        posMaxMonster = pos;
                        maxMonster = monster;
                    }
                }
                facts.action = new Action(new Unit('hero', facts.hero.row, facts.hero.column, true)).attack('monster', maxMonster.row, maxMonster.column);
                return facts;
            }
        },
        {
            name: "discover on border",
            priority: 6,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array
                return !facts.hasOwnProperty('action');
            },
            triggerOn: true,
            actions: function (facts) {
                /* collect all visited with non-visited neighbors = border */
                var nbMaxNeighbors = 0;
                var maxs = [];
                var count;
                var it = facts.gridIterator(game.rows, game.columns);
                var pos = it.next();
                var fact;
                while (!pos.done) {
                    count = countNeighborsNotVisited(pos.value.row, pos.value.column);
                    if (count == nbMaxNeighbors) maxs.push({ row: pos.value.row, column: pos.value.column });
                    if (count > nbMaxNeighbors) {
                        maxs = [{ row: pos.value.row, column: pos.value.column }];
                        nbMaxNeighbors = count;
                    }
                    pos = it.next();
                }
                var posMinDanger = maxs[0];
                var minDanger = facts.grid[posMinDanger.row][posMinDanger.column].fact.danger;
                for (var i = 1; i < maxs.length; i++) {
                    var pos = maxs[i];
                    var danger = facts.grid[pos.row][pos.column].fact.danger;
                    if (danger < minDanger) {
                        posMinDanger = pos;
                        minDanger = danger;
                    }
                }
                facts.action = new Action(new Unit('hero', facts.hero.row, facts.hero.column, true)).move(posMinDanger.row, posMinDanger.column);
                return facts;
            }
        },
        {
            name: "do not loop",
            priority: 6,
            conditions: function (facts) { // flow = cardinal pos inside grid : Array
                return !facts.hasOwnProperty('action');
            },
            triggerOn: true,
            actions: function (facts) {
                /* find visited with non-visited neighbors = border */
                var next;
                var it = facts.gridIterator(game.rows, game.columns);
                var pos = it.next();
                var fact;
                while (!pos.done) {
                    count = countNeighborsNotVisited(pos.value.row, pos.value.column);
                    if (count > 0) {
                        next = { row: pos.value.row, column: pos.value.column };
                        break;
                    }
                    pos = it.next();
                }
                facts.action = new Action(new Unit('hero', facts.hero.row, facts.hero.column, true)).move(next.row, next.column);
                return facts;
            }
        }        
    ];
    return new RuleEngine(rules);
}

function updateThreshold(facts) {
    var up = facts.learningRate * Math.tanh(facts.score);
    if (facts.threshold + up >= 0 && facts.threshold + up <= 1) {
        facts.threshold += up;
    }
}

function updateVue(facts) {
    vue.score = facts.score;
    vue.threshold = facts.threshold;
}

/* get action, execute it and update GUI */
function stepInfer() {
    var action = inferAction();
    if (action.action === "move") {
        facts.score -= 1;
        facts.hero.row = action.to.row;
        facts.hero.column = action.to.column;
    } else if (action.action == "attack") {
        facts.score -= 10;
    }
    game.doAction(action);
    delete facts.action;
    /* update threshold */
    updateThreshold(facts);
    updateVue(facts);
    game.show();
}

/* add fact, update score and returns infered action */
function inferAction() {
    var row = facts.hero.row;
    var column = facts.hero.column;
    var fact = facts.grid[row][column].fact;
    fact.visited = true;
    delete facts.portal;
    /* update certain fact */
    if (game.getUnitsAt("hole", row, column)) {
        facts.score -= 10 * game.rows * game.columns;
        fact.hole = 1;
        return new Action(new Unit('hero', row, column, true)).move(facts.initPos.row, facts.initPos.column);
    }
    if (game.getUnitsAt("monster", row, column)) {
        fact.monster = 1;
        facts.score -= 10 * game.rows * game.columns;
        return new Action(new Unit('hero', row, column, true)).move(facts.initPos.row, facts.initPos.column);
    }
    if (game.getUnitsAt("portal", row, column)) { // portal => nextGame
        facts.score += 10 * game.rows * game.columns;
        game = game.nextGame(); // does not reload the images
        initUnits(game);
        initFacts(game, facts.score, facts.learningRate, facts.threshold);
        return new Action(new Unit('hero', row, column, true)).move(facts.initPos.row, facts.initPos.column);
    }
    if (game.getUnitsAt("cloud", row, column)) {
        fact.cloud = 1;
    }
    if (game.getUnitsAt("rainbow", row, column)) {
        fact.rainbow = 1;
    }
    /* infer */
    ruleEngine.infer(facts);
    return facts.action;
}

