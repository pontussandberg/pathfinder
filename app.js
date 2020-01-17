// Classes
class Square {
    constructor(col, row, context) {
        this.col = col;
        this.row = row;
        this.x = this.col * 20;
        this.y = this.row * 20;
        this.width = 20;
        this.height = 20;
        this.ctx = context;
    }
    draw(color) {
        if (color) this.ctx.fillStyle = color;
        else this.ctx.fillStyle = "#fff";
        this.ctx.beginPath();
        this.ctx.fillRect(this.x, this.y, 19, 19);
        this.ctx.stroke();
    }

    log() {
        console.log(x);
    }
}

class Game {
    constructor() {
        this.board = this.getBoard();
        this.isRunning = false;
        this.isRunningBack = false;
        this.options = [];
        this.wallsArr = [];
        this.bestPath = [];
        this.initalPos;
        this.finishPos;
        this.currentPos;
        this.interval;
    }

    handleStart() {
        this.reset(); // keeps the walls

        let startValue = document.getElementById('start-input').value;
        let endValue = document.getElementById('end-input').value;

        this.runInit(startValue || 0, endValue || 624);
    }

    runInit = (startPos, endPos) => {
        this.currentPos = this.board[startPos];
        this.initalPos = this.currentPos;
        this.finishPos = this.board[endPos];
        this.board[endPos].endPos = true;
        this.currentPos.draw("yellow");

        this.isRunning = true;
        this.interval = setInterval(this.runLoop, 30)
    }



    runLoop = () => {
        if (this.currentPos !== this.finishPos && this.isRunning) {
            this.makeCellVisited();
            this.checkOptions(this.board);
            this.filterDuplicates();
            this.filterVisited();
            this.move();
            this.paintBoard();
        }
        else {
            clearInterval(this.interval);
            this.runBackInit();
        }
    }

    runBackInit = () => {
        let newEndPos = this.board.indexOf(this.initalPos);  // setting new end pos to the initial pos
        let oldEndPos = this.board.indexOf(this.finishPos); // setting current pos to inital finish pos 
        this.board[newEndPos].endPos = true;
        this.board[oldEndPos].endPos = false;
        this.finishPos = this.board[newEndPos];

        this.isRunningBack = true;
        this.options = [];

        this.interval = setInterval(this.runBackLoop, 30);
    }

    runBackLoop = () => {
        if (this.currentPos !== this.finishPos && this.isRunning) {
            this.makeCellPathed();
            this.checkOptions(this.visited);
            this.filterBestPath();
            this.filterDuplicates();
            this.move();
            this.paintBoard();
        }
        else {
            clearInterval(this.interval);
            this.finishPos.draw("yellow");
            this.initalPos.draw("yellow");
            this.isRunning = false;
            this.isRunningBack = false;
            console.log("done");
        }
    }

    checkOptions(arr) {
        let cp = this.currentPos;
        for (let i = 0; i < arr.length; i++) {
            let isValidOption = false;


            // same row, +1 col
            if (cp.col + 1 === arr[i].col && cp.row === arr[i].row)
                isValidOption = true;

            // same col, +1 row
            if (cp.row + 1 === arr[i].row && cp.col === arr[i].col)
                isValidOption = true;

            // same row, +1 col
            if (cp.col - 1 === arr[i].col && cp.row === arr[i].row)
                isValidOption = true;

            // same col, +1 row
            if (cp.row - 1 === arr[i].row && cp.col === arr[i].col)
                isValidOption = true;

            if (arr[i].wall)
                isValidOption = false;

            if (arr[i].bestPath) {
                isValidOption = false;
            }
            // filtering out visited cells for the first part of program
            if (!this.isRunningBack) {
                if (arr[i].visited)
                    isValidOption = false;
            }


            if (isValidOption) {
                this.options.push(arr[i]);
            }
        }
    }




    move() {
        let shortestDist;
        let bestOption;

        if (this.options) {
            for (let i = 0; i < this.options.length; i++) {

                // Can't do pythagoras on the neighbor cell. Need explicit check for finish.
                if (this.options[i].endPos) {
                    bestOption = this.options[i];
                    break;
                }

                // Pythagoras theroem
                let distance = Math.sqrt(Math.pow((this.options[i].x - this.finishPos.x), 2) + Math.pow((this.options[i].y - this.finishPos.y), 2));
                if (distance < shortestDist || !shortestDist) {
                    shortestDist = distance;
                    bestOption = this.options[i];
                }
            }
            this.currentPos = bestOption;
        }
    }


    makeCellVisited() {
        let index = this.board.indexOf(this.currentPos);
        this.board[index].visited = true;
        this.visited.push(this.board[index]);
    }

    makeCellPathed() {

        let index = this.board.indexOf(this.currentPos);
        this.bestPath.push(this.currentPos);
        this.board[index].bestPath = true;

    }

    filterVisited() {
        if (this.options) {
            for (let i = 0; i < this.options.length; i++) {
                if (this.options[i].visited) {
                    this.options.splice(i, 1);
                }
            }
        }
    }

    filterBestPath() {
        for (let i = 0; i < this.options.length; i++) {
            for (let j = 0; j < this.bestPath.length; j++) {
                if (this.options[i].col === this.bestPath[j].col && this.options[i].row === this.bestPath[j].row) {
                    this.options.splice(i, 1);
                }
            }
        }
    }

    filterDuplicates() {
        if (this.options)
            this.options.filter((a, b) => this.options.indexOf(a) === b)
    }

    handleClick(e) {
        let clickedX = Math.floor(e.offsetX / 20) * 20;
        let clickedY = Math.floor(e.offsetY / 20) * 20;
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].y === clickedY && this.board[i].x === clickedX) {
                if (this.board[i].wall) {
                    this.board[i].wall = false;
                    this.board[i].draw('#fff');
                }
                else {
                    this.board[i].draw('#111');
                }
            }
        }
    }

    reset() {
        // resetting board except for walls
        let newBoard = this.getBoard();
        for (let i = 0; i < newBoard.length; i++) {
            for (let j = 0; j < this.board.length; j++) {
                if ((this.board[i].wall) && (newBoard[i].col === this.board[j].col && newBoard[i].row === this.board[j].row)) {
                    newBoard[i].wall = true;
                }
            }
        }
        // setting board with same walls but resetting everything else
        this.board = newBoard;
        this.options = [];
        this.currentPos = null;
        this.isRunning = false;
        this.isRunningBack = false;
        this.options = [];
        this.visited = [];
        this.bestPath = [];
        this.initalPos = null;
        this.finishPos = null;
        clearInterval(this.interval);
        this.paintBoard();
    }

    getDefaultWalls() {
        let defaultWalls = [617, 592, 567, 542, 517, 492, 467, 417,
            442, 392, 367, 342, 343, 344, 345, 346, 347, 348, 623,
            598, 573, 548, 523, 492, 473, 472, 471, 470, 469, 474,
            323, 298, 273, 248, 223, 198, 173, 148, 123, 98, 73,
            48, 47, 46, 41, 40, 39, 38, 37, 35, 34, 33, 32, 31,
            30, 29, 28, 27, 26, 25, 66, 91, 116, 191, 216, 241,
            266, 291, 316, 341, 240, 239, 238, 237, 236, 235,
            234, 233, 208, 183, 158, 133, 108, 83, 58, 134,
            160, 186, 212, 211, 210, 185, 209, 184, 159,
            135, 161, 187, 213, 109];

        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < defaultWalls.length; j++) {
                if (defaultWalls[j] === i) {
                    this.board[i].wall = true;
                }
            }
        }
        this.paintBoard();
    }

    getBoard() {
        let boardArr = [];
        for (let row = 0; row < 25; row++) {
            for (let col = 0; col < 25; col++) {
                boardArr.push(new Square(col, row, ctx))
            }
        }
        return boardArr;
    }

    paintBoard() {
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].wall) this.board[i].draw("#111");             // wall
            else if (this.board[i].bestPath) this.board[i].draw("#007bff"); // visited
            else if (this.board[i].endPos) this.board[i].draw("#d95350");   // best path
            else if (this.board[i].visited) this.board[i].draw("#27a744");  // finish
            else this.board[i].draw("#fff");                                // empty
        }
    }

    drawArr(arr, color) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].draw(color);
        }
    }

}

// init
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");
canvas.addEventListener('mousedown', handleClick);

// Canvas must be a square
canvas.height = 500;
canvas.width = 500;

let game = new Game();
game.paintBoard();
game.getDefaultWalls();

function handleReset() {
    clearInterval(game.interval);
    game = new Game();
    game.paintBoard();
}

function handleClick(e) {
    game.handleClick(e);
}

function handleStart() {
    game.handleStart();
}
