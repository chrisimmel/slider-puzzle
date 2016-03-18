# slider-puzzle
The classic sliding puzzle game, with some new reinterpretation.

This is pure HTML + JavaScript.  The only external dependency is on the D3 library for UI rendering.
All you have to do to run it is put all the files together in a directory, then open index.html in a
browser.


Contents

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
