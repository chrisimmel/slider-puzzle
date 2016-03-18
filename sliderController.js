
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
 * The number of rows or columns of the board.  The board is always square,
 * so the width and height are the same.
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


BoardController.reportThinking = function() {
    d3.select(".controls").classed("thinking", true);
}

BoardController.reportNotThinking = function() {
    d3.select(".controls").classed("thinking", false);
}



/**
 * BoardController.resetBoard()
 *
 * Re-initializes the game board with a newly shuffled tile configuration.
 */
BoardController.resetBoard = function() {

    BoardController.reportThinking();

    setTimeout(function() {
        BoardModel.state = new BoardState(BoardController.width);
        BoardModel.state = BoardModel.state.smartShuffle(BoardController.difficulty);
        BoardModel.state.dump();

        BoardModel.userStepCount = 0;

        BoardView.renderState(BoardModel.state, 400);

        BoardController.reportNotThinking();

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
        BoardView.renderState(BoardModel.state);
        
        setTimeout(function() {
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
                 // Solve the next step in 40ms.
                 solveRestOfBoard();
            }, 40);
        }
    }

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

    BoardModel.state = newState;
    BoardModel.state.dump();
    BoardView.renderState( BoardModel.state);

    BoardModel.userStepCount++;

    if (BoardModel.state.isSolved()) {
        var results = d3.select("#results");
        
        results.append("p")
            .html("Congratulations!");
        
        results.append("p")
            .html("You completed the puzzle in <span>" + BoardModel.userStepCount + ((BoardModel.userStepCount > 1) ? " steps." : " step."));
    }
}

