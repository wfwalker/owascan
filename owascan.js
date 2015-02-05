// sample invocation:
// casperjs --engine=slimerjs owascan.js http://birdwalker.com

var casper = require('casper').create();
var args = require('system').args;

var gResources = {};

var cmdLineArgs = args.slice(4);

console.log('scanning ' + cmdLineArgs[0]);

// TODO: reuse thecount code for mapping file names to libraries
function findFileSuffix(inSuffix) {
    var scripts = [];

	for (var key in gResources) {
		if (gResources.hasOwnProperty(key) && key.indexOf(inSuffix) >= 0) {
			scripts.push(gResources[key]);
		}
	}

	return scripts;
}

// TODO: make this available to templating engine, or something
function findCacheingHeaders(inHeaders) {
	for (var index in inHeaders) {
		if (inHeaders[index].name == 'Etag' ||
			inHeaders[index].name == 'Cache-Control' ||
			inHeaders[index].name == 'Last-Modified') {
			console.log(inHeaders[index].name + ' ' + inHeaders[index].value);
		}
	}
}

function sumResourceSize() {
    var totalSize = 0;

	for (var key in gResources) {
		if (gResources.hasOwnProperty(key)) {
			totalSize = totalSize + gResources[key].bodySize;
		}
	}

	return totalSize;	
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

// casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');

casper.viewport(320, 480).then(function() {
	// TODO: make unique filename based on... timestamp?
	this.capture('frontpage.png');
});

casper.options.onResourceReceived = function(unused, response) {
	gResources[response.url] = response;
	// TODO: look for expires headers
}

casper.then(function(response){
	var gReport = {};
	// TODO: look for etags and cacheing

    gReport.body = response;
    gReport.totalSize = sumResourceSize();

	gReport.scriptsLoaded = findFileSuffix('.js');
	gReport.stylesheetsLoaded = findFileSuffix('.css');

	gReport.viewports = this.evaluate(getMetaViewport);
	gReport.appcacheManifests = this.evaluate(getAppcacheManifest);

	require('utils').dump(gReport);
});

casper.run();