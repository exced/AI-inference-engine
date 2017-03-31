function* idMaker() {
    var index = 0;
    while (true)
        yield index++;
}

var gen = idMaker();

console.log(gen.next().value); // 0
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2

var rows = 3;
var cols = 3;

function* gridIterator() {
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            yield { row: r, column: c };
        }
    }
}

var g = gridIterator();
console.log(g.next().value); // 0
console.log(g.next().value); // 1
console.log(g.next().value); // 2
console.log(g.next().value); // 2
console.log(g.next().value); // 2
console.log(g.next().value); // 2
console.log(g.next().value); // 2
console.log(g.next().value); // 2
console.log(g.next().value); // 2
console.log(g.next().value); // 2
console.log(g.next().value); // 2
console.log(g.next().value); // 2
console.log(g.next().value); // 2

var o = {
    test1: 0,
    test2: 0.5
};

function som(o) {
    return Object.values(o).findIndex((e, i, a) => {
        return e == 1;
    })
}

console.log(som(o));

var facts = [
    {
        visited: false,
        test1: 0
    },
    {
        visited: false,
        test1: 1
    }
]

function somArr(facts) {
    return facts.findIndex((e, i, arr) => {
        return !e.visited && Object.values(e).some((e1, i1, arr1) => {
            return e1 == 1;
        })
    });
}

console.log(somArr(facts));