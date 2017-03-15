// Vue.config.debug = true;

var initPos = { column: 0, row: 0 };
var currentPosition = initPos;
var pathUser = [initPos];
var gContext;
var height = screen.availHeight;
// init
var nbRows = 10; // square Grid
var nbCols = 10;
var nbMonster = 2;
var nbHole = 2;
var kPW = ~~((height - 250) / nCols);
var kPH = ~~((height - 250) / nRows);
var kPiW = 1 + (nCols * this.kPW);
var kPiH = 1 + (nRows * this.kPH);
var nbMonsters = 2;
var monsters = [];
var rainbows = [];
var nbHoles = 2;
var holes = [];
var clouds = [];
var portal = { column: nbCols-1, row: nbRows-1 };

var game = new Vue({
    el: '#scores',
    data: {
        // gameboard
        nbRows: nbRows,
        nbCols: nbCols,
        kPieceWidth: kPW,
        kPieceHeight: kPH,
        kPixelWidth: kPiW,
        kPixelHeight: kPiH,                
        // scoreboard
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
    imgPortal.src = "./assets/portal.jpg";
    /* monsters */
    var imgMonster = new Image();
    imgMonster.onload = function () {
        monsters
            .map(function (pos) {
                var x = (pos.column * game.kPieceWidth);
                var y = (pos.row * game.kPieceHeight);
                gContext.drawImage(imgMonster, x, y, game.kPieceWidth, game.kPieceHeight)
            })
    }
    imgMonster.src = "./assets/monster.png";
    /* rainbows */
    var imgRainbow = new Image();
    imgRainbow.onload = function () {
        rainbows
            .map(function (pos) {
                var x = (pos.column * game.kPieceWidth);
                var y = (pos.row * game.kPieceHeight);
                gContext.drawImage(imgRainbow, x, y, game.kPieceWidth, game.kPieceHeight)
            })
    }
    imgRainbow.src = "./assets/rainbow.png";
    /* holes */
    var imgHole = new Image();
    imgHole.onload = function () {
        holes
            .map(function (pos) {
                var x = (pos.column * game.kPieceWidth);
                var y = (pos.row * game.kPieceHeight);
                gContext.drawImage(imgHole, x, y, game.kPieceWidth, game.kPieceHeight)
            })
    }
    imgHole.src = "./assets/hole.jpg";
    /* clouds */
    var imgCloud = new Image();
    imgCloud.onload = function () {
        clouds
            .map(function (pos) {
                var x = (pos.column * game.kPieceWidth);
                var y = (pos.row * game.kPieceHeight);
                gContext.drawImage(imgCloud, x, y, game.kPieceWidth, game.kPieceHeight)
            })
    }
    imgCloud.src = "./assets/cloud.jpg";    
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
        drawBoard();
    }
}, false);

function zero2D(rows, cols) {
    var array = [], row = [];
    while (cols--) row.push(0);
    while (rows--) array.push(row.slice());
    return array;
}

function search(strat) {
    var path = [];
    var matrix = zero2D(game.nbRows, game.nbCols);
    mushroomsCopy
        .map(function (e, i, arr) {
            matrix[e.row][e.column]++;
        });
    var maxLength = Math.max(game.nbCols, game.nbRows);
    var temp;
    var max = 0;
    var borders = [];
    var border = [];
    /* mark matrix from end to begin */
    for (var k = 2 * (maxLength - 1); k >= 0; k--) {
        for (var y = game.nbCols - 1; y >= 0; --y) {
            var x = k - y;
            if (x >= 0 && x < game.nbRows) {
                var d = 0;
                if (y != game.nbRows - 1) {
                    d = matrix[y + 1][x];
                }
                if (x != game.nbCols - 1) {
                    if (matrix[y][x + 1] > d) {
                        d = matrix[y][x + 1];
                    }
                }
                matrix[y][x] += d;
            }
        }
    }
    /* score */
    game.robotScore = matrix[0][0];
    /* find the path */
    var curr = { column: 0, row: 0 };
    path.push({ column: 0, row: 0 });
    while (!(curr.column == game.nbCols - 1 && curr.row == game.nbRows - 1)) {
        if (curr.row < game.nbRows - 1) {
            if (curr.column < game.nbCols - 1) {
                if (matrix[curr.row + 1][curr.column] >= matrix[curr.row][curr.column + 1]) {
                    curr.row++;
                } else {
                    curr.column++;
                }
            } else {
                curr.row++;
            }
        } else {
            curr.column++;
        }
        path.push({ column: curr.column, row: curr.row });
    }
    return path;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function endGame() {
    drawResults();
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

function newGame() {
    currentPosition = initPos;
    pathUser = [initPos];
    game.mushrooms = [];
    currentPosition = { column: 0, row: 0 };
    game.gameEnded = false;
    // timer
    startTimer(game.nbRows);
    // generate random monsters
    for (var i = 0; i < nbMonsters; i++) {
        var rand;
        do { // Not on clouds || rainbows || holes
            rand = { column: getRandomIntInclusive(0, game.nbCols - 1), row: getRandomIntInclusive(0, game.nbRows - 1) };
        } while ((rand.column == game.nbCols - 1 && rand.row == game.nbRows - 1) || (rand.column == 0 && rand.row == 0))
        game.mushrooms.push({ column: rand.column, row: rand.row });
    }
    // remove duplicates
    game.mushrooms = game.mushrooms.filter(function (e, i, self) {
        return self.findIndex(function (p) {
            return p.row === e.row && p.column === e.column;
        }) === i;
    })

    mushroomsCopy = game.mushrooms;
    // canvas
    var canvas = document.getElementById('canvas');
    canvas.width = game.kPixelWidth;
    canvas.height = game.kPixelHeight;
    var context = canvas.getContext("2d");
    gContext = context;
    drawBoard();
}

function WindowLoad(event) {
    newGame();
}        