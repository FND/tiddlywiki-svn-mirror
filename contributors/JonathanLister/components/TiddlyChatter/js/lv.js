config.macros.lv = {};

config.macros.lv.init = function() {
	// create personal ChatterFeed with the username on the end
	var newTitle = "ChatterFeed" + config.options.txtUserName;
	if (!store.getTiddler(newTitle)) {
		var ownFeed = document.location.href.replace(/.html$/,".xml");
		var newText = "|''Type:''|RSS|\n|''URL:''|"+ownFeed+"|\n|''Workspace:''||\n|''TiddlerFilter:''|[tag[public]]|";
		var newTags = "channel public published systemServer";
		store.saveTiddler(newTitle,newTitle,newText,config.options.txtUserName,null,newTags,null,true);
	}
};

config.macros.lv.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	var table, this_tiddler;
	var subManagement, subManagementSlider;
	var listTemplate = {};
	listTemplate.columns = [];
	listTemplate.rowClasses = [];
	listTemplate.buttons = [];
	// listTemplate.actions = [];
	listTemplate.columns.push({
		type:"String",
		title:"Latest update",
		field:"latest_update"
	});
	listTemplate.columns.push({
		type:"TiddlerLink",
		title:"Title (no. of updates)",
		field:"link_title",
		tiddlerLink:"link"
	});
	listTemplate.columns.push({
		type:"String",
		title:"Last updated by",
		field:"last_updated_by"
	});
	/* listTemplate.columns.push({
		type:"Selector",
		field:"checked",
		rowName:"row_name"
	}); */
	listTemplate.rowClasses.push({
		field:"unread",
		className:"tiddlyChatterIncomingRowUnread"
	});
	listTemplate.rowClasses.push({
		field:"read",
		className:"tiddlyChatterIncomingRow"
	});
	listTemplate.buttons.push({
		name:"Get updates",
		caption:"Get",
		allowEmptySelection:"true"
	});
	listTemplate.buttons.push({
		name:"Create chatter",
		caption:"Create",
		allowEmptySelection:"true"
	});
	listTemplate.buttons.push({
		name:"Manage subscriptions",
		caption:"Manage",
		allowEmptySelection:"true"
	});
	/* listTemplate.actions.push({
		name:"bark",
		caption:"woof woof"
	});
	listTemplate.actions.push({
		name:"laugh",
		caption:"ha ha"
	}); */
	// callback has to deal with all the different functions, so select them by 'name'
	var callback = function(view,name,tiddlers) {
		switch(name) {
				case "Get updates":
					// when filterTiddlers supports excluding tiddlers, it will make sense to
					// exclude systemServer tiddlers so we don't collect other people's subscriptions
					config.macros.importWorkspaceMulti.importAll("[tag["+config.options.txtImportTag+"]]");
					break;
				case "Manage subscriptions":
				subManagement.style.display = subManagement.style.display == "none" ? "block" : "none";
					break;
				case "Create chatter":
					// mimicing the newTiddler button
					this.setAttribute("newTitle","NewChatter");
					this.setAttribute("isJournal","false");
					this.setAttribute("params","public");
					this.setAttribute("newFocus","title");
					this.setAttribute("newTemplate","2");
					this.setAttribute("customFields","unread:true");
					this.setAttribute("newText","Type some text and then press DONE");
					config.macros.newTiddler.onClickNewTiddler.call(this,null);
					break;
				default:
					// don't do anything
					break;
			}
	};
	/* START: routine to fill content into our listObject */
	var tagFilter;
	if (params) {
		tagFilter = params[0];
	}
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
		if (t.isTagged("public") && !t.isTagged("systemServer")) {
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
	// map content_and_notes onto listObject
	var listObject = [];
	for (var i=0;i<content_and_notes.length;i++) {
		var content_object = content_and_notes[i];
		// noteCount is the number of notes in content_object["notes"];
		var noteCount = content_object["notes"] ? content_object["notes"].length : 0;
		// newestNote is the first note in content_object["notes"] or the content itself if there are no notes
		var newestNote = noteCount !== 0 ? content_object["notes"][0] : content_object["content"];
		// display "new" next to the title if noteCount is 0
		var newContent = noteCount === 0 ? true : false;
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
		var contentTitle = content_object["content"].title;
		var contentTitleSuffix = newContent ? " (new)" : " (" + noteCount + ")";
		listObject[i] = {
			latest_update:daysSince,
			link_title:contentTitle + contentTitleSuffix,
			link:contentTitle,
			last_updated_by:newestNote.modifier,
			checked:newestNote.fields["unread"] ? true : false,
			row_name:contentTitle
		};
		if (newestNote.fields["unread"] == "true") {
			listObject[i]["unread"] = "yes";
		} else {
			listObject[i]["read"] = "yes";
		}
	}
	/* END */
	// Create a listview
	table = ListView.create(place,listObject,listTemplate,callback);
	this_tiddler = story.findContainingTiddler(table);
	this_tiddler.setAttribute("refresh","tiddler");
	this_tiddler.setAttribute("force","true");
	subManagement = config.macros.tiddlyChatterSetup.handler(place,"tiddlyChatterSetup",params,wikifier,paramString,tiddler);
	subManagement.style.display = "none";
};