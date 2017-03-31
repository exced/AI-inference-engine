// Vue.config.debug = true;
var rows = 2;
var columns = 2;
var infer;
var facts;
var Cert = { RAINBOW: 0, MONSTER: 1, CLOUD: 2, HOLE: 3, VOID: 4 };

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
        var images = imgs;
        game = newGame(images, rows + 1, columns + 1);
        game.show();
        startTimer(game.rows);
        facts = fill2D(game.rows, game.columns, { certitudes: [] });
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
    game.addUnitsAtRandom("hero", 1, true);
    game.addUnitsAtRandom("portal", 1, false);
    game.addUnitsAtRandom("monster", (~~(rows * columns) / 50), false);
    /* rainbows around monster */
    game.getUnits("monster").map((c) => {
        addUnitAround("rainbow", c.row, c.column, true);
    });
    game.addUnitsAtRandom("hole", ~~(rows * columns) / 50, false);
    /* clouds around hole */
    game.getUnits("hole").map((c) => {
        addUnitAround("cloud", c.row, c.column, true);
    });
    return game;
}

function newRuleEngine() {
    /* rules + facts */
    var rules = [
        {
            name: "cardinal positions",
            priority: 1,
            condition: function (pre) {
                return true;
            },
            triggerOn: true,
            actions: function (facts, pos) {
                return posCardinal(this.facts.currentPosition);
            }
        },
        {
            name: "is inside grid",
            priority: 2,
            condition: function (pre) {
                return true;
            },
            triggerOn: true,
            actions: function (facts, pos) {
                return post.filter((p) => {
                    return isInsideGrid(p);
                })
            }
        },
        {
            name: "monster around rainbow",
            priority: 3,
            condition: function (pre) {
                return pre.length >= 1;
            },
            triggerOn: true,
            actions: function (facts, pos) {
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
            condition: function (pre) {
                return pre.length >= 1;
            },
            triggerOn: true,
            actions: function (facts, pos) {
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
            condition: function (pre) {
                return pre.length >= 1;
            },
            triggerOn: true,
            actions: function (facts, pos) {

                return;
            }
        },
    ];
    return new RuleEngine(rules);
}

/* add fact */
function stepInfer(game) {
    var hero = game.getUnits("hero")[0];
    var row = hero.row;
    var column = hero.column;
    var certitudes = [];
    /* update certain fact */
    if (game.getUnitsAt("hole", row, column).length >= 0) {
        vue.score -= 10 * game.rows * game.columns;
        certitudes.push(Cert.HOLE);
    } else if (game.getUnitsAt("cloud", row, column).length >= 0) {
        certitudes.push(Cert.CLOUD);
    } else if (game.getUnitsAt("monster", row, column).length >= 0) {
        vue.score -= 10 * game.rows * game.columns;
        certitudes.push(Cert.MONSTER);
    } else if (game.getUnitsAt("rainbow", row, column).length >= 0) {
        certitudes.push(Cert.RAINBOW);
    } else if (game.getUnitsAt("portal", row, column).length >= 0) {
        vue.score += 10 * game.rows * game.columns;
        newGame(game.rows, game.columns);
    } else {
        certitudes.push(Cert.VOID);
    }
    /* update facts database */
    facts[row][column].certitudes = certitudes;
    /* infer */
    var newPosition = ruleEngine.infer(facts);
    stepGame(newPosition);
}
