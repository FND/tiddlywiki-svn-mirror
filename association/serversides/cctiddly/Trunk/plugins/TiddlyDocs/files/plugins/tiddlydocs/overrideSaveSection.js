config.commands.saveSection = {};

merge(config.commands.saveSection,{
	text: "save section",
	tooltip: "Save changes to this section"});

config.commands.saveSection.handler = function(event,src,title)
{
	console.log("save serction booo");
	var tiddlerElem = story.getTiddler(title);
	if(tiddlerElem) {
		var fields = {};
		story.gatherSaveFields(tiddlerElem,fields);
		var newTitle = fields.title || title;
		if(!store.tiddlerExists(newTitle))
			newTitle = newTitle.trim();
	}
	
	var node = {
		title: newTitle,
		children:[]
	};
	testSpec.unshift(node);
	
	
	console.log(testSpec);
	
	store.saveTiddler(window.activeDocument, window.activeDocument, $.toJSON(testSpec), null, null, null, fields);
	autoSaveChanges(true, window.activeDocument);
	story.closeTiddler(title);
	story.displayTiddler(null, newTitle);
	return false;
};