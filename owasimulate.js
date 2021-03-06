// Take a given URL, make a splashpack for it, run it in the simulator.

// prerequisites:

var startSimulator = require('node-firefox-start-simulator');
var launchApp = require('node-firefox-launch-app');
var installApp = require('node-firefox-install-app');
var findApp = require('node-firefox-find-app');
var uninstallApp = require('node-firefox-uninstall-app');
var connect = require('node-firefox-connect');

var url = require('url');
var args = require('system').args;
var wrench = require('wrench');
var fs = require('fs');

// parse command-line args

var cmdLineArgs = args.slice();
var appURL = url.parse(args[2]);
var safeString = appURL.host;

// Make a copy of ../splashpack in a unqiuely named folder

wrench.copyDirSyncRecursive('../splashpack', safeString, {
	forceDelete: true,
	filter: '\.git'
});

// helper function that reads a file, replaces a regex with a string, writes back the file

function fixFile(filename, fileRegex, newString) {
	var data = fs.readFileSync(filename, 'utf8');
	var fixed = data.replace(fileRegex, newString);
	fs.writeFileSync(filename, fixed);
	console.log('fixed ' + filename);
	return fixed;
}

// EDIT the splashpack

// Modify index.html and add your app name and hosted URL.
fixFile(safeString + '/index.html', /http:\/\/your-mobile-site-url.com/g, args[2]);

// Modify manifest.webapp and add your app name, description and developer details.
var manifestString = fs.readFileSync(safeString + '/manifest.webapp', 'utf8');
var manifest = JSON.parse(manifestString);
manifest.description = 'demonstration of ' + safeString + ' as app'
manifest.developer.name = 'owasimulate script';
manifest.name = safeString;
manifest.chrome.navigation = false;
fs.writeFileSync(safeString + '/manifest.webapp', JSON.stringify(manifest));

// Modify static/script.js and replace the URL with your app URL on line 10.
fixFile(safeString + '/static/script.js', /http:\/\/your-mobile-site-url.com/g, args[2]);

// TODO: Replace the icons in static/ with your own at 60px by 60px and 128px by 128px.

// start the simulator, install the splashpack we just made, then launch that app

startSimulator({ version: '2.2' }).then(function(simulator) {
	connect(simulator.port).then(function(client) {
		installApp({
			appPath: safeString,
			client: client
		}).then(function(appId) {
			console.log('App was installed with appId = ', appId);
			findApp({
				manifest: manifest,
				client: client
			}).then(function(apps) {
				if (apps.length > 0) {
					var firstApp = apps[0];
					console.log('firstApp');
					console.log(firstApp);
					launchApp({
						client: client,
						manifestURL: firstApp.manifestURL
					}).then(function(result) {
						console.log('Launched app', result);
					}, function(err) {
						console.error('Could not launch app', err);
					});
				}
			}, function(e) {
				console.error('Could not find app', e);
			});
		}, function(error) {
			console.error('App could not be installed: ', error);
		});
	});
});


