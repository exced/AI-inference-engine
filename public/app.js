/* Vue.config.debug = true; */

/* init grid GUI */
var sprites = {
    hero: "./assets/hero.png",
    hole: "./assets/hole.png",
    monster: "./assets/monster.png",
    portal: "./assets/portal.png",
    rainbow: "./assets/rainbow.png",
    cloud: "./assets/wind.png"
}
var images = {};
var gContext; // context game
var gContextK; // context knowledges
var height = screen.availHeight;
var nbRows = 10;
var nbCols = 10;
var kPieceWidth = ~~((height - 250) / nbCols);
var kPieceHeight = ~~((height - 250) / nbRows);
var kPixelWidth = 1 + (nbCols * this.kPieceWidth);
var kPixelHeight = 1 + (nbRows * this.kPieceHeight);
/* game vars */
var gameEnded = false;
var initPos = {};
var currentPosition = initPos;
var pathUser = [];
var nbMonsters = ~~((nbCols * nbRows) / 50);
var monsters = [];
var rainbows = [];
var nbHoles = ~~((nbCols * nbRows) / 50);
var holes = [];
var clouds = [];
var portal = {};
/* inference vars */
var facts;
var ruleEngine;

var game = new Vue({
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

/** Returns true if the tile position is valid, else false
 * @param {int} column
 * @param {int} row
 */
function isInsideGrid(position) {
    return (position.row >= 0 && position.row < nbRows) && (position.column >= 0 && position.column < nbCols);
}

function drawImage(ctx, img, column, row) {
    var x = (column * kPieceWidth);
    var y = (row * kPieceHeight);
    gContext.drawImage(images[img], x, y, kPieceWidth, kPieceHeight);
}

function drawCharacters(position) {
    /* hero */
    drawImage(gContext, "hero", position.column, position.row);
    /* portal */
    drawImage(gContext, "portal", portal.column, portal.row);
    /* monsters */
    monsters.map(function (pos) {
        drawImage(gContext, "monster", pos.column, pos.row);
    });
    /* rainbows */
    rainbows.map(function (pos) {
        drawImage(gContext, "rainbow", pos.column, pos.row);
    });
    /* holes */
    holes.map(function (pos) {
        drawImage(gContext, "hole", pos.column, pos.row);
    });
    /* clouds */
    clouds.map(function (pos) {
        drawImage(gContext, "cloud", pos.column, pos.row);
    });
}

function drawKnowledges() {
    gContextK.font = "10px Arial";
    knowledges.map(function (k) {
        var x = kPieceWidth * (1 + k.column) - kPieceWidth;
        var y = kPieceHeight * (1 + k.row);
        console.log("x " + x + " y " + y);
        gContextK.fillText(k.probMonster, x, y);
    })
}

function drawBoard(context) {
    context.clearRect(0, 0, kPixelWidth, kPixelHeight);
    context.beginPath();
    /* vertical lines */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
        context.moveTo(0.5 + x, 0);
        context.lineTo(0.5 + x, kPixelHeight);
    }
    /* horizontal lines */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
        context.moveTo(0, 0.5 + y);
        context.lineTo(kPixelWidth, 0.5 + y);
    }
    context.closePath();
    /* draw */
    context.strokeStyle = 'black';
    context.stroke();
}

function stepGame(newPosition) {
    game.score--;
    if (eqPos(newPosition, portal)) { // End of the game
        game.score += 10 * nbCols * nbRows;
        endGame();
    }
    if (isInsideGrid(newPosition)) {
        currentPosition = newPosition;
        pathUser.push(newPosition);
    }
    drawBoard(gContext);
    drawBoard(gContextK);
    drawCharacters(currentPosition);
    drawKnowledges();
}

document.addEventListener("keydown", function (e) {
    if (!gameEnded) {
        var newPosition = { column: currentPosition.column, row: currentPosition.row };
        if (e.keyCode == 39) { // Right
            newPosition.column += 1;
        }
        if (e.keyCode == 40) { // Down
            newPosition.row += 1;
        }
        if (e.keyCode == 39) { // Up
            newPosition.row -= 1;
        }
        if (e.keyCode == 37) { // Left
            newPosition.column -= 1;
        }
        stepGame(newPosition);
    }
}, false);

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = ~~(max);
    return ~~(Math.random() * (max - min + 1)) + min;
}

function endGame() {
    gameEnded = true;
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

function eqPos(pos1, pos2) {
    return pos1.column == pos2.column && pos1.row == pos2.row
}

function posCardinal(pos) {
    return [
        { column: pos.column, row: pos.row - 1 },
        { column: pos.column, row: pos.row + 1 },
        { column: pos.column - 1, row: pos.row },
        { column: pos.column + 1, row: pos.row }
    ];
}

function accessible_from(pos) {
    return pos.filter((p) => {
        return isInsideGrid(p);
    });
}

function newGame() {
    /* reset game vars */
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

function WindowLoad(event) {
    loadImages(sprites, function (imgs) {
        images = imgs;
        newGame();
    });
}
var Cert = { RAINBOWS: 0, MONSTERS: 1, HOLES: 2, VOID: 3, CLOUDS: 4 };
/* get and execute best action for current fact with inference engine */
function stepInfer() {
    var fact = {
        column: currentPosition.column,
        row: currentPosition.row,
        certitudes: []
    }

    game.score -= 1;

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
        newGame();
    } else {
        fact.certitudes.push(Cert.VOID);
    }
    /* update facts database */
    facts.add(fact);
    /* infer */
    var newPosition = ruleEngine.infer(facts);
    stepGame(newPosition);
}
