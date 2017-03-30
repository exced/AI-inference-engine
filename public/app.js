// Vue.config.debug = true;

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
    var game = newGame();
    game.init();
    game.show();
}

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

var gameComponents = {
    monster: new Component(),
};
var gameDatas = {
    gameEnded: false,
    initPos: {},
    currentPosition: initPos,
    pathUser: []
}
var game = new Game(gameGrid, gameVue);

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

function newGame() {
    var sprites = {
        hero: "./assets/hero.png",
        hole: "./assets/hole.png",
        monster: "./assets/monster.png",
        portal: "./assets/portal.png",
        rainbow: "./assets/rainbow.png",
        cloud: "./assets/wind.png"
    }
    /* game vars */
    initPos = { column: getRandomIntInclusive(0, nbCols - 1), row: getRandomIntInclusive(0, nbRows - 1) };
    currentPosition = initPos;
    pathUser = [];
    nbMonsters = ~~((nbCols * nbRows) / 50);
    monsters = [];
    rainbows = [];
    nbHoles = ~~((nbCols * nbRows) / 50);
    holes = [];
    clouds = [];
    gameEnded = false;
    knowledges = [];

    /* portal position */
    do { // Not on initPos
        rand = { column: getRandomIntInclusive(0, nbCols - 1), row: getRandomIntInclusive(0, nbRows - 1) };
    } while (eqPos(rand, initPos))
    portal = { column: rand.column, row: rand.row };

    /* generate random monsters */
    for (var i = 0; i < nbMonsters; i++) {
        var rand;
        do { // Not on initPos || portal || monsters
            rand = { column: getRandomIntInclusive(0, nbCols - 1), row: getRandomIntInclusive(0, nbRows - 1) };
        } while (eqPos(rand, initPos) || eqPos(rand, portal) || monsters.findMatch(rand, eqPos))
        monsters.push({ column: rand.column, row: rand.row });
    }

    /* generate random holes */
    for (var i = 0; i < nbHoles; i++) {
        var rand;
        do { // Not on initPos || portal || monsters || holes
            rand = { column: getRandomIntInclusive(0, nbCols - 1), row: getRandomIntInclusive(0, nbRows - 1) };
        } while (eqPos(rand, initPos) || eqPos(rand, portal) || monsters.findMatch(rand, eqPos) || holes.findMatch(rand, eqPos))
        holes.push({ column: rand.column, row: rand.row });
    }

    /* generate rainbows : N/S/W/E for each monsters */
    monsters.map(function (pos) {
        var card = posCardinal(pos);
        card.map(function (c) {
            if (isInsideGrid(c) && !eqPos(c, initPos) && !eqPos(c, portal) && !monsters.findMatch(c, eqPos)
                && !holes.findMatch(c, eqPos) && !clouds.findMatch(c, eqPos) && !rainbows.findMatch(c, eqPos)) {
                rainbows.push(c);
            }
        })
    })

    /* generate clouds : N/S/W/E for each holes */
    holes.map(function (pos) {
        var card = posCardinal(pos);
        card.map(function (c) {
            if (isInsideGrid(c) && !eqPos(c, initPos) && !eqPos(c, portal) && !monsters.findMatch(c, eqPos)
                && !holes.findMatch(c, eqPos) && !clouds.findMatch(c, eqPos) && !rainbows.findMatch(c, eqPos)) {
                clouds.push(c);
            }
        })
    })

    /* canvasGame */
    var canvas = document.getElementById('canvas');
    canvas.width = kPixelWidth;
    canvas.height = kPixelHeight;
    var context = canvas.getContext("2d");
    gContext = context;
    drawBoard(gContext);
    drawCharacters(currentPosition);

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
