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
function createTiddlyElement(theParent,theElement,theID,theClass,theText,attribs)
{
	var e = document.createElement(theElement);
	if(theClass != null)
		e.className = theClass;
	if(theID != null)
		e.setAttribute("id",theID);
	if(theText != null)
		e.appendChild(document.createTextNode(theText));
	if(attribs){
		for(var n in attribs){
			e.setAttribute(n,attribs[n]);
		}
	}
	if(theParent != null)
		theParent.appendChild(e);
	return e;
}

function createTiddlyButton(theParent,theText,theTooltip,theAction,theClass,theId,theAccessKey,attribs)
{
	var theButton = document.createElement("a");
	if(theAction) {
		theButton.onclick = theAction;
		theButton.setAttribute("href","javascript:;");
	}
	if(theTooltip)
		theButton.setAttribute("title",theTooltip);
	if(theText)
		theButton.appendChild(document.createTextNode(theText));
	if(theClass)
		theButton.className = theClass;
	else
		theButton.className = "button";
	if(theId)
		theButton.id = theId;
	if(attribs){
		for(var n in attribs){
			e.setAttribute(n,attribs[n]);
		}
	}
	if(theParent)
		theParent.appendChild(theButton);
	if(theAccessKey)
		theButton.setAttribute("accessKey",theAccessKey);
	return theButton;
}



config.macros.notes={
	
	cancelWarning: "Are you sure you want to abandon changes to your notes for '%0'?",
	editLabel: "edit notes",
	editTitle: "double click to edit",
	saveLabel: "save notes",
	saveTitle: "double click to save",
	cancelLabel: "cancel",
	heading: "Notes",
	suffix: "Notes",
	tags: "Notes",
	
	saveNotes: function(ev){
		e = ev? ev : window.event;
		var theTarget = resolveTarget(e);
		if (theTarget.nodeName.toLowerCase() == "textarea")
			return false;
		var title = story.findContainingTiddler(theTarget).getAttribute("tiddler");
		story.setDirty(title,false);
		var box = document.getElementById("notesContainer"+title);
		var textarea = document.getElementById("notesTextArea"+title);
		if(textarea.getAttribute("oldText")!=textarea.value){
			var suffix = box.getAttribute("suffix");
			var t = store.getTiddler(title+"-"+suffix);
			// this line changed to split the tags attribute
			store.saveTiddler(title+"-"+suffix,title+"-"+suffix,textarea.value,config.options.txtUserName,new Date(),t?t.tags:box.getAttribute("tags").split(" "),t?t.fields:{});
		}
		story.refreshTiddler(title,1,true);
		return false;
	},
	
	editNotes: function(box,tiddler){
		removeChildren(box);
		story.setDirty(tiddler,true);
		box.title = this.saveTitle;
		box.ondblclick = this.saveNotes;
		createTiddlyButton(box,this.cancelLabel,this.cancelLabel,this.saveNotes,"cancelNotesButton");
		createTiddlyButton(box,this.saveLabel,this.saveLabel,this.saveNotes,"saveNotesButton");
		wikify("!!"+box.getAttribute("heading")+"\n",box);
		addClass(box,"editor");
		var wrapper1 = createTiddlyElement(null,"fieldset",null,"fieldsetFix");
		var wrapper2 = createTiddlyElement(wrapper1,"div");
		var e = createTiddlyElement(wrapper2,"textarea","notesTextArea"+tiddler);
		var v = store.getValue(tiddler+"-"+box.getAttribute("suffix"),"text");
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
		box.appendChild(wrapper1);
	},
	
	editNotesButtonOnclick: function(e){
		var title = story.findContainingTiddler(this).getAttribute("tiddler");
		var box = document.getElementById("notesContainer"+title);
		config.macros.notes.editNotes(box,title);
		return false;
	},
	
	ondblclick : function(ev){
		e = ev? ev : window.event;
		var theTarget = resolveTarget(e);
		var title = story.findContainingTiddler(theTarget).getAttribute("tiddler");
		var box = document.getElementById("notesContainer"+title);
		config.macros.notes.editNotes(box,title);
		e.cancelBubble = true;
		if(e.stopPropagation) e.stopPropagation();
		return false;
	},
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		
		params = paramString.parseParams("anon",null,true,false,false);
		var heading = getParam(params,"heading",this.heading);
		// tags can be a space-separated string of tags
		var tags_string = getParam(params,"tags",this.tags);
		var tags = tags_string.split(" ");
		var suffix = getParam(params,"suffix",this.suffix);
		// when we create the Notes box, we use the tags_string as the attribute
		var box = createTiddlyElement(place,"div","notesContainer"+tiddler.title,"TiddlerNotes",null,{"source":tiddler.title,params:paramString,heading:heading,tags:tags_string,suffix:suffix});
		createTiddlyButton(box,this.editLabel,this.editLabel,this.editNotesButtonOnclick,"editNotesButton");
		// if there aren't any notes, just show "Notes"
		// if there are notes, show "Notes by xxx"
		// if you added the notes, show "Notes by you"
		var notes_tiddler = store.fetchTiddler(tiddler.title+"-"+suffix);
		var heading_extension = "";
		if (notes_tiddler && notes_tiddler.modifier) {
			heading_extension = (notes_tiddler.modifier == config.options.txtUserName) ? " by you" : " by " + notes_tiddler.modifier;
		}
		wikify("!!"+heading+heading_extension+"\n",box);
		box.title=this.editTitle;
		//box.setAttribute("source",tiddler.title);
		//box.setAttribute("params",paramString);
		//box.setAttribute("heading",heading);
		//box.setAttribute("tags",tags_string);
		//box.setAttribute("suffix",suffix);
		box.ondblclick = this.ondblclick;
		wikify("<<tiddler [["+tiddler.title+"-"+suffix+"]]>>",box);
	}		
};

Story.prototype.old_notes_closeTiddler = Story.prototype.closeTiddler;
Story.prototype.closeTiddler = function(title,animate,unused){
	if(story.isDirty(title)) {
		if(!confirm(config.macros.notes.cancelWarning.format([title])))
			return false;
	}
	return this.old_notes_closeTiddler.apply(this,arguments);
}

setStylesheet(".TiddlerNotes {\n"+ " background:#eee;\n"+ " border:1px solid #ccc;\n"+ " padding:10px;\n"+ " margin:15px;\n"+ "}\n"+ "\n"+ ".cancelNotesButton,.editNotesButton, .saveNotesButton {\n"+ " float:right;\n"+ " border:1px solid #ccc;\n"+ " padding:2px 5px;\n"+ "}\n"+ "\n"+ ".saveNotesButton{\n"+ " margin-right:0.5em;\n"+ "}\n"+ "\n"+ ".TiddlerNotes.editor textarea{\n"+ " border:1px solid #ccc;\n"+ "}","NotesPluginStyles");


//sliders
//keyboard shortcuts
// ids.. 
// ids.. 


//!END-PLUGIN-CODE
// %/