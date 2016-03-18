
/*
 * Class BoardController
 * 
 * The slider puzzle board controller, a singleton.
 *
 */
function BoardController() {}

/**
 * BoardController.width
 *
 * The number of rows or columns of the board.  The board is always square,
 * so the width and height are the same.
 */
BoardController.width = 4;

/**
 * BoardController.difficulty
 *
 * The desired difficulty of the initial board layout.  This is measured as the sum
 * of the Manhattan distance of each tile from its home position, but users don't
 * need to know that!
 */
BoardController.difficulty = 45;


/**
 * Initializes the user controls.
 */
BoardController.initControls = function() {
    d3.select("#width").on("change", function() {
            BoardController.width = this.value;
            d3.select("#widthValue").html(BoardController.width);
            BoardController.resetBoard();
        })
        .attr("value", BoardController.width);
    d3.select("#widthValue").html(BoardController.width);

    d3.select("#difficulty").on("change", function() {
            BoardController.difficulty = this.value;
            d3.select("#difficultyValue").html(BoardController.difficulty);
            BoardController.resetBoard();
        })
        .attr("value", BoardController.difficulty);
    d3.select("#difficultyValue").html(BoardController.difficulty);
}


/**
 * BoardController.reportThinking()
 *
 * Activates the GIF spinner.
 */
BoardController.reportThinking = function() {
    d3.select(".controls").classed("thinking", true);
}

/**
 * BoardController.reportNotThinking()
 *
 * Hides the GIF spinner.
 */
BoardController.reportNotThinking = function() {
    d3.select(".controls").classed("thinking", false);
}



/**
 * BoardController.resetBoard()
 *
 * Re-initializes the game board with a newly shuffled tile configuration.
 */
BoardController.resetBoard = function() {

    // Activate the GIF spinner.
    BoardController.reportThinking();

    // TODO: Free up foreground UI thread by doing the board layout generation in a WebWorker.
    setTimeout(function() {
        // Create a new board of the correct size in a solved state.
        BoardModel.state = new BoardState(BoardController.width);
        
        // Shuffle the board to the desired level of difficulty.
        BoardModel.state = BoardModel.state.smartShuffle(BoardController.difficulty);
        BoardModel.state.dump();

        // Reset the user step count.
        BoardModel.userStepCount = 0;

        // Render the new, shuffled state.
        BoardView.renderState(BoardModel.state, 400);

        // Hide the GIF spinner.
        BoardController.reportNotThinking();

        // Remove the congratulations message from last game.
        d3.select("#results").selectAll("p").remove();
    }, 20);

};


/**
 * BoardController.showHint()
 *
 * Animates a hint showing a move that leads toward the known solution.
 */
BoardController.showHint = function() {
    var nextState = BoardModel.state._priorState;

    if (nextState) {
        var saveState = BoardModel.state;
        BoardModel.state = nextState;
        // Temporarily render the next step in the known solution.
        BoardView.renderState(BoardModel.state);
        
        setTimeout(function() {
             // Restore the prior state.
             BoardModel.state = saveState;
             BoardView.renderState(BoardModel.state);
        }, 200);
    }
}


/**
 * BoardController.solveBoard
 *
 * Animates the known solution to the current board configuration.
 */
BoardController.solveBoard = function() {
    // Rather than search for a new solution here, we just unwind the breadcrumb path
    // of the shuffle steps used to generate the board, plus the user's moves up to now.
    //BoardState.findSolution(state);

    function solveRestOfBoard() {
        if (BoardModel.state._priorState) {
            BoardModel.state = BoardModel.state._priorState;
            BoardView.renderState(BoardModel.state, 50);

            setTimeout(function() {
                 // Show the next step in 40ms.
                 solveRestOfBoard();
            }, 40);
        }
    }

    // Show the first step in the solution, which kicks off the timer chain.
    solveRestOfBoard();
}


/**
 * BoardController.userMoveTile
 *
 * A user action to move the given tile and render the new board state.
 */
BoardController.userMoveTile = function(index) {
    // Compute new state.
    var newState = BoardModel.state.moveTile(index);

    if (BoardModel.state._priorState && newState.equals(BoardModel.state._priorState)) {
        // If user has chosen the next step in the known solution, remove that step from the solution stack.
        newState = BoardModel.state._priorState;
    }

    // Set and render the new state.
    BoardModel.state = newState;
    BoardModel.state.dump();
    BoardView.renderState( BoardModel.state, 200);

    // Increment the user step count.
    BoardModel.userStepCount++;

    if (BoardModel.state.isSolved()) {
        // If the game is over, congratulate the user and present the number of steps taken.
        var results = d3.select("#results");
        
        results.append("p")
            .html("Congratulations!");
        
        results.append("p")
            .html("You completed the puzzle in <span>" + BoardModel.userStepCount + ((BoardModel.userStepCount > 1) ? "</span> steps." : " step."));
    }
}

