/***
TiddlerFilesModule v3.0 beta for MasterIncludesPlugin
author: FND
contributor: Saq Imtiaz
based on loadExternal by Saq Imtiaz

!To Do
* fix RegEx in importFiles()
* what if MasterIncludesPlugin.js is missing?!
* importing an empty file raises an error
* review DEBUG markers
* document
** variables/settings - cf. default variables  readConfig()
** precedence (skipping): individual tiddler files take precedence over master document
** N.B.: each additional file access has significant detrimental impact on startup speed
   => recommended only for plugin development
***/

merge(MasterIncludes, {
	importedFiles: [],
	importedFilePrefix: "tiddler file imported: "
});

// hijack importExternal() to incorporate tiddler file import
MasterIncludes.importExternal_TiddlerFilesModule = MasterIncludes.importExternal;
MasterIncludes.importExternal = function() {
	this.importFiles(this.tiddlerLocations);
	MasterIncludes.importExternal_TiddlerFilesModule.apply(this, arguments);
}

// hijack readConfig() for additional configuration items
MasterIncludes.readConfig_TiddlerFilesModule = MasterIncludes.readConfig;
MasterIncludes.readConfig = function(title) {
	MasterIncludes.readConfig_TiddlerFilesModule.apply(this, arguments);
	var tiddlerLocations = store.getTiddlerSlice(title, "TiddlerFileLocations");
	this.tiddlerLocations = tiddlerLocations ? tiddlerLocations.readBracketedList() : [];
	this.created = store.getTiddlerSlice(title, "DefaultCreated") || new Date();
	this.modified = store.getTiddlerSlice(title, "DefaultModified") || new Date();
	this.modifier = store.getTiddlerSlice(title, "DefaultModifier") || this.title;
	this.reportImportedFiles = (store.getTiddlerSlice(title, "ReportImportedFiles") == "true") ? true : false;
};

// import individual tiddler files
MasterIncludes.importFiles = function(uris) {
	var externalStore = new TiddlyWiki();
	for(var i = 0; i < uris.length; i++) {
		var text = getFileContents(uris[i]);
		if(text) {
			text = text.replace(/\r/mg, ""); // remove additional EOL characters (Windows)
			var constituents = uris[i].match(/(?:.*(?:\\|\/))?(.*)(?:\.)(.*)/); // DEBUG: flawed when there is no file extension (e.g. "../foo/bar")
			var title = constituents[1];
			var type = constituents[2];
			var tags = this.tags.slice(0); // create an independent local copy
			if(type == "js")
				tags.pushUnique("systemConfig");
			if(!store.tiddlerExists(title)) { // do not overwrite local tiddlers
				store.saveTiddler(title, title, text, this.modifier, this.modified, tags, null, null, this.created);
				this.importedFiles.push(title + " (" + uris[i] + ")");
			} else {
				this.skipped.push(uris[i]);
			}
		} else {
			this.errors.push(getScriptPath() + uris[i]);
		}
	}
}

// hijack statusReport() for additional configuration items
MasterIncludes.statusReport_TiddlerFilesModule = MasterIncludes.statusReport;
MasterIncludes.statusReport = function(title) {
	this.displayArray(this.reportImportedFiles, this.importedFiles, this.importedFilePrefix);
	MasterIncludes.statusReport_TiddlerFilesModule.apply(this, arguments);
};