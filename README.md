owascan
=======

assess an existing website for its suitability as an Open Web App, especially for Firefox OS

Uses CasperJS and SlimerJS

There are two scripts so far:

owascan.js will fetch the front page of your candidate app, scan for some gotchas, save a screenshot, and dump some JSON

owasimulate.js will create a splashpack for your candidate app install it in the Firefox OS simulator, and launch it there.

Note: this project uses git submodules, please initialize them as needed.
