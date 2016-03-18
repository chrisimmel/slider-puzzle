
/*
 * Class BoardController
 * 
 * The slider puzzle board controller, singleton.
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
 * BoardController.resetBoard()
 *
 * Re-initializes the game board with a newly shuffled tile configuration.
 */
BoardController.resetBoard = function() {
    BoardModel.state = new BoardState(BoardController.width);
    BoardModel.state = BoardModel.state.smartShuffle(BoardController.difficulty);
    BoardModel.state.dump();

    BoardView.renderState(BoardModel.state);
};

/**
 * BoardController.showHint
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
}

