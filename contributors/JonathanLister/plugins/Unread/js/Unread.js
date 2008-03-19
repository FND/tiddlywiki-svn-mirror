config.macros.unread = {};

config.macros.unread.handler = function(place,macroName,param,wikifier,paramString,tiddler) {
	// check to see if tiddler has extended field "unread"
	// if so, add button to click to change status to read
	if (tiddler.fields["unread"]) {
		var unread = tiddler.fields["unread"] == "true" ? true : false;
		// SUPPORTING: tiddlers with notes - if a note is unread, reflect that in the status
		if (config.macros.notes) {
			// Get the notes tiddlers for this tiddler and set their unread status to that of the parent tiddler
			var notes_tiddlers = store.getTaggedTiddlers("notes");
			var notes = [];
			var notesCount = 0;
			for (var i=0;i<notes_tiddlers.length;i++) {
				if (notes_tiddlers[i].title != t.title && notes_tiddlers[i].title.indexOf(t.title) != -1) {
					if (notes_tiddlers[i].fields["unread"]) {
						unread = notes_tiddlers[i].fields["unread"] == "true" ? true : false;
					}
				}
			}
		}
		var label = (unread) ? "Mark as read" : "Mark as unread";
		var caption = (!unread) ? "Click to mark as read" : "Click to mark as unread";
		var theUnreadBox = createTiddlyButton(place,label,caption);
		theUnreadBox.onclick = config.macros.unread.markAsRead;
		theUnreadBox.status = unread;
	}
};

config.macros.unread.markAsRead = function() {
	var DOMTiddler = story.findContainingTiddler(this);
	var t = store.fetchTiddler(DOMTiddler.getAttribute("tiddler"));
	// switch unread status
	t.fields["unread"] = this.status ? "false" : "true";
	// SUPPORTING: tiddlers with notes, so we can mark all read at once
	if (config.macros.notes) {
		// Get the notes tiddlers for this tiddler and set their unread status to that of the parent tiddler
		var notes_tiddlers = store.getTaggedTiddlers("notes");
		var notes = [];
		var notesCount = 0;
		for (var i=0;i<notes_tiddlers.length;i++) {
			if (notes_tiddlers[i].title != t.title && notes_tiddlers[i].title.indexOf(t.title) != -1) {
				if (notes_tiddlers[i].fields["unread"]) {
					notes_tiddlers[i].fields["unread"] = t.fields["unread"];
				}
			}
		}
	}
	// store.saveTiddler(t.title,t.title,t.text,t.modifier,t.modified,t.tags,t.fields,false,t.created);
	// story.refreshTiddler(DOMTiddler.getAttribute("tiddler"),DOMTiddler.getAttribute("template"),true);
	story.refreshAllTiddlers();
	// the line above seems rather heavy-handed... what's an efficient way to make another tiddler respond to a change in this one's fields?
	// also, if I don't save t back to the store, does this have any consequences? Or is it happening automatically?
};