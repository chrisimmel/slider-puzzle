/**
 * Class Tile
 * 
 * Represents a single tile on the puzzle board.
 *
 * Attributes:
 *
 *     ID - the number displayed on the face of the tile
 */
function Tile(id) {
    this.id = id;
    this.canMove = false;
}

/**
 * The tile's ID, that is, the number displayed on the face of the tile.
 */
 Tile.prototype.id;

/**
 * Whether the tile can be moved.
 */
Tile.prototype.canMove;


/**
 * Class BoardState
 * 
 * Represents a state of the puzzle board.
 *
 * Parameters:
 *
 *     width - the number of rows or columns.  The board is always square, so the
 *                    width and height are the same.
 *
 *     priorState - (optional) the prior state on which the new state will be based.
 *
 *     moveLoc - if priorState is given, then moveLoc specifies the tile to be moved
 *                 to generate the new state.
 */
function BoardState(width, priorState, moveLoc) {
    this._width = width;
    this._tiles = null;
    this._emptyLoc = null;

    if (priorState) {
        this._initFromPrior(priorState, moveLoc);
    }
    else {
        this._initSolved();
    }
}

/**
 * BoardState._width
 *
 * The number of rows or columns of the board.  The board is always square,
 * so the width and height are the same.
 */
BoardState.prototype._width;

/**
 * BoardState._tiles
 *
 * The matrix of tiles, stored in a 1-dimensional array.
 */
BoardState.prototype._tiles;

/**
 * BoardState._emptyLoc
 *
 * The index of the empty cell, kept as a shortcut.
 */
BoardState.prototype._emptyLoc;


/**
 * BoardState.dump()
 *
 * Dumps an ASCII visualization of the board state to the console.
 */
BoardState.prototype.dump = function() {
    var i = 0;
    for (var x = 0; x < this._width; x++) {
        var row = '';

        for (var y = 0; y < this._width; y++) {
            if (this._tiles[i]) {
                if (this._tiles[i].id < 10) {
                    row += ' ';
                }
                row += this._tiles[i].id;
                row += ' ';
            }
            else {
                row += '   ';
            }
            i++;
        }
        console.log(row);
    }
};


/**
 * BoardState.dumpPath()
 *
 * Dumps an ASCII visualization of a sequence of board states to the console.
 */
BoardState.dumpPath = function(path) {
    for (var i = 0; i < path.length; i++) {
        console.log(path[i].signature());
    }
};
    

/**
 * BoardState.signature()
 *
 * Generates a unique string signature that represents the board state.
 */
BoardState.prototype.signature = function() {
    var sig = '';
    for (var i = 0; i < this._tiles.length; i++) {
        if (this._tiles[i]) {
            sig += this._tiles[i].id;
            sig += '.';
        }
        else {
            sig += '...';
        }
    }

    return sig;
};


/**
 * BoardState._initEmpty()
 *
 * Initializes an empty board state.
 */
BoardState.prototype._initEmpty = function() {
    this._tiles = new Array(this._width * this._width);
};


/**
 * BoardState._initSolved()
 *
 * Initializes the board state as solved.
 */
BoardState.prototype._initSolved = function() {
    this._initEmpty();
        
    var last = this._width * this._width - 1;
    var newMoveables = this.getNeighbors(last);

    for (var i = 0; i <= last; i++) {
        if (i == last) {
            // Leave the last cell empty.
            this._tiles[i] = null;
            this._emptyLoc = i;
        }
        else {
            // Tiles are initialized with an ID that is the index of their home cell + 1.
            this._tiles[i] = new Tile(i + 1);
            this._tiles[i].canMove = newMoveables.indexOf(i) >= 0;
        }
    }
};


/**
 * BoardState._initFromPrior(priorState, moveIndex)
 *
 * Initializes the board state based on a prior board state and the index of a tile
 * to move.
 */
BoardState.prototype._initFromPrior = function(priorState, moveIndex) {
    this._initEmpty();

    var canMove = priorState.canMoveTile(moveIndex);
    var last = this._width * this._width - 1;
    var newMoveables = this.getNeighbors(moveIndex);

    for (var i = 0; i <= last; i++) {
        if (canMove && i == moveIndex) {
            // This is the index of the source tile to move.  It becomes the new empty cell.
            this._tiles[i] = null;
            this._emptyLoc = i;
        }
        else if (canMove && i == priorState._emptyLoc) {
            // This is the index of the old empty cell.  It receives the moved tile.
            this._tiles[i] = priorState._tiles[moveIndex];
            if (this._tiles[i]) {
                this._tiles[i].canMove = newMoveables.indexOf(i) >= 0;
            }
        }
        else {
            // This is an ordinary, unchanging cell.  Copy its tile to the same cell in
            // the new state.
            this._tiles[i] = priorState._tiles[i];
            if (this._tiles[i]) {
                this._tiles[i].canMove = newMoveables.indexOf(i) >= 0;
            }
        }
    }
};


/**
 * BoardState._toPoint(index)
 *
 * Converts a cell index to an x, y point, returned as a two-slot array.
 */
BoardState.prototype._toPoint = function(index) {
    var y = Math.floor(index / this._width);
    var x = index - (y * this._width);
        
    return [x, y];
};


/**
 * BoardState._toIndex(point)
 *
 * Converts an x, y point to a cell index.
 */
BoardState.prototype._toIndex = function(point) {
    return point[1] * this._width + point[0];
};


/**
 * BoardState.distanceFromSolution()
 *
 * Computes the total of the Manhattan distance of each tile from its home position.
 * This doesn't represent the number of steps to a solution, but can still be used as
 * an estimate of "how different" the state is from the solution.
 */
BoardState.prototype.distanceFromSolution = function() {
    var distance = 0;

    for (var i = 0; i < this._tiles.length; i++) {
        if (this._tiles[i]) {
            //var tileHome = this._toPoint(this._tiles[i].id - 1);
            //var tilePos = this._toPoint(i);

            /* Manhattan distance of this tile from its home position. */
            //distance += this._tiles[i].id
            distance += this.distanceFromHome(this._tiles[i].id, i);
        }
    }

    return distance;
};

/**
 * BoardState.distanceFromHome()
 *
 * The Manhattan distance of a single tile from its home position.
 */
BoardState.prototype.distanceFromHome = function(tileId, tileIndex) {
    var tileHome = this._toPoint(tileId - 1);
    var tilePos = this._toPoint(tileIndex);

    /* Manhattan distance of this tile from its home position. */
    return (Math.abs(tilePos[0] - tileHome[0]) + Math.abs(tilePos[1] - tileHome[1]));
}


/**
 * Determines whether this and another board state are equal.
 */
BoardState.prototype.equals = function(state2) {
    var equals = !!state2;

    if (equals) {
        for (var i = 0; equals && i < this._tiles.length; i++) {
            if (this._tiles[i]) {
                equals = !!state2._tiles[i] && this._tiles[i].id == state2._tiles[i].id;
            }
            else {
                equals = !state2._tiles[i];
            }
        }
    }

    return equals;
}

/**
 * BoardState.isSolved()
 *
 * Determines whether this is the "solved" board state, that is the state in which each
 * tile is in its home position.
 */
BoardState.prototype.isSolved = function() {
    var isSolved = true;
    var last = this._width * this._width - 1;

    for (i = 0; i < last && isSolved; i++) {
        if (this._tiles[i] == null || this._tiles[i].id != i + 1) {
            isSolved = false;
        }
    }

    return isSolved;
};


/**
 * BoardState.canMoveTile(index)
 *
 * Determines whether the given tile can be moved.  Only tiles horizontally or vertically
 * adjacent to the empty cell can be moved.
 */
BoardState.prototype.canMoveTile = function(index) {
    var neighbors = this.getNeighbors(this._emptyLoc);

    return neighbors.indexOf(index) >= 0;
};


/**
 * BoardState.moveTile(fromIndex)
 *
 * Moves the tile at the given index into the empty cell.
 */
BoardState.prototype.moveTile = function(fromIndex) {
    return this.canMoveTile(fromIndex)
            ? new BoardState(this._width, this, fromIndex)
            : this;
};


function userMoveTile(index) {
    // Compute new state.
    var newState = state.moveTile(index);

    if (state.solution) {
        // Copy the solution path.
        var newSolution = state.solution.map(function(s) { return s; });

        if (state.solution.length > 1 && newState.equals(state.solution[state.solution.length - 2])) {
            // If the user happened to pick the last state from the "official" solution,
            // just pull that last state off of the queue.
            newSolution.pop();
        }
        else {
            // Otherwise, the user is going farther into the woods.  Add this misstep
            // to the solution path.
            newSolution.push(newState);
        }

        newState.solution = newSolution;
    }

    state = newState;
    state.dump();
    renderState(state);
}


/**
 * BoardState.getNeighbors(index)
 *
 * Computes the indices of the neighbor cells of the cell at the given index.
 */
BoardState.prototype.getNeighbors = function(index) {
    var neighbors = [];
    var loc = this._toPoint(index);
    var x = loc[0];
    var y = loc[1];

    if (y > 0) {
        neighbors.push(this._toIndex([x, y - 1]));
    }
    if (x > 0) {
        neighbors.push(this._toIndex([x - 1, y]));
    }
    if (x < this._width - 1) {
        neighbors.push(this._toIndex([x + 1, y]));
    }
    if (y < this._width - 1) {
        neighbors.push(this._toIndex([x, y + 1]));
    }
        
    return neighbors;
};


/**
 * BoardState.getPossibleNextStates()
 *
 * Gets the set of all possible next board states.
 */
BoardState.prototype.getPossibleNextStates = function() {
    var moveableLocs = this.getNeighbors(this._emptyLoc);
    var nextStates = [];

    for (var i = 0; i < moveableLocs.length; i++) {
        nextStates.push(this.moveTile(moveableLocs[i]));
    }

    return nextStates;
};


/**
 * BoardState.getMoveableLocs()
 *
 * Gets the indices of all cells containing a tile that can presently be moved.
 */
 BoardState.prototype.getMoveableLocs = function() {
    var moveableLocs = null;
        
    if (this._emptyLoc != null) {
        moveableLocs = this.getNeighbors(this._emptyLoc);
    }

    return moveableLocs;
};


/**
 * BoardState.moveOneRandom()
 *
 * Randomly moves a single moveable tile.
 */
BoardState.prototype.moveOneRandom = function() {
    var moveableLocs = this.getMoveableLocs();
    var loc = moveableLocs[Math.floor(Math.random() * moveableLocs.length)];
    return this.moveTile(loc);
};

/**
 * BoardState.shuffle(numSteps)
 *
 * Shuffles the board state by executing numSteps random moves.
 */
BoardState.prototype.shuffle = function(numSteps) {
    var newState = this;
    var lastMoved = -1;
    var solution = [this];

    numSteps = Math.min(numSteps, this._width * this._width * this._width);
    numSteps *= this._width > 5 ? Math.floor(this._width / 5) : 1;

    for (var i = 0; i < numSteps; i++) {
        var moveableLocs = newState.getMoveableLocs();
        var lastLoc = moveableLocs.indexOf(lastMoved);
        if (lastLoc >= 0) {
            moveableLocs.splice(lastLoc, 1);
        }
        
        var loc = moveableLocs[Math.floor(Math.random() * moveableLocs.length)];
        lastMoved = newState._emptyLoc;

        newState = newState.moveTile(loc);

        // Keep a breadcrumb trail of how to get back to the solution
        // (following the same, not necessarily the best, path).
        solution.push(newState);
        newState.solution = solution;

        // Copy solution so we can modify it without changing interim solutions.
        solution = solution.map(function(s) { return s; });

        if (newState.isSolved() || newState.equals(this)) {
            // If the shuffled state is a solution or is the same as the starting state, force another iteration.
            i--;
        }
    }

    return newState;
};

/**
 * BoardState.findSolution
 *
 * Searches for a solution to the given starting state.
 * 
 * Uses a breadth-first search to search for a solution.
 */
BoardState.findSolution = function(startingState) {
    // An associative array (hash map) recording which states have been visited, and the prior state of each.
    var visitedStates = {};

    // The list of remaining candidate states to be considered.  Seed it with the starting state.
    var candidates = [startingState];

    // The number of visited states.
    var numVisited = 0;

    // The number of candidates generated.
    var numCandidates = 1;

    // The time when computation started, in ms.
    var startTimeMs = new Date().getTime();

    if (startingState.isSolved()) {
        // Special case:  the starting state is a solution!
        console.log("Starting state is solution!");
        return candidates;
    }

    // Record the starting state as having no prior state.
    visitedStates[startingState.signature()] = "start";

    // Process candidates as long was we have some...
    while (candidates.length) {
        // Find the most promising candidate (based on least difference from solution)...
        var minDist = null;
        var minIndex = null;
        for (var i = 0; i < candidates.length; i++) {
            var cand = candidates[i];
            var dist = cand.distanceFromSolution();
            if (minDist == null || dist < minDist) {
                minDist = dist;
                minIndex = i;
            }
        }

        // Pull the selected candidate from the list.
        // (Note that if we simply dequeue the first candidate, this becomes a simple
        // breadth-first search (and a lot slower).)
        var candidateState = candidates.splice(minIndex, 1)[0];

        // The candidate signature can be used as a hash of the state, or as a simple visualization.
        var candidateSig = candidateState.signature();

        console.log("Visiting: " + candidateSig);
        numVisited++;

        // For each immediate successor to the candidate state...
        var nextStates = candidateState.getPossibleNextStates();
        for (var i = 0; i < nextStates.length; i++) {
            var next = nextStates[i];
            var nextSig = next.signature();

            if (!visitedStates[nextSig]) {
                // If we haven't already visited this state, check if it is a solution.

                // Record the fact that we've visited this state, also recording its prior state.                    
                visitedStates[nextSig] = candidateState;

	            // Is this a solution?
	            if (next.isSolved()) {
	                // If so, we're done!
	                var computeTimeMs = new Date().getTime() - startTimeMs;
	                console.log("Done!");

	                // Construct the solution by following the trace of prior states...
	                var solution = [];
	                while (next && next != "start") {
	                    solution.push(next);
	                    next = visitedStates[next.signature()];
	                }

	                // Log the solution and some statistics...
	                BoardState.dumpPath(solution);
	                console.log("Starting complexity: " + startingState.distanceFromSolution());
	                console.log("Solution steps: " + solution.length);
	                console.log("States considered: " + numVisited);
	                console.log("Candidates generated: " + numCandidates);
	                console.log("Computed in " + computeTimeMs + " milliseconds.");

	                return solution;
	            }
                else {
                    // If not a solution, add this state to the queue to be considered later.
                    console.log("Adding to candidates: " + nextSig);
                    candidates.push(next);
                    numCandidates++;
	            }
	        }
	        else {
	            console.log("Already visited state: " + nextSig);
	        }
	    }
    }

    // The search space has been exhausted without finding a solution.
    return null;
};

/*
function Board(sideLength) {
    this.sideLength = sideLength;
    this.state = new BoardState(sideLength);
}
*/

var state;
var difficulty = 60;
var width = 4;
var boardWidth = 400;
var boardHeight = boardWidth;
var board;

function initControls() {
    d3.select("#width").on("change", function() {
        width = this.value;
        updateSizes();
        resetBoard();
        })
        .attr("value", width);

    d3.select("#difficulty").on("change", function() {
        difficulty = this.value;
        updateSizes();
        resetBoard();
        })
        .attr("value", difficulty);
}

function updateSizes() {
    var cellWidth = boardWidth / state._width;

    board.selectAll("text")
        .attr("x", cellWidth / 2)
        .attr("y", cellWidth / 2 + 13);

    board.selectAll("rect")
        .attr("width", cellWidth - 1)
        .attr("height", cellWidth - 1);
}

function initBoard() {
    board = d3.select(".board")
        .attr("width", boardWidth)
        .attr("height", boardHeight);
}


/**
 * Re-initializes the game board with a newly shuffled tile configuration.
 */
function resetBoard() {
    state = new BoardState(width);
    state = state.shuffle(difficulty);
    state.dump();

    //initBoard();
    renderState(state);
}

function showHint() {
    var solution = state.solution;

    //BoardState.findSolution(state);

    if (solution && solution.length >= 2) {
        var saveState = state;
        state = solution[solution.length - 2];
        renderState(state);
        
        setTimeout(function() {
             state = saveState; renderState(state);
        }, 200);
    }
}

/**
 * Animate a solution to the current board configuration.
 */
function solveBoard() {
    var solution = state.solution;
//        BoardState.findSolution(state);

    function solveRestOfBoard() {
        if (solution && solution.length > 0) {
            state = solution.pop();
            renderState(state, 50);

            setTimeout(function() {
                 solveRestOfBoard();
            }, 40);
        }
    }

    solveRestOfBoard();
}


function renderState(state, delay) {
    if (!delay) {
        delay = 300;
    }

    var cellWidth = boardWidth / state._width;
    var data = state._tiles.map(function(t, i) {
                var p = state._toPoint(i);
                return {x: p[0],
                        y: p[1],
                        id: t ? t.id : 0,
                        dist: t ? state.distanceFromHome(t.id, i) : 0,
                        canMove: t ? t.canMove : 0 };
                        });
    var fontSize = "" + Math.floor(cellWidth * 0.4) + "px";
    var textOffsetX = cellWidth / 2;
    var textOffsetY = cellWidth / 1.6;

    // Join to set data on cells.
    var cellAll = board.selectAll("svg")
        .data(data, function(t) { return t ? t.id : -1; });

    // Enter to render elements on cells.
    var cellNew = cellAll.enter().append("svg");

    var color = d3.scale.linear()
        .domain([0, 1])
        .range([d3.rgb(120, 180, 120), d3.rgb(221, 17, 17)])
        /*.range(["green", "red"])*/
        .clamp(true);
    
    cellNew
        .attr("id", function(d) { return d.id; })
        .append("circle")
        //.attr("fill", function(d) { return String(color(d.dist / (state._width * 2))); })
        .attr("fill", "#ddd")
        ;

	cellNew
		.append("text")
        .text(function(d) { return d.id ? d.id : ""; });

    cellAll.select("circle")
        .transition()
        .duration(delay)
        .attr("fill", function(d) { return String(color(d.dist / (state._width * 2))); })
        /*.attr("width", cellWidth - 1)
        .attr("height", cellWidth - 1)*/
        .attr("cx", (cellWidth - 1) / 2)
        .attr("cy", (cellWidth - 1) / 2)
        .attr("r", (cellWidth - 1) / 2)
//        rgb(221, 17, 17) unsolved
//        rgb(120, 180, 120) solved
/*        .attr("fill", function(d) { return "rgb(" + Math.round(Math.min(1, d.dist / state._width) * 256)
                                                  + ", 100"
                                                  + ", 100)"; }
                                                  )
*/
                                                  ;
    board.selectAll("text")
        .transition()
        .duration(delay)
        .attr("x", textOffsetX)
        .attr("y", textOffsetY)
        .attr("font-size", fontSize);

    cellAll.classed("tile", function(d) { return !!d.id; })
        .classed("canMove", function(d) { return d.canMove; })
        .classed("solved", function(d, i) { return d.id == i + 1; })
//    function(d, i) { return d.id ? (d.canMove ? "tile canMove" : "tile") + (d.id == i + 1 ? " solved" : "") : ""; })
        .transition()
        .duration(delay)
        .attr("x", function(d) { return d.x * cellWidth; }) 
        .attr("y", function (d) { return d.y * cellWidth; })
        .attr("data-i", function (d, i) { return i; })
        .attr("data-d", function (d, i) { return d.dist; });

    cellAll.exit().remove();

    if (state.isSolved()) {
        board.attr("class", "board solved");
        cellAll.on("click", function() {});
    }
    else {
    	board.attr("class", "board");
        cellAll.on("click", function() {
                                var id = parseInt(this.getAttribute("data-i"));
                                if (id >= 0) {
                                    userMoveTile(id);
                                }
                            });
    }
}
