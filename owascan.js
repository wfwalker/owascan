// sample invocation:
// casperjs --engine=slimerjs owascan.js http://birdwalker.com

var casper = require('casper').create();
var args = require('system').args;

var gResources = {};

var cmdLineArgs = args.slice(4);

console.log('scanning ' + cmdLineArgs[0]);

function findFileSuffix(inSuffix) {
    var scripts = [];

	for (var key in gResources) {
		if (gResources.hasOwnProperty(key) && key.indexOf(inSuffix) >= 0) {
			scripts.push(key);
		}
	}

	return scripts;
}

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

casper.viewport(320, 480).then(function() {
	this.capture('frontpage.png');
});

casper.options.onResourceReceived = function(unused, response) {
	gResources[response.url] = response;
	// TODO: look for expires headers
    findCacheingHeaders(response.headers);
}

casper.then(function(response){
	// TODO: look for etags and cacheing
    // require('utils').dump(response.headers);
    console.log(response.contentType + ' size: ' + response.bodySize);
    console.log('resource size: ' + sumResourceSize());

	var scriptSources = findFileSuffix('.js');
	var stylesheetSources = findFileSuffix('.css');

	var viewports = this.evaluate(getMetaViewport);
	var appcacheManifests = this.evaluate(getAppcacheManifest);

    console.log('\n' + scriptSources.length + ' scripts found');

	for (var i = 0; i < scriptSources.length; ++i) {
		console.log('    -- "' + scriptSources[i] + '"');			
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