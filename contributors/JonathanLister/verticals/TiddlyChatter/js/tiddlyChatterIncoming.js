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
	tciWrapper.setAttribute("refresh","content");
	tciWrapper.setAttribute("force","true");
	createTiddlyElement(tciWrapper,"div","tiddlyChatterIncomingTitle",null,"TiddlyChatter - incoming!");
	var tciTable = createTiddlyElement(tciWrapper,"table","tiddlyChatterIncomingTable");
	var tciTableHead = createTiddlyElement(tciTable,"tr","tiddlyChatterIncomingHeader");
	createTiddlyElement(tciTableHead,"th",null,null,"Latest update");
	createTiddlyElement(tciTableHead,"th",null,null,"Title (no. of updates)");
	createTiddlyElement(tciTableHead,"th",null,null,"Last updated by");
	// now we have to add in the new content in table rows
	// content_and_notes holds our content and associated notes in the form:
	// [{content:content1,notes:[note1a,note1b]},{content:content2,notes[note2a,note2b]},...]
	var content_and_notes = [];
	var notes = [];
	var filteredContent = store.filterTiddlers(tagFilter);
	// process: collect the content first and set up the content_and_notes array
	// collect the notes at the same time and store them
	// sort notes by modify date
	// run through cotent, adding its notes to content_and_notes
	// sort content_and_notes by modify date of most recent note belonging to content
	for (var i=0;i<filteredContent.length;i++) {
		var t = filteredContent[i];
		if (t.isTagged("public")) {
			if (!t.isTagged("notes")) {
				// it's parent content
				content_and_notes.push({content:t,notes:[]});
			} else {
				// it's a note
				notes.push(t);
			}
		}
	}
	notes.sort(function(a,b){
		return a.modified > b.modified ? -1 : (a.modified == b.modified ? 0 : 1);
	});
	for (var i=0;i<content_and_notes.length;i++) {
		var content_object = content_and_notes[i];
		for (var j=0;j<notes.length;j++) {
			if (notes[j].title.indexOf(content_object["content"].title) != -1) {
				// matched a note with a title containing a piece of content's title
				content_object["notes"].push(notes[j]);
			}
		}
	}
	content_and_notes.sort(function(a,b){
		var a_most_recent, b_most_recent;
		// a["notes"][0] is the most recent note for a piece of content, if it exists
		// if it doesn't exist, use the content itself
		if (a["notes"][0]) {
			a_most_recent = a["notes"][0];
		} else {
			a_most_recent = a["content"];
		}
		if (b["notes"][0]) {
			b_most_recent = b["notes"][0];
		} else {
			b_most_recent = b["content"];
		}
		return a_most_recent.modified > b_most_recent.modified ? -1 : (a_most_recent.modified == b_most_recent.modified ? 0 : 1);
	});
	// iterate through content_and_notes array, creating table rows as we go
	for (var i=0;i<content_and_notes.length;i++) {
		var content_object = content_and_notes[i];
		// noteCount is the number of notes in content_object["notes"];
		var noteCount = content_object["notes"] ? content_object["notes"].length : 0;
		// newestNote is the first note in content_object["notes"] or the content itself if there are no notes
		var newestNote = noteCount !== 0 ? content_object["notes"][0] : content_object["content"];
		// display "new" if noteCount is 0
		noteCount = noteCount === 0 ? "new" : noteCount;
		var tciTableRow = createTiddlyElement(tciTable,"tr",null,"tiddlyChatterIncomingRow");
		// if the content for this row is unread, give the row a class of "unread"
		// "unread" is a custom field on an imported tiddler
		if (newestNote.fields["unread"]) {
			tciTableRow.setAttribute("class","tiddlyChatterIncomingRowUnread");
		}
		// we want to know how many days since the last update
		var daysSince = newestNote.modified.relativeDays();
		// display today or yesterday if daysSince is 0 or 1, respectively
		if (daysSince === 0) {
			daysSince = "today";
		} else if (daysSince == 1) {
			daysSince = "yesterday";
		} else {
			daysSince = daysSince + " days ago";
		}
		createTiddlyElement(tciTableRow,"td",null,null,daysSince);
		var contentTitle = content_object["content"].title + " (" + noteCount +")";
		var contentTitleCell = createTiddlyElement(tciTableRow,"td");
		var contentLink = createTiddlyLink(contentTitleCell,content_object["content"].title);
		createTiddlyText(contentLink,contentTitle);
		contentLink.content_object = content_object;
		contentLink.onclick_old = contentLink.onclick;
		contentLink.onclick = function() {
			var titles = [];
			titles[0] = this.content_object["content"].title;
			for (var i=0;i<this.content_object["notes"].length;i++) {
				titles.push(this.content_object["notes"][i].title);
			}
			for (var i=0;i<titles.length;i++) {
				var t = store.fetchTiddler(titles[i]);
				if (t.fields["unread"] && t.fields["unread"] == true) {
					t.fields["unread"] = false;
					t.set(t.title,t.text,t.modifier,t.modified,t.tags,t.created,t.fields);
				}
			}
			var this_tiddler = story.findContainingTiddler(this);
			story.refreshTiddler(this_tiddler.getAttribute("tiddler"),this_tiddler.getAttribute("template"),true);
		contentLink.onclick_old.apply(this,arguments);
		};
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