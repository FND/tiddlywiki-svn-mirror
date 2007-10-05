//{{{

//TiddlyChatter incoming messages

config.macros.tiddlyChatterIncoming = {};

// takes a param that is a filter of the form [tag[xxx yyy]], where xxx yyy
// represents any number of tags
config.macros.tiddlyChatterIncoming.handler = function(place,macroName,params){

	var tagFilter;
	if (params) {
		tagFilter = params[0];
	}
	// set up the UI
	var tciWrapper = createTiddlyElement(place,"div","tiddlyChatterIncomingWrapper");
	createTiddlyElement(tciWrapper,"div","tiddlyChatterIncomingTitle",null,"TiddlyChatter - incoming!");
	var tciTable = createTiddlyElement(tciWrapper,"table","tiddlyChatterIncomingTable");
	var tciTableHead = createTiddlyElement(tciTable,"tr","tiddlyChatterIncomingHeader");
	createTiddlyElement(tciTableHead,"th",null,null,"Latest update");
	createTiddlyElement(tciTableHead,"th",null,null,"Title (no. of updates)");
	createTiddlyElement(tciTableHead,"th",null,null,"Last updated by");
	// now we have to add in the new content in table rows
	// TO DECIDE: how is new content marked?
	// here's a sensible approach:
	// show all public content in the list
	// if this list is displayed directly after an update, highlight the new content
	// we can support the line above by passing in the relevant tiddler titles as an input array
	var content = [];
	var notes = [];
	var filteredContent = store.filterTiddlers(tagFilter);
	for (var i=0;i<filteredContent.length;i++) {
		var tiddler = filteredContent[i];
		if(tiddler.isTagged("public")) {
			// we need to know if the tiddlers are parent content nodes or notes,
			// because we don't want to show notes as top-level content
			if(tiddler.isTagged("notes")) {
				notes.push(tiddler);
			} else {
				content.push(tiddler);
			}
		}
	}
	// at this point, content has all the top level content tiddlers
	// notes has all the notes on tiddlers
	// iterate through content array, creating table rows as we go
	for (var i=0;i<content.length;i++) {
		var tiddler = content[i];
		var noteCount = 0;
		// newestNote is at the least the original content
		var newestNote = tiddler;
		for (var j=0;j<notes.length;j++) {
			if (notes[j].title.indexOf(tiddler.title) != -1) {
				// a note with a title that contains a content node title is matched
				// increment the noteCount, which is the number of notes associated with a piece of content
				// find out if this note is the most recent update and update newestNote if so
				noteCount++;
				newestNote = (notes[j].modified.getTime() > newestNote.modified.getTime()) ? notes[j] : newestNote;
			}
		}
		// display "new" if noteCount is 0
		noteCount = noteCount === 0 ? "new" : noteCount;
		var tciTableRow = createTiddlyElement(tciTable,"tr",null,"tiddlyChatterIncomingRow");
		// we want to know how many days since the last update
		var daysSince = newestNote.modified.relativeDays();
		// display today or yesterday if daysSince is 0 or 1, respectively
		if (daysSince === 0) {
			daysSince = "today";
		} else if (daysSince == 1) {
			daysSince = "yesterday";
		}
		createTiddlyElement(tciTableRow,"td",null,null,daysSince);
		var contentTitle = tiddler.title + " (" + noteCount +")";
		var contentTitleCell = createTiddlyElement(tciTableRow,"td");
		createTiddlyText(createTiddlyLink(contentTitleCell,tiddler.title),contentTitle);
		createTiddlyElement(tciTableRow,"td",null,null,newestNote.modifier);
	}
};

// Returns the number of days since the Date
Date.prototype.relativeDays = function() {
	var now = new Date();
	var interval = now.getTime() - this.getTime();
	interval = Math.floor(interval / (1000 * 60 * 60 * 24));
	return interval;
};
//}}}