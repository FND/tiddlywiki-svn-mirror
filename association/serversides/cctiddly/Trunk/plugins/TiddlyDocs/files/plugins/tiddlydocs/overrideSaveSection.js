config.commands.saveSection = {};

merge(config.commands.saveSection,{
	text: "save section",
	tooltip: "Save changes to this section"});

config.commands.saveSection.handler = function(event,src,title)
{
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
	testSpec.unshift(node);
	store.saveTiddler(window.activeDocument, window.activeDocument, $.toJSON(testSpec), null, null, null, fields);
	autoSaveChanges();
	story.closeTiddler(title);
	story.displayTiddler(null, newTitle);
	return false;
};