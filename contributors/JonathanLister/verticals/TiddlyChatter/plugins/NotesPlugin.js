/***
|''Name:''|NotesPlugin|
|''Description:''||
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#NotesPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|
!!Usage:
*
***/
// /%
//!BEGIN-PLUGIN-CODE

config.macros.notes={
	
	cancelWarning: "Are you sure you want to abandon changes to your notes for '%0'?",
	addLabel: "add notes",
	editLabel: "edit notes",
	editTitle: "double click to edit",
	saveLabel: "save notes",
	saveTitle: "double click to save",
	cancelLabel: "cancel",
	heading: "Notes",
	suffix: "Notes"+config.options.txtUserName,
	tags: "Notes",
	
	saveNotes: function(ev){
		e = ev? ev : window.event;
		var theTarget = resolveTarget(e);
		if (theTarget.nodeName.toLowerCase() == "textarea")
			return false;
		var title = story.findContainingTiddler(theTarget).getAttribute("tiddler");
		story.setDirty(title,false);
		var box = document.getElementById("notesContainer"+title);
		// if 'save notes' is clicked on, notesBox is this.parentNode
		var notesBox = this.parentNode;
		if (this.getAttribute("noteCount")) {
			// if notesBox has been double-clicked, notesBox is this
			notesBox = this;
		}
		// HACK so you can change usernames in-flight - reload suffix
		suffix = "Notes"+config.options.txtUserName;
		var noteCount = notesBox.getAttribute("noteCount");
		var textarea = document.getElementById("notesTextArea"+noteCount+title);
		if(textarea.getAttribute("oldText")!=textarea.value){
			var suffix = box.getAttribute("suffix");
			var t = store.getTiddler(title+"-"+suffix+noteCount);
			// this line changed to split the tags attribute
			store.saveTiddler(title+"-"+suffix+noteCount,title+"-"+suffix+noteCount,textarea.value,config.options.txtUserName,new Date(),t?t.tags:box.getAttribute("tags").split(" "),t?t.fields:box.getAttribute("customFields").decodeHashMap());
		}
		story.refreshTiddler(title,1,true);
		return false;
	},
	
	editNotes: function(notesBox,box,tiddler){
		removeChildren(notesBox);
		story.setDirty(tiddler,true);
		notesBox.title = this.saveTitle;
		notesBox.ondblclick = this.saveNotes;
		// Q: this cancel button doesn't appear to work! Is this what you meant to do?
		createTiddlyButton(notesBox,this.cancelLabel,this.cancelLabel,this.saveNotes,"cancelNotesButton");
		createTiddlyButton(notesBox,this.saveLabel,this.saveLabel,this.saveNotes,"saveNotesButton");
		wikify("!!"+box.getAttribute("heading")+"\n",notesBox);
		addClass(notesBox,"editor");
		var wrapper1 = createTiddlyElement(null,"fieldset",null,"fieldsetFix");
		var wrapper2 = createTiddlyElement(wrapper1,"div");
		var e = createTiddlyElement(wrapper2,"textarea","notesTextArea"+notesBox.getAttribute("noteCount")+tiddler);
		var v = store.getValue(tiddler+"-"+box.getAttribute("suffix")+notesBox.getAttribute("noteCount"),"text");
		if(!v) 
			v = "";
		e.value = v;
		e.setAttribute("oldText",v);
		var rows = 10;
		var lines = v.match(/\n/mg);
		var maxLines = Math.max(parseInt(config.options.txtMaxEditRows),5);
		if(lines != null && lines.length > rows)
			rows = lines.length + 5;
		rows = Math.min(rows,maxLines);
		e.setAttribute("rows",rows);
		notesBox.appendChild(wrapper1);
	},
	
	editNotesButtonOnclick: function(e){
		var title = story.findContainingTiddler(this).getAttribute("tiddler");
		var box = document.getElementById("notesContainer"+title);
		var notesBox = this.parentNode;
		config.macros.notes.editNotes(notesBox,box,title);
		return false;
	},
	
	addNotesButtonOnclick: function(e){
		var title = story.findContainingTiddler(this).getAttribute("tiddler");
		var box = document.getElementById("notesContainer"+title);
		var oldNoteCount = box.getAttribute("notesCount");
		var notesBox = createTiddlyElement(box,"div",null,"TiddlerNotes",null,{noteCount:oldNoteCount++});
		notesBox.ondblclick = config.macros.notes.ondblclick;
		removeNode(this);
		config.macros.notes.editNotes(notesBox,box,title);
		return false;
	},
	
	ondblclick : function(ev){
		e = ev? ev : window.event;
		var theTarget = resolveTarget(e);
		var title = story.findContainingTiddler(theTarget).getAttribute("tiddler");
		var box = document.getElementById("notesContainer"+title);
		var notesBox = this;
		config.macros.notes.editNotes(notesBox,box,title);
		e.cancelBubble = true;
		if(e.stopPropagation) e.stopPropagation();
		return false;
	},
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		
		params = paramString.parseParams("anon",null,true,false,false);
		var heading = getParam(params,"heading",this.heading);
		// tags can be a space-separated string of tags
		// this parameter allows you to specify an identiying tag for the note
		// then we inherit the parent's tags
		// when we create the Notes box, we use tags as its tags attribute
		var tags_string = getParam(params,"tags",this.tags);
		var tags = tags_string.split(" ");
		for(var i=0;i<tiddler.tags.length;i++) {
			if (!tags.contains(tiddler.tags[i])) {
				tags_string += " " + tiddler.tags[i].toString();
			}
		}
		var fields_string = "";
		for(var i in tiddler.fields) {
			fields_string += i+":'"+tiddler.fields[i]+"' ";
		}
		console.log(fields_string);
		var suffix = getParam(params,"suffix",this.suffix);
		// Get the notes tiddlers for this tiddler, count them, make the count an attribute on the box
		var notes_tiddlers = store.getTaggedTiddlers("notes");
		var notes = [];
		var notesCount = 0;
		for(i=0;i<notes_tiddlers.length;i++) {
			if (notes_tiddlers[i].title != tiddler.title && notes_tiddlers[i].title.indexOf(tiddler.title) != -1) {
				notes.push(notes_tiddlers[i]);
				notesCount++;
			}
		}
		// sort the notes by modified date to get the most recent in notes[0]
		notes.sort(function(a,b){
			return a.modified > b.modified ? -1 : (a.modified == b.modified ? 0 : 1);
		});
		var box = createTiddlyElement(place,"div","notesContainer"+tiddler.title,"TiddlerNotes",null,{"source":tiddler.title,params:paramString,heading:heading,tags:tags_string,suffix:suffix,notesCount:notesCount,customFields:fields_string});
		// if there aren't any notes, show "No notes"
		// if there are notes, show "Notes (latest by xxx)"
		// if you added the notes, show "Notes (latest by you)"
		// REMOVED: var notes_tiddler = store.fetchTiddler(tiddler.title+"-"+suffix);
		var heading_extension = "";
		if (notes[0] && notes[0].modifier) {
			if (notes[0].modifier != config.options.txtUserName) {
				heading_extension = " (latest by " + notes[0].modifier + ")";
			} else {
				heading_extension = " (latest by you)";
			}
			wikify("!!"+heading+heading_extension+"\n",box);
		} else {
			wikify("//No notes//\n",box);
		}
		box.title=this.editTitle;
		// These lines unnecessary with createTiddlyElement that takes an object of attributes
		//box.setAttribute("source",tiddler.title);
		//box.setAttribute("params",paramString);
		//box.setAttribute("heading",heading);
		//box.setAttribute("tags",tags_string);
		//box.setAttribute("suffix",suffix);
		// REMOVED: box.ondblclick = this.ondblclick;
		for (var i=0;i<notes.length;i++) {
			var notesBox = createTiddlyElement(box,"div",null,"TiddlerNotes",null,{noteCount:i});
			notesBox.ondblclick = this.ondblclick;
			wikify("<<tiddler [["+notes[i].title+"]]>>\n",notesBox);
			createTiddlyElement(notesBox,"span",null,"subtitle","at "+notes[i].modified+" by "+notes[i].modifier);
			createTiddlyButton(notesBox,this.editLabel,this.editLabel,this.editNotesButtonOnclick,"editNotesButton");
		}
		// add 'add notes' button
		createTiddlyButton(box,this.addLabel,this.addLabel,this.addNotesButtonOnclick,"editNotesButton");	
	}		
};

/* CHANGE: 09/10/07 - not sure why this is needed
Story.prototype.old_notes_closeTiddler = Story.prototype.closeTiddler;
Story.prototype.closeTiddler = function(title,animate,unused){
	if(story.isDirty(title)) {
		if(!confirm(config.macros.notes.cancelWarning.format([title])))
			return false;
	}
	return this.old_notes_closeTiddler.apply(this,arguments);
}
*/

setStylesheet(".TiddlerNotes {\n"+ " background:#eee;\n"+ " border:1px solid #ccc;\n"+ " padding:10px;\n"+ " margin:15px;\n"+ "}\n"+ "\n"+ ".cancelNotesButton,.editNotesButton, .saveNotesButton {\n"+ " float:right;\n"+ " border:1px solid #ccc;\n"+ " padding:2px 5px;\n"+ "}\n"+ "\n"+ ".saveNotesButton{\n"+ " margin-right:0.5em;\n"+ "}\n"+ "\n"+ ".TiddlerNotes.editor textarea{\n"+ " border:1px solid #ccc;\n"+ "}","NotesPluginStyles");


//sliders
//keyboard shortcuts
// ids.. 
// ids.. 


//!END-PLUGIN-CODE
// %/