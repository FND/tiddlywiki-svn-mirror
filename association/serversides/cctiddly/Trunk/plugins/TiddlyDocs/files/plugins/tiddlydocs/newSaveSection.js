config.commands.saveNewSection = {};

merge(config.commands.saveNewSection,{
	text: "save section",
	tooltip: "Save changes to this section"});

config.commands.saveNewSection.handler = function(event,src,title)
{
	var testSpec  = $.parseJSON(store.getTiddlerText(window.activeDocument));
	var tiddlerElem = story.getTiddler(title);
	if(tiddlerElem) {
		var fields = {};
		story.gatherSaveFields(tiddlerElem,fields);
		var newTitle = fields.title || title;
		if(!store.tiddlerExists(newTitle))
			newTitle = newTitle.trim();
		var specTiddler = store.getTiddler(window.activeDocument);
		var fields = merge(specTiddler.fields, config.defaultCustomFields);
	} else {
		var fields = config.defaultCustomFields;
	}
	var node = {
		title: newTitle,
		children:[]
	};
	
	if(!config.commands.saveNewSection.find(newTitle, testSpec)){
		testSpec.unshift(node);
		store.saveTiddler(window.activeDocument, window.activeDocument, $.toJSON(testSpec), null, null, null, fields);
	}else{
		alert("document already contains item of this name");
	}
	if(!store.tiddlerExists(newTitle)){
		store.saveTiddler(newTitle, newTitle, config.views.wikified.defaultText, config.options.txtUserName, new Date(), "task", config.defaultCustomFields);
	}
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