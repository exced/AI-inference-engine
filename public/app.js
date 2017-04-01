// Vue.config.debug = true;
var rows = 2;
var columns = 2;
var infer;
var facts;

var vue = new Vue({
    el: '#scores',
    data: {
        /* scoreboard */
        timer: '',
        score: 0
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
        startTimer(game.rows);
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
            score: 0,
            grid: fill2D(game.rows, game.columns, new Fact(fact))
        }
        ruleEngine = newRuleEngine();
    });
}

function startTimer(duration) {
    var timer = duration, minutes, seconds;
    var t = setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        vue.timer = minutes + ":" + seconds;
        if (--timer < 0) {
            clearInterval(t);
        }
    }, 1000);
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
                var flow = { row: row, column: column };
                return flow;
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
            name: "reduce next action",
            priority: 5,
            conditions: function (facts, flow) { // flow = cardinal pos inside grid + danger coeff : Array
                var res =
                    flow.accessible_from
                        .reduce((acc, item, index, arr) => {
                            return [facts.grid[item.row][item.column].fact].concat(acc);
                        }, [])
                        .every((e) => {
                            return e.hasOwnProperty('danger');
                        });
                return res;
            },
            triggerOn: true,
            actions: function (facts, flow) {
                /* throws stone if the attack cost and the move straight is cheaper than 
                avoiding the monster */
                
                /*
                var notVisited = flow.accessible_from
                    .filter((e) => {
                        return !facts.grid[e.row][e.column].fact.visited;
                    });
                    */
                return flow.accessible_from.reduce((acc, e, i, arr) => {
                    var fact = facts.grid[e.row][e.column].fact;
                    return fact.danger < acc.danger ? e : acc;
                }, { danger: Number.MAX_VALUE })
            }
        }
    ];
    return new RuleEngine(rules);
}

/* add fact */
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
    } else if (game.getUnitsAt("cloud", row, column)) {
        fact.cloud = 1;
    } else if (game.getUnitsAt("monster", row, column)) {
        fact.monster = 1;
        vue.score -= 10 * game.rows * game.columns;
        facts.score -= 10 * game.rows * game.columns;
    } else if (game.getUnitsAt("rainbow", row, column)) {
        fact.rainbow = 1;
    } else if (game.getUnitsAt("portal", row, column)) {
        vue.score += 10 * game.rows * game.columns;
        facts.score += 10 * game.rows * game.columns;
        fact.portal = 1;
    } else {
        fact.empty = 1;
    }
    fact.hero = 1;
    /* infer */
    var action = ruleEngine.infer(facts).action;
    fact.hero = 0;
    console.log("action " + JSON.stringify(action));
    game.doAction('hero', action);
    game.show();
}
