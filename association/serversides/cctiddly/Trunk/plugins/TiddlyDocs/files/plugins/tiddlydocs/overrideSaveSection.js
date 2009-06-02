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
/*	if(!store.tiddlerExists(newTitle)) {
		var spec = "* "+newTitle+"\n"+store.getTiddlerText(window.activeDocument);
	}
	
*/

	var node = {
		title: newTitle,
		children:[]
	};
	testSpec.push(node);
	
	
	console.log(testSpec);
	
	store.saveTiddler(window.activeDocument, window.activeDocument, $.toJSON(testSpec), null, null, null, fields);
	autoSaveChanges(window.activeDocument, true);
	story.closeTiddler(title);
	story.displayTiddler(null, newTitle);
	return false;
};