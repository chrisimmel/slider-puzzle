
/*
 * Class BoardView
 * 
 * The slider puzzle board view, singleton.
 *
 */
function BoardView() {}

/**
 * The displayed board width, in pixels.
 */
BoardView.boardWidth = 400;

/**
 * The displayed board height, in pixels.  (The board is always square, so this is the
 * same as the height.)
 */
BoardView.boardHeight = BoardView.boardWidth;

/**
 * The board.
 */
BoardView.board;


/**
 * Initializes the board display.
 */
BoardView.initBoard = function() {
    BoardView.board = d3.select(".board")
        .attr("width", BoardView.boardWidth)
        .attr("height", BoardView.boardHeight);
}

/**
 * Initializes the user controls.
 */
BoardView.initControls = function() {
    d3.select("#width").on("change", function() {
        BoardController.width = this.value;
        BoardView.updateSizes();
        BoardController.resetBoard();
        })
        .attr("value", width);

    d3.select("#difficulty").on("change", function() {
        BoardController.difficulty = this.value;
        BoardView.updateSizes();
        BoardController.resetBoard();
        })
        .attr("value", difficulty);
}

/**
 * Updates the sizes of displayed elements.
 */
BoardView.updateSizes = function() {
    var cellWidth = BoardView.boardWidth / BoardModel.state._width;

    BoardView.board.selectAll("text")
        .attr("x", cellWidth / 2)
        .attr("y", cellWidth / 2 + 13);

    BoardView.board.selectAll("rect")
        .attr("width", cellWidth - 1)
        .attr("height", cellWidth - 1);
}

/**
 * Renders the given state, with a given transition delay.
 */
BoardView.renderState = function(state, delay) {
    if (!delay) {
        delay = 300;
    }

    var cellWidth = BoardView.boardWidth / state._width;
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
    var cellAll = BoardView.board.selectAll("svg")
        .data(data, function(t) { return t ? t.id : -1; });

    // Enter to render elements on new cells.
    var cellNew = cellAll.enter().append("svg");

    // Determine the fill color of the tiles based on distance from home position.
    var color = d3.scale.linear()
        .domain([1, (state._width - 1) * 2])
        .range([d3.rgb(120, 180, 120), d3.rgb(221, 17, 17)])
        //.range(["green", "red"])
        .clamp(true);

    // Add the circle element in each tile.
    cellNew
        .attr("id", function(d) { return d.id; })
        .append("circle")
        .attr("fill", "#ddd"); // Initial fill is gray, then we fade to correct color.

    // Add the text label in each tile.
	cellNew
		.append("text")
        .text(function(d) { return d.id ? d.id : ""; })
        .attr("x", textOffsetX)
        .attr("y", textOffsetY)
        .attr("font-size", fontSize);

    // Update the attributes af all circles (new and existing).
    cellAll.select("circle")
        .transition()
        .duration(delay)
        .attr("fill", function(d) { return String(color(d.dist)); })
        .attr("cx", (cellWidth - 1) / 2)
        .attr("cy", (cellWidth - 1) / 2)
        .attr("r", (cellWidth - 1) / 2);

    // Update the attributes af all text elements (new and existing).
    cellAll.select("text")
        .transition()
        .duration(delay)
        .attr("x", textOffsetX)
        .attr("y", textOffsetY)
        .attr("font-size", fontSize);

    // Update the class and attributes af all text elements (new and existing).
    cellAll.classed("tile", function(d) { return !!d.id; })
        .classed("canMove", function(d) { return d.canMove; })
        .classed("solved", function(d, i) { return d.id == i + 1; })
        .transition()
        .duration(delay)
        .attr("x", function(d) { return d.x * cellWidth; }) 
        .attr("y", function (d) { return d.y * cellWidth; })
        .attr("data-i", function (d, i) { return i; })
        .attr("data-d", function (d, i) { return d.dist; });

    // Remove obsolete elements (as when reducing board size).
    cellAll.exit().remove();

    if (state.isSolved()) {
        // The puzzle is solved.  Mark this on the board, and ignore clicks on all tiles.
        BoardView.board.attr("class", "board solved");
        cellAll.on("click", null);
    }
    else {
        // The puzzle is not solved.  Remove "solved" class from board, and accept clicks on moveable tiles.
    	BoardView.board.attr("class", "board");
        cellAll.on("click", function(d) {
                                var i = parseInt(this.getAttribute("data-i"));
                                if (i >= 0) {
                                    BoardController.userMoveTile(i);
                                }
                            });

        // TODO:  Add a drag behavior so the user can drag candidate tiles, not just click on them.
    }
}
