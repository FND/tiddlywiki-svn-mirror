config.macros.TCDashboard = {
	noteTag:"notes",
	sharingTag:"public", // not used
	privateTag:"private",
	listTemplate:{
		columns:[
			{
				type:"TiddlerLink",
				title:"Title (no. of updates)",
				field:"link_title",
				tiddlerLink:"link"
			},
			{
				type:"String",
				title:"Last updated by",
				field:"last_updated_by"
			},
			{
				type:"String",
				title:"Latest update",
				field:"latest_update"
			}
		],
		rowClasses:[
			{
				field:"unread",
				className:"tiddlyChatterIncomingRowUnread"
			}
			/* {
				field:"read",
				className:"tiddlyChatterIncomingRow"
			} */
		]
		// buttons:[]
		// actions:[]
	}
};

Tiddler.prototype.isUnread = function() {
	return this.fields["unread"] == "true";
};

Tiddler.prototype.isChildTiddler = function(parent) {
	// matching a parent with a child containing the parent's title
	return parent && this.title.indexOf(parent.title)!=-1;
};

config.macros.TCDashboard.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	var filter = params ? params[0] : "";
	var contentAndNotes = [];
	// contentAndNotes is an array of objects, each of which has a "content" and a "notes" property
	// "content" is a tiddler; "notes" is an array of tiddlers
	// [{content:content1,notes:[note1a,note1b]},{content:content2,notes[note2a,note2b]},...]

	// process: collect the content first and set up the contentAndNotes array
	// collect the notes at the same time and store them in the notes array
	// sort notes by modify date
	// run through cotent, adding each item's notes to contentAndNotes
	// sort contentAndNotes by modify date of most recent note belonging to content
	var notes = [];
	var tiddlers = store.filterTiddlers(filter);
	for(var i=0;i<tiddlers.length;i++) {
		var t = tiddlers[i];
		if(!t.isTagged(this.privateTag)) {
			if(!t.isTagged(this.noteTag)) {
				// it's parent content
				contentAndNotes.push({content:t,notes:[]});
			} else {
				// it's a note
				notes.push(t);
			}
		}
	}
	notes.sort(function(a,b){
		return a.modified > b.modified ? -1 : (a.modified == b.modified ? 0 : 1);
	});
	
	for(i=0;i<contentAndNotes.length;i++) {
		var obj = contentAndNotes[i];
		for (var j=0;j<notes.length;j++) {
			if(notes[j].isChildTiddler(obj["content"])) {
				obj["notes"].push(notes[j]);
			}
		}
	}
	
	contentAndNotes.sort(function(a,b){
		// a["notes"][0] is the most recent note for a piece of content, if it exists
		// if it doesn't exist, use the content itself
		var a_most_recent = a["notes"][0] ? a["notes"][0] : a["content"];
		var b_most_recent = b["notes"][0] ? b["notes"][0] : b["content"];
		return a_most_recent.modified > b_most_recent.modified ? -1 : (a_most_recent.modified == b_most_recent.modified ? 0 : 1);
	});
	
	// map contentAndNotes onto listObject
	var listObject = [];
	for(i=0;i<contentAndNotes.length;i++) {
		obj = contentAndNotes[i];
		// newestNote is the first note in obj["notes"] or the content itself if there are no notes
		// display "today" or "yesterday" if daysSince is 0 or 1, respectively
		var noteCount = obj["notes"] ? obj["notes"].length : 0;
		var newestNote = noteCount !== 0 ? obj["notes"][0] : obj["content"];
		var newContent = noteCount === 0 ? true : false;
		var daysSince = newestNote.modified.relativeDays();
		daysSince = (daysSince===0 ? "today" : (daysSince==1 ? "yesterday" : daysSince + " days ago"));
		var contentTitle = obj["content"].title;
		var contentTitleSuffix = newContent ? " (new)" : " (" + noteCount + ")";
		
		listObject[i] = {
			latest_update:daysSince,
			link_title:contentTitle + contentTitleSuffix,
			link:contentTitle,
			last_updated_by:newestNote.modifier,
			unread:newestNote.isUnread(),
			row_name:contentTitle
		};
	}
	
	// Create the ListView
	var table = ListView.create(place,listObject,this.listTemplate);
	var this_tiddler = story.findContainingTiddler(table);
	this_tiddler.setAttribute("refresh","tiddler");
	this_tiddler.setAttribute("force","true");
};

/*** 16/10 - Patch not submitted yet ***/

// Returns the number of days since the Date
Date.prototype.relativeDays = function() {
	var now = new Date();
	var interval = now.getTime() - this.getTime();
	interval = Math.floor(interval / (1000 * 60 * 60 * 24));
	return interval;
};