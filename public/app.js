/* Vue.config.debug = true; */

/* init grid GUI */
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
var knowledges = [];
var rules = [];

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

function drawCharacters(position) {
    /* hero */
    var imgHero = new Image();
    imgHero.onload = function () {
        // transform row / column to grid coords
        var x = (position.column * kPieceWidth);
        var y = (position.row * kPieceHeight);
        gContext.drawImage(imgHero, x, y, kPieceWidth, kPieceHeight)
    }
    imgHero.src = "./assets/hero.png";
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
    imgCloud.src = "./assets/wind.png";
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
    var accessibles = [];
    posCardinal(pos).map(function (p) {
        isInsideGrid(p)
        accessibles.push(p)
    })
    return accessibles;
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

    /* rules + knowledges */


    /* timer */
    startTimer(nbRows);
}

function WindowLoad(event) {
    newGame();
}

/* inference AI */
/* get and execute best action for current state with inference engine */
function stepInfer() {
    /* decision making */
    var newPosition = null;
    stepGame(newPosition);

    /* update knowledges, try to infer and update score */
    if (holes.findMatch(newPosition, eqPos)) {
        game.score -= 10 * nbRows * nbCols;

    }
    else if (clouds.findMatch(newPosition, eqPos)) {

    }
    else if (monsters.findMatch(newPosition, eqPos)) {
        game.score -= 10 * nbRows * nbCols;

    }
    else if (rainbows.findMatch(newPosition, eqPos)) {

    } else {

    }
}
