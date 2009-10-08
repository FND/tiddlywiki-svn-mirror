config.commands.saveNewSection = {};
config.commands.saveNewSection.find = function(needle, haystack) {
	for(var t=0; t < haystack.length; t++) {
		if(haystack[t].title==needle)
			return true;
		if(haystack[t].children != undefined)
			config.commands.saveNewSection.find(needle, haystack[t].children);
	}
	return false;
}

window.addToToc = function(sectionTitle, docTitle) {
	var documentSpec = jQuery.parseJSON(store.getTiddlerText(docTitle)).content;
	if(!config.commands.saveNewSection.find(sectionTitle, documentSpec)){
		var node = {
			title: sectionTitle,
			children:[]
		};
		documentSpec.push(node);
		var docFields = store.getTiddler(docTitle).fields;
		var tiddler = store.saveTiddler(docTitle, docTitle, '{content:'+jQuery.toJSON(documentSpec)+'}', null, null, null, merge(docFields, config.defaultCustomFields));
	}
}

//(function() {

var _saveTiddler = Story.prototype.saveTiddler;
Story.prototype.saveTiddler = function(title, minorUpdate) {
	var autosave = config.options.chkAutoSave;
	config.options.chkAutoSave = false;
	var _title = _saveTiddler.apply(this, arguments);
	config.options.chkAutoSave = autosave;

	addToToc(_title, window.activeDocument);
	var tiddler = store.getTiddler(_title);
	tiddler.tags.push("[[doc_" + window.activeDocument + "]]");
	autoSaveChanges(null, [tiddler, window.activeDocument]);
	return _title;
};

//})();