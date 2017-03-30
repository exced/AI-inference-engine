// Vue.config.debug = true;

var gameVue = new Vue({
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

/**
 * Create and run a new game
 * @param {Event} window event 
 */
function WindowLoad(event) {
    var game = newGame(10, 10, 0.02, 0.02);
    game.init();
    game.show();
}

function startTimer(duration) {
    var timer = duration, minutes, seconds;
    var t = setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        game.timer = minutes + ":" + seconds;
        if (--timer < 0 || game.gameEnded) {
            clearInterval(t);
            endGame();
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
function newGame(rows, columns, monstersRatio, holesRatio) {
    /* game */
    var sprites = {
        grey: "./assets/grey.png",
        hero: "./assets/hero.png",
        hole: "./assets/hole.png",
        monster: "./assets/monster.png",
        portal: "./assets/portal.png",
        rainbow: "./assets/rainbow.png",
        cloud: "./assets/wind.png"
    }
    /* canvas */
    var gameCanvas = document.getElementById('canvas');
    /* datas */
    var gameDatas = {
        gameEnded: false,
        path: []
    }
    var game = new Game(gameCanvas, rows, columns, gameDatas, gameUnits);
    /* add components */
    game.addComponentsAtRandom("hero", 1, false);
    game.addComponentsAtRandom("portal", 1, false);
    game.addComponentsAtRandom("monster", monstersRatio * (rows * columns), false);
    /* rainbows around monster */
    game.getUnitsOf("monster").map((c) => {
        addComponentAround("rainbow", c.row, c.column, false);
    });
    game.addComponentsAtRandom("hole", holesRatio * (rows * columns), false);
    /* clouds around hole */
    game.getUnitsOf("hole").map((c) => {
        addComponentAround("cloud", c.row, c.column, false);
    });

    /* canvasKnowledges */
    var canvasK = document.getElementById('canvasK');
    canvasK.width = kPixelWidth;
    canvasK.height = kPixelHeight;
    var contextK = canvasK.getContext("2d");
    gContextK = contextK;
    drawBoard(gContextK);
    drawKnowledges();

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

    /* rule engine */
    ruleEngine = new RuleEngine(rules);

    facts = new Facts([], eqPos);

    /* timer */
    startTimer(nbRows);
}


var Cert = { RAINBOWS: 0, MONSTERS: 1, HOLES: 2, VOID: 3, CLOUDS: 4 };
/* get and execute best action for current fact with inference engine */
function stepInfer() {
    var fact = {
        column: currentPosition.column,
        row: currentPosition.row,
        certitudes: []
    }

    game.score--;

    /* update certain fact */
    if (holes.findMatch(currentPosition, eqPos)) {
        game.score -= 10 * nbRows * nbCols;
        fact.certitudes.push(Cert.HOLES);
    } else if (clouds.findMatch(currentPosition, eqPos)) {
        fact.certitudes.push(Cert.CLOUDS);
    } else if (monsters.findMatch(currentPosition, eqPos)) {
        game.score -= 10 * nbRows * nbCols;
        fact.certitudes.push(Cert.MONSTERS);
    } else if (rainbows.findMatch(currentPosition, eqPos)) {
        fact.certitudes.push(Cert.RAINBOWS);
    } else if (eqPos(currentPosition, portal)) {
        game.score += 10 * nbCols * nbRows;
        newGame();
    } else {
        fact.certitudes.push(Cert.VOID);
    }
    /* update facts database */
    facts.add(fact);
    /* infer */
    var newPosition = ruleEngine.infer(facts);
<<<<<<< HEAD
    stepGame(newPosition);
=======
    for (var i = 0; i < rs.length; i++) {
        console.log(JSON.stringify(rs[i]));
    }

    if (isInsideGrid(newPosition)) {
        currentPosition = newPosition;
        pathUser.push(newPosition);
    }
    drawBoard(gContext);
    drawBoard(gContextK);
    drawCharacters(currentPosition);
    drawKnowledges();
>>>>>>> 9d3e528da98d86acd8ce106a8e31be0ee61860b4
}
