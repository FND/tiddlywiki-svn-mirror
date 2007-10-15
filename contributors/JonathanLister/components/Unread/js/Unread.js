config.macros.unread = {};

config.macros.unread.handler = function(place,macroName,param,wikifier,paramString,tiddler) {
	// check to see if tiddler has extended field "unread"
	// if so, add button to click to change status to read
	if (tiddler.fields["unread"]) {
		var unread = tiddler.fields["unread"];
		var label = unread == "true" ? "Mark as read" : "Mark as unread";
		var caption = unread == "false" ? "Click to mark as read" : "Click to mark as unread";
		var theUnreadBox = createTiddlyButton(place,label,caption);
		theUnreadBox.onclick = config.macros.unread.markAsRead;
	}
};

config.macros.unread.markAsRead = function() {
	var DOMTiddler = story.findContainingTiddler(this);
	var t = store.fetchTiddler(DOMTiddler.getAttribute("tiddler"));
	t.fields["unread"] = t.fields["unread"] == "true" ? "false" : "true";
	// store.saveTiddler(t.title,t.title,t.text,t.modifier,t.modified,t.tags,t.fields,false,t.created);
	// story.refreshTiddler(DOMTiddler.getAttribute("tiddler"),DOMTiddler.getAttribute("template"),true);
	story.refreshAllTiddlers();
	// the line above seems rather heavy-handed... what's an efficient way to make another tiddler respond to a change in this one's fields?
	// also, if I don't save t back to the store, does this have any consequences? Or is it happening automatically?
};