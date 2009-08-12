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
		documentSpec.unshift(node);
		var docFields = store.getTiddler(docTitle).fields;
		var tiddler = store.saveTiddler(docTitle, docTitle, {content:jQuery.toJSON(documentSpec)}, null, null, null, merge(docFields, config.defaultCustomFields));

	}
}

Story.prototype.saveTiddler = function(title,minorUpdate)
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem) {
		var fields = {};
		this.gatherSaveFields(tiddlerElem,fields);
		var newTitle = fields.title || title;
		if(!store.tiddlerExists(newTitle))
			newTitle = newTitle.trim();
		if(store.tiddlerExists(newTitle) && newTitle != title) {
			if(!confirm(config.messages.overwriteWarning.format([newTitle.toString()])))
				return null;
		}
		if(newTitle != title)
			this.closeTiddler(newTitle,false);
		tiddlerElem.id = this.tiddlerId(newTitle);
		tiddlerElem.setAttribute("tiddler",newTitle);
		tiddlerElem.setAttribute("template",DEFAULT_VIEW_TEMPLATE);
		tiddlerElem.setAttribute("dirty","false");
		if(config.options.chkForceMinorUpdate)
			minorUpdate = !minorUpdate;
		if(!store.tiddlerExists(newTitle))
			minorUpdate = false;
		var newDate = new Date();
		var extendedFields = store.tiddlerExists(newTitle) ? store.fetchTiddler(newTitle).fields : (newTitle!=title && store.tiddlerExists(title) ? store.fetchTiddler(title).fields : merge({},config.defaultCustomFields));
		for(var n in fields) {
			if(!TiddlyWiki.isStandardField(n))
				extendedFields[n] = fields[n];
		}
		var tiddler = store.saveTiddler(title,newTitle,fields.text,minorUpdate ? undefined : config.options.txtUserName,minorUpdate ? undefined : newDate,fields.tags,extendedFields);
		window.addToToc(newTitle, window.activeDocument);
		autoSaveChanges(null,[tiddler]);
		return newTitle;
	}
	return null;
};

