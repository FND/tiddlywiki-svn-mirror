config.macros.saveDefaultTiddlers = {
    label: "save view as default",
    prompt: "click to save view as default"
};

config.macros.saveDefaultTiddlers.handler = function(place) {
	createTiddlyButton(place,this.label,this.prompt,this.onClick);
};

config.macros.saveDefaultTiddlers.onClick = function(e)
{
	var links = [];
	story.forEachTiddler(function(title,element) {
		links.push(String.encodeTiddlyLink(title));
	});
	var body = links.join("\n");
	var t = store.getTiddler("DefaultTiddlers");
	store.saveTiddler(t.title,t.title,body,t.modifier,t.modified,t.tags,t.fields,false,t.created);
	displayMessage('DefaultTiddlers saved');
	autoSaveChanges();
	return false;
};