/* Vue.config.debug = true; */

/* init grid GUI */
var gContext;
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

function isInsideGrid(position) {
    return (position.row >= 0 && position.row < nbRows) && (position.column >= 0 && position.column < nbCols);
}

function drawCharacters(position) {
    /* unicorn */
    var imgUnicorn = new Image();
    imgUnicorn.onload = function () {
        // transform row / column to grid coords
        var x = (position.column * kPieceWidth);
        var y = (position.row * kPieceHeight);
        gContext.drawImage(imgUnicorn, x, y, kPieceWidth, kPieceHeight)
    }
    imgUnicorn.src = "./assets/unicorn.png";
    /* portal */
    var imgPortal = new Image();
    imgPortal.onload = function () {
        var x = (portal.column * kPieceWidth);
        var y = (portal.row * kPieceHeight);
        gContext.drawImage(imgPortal, x, y, kPieceWidth, kPieceHeight)
    }
    imgPortal.src = "./assets/portal.png";
    /* monsters */
    var imgMonster = new Image();
    imgMonster.onload = function () {
        monsters.map(function (pos) {
            var x = (pos.column * kPieceWidth);
            var y = (pos.row * kPieceHeight);
            gContext.drawImage(imgMonster, x, y, kPieceWidth, kPieceHeight)
        })
    }
    imgMonster.src = "./assets/monster.png";
    /* rainbows */
    var imgRainbow = new Image();
    imgRainbow.onload = function () {
        rainbows.map(function (pos) {
            var x = (pos.column * kPieceWidth);
            var y = (pos.row * kPieceHeight);
            gContext.drawImage(imgRainbow, x, y, kPieceWidth, kPieceHeight)
        })
    }
    imgRainbow.src = "./assets/rainbow.png";
    /* holes */
    var imgHole = new Image();
    imgHole.onload = function () {
        holes.map(function (pos) {
            var x = (pos.column * kPieceWidth);
            var y = (pos.row * kPieceHeight);
            gContext.drawImage(imgHole, x, y, kPieceWidth, kPieceHeight)
        })
    }
    imgHole.src = "./assets/hole.png";
    /* clouds */
    var imgCloud = new Image();
    imgCloud.onload = function () {
        clouds.map(function (pos) {
            var x = (pos.column * kPieceWidth);
            var y = (pos.row * kPieceHeight);
            gContext.drawImage(imgCloud, x, y, kPieceWidth, kPieceHeight)
        })
    }
    imgCloud.src = "./assets/cloud.png";
}

function drawBoard() {
    gContext.clearRect(0, 0, kPixelWidth, kPixelHeight);
    gContext.beginPath();
    /* vertical lines */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
        gContext.moveTo(0.5 + x, 0);
        gContext.lineTo(0.5 + x, kPixelHeight);
    }
    /* horizontal lines */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
        gContext.moveTo(0, 0.5 + y);
        gContext.lineTo(kPixelWidth, 0.5 + y);
    }
    gContext.closePath();
    /* draw */
    gContext.strokeStyle = 'black';
    gContext.stroke();
    drawCharacters(currentPosition);
}

function stepGame(newPosition) {
    score--;
    if (eqPos(newPosition, portal)) { // End of the game
        score += 10 * nbCols * nbRows;
        endGame();
    }
    if (isInsideGrid(newPosition)) {
        currentPosition = newPosition;
        pathUser.push(newPosition);
    }
    drawBoard();
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

    /* canvas */
    var canvas = document.getElementById('canvas');
    canvas.width = kPixelWidth;
    canvas.height = kPixelHeight;
    var context = canvas.getContext("2d");
    gContext = context;
    drawBoard();

    /* inference engine */
    initRules();
    /* infer_at */
    addRule(ruleInferAt());

    /* timer */
    startTimer(nbRows);
}

function WindowLoad(event) {
    newGame();
}

/* rules */
const cloudStr = 'cloud';
const rainbowStr = 'rainbow';
const monsterStr = 'monster';
const holeStr = 'hole';
const emptyStr = 'empty';
var rulesText = [];
var db;
/* editor */
var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.getSession().setMode("ace/mode/prolog");
editor.setReadOnly(true);

function initRules() {
    /* board rules */
    for (var i = 0; i < nbRows; i++) {
        for (var j = 0; j < nbCols; j++) {
            var p = posCardinal({ column: j, row: i })
            p.map(function (pos) {
                if (isInsideGrid(pos)) {
                    rulesText.push(ruleAccessibleFrom({ column: j, row: i }, pos));
                }
            });
        }
    }
    /* editor */
    rulesText.map(function (ruleText) {
        editor.insert(ruleText + ' \n');
    });
    /* knowledges */
    var rules = parser(lexer(rulesText.join(''))).parseRules();
    db = new Database(rules);
}

function addRule(ruleText) {
    if (!rulesText.includes(ruleText)) {
        db.addRule(parser(lexer(ruleText)).parseRules());
        editor.insert(ruleText + ' \n');
        rulesText.push(ruleText);
    }
}

/* inference AI */
/* rules :
 * at(unicorn|monster|cloud|rainbow|hole, case)
 * accessible_from(pos1, pos2)
*/
function posText(pos) {
    return 'pos(' + pos.column + ', ' + pos.row + ')';
}

function ruleAccessibleFrom(posTo, posFrom) {
    return 'accessible_from(' + posText(posTo) + ', ' + posText(posFrom) + ').';
}

function queryAccessibleFrom(posFrom) {
    var pos = [];
    var goalText = 'accessible_from(X, ' + posText(posFrom) + ')';
    var goal = parser(lexer(goalText)).parseTerm();
    var x = goal.args[0]; // variable X
    for (var item of db.query(goal)) {
        var col = goal.match(item).get(x).args[0].functor;
        var row = goal.match(item).get(x).args[1].functor;
        pos.push({ column: col, row: row });
    }
    return pos;
}

/* already visited */
function ruleAt(name, pos) {
    return 'at(' + name + ', ' + posText(pos) + ').';
}

function queryAt(pos) {
    var at = [];
    var goalText = 'at(X, ' + posToText(pos) + ')';
    var goal = parser(lexer(goalText)).parseTerm();
    var x = goal.args[0]; // variable X
    for (var item of db.query(goal)) {
        at.push(goal.match(item).get(x).functor);
    }
    return at;
}

/* infer at */
function ruleInferAt(pos) {
    return 'infer_at(X, Y) :- at(X, Z), accessible_from(Z, Y), accessible_from(Z,'+ posText(pos) + ').';
}

function queryInferAt(pos) {
    var xs = [];
    var ys = [];
    var goalText = ruleInferAt(pos);
    var goal = parser(lexer(goalText)).parseTerm();
    var x = goal.args[0]; // variable X
    var y = goal.args[1]; // variable Y
    for (var item of db.query(goal)) {
        xs.push(goal.match(item).get(x).functor);
    }
    for (var item of db.query(goal)) {
        ys.push(goal.match(item).get(y).functor);
    }    
    /* probabilities */
    return at;
}

/* get and execute best action for current state with inference engine */
function stepInfer() {
    /* choose action */
    pos = queryAccessibleFrom(currentPosition);
    /* decision making */
    var newPosition = pos[0];
    stepGame(newPosition);

    /* update knowledges, try to infer and update score */
    if (holes.findMatch(newPosition, eqPos)) {
        score -= 10 * nbRows * nbCols;
        addRule(ruleAt(holeStr, newPosition));
    }
    else if (clouds.findMatch(newPosition, eqPos)) {
        addRule(ruleAt(cloudStr, newPosition));
    }
    else if (monsters.findMatch(newPosition, eqPos)) {
        score -= 10 * nbRows * nbCols;
        addRule(ruleAt(monsterStr, newPosition));
    }
    else if (rainbows.findMatch(newPosition, eqPos)) {
        addRule(ruleAt(rainbowStr, newPosition));
    } else {
        addRule(ruleAt(emptyStr, newPosition));
    }
}
