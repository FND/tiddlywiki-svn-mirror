/***
MasterIncludesPlugin v3.0 beta
author: FND
contributor: Saq Imtiaz
based on loadExternal by Saq Imtiaz

!To Do
* bug: readOnly in ConfigOverride not working properly (requires using EnableEdit bookmarklet)
* master document optional when using TiddlerFilesModule!?
* review DEBUG markers
* tweak annotation colors
* MasterIncludesLogMacro
** literal "\n" when used in parameter
** excessive trailing BR
* re-introduce shadow tiddler / backstage panel for logs
* document
** variables/settings - cf. default variables, readConfig()
** TiddlerFilesModule
** precedence (skipping)
** logs (MasterIncludesLogMacro)
** limitations
*** XSS restrictions: limited to master files on the same host (for non-local TW documents)
**** cf. http://www.tiddlywiki.org/wiki/Importing#Limitations
*** single master file (intentional!)
*** modification of included MarkupPostBody, MarkupPostHead, MarkupPreBody and MarkupPreHead require the respective //client// document to be saved before taking effect
** version number in backstage tooltip
** MasterIncludesLogMacro (see extra file)
** ShowWhen to style external tiddlers
** alternatives: http://www.tiddlytools.com/#LoadTiddlersPlugin & http://www.tiddlytools.com/#RunTiddlerPlugin (cf. http://groups.google.com/group/TiddlyWiki/browse_thread/thread/6533548448e19d91/1b31e898715d9228?#1b31e898715d9228)
** wiki page
** via remote, attempts to import non-existing files usually result in importing a 404 page
* integrate MasterIncludesLogMacro
* re-organize code order (functions)
* compress code (cf. http://www.tiddlywiki.org/wiki/TinyTiddly)
***/

MasterIncludes = {
	name: "MasterIncludesPlugin",
	version: "3.0 alpha",
	configTiddler: "MasterIncludesConfig",
	defaultTag: "MasterIncludes", // DEBUG: rename?
	annotation: "This tiddler has been loaded from an external file. Changes will only be saved in this local TiddlyWiki document.",
	warning: "This tiddler has been loaded from an external file.\nDo you wish to save it in this file?",
	importedPrefix: "tiddler imported: ",
	skippedPrefix: "skipped during import: ",
	errorPrefix: "error during import: ",
	styles: "html body .MasterIncludesAnnotation { border-color: #ff2f37; background: #ffbfc2; }",
	imported: [],
	skipped: [],
	errors: []
};

MasterIncludes.init = function() {
	// backup store's dirty status
	var dirtyStatus = store.isDirty();
	// begin import
	if(store.isTiddler(this.configTiddler)) {
		// read configuration settings
		this.readConfig(this.configTiddler);
		// import external resources
		this.importExternal();
		// apply custom styles
		setStylesheet(this.styles, "MasterIncludesStyles");
	} else {
		this.errors.push(this.configTiddler + " not found");
	}
	// restore store's dirty status
	store.setDirty(dirtyStatus);
};

// read configuration from configTiddler
MasterIncludes.readConfig = function(title) {
	this.title = store.getTiddlerSlice(title, "Title") || "MasterIncludes";
	this.masterLocation = store.getTiddlerSlice(title, "MasterLocation") || "master.html";
	this.importFilter = store.getTiddlerSlice(title, "ImportFilter");
	var customTags = store.getTiddlerSlice(title, "ExternalTags");
	this.tags = customTags ? customTags.readBracketedList() : [];
	this.tags.pushUnique(this.defaultTag);
	this.reportImported = (store.getTiddlerSlice(title, "ReportImported") == "true") ? true : false;
	this.reportSkipped = (store.getTiddlerSlice(title, "ReportSkipped") == "true") ? true : false;
	this.reportErrors = (store.getTiddlerSlice(title, "ReportErrors") == "false") ? false : true;
};

// import external resources
MasterIncludes.importExternal = function() {
	this.importDocument(this.masterLocation);
};

// import tiddlers from master TiddlyWiki document
MasterIncludes.importDocument = function(uri) {
	var externalStore = new TiddlyWiki();
	if(uri)
		var text = getFileContents(uri);
	if(text) {
		externalStore.importTiddlyWiki(text);
		if(this.importFilter) {
			var tiddlers = externalStore.filterTiddlers(this.importFilter);
			for(var t = 0; t < tiddlers.length; t++) {
				this.importTiddler(tiddlers[t], tiddlers[t].title);
			}
		} else {
			externalStore.forEachTiddler(function(title, tiddler) {
				this.importTiddler(tiddler, title);
			});
		}
	} else {
		this.errors.push(getScriptPath() + uri);
	}
};

MasterIncludes.importTiddler = function(tiddler, title) {
	if(!store.tiddlerExists(title)) { // do not overwrite local tiddlers
		for(var i = 0; i < this.tags.length; i++)
			tiddler.tags.pushUnique(this.tags[i]);
		store.addTiddler(tiddler);
		this.imported.push(title);
		return true;
	} else {
		this.skipped.push(title);
		return false;
	}
};

function getFileContents(uri) {
	if(isHttp(uri))
		return getRemoteData(uri);
	else if(isHttp(document.location.toString()))
		return getRemoteData(getScriptPath() + uri.replace(/\\/, "/"));
	else
		return loadFile(getScriptPath() + uri);
}

// DEBUG: might become obsolete with refactored core code; cf. notes on ticket #435 (http://trac.tiddlywiki.org/ticket/435)
function getScriptPath() {
	var originalPath = document.location.toString();
	if(isHttp(originalPath)) { // remote (HTTP) path
		var dirPathPos = originalPath.lastIndexOf("/");
		return originalPath.substr(0, dirPathPos) + "/";
	} else { // local path
		var localPath = getLocalPath(originalPath);
		var separator = "\\"; //backSlash = true; -- DEBUG'd
		var dirPathPos = localPath.lastIndexOf("\\");
		if(dirPathPos == -1) {
			dirPathPos = localPath.lastIndexOf("/");
			separator = "/";
		}
		return localPath.substr(0, dirPathPos) + separator;
	}
}

function getRemoteData(uri) {
	if(window.Components && window.netscape && window.netscape.security && !isHttp(document.location.protocol))
		window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	var XHR = getXMLHttpRequest();
	if(XHR) {
		XHR.open("GET", uri, false);
		XHR.send(null);
		if(XHR.status == 0 || 200)
			return XHR.responseText;
		else
			return false;
	} else {
		return false;
	}
}

function isHttp(str) {
	return str.indexOf("http") != -1;
}

// hijack loadPlugins() to create hook
loadPlugins_MasterIncludes = window.loadPlugins;
window.loadPlugins = function() {
	MasterIncludes.init();
	loadPlugins_MasterIncludes.apply(this, arguments);
};

// hijack backstage initialization to add link to master document
backstage.init_MasterIncludes = backstage.init;
backstage.init = function(place, macroName, params, wikifier, paramString, tiddler) {
	this.init_MasterIncludes.apply(this, arguments);
	if(MasterIncludes.masterLocation) {
		var btn = createTiddlyButton(document.getElementById("backstageToolbar"),
			MasterIncludes.title + glyph("bentArrowRight"),
			MasterIncludes.name + " v" + MasterIncludes.version,
			function() { backstage.switchTab(null); }, // DEBUG: not enough!? - cf. backstage.onClickCommand() / Save button in backstage
			"backstageTab backstageAction",
			null, null, { href: MasterIncludes.masterLocation }
		);
		if(config.options.chkOpenInNewWindow)
			btn.target = "_blank";
	}
	MasterIncludes.statusReport();
};

// report import status (imported, skipped, errors)
MasterIncludes.statusReport = function() { // DEBUG: rename!?
	if(this.reportErrors === undefined)
		this.reportErrors = true;
	this.displayArray(this.reportImported, this.imported, this.importedPrefix);
	this.displayArray(this.reportSkipped, this.skipped, this.skippedPrefix);
	this.displayArray(this.reportErrors, this.errors, this.errorPrefix);
};

MasterIncludes.displayArray = function(chk, arr, prefix) { // DEBUG: rename!?
	if(chk)
		for(var i = 0; i < arr.length; i++)
			displayMessage(prefix + arr[i]);
};

// override externalize() to exclude external tiddlers from store when saving
SaverBase.prototype.externalize = function(store) {
	var results = [];
	var tiddlers = store.getTiddlers("title", MasterIncludes.defaultTag);
	for(var t = 0; t < tiddlers.length; t++)
		results.push(this.externalizeTiddler(store, tiddlers[t]));
	return results.join("\n");
};

// hijack annotations macro to add annotation for external tiddlers
config.macros.annotations.handler_MasterIncludes = config.macros.annotations.handler;
config.macros.annotations.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	if(tiddler.isTagged(MasterIncludes.defaultTag)) {
		wikify(MasterIncludes.annotation, createTiddlyElement(place, "div", null, "annotation MasterIncludesAnnotation"), null, tiddler);
	} else
		this.handler_MasterIncludes.apply(this, arguments);
};

// hijack saveTiddler() to add warning for external tiddlers
Story.prototype.saveTiddler_MasterIncludes = Story.prototype.saveTiddler;
Story.prototype.saveTiddler = function(title, minorUpdate) {
	if(store.getTiddler(title) && store.getTiddler(title).isTagged(MasterIncludes.defaultTag)) {
		var cont = confirm(MasterIncludes.warning);
		if(!cont)
			story.setTiddlerTag(title, MasterIncludes.defaultTag, -1); // remove default tag when saving locally
		else
			return false;
	}
	this.saveTiddler_MasterIncludes.apply(this, arguments);
};

// DEBUG: to become obsolete with ticket #442 (http://trac.tiddlywiki.org/ticket/442)
TiddlyWiki.prototype.isTiddler = function(title) {
	return store.tiddlerExists(title) || store.isShadowTiddler(title);
};

/* MasterIncludesLogMacro */

config.macros.MasterIncludesLog = {
	emptySuffix: "empty log array: ",
	errorPrefix: "error accessing log array: "
};

config.macros.MasterIncludesLog.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	if(MasterIncludes[params[0]] && MasterIncludes[params[0]].length > 0) {
		this.prefix = params[1] || "* [[";
		this.suffix = params[2] || "]]\n";
		var output = "";
		for(var i = 0; i < MasterIncludes[params[0]].length; i++)
			output += this.prefix + MasterIncludes[params[0]][i] + this.suffix;
	} else if(MasterIncludes[params[0]]) {
		var output = this.emptySuffix + "{{{" + params[0] + "}}}";
	} else {
		var output = this.errorPrefix + "{{{" + params[0] + "}}}";
	}
	wikify(output, place);
};
