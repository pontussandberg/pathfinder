let displayStats = document.getElementById('stats');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");

// Canvas must be a square
canvas.height = 500;
canvas.width = 500;

// Classes
class Square {
	constructor(col, row) {
		this.col = col;
		this.row = row;
		this.x = this.col * 10;
		this.y = this.row * 10;

		this.width = 10;
		this.height = 10;
	}
	draw(color) {
		if (color) ctx.fillStyle = color;
		else ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.fillRect(this.x, this.y, 9, 9);
		ctx.stroke();
	}
}

canvas.addEventListener('mousedown', handleClick);






// gets arr with square obj which represents the board.
let board = getBoard();

let visited = [];
let options = [];
let walls = [];
let currentPos;
let interval;

drawAll();




function handleStart() {
	let startValue = document.getElementById('start-input').value;
	let endValue = document.getElementById('end-input').value;
	let intervalValue = document.getElementById('interval-input').value;

	initializer(startValue || 0, endValue || 2499, intervalValue || 100);
}





// Kicking off find();
function initializer(startPos, endPos, intervalTimer) {
	reset();
	currentPos = board[startPos];
	finishPos = board[endPos];
	finishPos.draw("#f48024");
	visited.push(currentPos);
	currentPos.draw("yellow");

	interval = setInterval(find, intervalTimer);
}





// Main function. The loop.
function find() {

	if (currentPos !== finishPos) {

		checkForOptions();
		removeVisited();
		currentPos = chooseBestOption();
		visited.push(currentPos);
		drawVisited();
	}
	else {
		clearInterval(interval);
	}
}




// Drawing the visited cells on Canvas.
function drawVisited() {
	for (let i = 0; i < visited.length; i++) {
		visited[i].draw('#27a744');
	}
}





// After checking for options, removing all options
// that are already visited. 
// Also removes "walls" from options.
function removeVisited() {
	for (let i = 0; i < options.length; i++) {

		for (let j = 0; j < visited.length; j++) {
			if (options[i] === visited[j]) {
				options.splice(i, 1);
			}
		}
	}
}







// Calculate the option with the closest path
// to endPoint and returns that value.
// Also removes that option from options array.
function chooseBestOption() {
	if (options) {
		let closestCell = 10000000000;
		let bestCell;
		for (let i = 0; i < options.length; i++) {

			let value = Math.sqrt(Math.pow((options[i].x - finishPos.x), 2) + Math.pow((options[i].y - finishPos.y), 2));

			if (value < closestCell) {
				closestCell = value;
				bestCell = options[i];
			}


		}
		let index = options.indexOf(bestCell);
		options.splice(index, 1);
		return bestCell;
	}
	else alert('no options');
}






// Finds "neighbor" cells and lists them to options array.
function checkForOptions() {
	if (currentPos) {
		for (let i = 0; i < board.length; i++) {

			let isRow = false;
			let isCol = false;

			// straight?
			if (currentPos.col === board[i].col || currentPos.col + 1 === board[i].col || currentPos.col - 1 === board[i].col) {
				isCol = true;
			}

			if (board[i].row === currentPos.row || board[i].row - 1 === currentPos.row || board[i].row + 1 === currentPos.row) {
				isRow = true;
			}

			// diagonal?
			if (currentPos.row + 1 === board[i].row && currentPos.col + 1 === board[i].col)
				continue;


			if (currentPos.row - 1 === board[i].row && currentPos.col - 1 === board[i].col)
				continue;


			if (currentPos.row - 1 === board[i].row && currentPos.col + 1 === board[i].col)
				continue;


			if (currentPos.row + 1 === board[i].row && currentPos.col - 1 === board[i].col)
				continue;


			// wall?
			if (board[i].wall === true)
				continue;


			// same?
			if (currentPos === board[i])
				continue;

			// valid option?
			if (isRow && isCol) {
				options.push(board[i]);
				console.log(board[i], "the one getting pushed");
			}
		}
	}


	else {
		clearInterval(interval);
		alert('I am stuck');
	}


}












function reset() {
	clearInterval(interval);
	visited = [];
	options = [];
	currentPos;
	interval;
	drawAll();
}

function handleReset() {
	board = getBoard();
	reset();
}


function getBoard() {
	let boardArr = [];
	for (let row = 0; row < 50; row++) {
		for (let col = 0; col < 50; col++) {
			boardArr.push(new Square(col, row))
		}
	}
	return boardArr;
}



function drawAll() {
	for (let i = 0; i < board.length; i++) {
		if (board[i].wall === true) board[i].draw("#111");
		else board[i].draw();

	}

}


function handleClick(e) {
	let clickedX = Math.floor(e.offsetX / 10) * 10;
	let clickedY = Math.floor(e.offsetY / 10) * 10;
	for (let i = 0; i < board.length; i++) {
		if (board[i].y === clickedY && board[i].x === clickedX) {
			if (board[i].wall) {
				board[i].wall = false;
				board[i].draw('#fff');
			}
			else {
				board[i].wall = true;
				board[i].draw('#111');
			}
		}
	}
}

