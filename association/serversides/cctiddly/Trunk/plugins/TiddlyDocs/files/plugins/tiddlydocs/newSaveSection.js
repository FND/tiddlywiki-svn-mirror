config.commands.saveNewSection = {};

merge(config.commands.saveNewSection,{
	text: "save section",
	tooltip: "Save changes to this section",
	sectionExistsWarning :  "document already contains a section of the name: "
});

config.commands.saveNewSection.handler = function(event,src,title)
{
	
	alert("heere");
	var testSpec  = $.parseJSON(store.getTiddlerText(window.activeDocument));
	var existingTiddler = story.getTiddler(title);
	if(existingTiddler) {
		var fields = {};
		story.gatherSaveFields(existingTiddler,fields);
		var newTitle = fields.title || title;
		if(!store.tiddlerExists(newTitle))
			newTitle = newTitle.trim();
		var specTiddler = store.getTiddler(window.activeDocument);
		var existingTiddlerFields = merge(specTiddler.fields, config.defaultCustomFields);
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


	// get fields for the tiddler if it already exists. 

	store.saveTiddler(newTitle, newTitle, config.views.wikified.defaultText, config.options.txtUserName, new Date(), "task", config.defaultCustomFields);

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