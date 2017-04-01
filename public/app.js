// Vue.config.debug = true;
var rows = 2;
var columns = 2;
var infer;
var facts;
var threshold = 0.5; // decision making threshold : agent learns the best threshold to maximize the score.
var learningRate = 0.2;

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

/**
 * initialize facts
 */
function initFacts(game, learningRate, score, threshold) {
    var fact = {
        visited: false,
        hero: 0,
        rainbow: 0,
        monster: 0,
        hole: 0,
        cloud: 0,
        danger: 0,
        portal: 0
    };
    facts = {
        score: score,
        learningRate: learningRate,
        threshold: threshold,
        grid: fill2D(game.rows, game.columns, new Fact(fact))
    }
}

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
        initFacts(game, 0, threshold);
        ruleEngine = newRuleEngine();
    });
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
    /* add components */
    game.addUnitsAtRandom("hero", 1, false);
    game.addUnitsAtRandom("portal", 1, false);
    game.addUnitsAtRandom("monster", (~~(rows * columns) / 50), false);
    /* rainbows around monster */
    game.getUnits("monster").map((c) => {
        game.addUnitAround("rainbow", c.row, c.column, true);
    });
    game.addUnitsAtRandom("hole", ~~(rows * columns) / 50, false);
    /* clouds around hole */
    game.getUnits("hole").map((c) => {
        game.addUnitAround("cloud", c.row, c.column, true);
    });
    return game;
}

function countNeighborsNotVisited(row, column) {
    var neighbors = game.accessible_from(row, column);
    var count = 0;
    for (var n in neighbors) {
        if (facts.grid[n.row][n.column].fact.visited) {
            count++;
        }
    }
    return count;
}

function minDangerAround(row, column) {
    var minDangerAround = Number.MAX_VALUE;
    var danger;
    for (var around in game.accessible_from(row, column)) {
        danger = facts.grid[around.row][around.column].fact.danger
        if (danger < minDangerAround) {
            minDangerAround = danger;
        }
    }
    return minDangerAround;
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
            conditions: function (facts, flow) { // flow == null
                for (var r = 0; r < facts.grid.length; r++) {
                    for (var c = 0; c < facts.grid[0].length; c++) {
                        if (facts.grid[r][c].fact.hero == 1) {
                            return true;
                        }
                    }
                }
                return false;
            },
            triggerOn: true,
            actions: function (facts, flow) {
                var row;
                var column;
                for (var r = 0; r < facts.length; r++) {
                    for (var c = 0; c < facts.grid[0].length; c++) {
                        if (facts.grid[r][c].fact.hero == 1) {
                            row = r;
                            column = c;
                            break;
                        }
                    }
                }
                /* assert facts at hero position */
                var fact = facts.grid[row][column].fact;
                fact.visited = true;
                Object.values(fact).map((v) => {
                    if (typeof v === 'number' && v != 1) {
                        v = 0;
                    }
                })
                return { row: row, column: column };
            }
        },
        {
            name: "accessible cardinal positions",
            priority: 1,
            conditions: function (facts, flow) { // flow == hero position { row: r, column: c}
                return flow.hasOwnProperty('row') && flow.hasOwnProperty('column');
            },
            triggerOn: true,
            actions: function (facts, flow) {
                flow.accessible_from = game.accessible_from(flow.row, flow.column);
                return flow;
            }
        },
        {
            name: "empty is safe",
            priority: 2,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid : Array
                return (facts.grid[flow.row][flow.column].fact.empty == 1);
            },
            triggerOn: true,
            actions: function (facts, flow) {
                facts.grid[flow.row][flow.column].fact.danger = 0;
                return flow;
            }
        },
        {
            name: "monster around rainbow",
            priority: 2,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid : Array
                return (facts.grid[flow.row][flow.column].fact.rainbow == 1);
            },
            triggerOn: true,
            actions: function (facts, flow) {
                var possibleMonster =
                    flow.accessible_from
                        .filter((e, i, a) => {
                            var fact = facts.grid[e.row][e.column].fact;
                            return !fact.certainNot('monster');
                        });
                possibleMonster.map((pos) => {
                    facts.grid[pos.row][pos.column].fact.monster = 1 / possibleMonster.length;
                });
                return flow;
            }
        },
        {
            name: "rainbow around monster",
            priority: 2,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid : Array
                return (facts.grid[flow.row][flow.column].fact.monster == 1);
            },
            triggerOn: true,
            actions: function (facts, flow) {
                flow.accessible_from.map((pos) => {
                    facts.grid[pos.row][pos.column].fact.rainbow = 1;
                })
                return flow;
            }
        },
        {
            name: "hole around cloud",
            priority: 2,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid : Array
                return (facts.grid[flow.row][flow.column].fact.cloud == 1);
            },
            triggerOn: true,
            actions: function (facts, flow) {
                var possibleHole =
                    flow.accessible_from
                        .filter((e, i, a) => {
                            var fact = facts.grid[e.row][e.column].fact;
                            return !fact.certainNot('hole');
                        });
                possibleHole.map((pos) => {
                    facts.grid[pos.row][pos.column].fact.hole = 1 / possibleHole.length;
                });
                return flow;
            }
        },
        {
            name: "cloud around hole",
            priority: 2,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid : Array
                return (facts.grid[flow.row][flow.column].fact.hole == 1);
            },
            triggerOn: true,
            actions: function (facts, flow) {
                flow.accessible_from.map((pos) => {
                    facts.grid[pos.row][pos.column].fact.cloud = 1;
                })
                return flow;
            }
        },
        {
            name: "portal is the last not visited",
            priority: 3,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid : Array
                return true;
            },
            triggerOn: true,
            actions: function (facts, flow) {
                var notVisited = [];
                for (var r = 0; r < facts.grid.length; r++) {
                    for (var c = 0; c < facts.grid[0].length; c++) {
                        if (!facts.grid[r][c].fact.visited) {
                            notVisited.concat({ row: r, column: c });
                        }
                    }
                }
                if (notVisited.length == 1) {
                    facts.grid[notVisited[0].row][notVisited[0].column].fact.portal = 1;
                }
                return flow;
            }
        },
        {
            name: "danger probabilities",
            priority: 4,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid : Array
                return true;
            },
            triggerOn: true,
            actions: function (facts, flow) {
                flow.accessible_from.map((pos) => {
                    var fact = facts.grid[pos.row][pos.column].fact;
                    fact.danger = Math.max(fact.monster, fact.hole);
                })
                return flow;
            }
        },
        {
            name: "do not move to a hole if you are sure of its position",
            priority: 5,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid : Array
                return true;
            },
            triggerOn: true,
            actions: function (facts, flow) {
                flow.accessible_from = flow.accessible_from.filter((pos) => {
                    return facts.grid[pos.row][pos.column].fact.certainNot('hole');
                });
                return flow;
            }
        },
        {
            name: "discover new if danger is below threshold",
            priority: 6,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid : Array
                return flow.accessible_from
                    .reduce((acc, pos, i, arr) => {
                        return [facts.grid[pos.row][pos.column].fact].concat(acc);
                    }, [])
                    .filter((fact) => {
                        return !fact.visited;
                    })
                    .some((fact) => {
                        return fact.danger <= facts.threshold;
                    });
            },
            triggerOn: true,
            actions: function (facts, flow) {
                var possible =
                    flow.accessible_from
                        .reduce((acc, pos, i, arr) => {
                            var fact = facts.grid[pos.row][pos.column].fact;
                            return !fact.visited && fact.danger <= facts.threshold ? [item].concat(acc) : acc;
                        }, []);
                var posMinDanger = possible[0];
                var minDanger = facts.grid[posMinDanger.row][posMinDanger.column].fact.danger;
                for (var i = 1; i < possible.length; i++) {
                    var pos = possible[i];
                    var danger = facts.grid[pos.row][pos.columns].fact.danger;
                    if (danger < minDanger) {
                        posMinDanger = pos;
                        minDanger = danger;
                    }
                }
                return new Action('hero').move(facts.row, facts.column, posMinDanger.row, posMinDanger.column);
            }
        },
        {
            name: "throws stone on monster",
            priority: 6,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid + danger coeff : Array
                var res =
                    flow.accessible_from
                        .reduce((acc, item, index, arr) => {
                            return [facts.grid[item.row][item.column].fact].concat(acc);
                        }, [])
                        .some((e) => {
                            return e.hasOwnProperty('monster') && e.monster >= facts.threshold;
                        });
                return res;
            },
            triggerOn: true,
            actions: function (facts, flow) {
                /* collect positions */
                var possible =
                    flow.accessible_from
                        .reduce((acc, item, index, arr) => {
                            var fact = facts.grid[item.row][item.column].fact;
                            return fact.hasOwnProperty('monster') && fact.monster >= facts.threshold ? [item].concat(acc) : acc;
                        }, []);
                /* choose the most probable */
                var posMaxMonster = possible[0];
                var maxMonster = facts.grid[posMaxMonster.row][posMaxMonster.column].fact.monster;
                for (var i = 1; i < possible.length; i++) {
                    var pos = possible[i];
                    var monster = facts.grid[pos.row][pos.columns].fact.monster;
                    if (monster < maxMonster) {
                        posMaxMonster = pos;
                        maxMonster = monster;
                    }
                }
                return new Action('hero').attack('monster', maxMonster.row, maxMonster.column);
            }
        },
        {
            name: "go back to safe",
            priority: 6,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid : Array
                return true;
            },
            triggerOn: true,
            actions: function (facts, flow) {
                /* collect all visited with non-visited neighbors */
                var nbMaxNeighbors = 0;
                var count;
                for (var r = 0; r < facts.rows; r++) {
                    for (var c = 0; c < facts.columns; c++) {
                        count = countNeighborsNotVisited(r, c);
                        if (count >= 0) {
                            if (count > nbMaxNeighbors) {
                                nbMaxNeighbors = count;
                            }
                        }
                    }
                }
                var minDangerAround = Number.MAX_VALUE;
                var min = Number.MAX_VALUE;
                var posMinDangerAround;
                /* filter max non visited */
                for (var r = 0; r < facts.rows; r++) {
                    for (var c = 0; c < facts.columns; c++) {
                        count = countNeighborsNotVisited(r, c);
                        if (count == nbMaxNeighbors) {
                            min = minDangerAround(r, c);
                            if (min < minDangerAround) {
                                minDangerAround = min;
                                posMinDangerAround = { row: r, column: c };
                            }
                        }
                    }
                }
                return new Action('hero').move(facts.row, facts.column, minDangerAround.row, minDangerAround.column);
            }
        }
    ];
    return new RuleEngine(rules);
}

function updateThreshold(facts) {
    var up = facts.learningRate * Math.tanh(facts.score);
    if (!(facts.threshold - up < 0 || facts.threshold - up > 1)) {
        facts.threshold -= up;
    }
}

/* add fact, update score, do the infered action */
function stepInfer() {
    var hero = game.getUnits("hero")[0];
    var row = hero.row;
    var column = hero.column;
    var fact = facts.grid[row][column].fact;
    /* update certain fact */
    if (game.getUnitsAt("hole", row, column)) {
        vue.score -= 10 * game.rows * game.columns;
        facts.score -= 10 * game.rows * game.columns;
        fact.hole = 1;
        game.doAction(new Action('hero').move(row, column, game.initPos.row, game.initPos.column));
    } else if (game.getUnitsAt("cloud", row, column)) {
        fact.cloud = 1;
    } else if (game.getUnitsAt("monster", row, column)) {
        fact.monster = 1;
        vue.score -= 10 * game.rows * game.columns;
        facts.score -= 10 * game.rows * game.columns;
        game.doAction(new Action('hero').move(row, column, game.initPos.row, game.initPos.column));
    } else if (game.getUnitsAt("rainbow", row, column)) {
        fact.rainbow = 1;
    } else if (game.getUnitsAt("portal", row, column)) {
        vue.score += 10 * game.rows * game.columns;
        facts.score += 10 * game.rows * game.columns;
        game = game.nextGame();
        initFacts(game, facts.learningRate, facts.score, facts.threshold);
    } else {
        fact.empty = 1;
    }
    fact.hero = 1;
    /* update threshold */
    updateThreshold(facts);
    /* infer */
    var action = ruleEngine.infer(facts).action;
    fact.hero = 0;
    console.log("action " + JSON.stringify(action));
    if (action.action == "move") {
        facts.score -= 1;
    } else if (action.action == "attack") {
        facts.score -= 10;
    }
    game.doAction('hero', action);
    game.show();
}

