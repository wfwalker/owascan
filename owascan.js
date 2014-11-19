// sample invocation:
// casperjs --engine=slimerjs owascan.js http://birdwalker.com

var casper = require('casper').create();
var args = require('system').args;

var cmdLineArgs = args.slice(4);

console.log('scanning ' + cmdLineArgs[0]);

function getScriptSources() {
    var scripts = document.querySelectorAll('script');
    return Array.prototype.map.call(scripts, function(e) {
        return e.getAttribute('src');
    });
}

function getStylesheetSources() {
    var stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    return Array.prototype.map.call(stylesheets, function(e) {
        return e.getAttribute('href');
    });
}

function getMetaViewport() {
    var viewports = document.querySelectorAll('meta[name="viewport"]');
    return Array.prototype.map.call(viewports, function(e) {
        return e.getAttribute('content');
    });
}

function getAppcacheManifest() {
    var htmls = document.querySelectorAll('html[manifest]');
    return Array.prototype.map.call(htmls, function(e) {
        return e.getAttribute('manifest');
    });
}

casper.start(cmdLineArgs[0], function() {
	this.echo('title: ' + this.getTitle());
});

casper.viewport(320, 480).then(function() {
	this.capture('frontpage.png');
});

casper.then(function(){
	var scriptSources = this.evaluate(getScriptSources);
	var stylesheetSources = this.evaluate(getStylesheetSources);
	var viewports = this.evaluate(getMetaViewport);
	var appcacheManifests = this.evaluate(getAppcacheManifest);

    console.log('\n' + scriptSources.length + ' scripts found');

	for (var i = 0; i < scriptSources.length; ++i) {
		if (scriptSources[i] == '') {
			console.log('    -- INLINE');			
		} else {
			console.log('    -- "' + scriptSources[i] + '"');			
		}
	}

    console.log('\n' + stylesheetSources.length + ' stylesheets found');

	for (var i = 0; i < stylesheetSources.length; ++i) {
		console.log('    -- "' + stylesheetSources[i] + '"');
	}

    console.log('\n' + viewports.length + ' viewports found');

	for (var i = 0; i < viewports.length; ++i) {
		console.log('    -- "' + viewports[i] + '"');
	}

    console.log('\n' + appcacheManifests.length + ' appcache manifests found');

	for (var i = 0; i < appcacheManifests.length; ++i) {
		console.log('    -- "' + appcacheManifests[i] + '"');
	}

});

casper.run();