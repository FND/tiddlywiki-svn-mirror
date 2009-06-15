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
	var documentSpec = $.parseJSON(store.getTiddlerText(docTitle));
	if(!config.commands.saveNewSection.find(sectionTitle, documentSpec)){
		var node = {
			title: sectionTitle,
			children:[]
		};
		documentSpec.unshift(node);
		var docFields = store.getTiddler(docTitle).fields;
		console.log("fileds are : ", merge(docFields, config.defaultCustomFields));
		
		var tiddler = store.saveTiddler(docTitle, docTitle, $.toJSON(documentSpec), null, null, null, merge(docFields, config.defaultCustomFields));

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




/*
config.commands.saveNewSection = {};

merge(config.commands.saveNewSection,{
	text: "save section",
	tooltip: "Save changes to this section",
	sectionExistsWarning :  "document already contains a section of the name: "
});

config.commands.saveNewSection.handler = function(event,src,title)
{
	
	console.log("config.commands.saveNewSection");
	var testSpec  = $.parseJSON(store.getTiddlerText(window.activeDocument));
	var existingTiddler = story.getTiddler(title);
	if(existingTiddler) {
		console.log("et", existingTiddler);
		var fields = {};
		story.gatherSaveFields(existingTiddler,fields);
		var newTitle = fields.title || title;
		if(!store.tiddlerExists(newTitle))
			newTitle = newTitle.trim();
		var specTiddler = store.getTiddler(window.activeDocument);
		console.log(store.getTiddler);
		var existingTiddlerFields = merge(existingTiddler.getAttribute("tiddlyFields"), config.defaultCustomFields);
	} else {
		var existingTiddlerFields = config.defaultCustomFields;
	}
	var node = {
		title: newTitle,
		children:[]
	};
	// if the tiddler is not already part of the TOC the add it
	if(!config.commands.saveNewSection.find(newTitle, testSpec)){
		testSpec.unshift(node);
		store.saveTiddler(window.activeDocument, window.activeDocument, $.toJSON(testSpec), null, null, null, existingTiddlerFields);
	}
	if(specTiddler.fields){
		var specTiddlerFields = merge(specTiddler.fields, config.defaultCustomFields);
	}else{
		var specTiddlerFields = config.defaultCustomFields ;
	}
	store.saveTiddler(newTitle, newTitle, config.views.wikified.defaultText, config.options.txtUserName, new Date(), "task", specTiddlerFields );
	story.closeTiddler(title);
	story.displayTiddler(null, newTitle);
	return false;
};

config.commands.saveNewSection.find = function(needle, haystack) {
	for(var t=0; t < haystack.length; t++) {
		if(haystack[t].title==needle) {
			return true;
		}
		config.commands.saveNewSection.find(needle, haystack[t].children);
	}
	return false;
}

*/