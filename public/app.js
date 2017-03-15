/* Vue.config.debug = true; */

/* init grid GUI */
var gContext;
var height = screen.availHeight;
var nbRows = 10;
var nbCols = 10;
var kPW = ~~((height - 250) / nbCols);
var kPH = ~~((height - 250) / nbRows);
var kPiW = 1 + (nbCols * this.kPW);
var kPiH = 1 + (nbRows * this.kPH);
/* game vars */
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
        /* gameboard */
        nbRows: nbRows,
        nbCols: nbCols,
        kPieceWidth: kPW,
        kPieceHeight: kPH,
        kPixelWidth: kPiW,
        kPixelHeight: kPiH,
        /* scoreboard */
        timer: '',
        gameEnded: false,
        score: 0
    },
    computed: {
    },
    methods: {
        newGame: function () {
            newGame();
        },
        updateGrid: function () {
            this.kPieceWidth = ~~((height - 250) / this.nbCols);
            this.kPieceHeight = ~~((height - 250) / this.nbRows);
            this.kPixelWidth = 1 + (this.nbRows * this.kPieceWidth);
            this.kPixelHeight = 1 + (this.nbCols * this.kPieceHeight);
            newGame();
        }
    }
});

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', WindowLoad, false);
}
else if (window.attachEvent) { // IE
    window.attachEvent('onload', WindowLoad);
}

function isInsideGrid(position) {
    return (position.row >= 0 && position.row < game.nbRows) && (position.column >= 0 && position.column < game.nbCols);
}

function drawCharacters(position) {
    /* unicorn */
    var imgUnicorn = new Image();
    imgUnicorn.onload = function () {
        // transform row / column to grid coords
        var x = (position.column * game.kPieceWidth);
        var y = (position.row * game.kPieceHeight);
        gContext.drawImage(imgUnicorn, x, y, game.kPieceWidth, game.kPieceHeight)
    }
    imgUnicorn.src = "./assets/unicorn.png";
    /* portal */
    var imgPortal = new Image();
    imgPortal.onload = function () {
        var x = (portal.column * game.kPieceWidth);
        var y = (portal.row * game.kPieceHeight);
        gContext.drawImage(imgPortal, x, y, game.kPieceWidth, game.kPieceHeight)
    }
    imgPortal.src = "./assets/portal.png";
    /* monsters */
    var imgMonster = new Image();
    imgMonster.onload = function () {
        monsters.map(function (pos) {
            var x = (pos.column * game.kPieceWidth);
            var y = (pos.row * game.kPieceHeight);
            gContext.drawImage(imgMonster, x, y, game.kPieceWidth, game.kPieceHeight)
        })
    }
    imgMonster.src = "./assets/monster.png";
    /* rainbows */
    var imgRainbow = new Image();
    imgRainbow.onload = function () {
        rainbows.map(function (pos) {
            var x = (pos.column * game.kPieceWidth);
            var y = (pos.row * game.kPieceHeight);
            gContext.drawImage(imgRainbow, x, y, game.kPieceWidth, game.kPieceHeight)
        })
    }
    imgRainbow.src = "./assets/rainbow.png";
    /* holes */
    var imgHole = new Image();
    imgHole.onload = function () {
        holes.map(function (pos) {
            var x = (pos.column * game.kPieceWidth);
            var y = (pos.row * game.kPieceHeight);
            gContext.drawImage(imgHole, x, y, game.kPieceWidth, game.kPieceHeight)
        })
    }
    imgHole.src = "./assets/hole.png";
    /* clouds */
    var imgCloud = new Image();
    imgCloud.onload = function () {
        clouds.map(function (pos) {
            var x = (pos.column * game.kPieceWidth);
            var y = (pos.row * game.kPieceHeight);
            gContext.drawImage(imgCloud, x, y, game.kPieceWidth, game.kPieceHeight)
        })
    }
    imgCloud.src = "./assets/cloud.png";
}

function drawBoard() {
    gContext.clearRect(0, 0, game.kPixelWidth, game.kPixelHeight);
    gContext.beginPath();
    /* vertical lines */
    for (var x = 0; x <= game.kPixelWidth; x += game.kPieceWidth) {
        gContext.moveTo(0.5 + x, 0);
        gContext.lineTo(0.5 + x, game.kPixelHeight);
    }
    /* horizontal lines */
    for (var y = 0; y <= game.kPixelHeight; y += game.kPieceHeight) {
        gContext.moveTo(0, 0.5 + y);
        gContext.lineTo(game.kPixelWidth, 0.5 + y);
    }
    gContext.closePath();
    /* draw */
    gContext.strokeStyle = 'black';
    gContext.stroke();
    drawCharacters(currentPosition);
}

document.addEventListener("keydown", function (e) {
    if (!game.gameEnded) {
        var newPosition = { column: currentPosition.column, row: currentPosition.row };
        if (e.keyCode == 68 || e.keyCode == 39) { // D or Right
            newPosition.column += 1;
        }
        if (e.keyCode == 83 || e.keyCode == 40) { // S or Down
            newPosition.row += 1;
        }
        if (e.keyCode == 87 || e.keyCode == 39) { // W or Up
            newPosition.row -= 1;
        }
        if (e.keyCode == 65 || e.keyCode == 37) { // A or Left
            newPosition.column -= 1;
        }
        if (newPosition.column == game.nbCols - 1 && newPosition.row == game.nbRows - 1) { // End of the game
            endGame();
        }
        if (isInsideGrid(newPosition)) {
            pathUser.push(newPosition);
        }
        drawBoard();
    }
}, false);

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = ~~(max);
    return ~~(Math.random() * (max - min + 1)) + min;
}

function endGame() {
    game.gameEnded = true;
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

function pushCardinal(array, pos) {
    var card = [
        { column: pos.column, row: pos.row - 1 },
        { column: pos.column, row: pos.row + 1 },
        { column: pos.column - 1, row: pos.row },
        { column: pos.column + 1, row: pos.row }
    ];
    card.map(function (c) {
        if (isInsideGrid(c) && !eqPos(c, initPos) && !eqPos(c, portal) && !monsters.findMatch(c, eqPos)
            && !holes.findMatch(c, eqPos) && !clouds.findMatch(c, eqPos) && !rainbows.findMatch(c, eqPos)) {
            array.push(c);
        }
    })
}

function newGame() {
    /* reset game vars */
    initPos = { column: getRandomIntInclusive(0, game.nbCols - 1), row: getRandomIntInclusive(0, game.nbRows - 1) };
    currentPosition = initPos;
    pathUser = [];
    nbMonsters = ~~((nbCols * nbRows) / 50);
    monsters = [];
    rainbows = [];
    nbHoles = ~~((nbCols * nbRows) / 50);
    holes = [];
    clouds = [];
    game.gameEnded = false;

    /* portal position */
    do { // Not on initPos
        rand = { column: getRandomIntInclusive(0, game.nbCols - 1), row: getRandomIntInclusive(0, game.nbRows - 1) };
    } while (eqPos(rand, initPos))
    portal = { column: rand.column, row: rand.row };

    /* generate random monsters */
    for (var i = 0; i < nbMonsters; i++) {
        var rand;
        do { // Not on initPos || portal || monsters
            rand = { column: getRandomIntInclusive(0, game.nbCols - 1), row: getRandomIntInclusive(0, game.nbRows - 1) };
        } while (eqPos(rand, initPos) || eqPos(rand, portal) || monsters.findMatch(rand, eqPos))
        monsters.push({ column: rand.column, row: rand.row });
    }

    /* generate random holes */
    for (var i = 0; i < nbHoles; i++) {
        var rand;
        do { // Not on initPos || portal || monsters || holes
            rand = { column: getRandomIntInclusive(0, game.nbCols - 1), row: getRandomIntInclusive(0, game.nbRows - 1) };
        } while (eqPos(rand, initPos) || eqPos(rand, portal) || monsters.findMatch(rand, eqPos) || holes.findMatch(rand, eqPos))
        holes.push({ column: rand.column, row: rand.row });
    }

    /* generate rainbows : N/S/W/E for each monsters */
    monsters.map(function (pos) {
        pushCardinal(rainbows, pos);
    })

    /* generate clouds : N/S/W/E for each holes */
    holes.map(function (pos) {
        pushCardinal(clouds, pos);
    })

    /* canvas */
    var canvas = document.getElementById('canvas');
    canvas.width = game.kPixelWidth;
    canvas.height = game.kPixelHeight;
    var context = canvas.getContext("2d");
    gContext = context;
    drawBoard();

    /* timer */
    startTimer(game.nbRows);
}

function WindowLoad(event) {
    newGame();
}        