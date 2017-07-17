# slider-puzzle
The classic sliding puzzle game, with some new reinterpretation.

This is pure HTML + JavaScript.  There are no moving parts or state on the server side.  The only external
dependency is on the D3 library for UI rendering.  All you have to do to run it is put all the files together
in a directory, then open index.html in a browser.

Features:

* Board sizes from 2x2 to 12x12 (although why anyone would want to actually play through a 12x12 layout,
I don't know).

* Varying difficulty levels (complexity of initial board layout).

* Button to get a hint for a move that leads toward a known solution.

* Button to show an animated solution to the current board state.

* Button to start over with a freshly generated board state.

* Tile coloration based on distance from "home position".  A tile that is where it belongs is bright green.
A tile that is maximally distant from its home position is bright red.  Intermediate positions get intermediate
colors.

Try it out at:  http://luminifera.net/slider/

Have fun, and let me know what you think!

Chris Immel

-----------------------------------



File Contents

index.html
The single page of this single-page application.

sliderController.js
The UI controller through which the user runs the show.

sliderView.js
The UI view, in which all rendering to the DOM is done.

slider.css
Some simple styling.

sliderModel.js
The model of the slider puzzle data.  The logical heart of the game.

spinner.gif
An animated GIF that spins when the model is busy generating a board layout.

tools.js
General purpose utilities, such as for sorting, inserting, etc.
