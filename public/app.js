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
            rainbow: 0,
            monster: 0,
            hole: 0,
            cloud: 0,
            portal: 0
        };
        facts = {
            hero: {},
            grid: fill2D(game.rows, game.columns, fact)
        };
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

function* gridIterator(rows, cols) {
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            yield { row: r, column: c };
        }
    }
}

function newRuleEngine() {
    /* rules + facts */
    /* rules have priority representing "step". Each rule is tested. Each step apply its conditions
    on the result of the previous "step" result (modified by previous actions). Warn with the dimensions and
    the attributes of the flow (chain of objects). The entrypoint is a matrix of facts.
    */
    var rules = [
        {
            name: "hero position",
            priority: 0,
            condition: function (facts, flow) {
                return facts.hasOwnProperty('hero');
            },
            triggerOn: true,
            actions: function (facts, flow) {
                return facts.hero;
            }
        },
        {
            name: "cardinal positions",
            priority: 1,
            condition: function (facts, flow) {
                return true;
            },
            triggerOn: true,
            actions: function (facts, flow) {
                return game.posCardinal(this.facts.currentPosition);
            }
        },
        {
            name: "is inside grid",
            priority: 2,
            condition: function (facts, flow) {
                return true;
            },
            triggerOn: true,
            actions: function (facts, flow) {
                return post.filter((p) => {
                    return isInsideGrid(p);
                })
            }
        },
        {
            name: "monster around rainbow",
            priority: 3,
            condition: function (facts) {
                return pre.length >= 1;
            },
            triggerOn: true,
            actions: function (facts) {
                if (!facts[pos.row][pos.column].contains(Cert.MONSTERS)) {
                    var nb = 0;
                    for (var i = 0; i < facts.length; i++) {
                        if (this.facts.certitudes == Cert.RAINBOW) {
                            nb++;
                        }
                    }
                    if (nb == facts.length) {
                        facts[pos.row][pos.column].certitudes.push(Cert.MONSTERS);
                    }
                }
                return nb / facts.length;
            }
        },
        {
            name: "hole around cloud",
            priority: 3,
            condition: function (facts) {
                return pre.length >= 1;
            },
            triggerOn: true,
            actions: function (facts) {
                var nb = 0;
                for (var i = 0; i < facts.length; i++) {
                    if (this.facts.certitudes == Cert.CLOUDS) {
                        nb++;
                    }
                }
                if (nb == facts.length) {
                    facts[pos.row][pos.column].certitudes.push(Cert.HOLES);
                }
                return nb / facts.length;
            }
        },
        {
            name: "max probability",
            priority: 4,
            condition: function (facts) {
                return pre.length >= 1;
            },
            triggerOn: true,
            actions: function (facts) {

                return;
            }
        },
        {
            name: "certainty propagation",
            priority: 4,
            condition: function (facts) {
                return facts.some((e, i, arr) => {
                    return !e.visited && Object.values(e).some((e1, i1, arr1) => {
                        return e1 == 1;
                    })
                });
            },
            triggerOn: true,
            actions: function (facts) {
                return facts.findIndex((e, i, arr) => {
                    return !e.visited && Object.values(e).some((e1, i1, arr1) => {
                        return e1 == 1;
                    })
                });
            }
        },
    ];
    return new RuleEngine(rules);
}

/* add fact */
function stepInfer() {
    var hero = game.getUnits("hero")[0];
    var row = hero.row;
    var column = hero.column;
    var fact = facts.grid[row][column];
    facts.hero = hero;
    console.log("FACTS");
    console.log(facts);
    /* update certain fact */
    if (game.getUnitsAt("hole", row, column)) {
        vue.score -= 10 * game.rows * game.columns;
        fact.hole = 1;
    } else if (game.getUnitsAt("cloud", row, column)) {
        fact.cloud = 1;
    } else if (game.getUnitsAt("monster", row, column)) {
        vue.score -= 10 * game.rows * game.columns;
    } else if (game.getUnitsAt("rainbow", row, column)) {
        fact.rainbow = 1;
    } else if (game.getUnitsAt("portal", row, column)) {
        vue.score += 10 * game.rows * game.columns;
        fact.portal = 1;
    } else {
        fact.empty = 1;
    }
    /* update facts database */
    fact.visited = true;
    /* copy */
    var factsCopy = JSON.parse(JSON.stringify(facts));
    /* infer */
    var newPosition = ruleEngine.infer(factsCopy);
    stepGame(newPosition);
}
