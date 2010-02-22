// Cecily continuously modifies the current map tiddler as tiddlers are moved around and resized. This hack
// is to avoid warning the user of unsaved changes when they browse away from Cecily

if(window.location.protocol !== "file:") {
	window.unload = function() {};
	window.confirmExit = function() {};
	config.options.chkAutoSave = false;
}

