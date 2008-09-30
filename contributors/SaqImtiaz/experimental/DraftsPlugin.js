//all save functions should respect readOnly flag!! ala cancelTiddler comand
//when tiddler does not exist
// // editing shadow
// // creating new

config.draft={
	defaults :{
		enablecrashguard : true,
		savetimer : 45,
		draftnotice: "This tiddler contains unsaved edits, which have been loaded",
		draftnoticecss:".draftnotice {background:#FFBFC2; color:#000; border:2px solid #FF2F37; padding:0.5em; margin:0.5em;}\n.hasDraft{background:#FFCFD2;}"
	}
};

//save all open edits for all tiddlers in the story
//set the crashguard dirty flag for all, since this is an auto save
function crashGuard()
{
	var saved = false;
	story.forEachTiddler(function(title,element){
		if(element.getAttribute("dirty") == "true"){
			var res = story.saveDraft(title,element,true);
			if (res) saved = true;
		}
	});
	if (saved){
		saveChanges();
	}
}

if (config.draft.defaults.enablecrashguard &&!readOnly){
	window.setInterval(crashGuard,config.draft.defaults.savetimer*100);
	config.options.chkAutoSave = true;
}

// flag to set when getValue should return draf valuues
TiddlyWiki.prototype.autoLoadDrafts = false;

// hijack getValue
// return draft values if they exist, based on flag
// where should this flag be trigged from? should only work when editing a tiddler
TiddlyWiki.prototype.old_drafts_getValue = TiddlyWiki.prototype.getValue;
TiddlyWiki.prototype.getValue = function(tiddler,fieldName)
{
	var val;
	if(this.autoLoadDrafts){
		val = this.old_drafts_getValue(tiddler,"lewcid.draft."+fieldName);
	}
	return (val == undefined)? this.old_drafts_getValue.apply(this,arguments):val;
};

// discard all draft fields for a tiddler
// discard crashguard dirty flag
TiddlyWiki.prototype.discardDraft = function(title)
{
	store.suspendNotifications();
	store.setValue(title,"crashguard.dirty");
	store.setValue(title,"lewcid.draft");
	store.resumeNotifications();
};

//hijack story.save tiddler
//discard drafts when saving tiddler (equivalent of clicking done)
//discard crashguard dirty field
//better to hijack command for done? saveTiddler command
Story.prototype.old_drafts_saveTiddler = Story.prototype.saveTiddler;
Story.prototype.saveTiddler = function(title,minorUpdate)
{
	store.discardDraft(title);
	return this.old_drafts_saveTiddler.apply(this,arguments);
};

//save fields of open for edit tiddler
//set crashguard dirty (optional)
Story.prototype.saveDraft = function(title,tiddlerElem,crashGuard)
{
		var fields = {};
		this.gatherSaveFields(tiddlerElem,fields);
		if (!tiddlerElem) var tiddlerElem = document.getElementById(this.idPrefix + title); 
		if (readOnly || !this.hasDraftChanges(title,tiddlerElem,fields))
			return false;
		store.suspendNotifications();
		for (var n in fields){
			store.setValue(title,"lewcid.draft."+n, fields[n]);
		}
		store.setValue(title,"lewcid.draft","true");
		store.setValue(title,"crashguard.dirty",crashGuard);
		store.resumeNotifications();
		return true;
};

Story.prototype.hasDraftChanges = function(title,e,fields)
{
	if(e != null){
		var tiddler = store.fetchTiddler(title);
		if (!tiddler)
			return false;
		for(var n in fields){
			var val = store.getValue(title,n);
			if ( val!= fields[n] && fields[n]!=store.getValue(title,"lewcid.draft."+n))
				return true;
		}
	}
	return false;
};

//save fields to drafts
//remove crashguard.dirty
//displayTiddler view mode
config.commands.saveDraft = {text:"save draft",hideReadOnly:"true"};
config.commands.saveDraft.handler = function(event,src,title)
{
	story.saveDraft(title);
	story.setDirty(title,false);
	story.displayTiddler(null,title);
	return false;
};

config.commands.cancelTiddler.handler = function(event,src,title)
{
	if(story.hasChanges(title) && !readOnly) {
		if(!confirm(this.warning.format([title])))
			return false;
	}
	store.suspendNotifications();
	store.setValue(title,"crashguard.dirty");
	store.resumeNotifications();
	story.setDirty(title,false);
	story.displayTiddler(null,title);
	return false;
};

// discard drafts
// remove crashguard.dirty
config.commands.discardDraft = {text:"discard draft",hideReadOnly:"true"};
config.commands.discardDraft.handler = function(event,src,title)
{
	store.discardDraft(title);
	var tiddlerElem = document.getElementById(story.idPrefix + title);
	tiddlerElem.setAttribute("dirty","false");
	var fields = tiddlerElem.getAttribute("tiddlyFields");
	story.refreshTiddler(title,DEFAULT_EDIT_TEMPLATE,true);
	story.focusTiddler(title,"text");
};

// set draft loading and edit tiddler
// also make this respect config setting for autoloading drafts
config.commands.editTiddler.old_draft_handler = config.commands.editTiddler.handler;
config.commands.editTiddler.handler = function(event,src,title)
{
	store.autoLoadDrafts = true;
	config.commands.editTiddler.old_draft_handler.apply(this,arguments);
	store.autoLoadDrafts = false;
};

Story.prototype.old_draft_refreshTiddler = Story.prototype.refreshTiddler;
Story.prototype.refreshTiddler = function(title,template,force,customFields,defaultText)
{
	var t = this.old_draft_refreshTiddler.apply(this,arguments);
	removeClass(t,"hasDraft");	
	if (t &&store.getValue(title,"lewcid.draft")=="true" &&!readOnly){
		addClass(t,"hasDraft");
		if (t.getAttribute("dirty") == "true"){
			var count = t.childNodes.length;
			var ed;
			for (var j=0; j<count; j++){
				if(hasClass(t.childNodes[j],"editor")){
					ed = t.childNodes[j];	
					break;
				}
			}
			var notice = ed.parentNode.insertBefore(createTiddlyElement(null,"div",null,"draftnotice"),ed.nextSibling);
			wikify(config.draft.defaults.draftnotice,notice);			
		}
	}
	return t;
};

setStylesheet(config.draft.defaults.draftnoticecss,"DraftsPluginStyles");

TiddlyWiki.prototype.getDraftTiddlers = function (crashOnly,sortBy)
{
	var field = crashOnly? "crashguard.dirty" : "lewcid.draft";
	var sortBy = sortBy? sortBy :"title";
	var results=[];
	store.forEachTiddler(function(title,tiddler){
		if (store.getValue(tiddler,field)== 'true'){
			results.push(tiddler);
		}
	});
	results.sort(function(a,b) {return a[sortBy] < b[sortBy] ? -1 : (a[sortBy] == b[sortBy] ? 0 : +1);});
	return results;
};

config.macros.crashGuard ={};
config.macros.crashGuard.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
		var tiddlers = store.getDraftTiddlers(true,"modified");
		var out = "The following tiddlers, have drafts that were not saved.\nThis is probably caused by a browser crash before the TiddlyWiki file could be saved:\n";
		for (var i=0; i<tiddlers.length;i++){
			out+= "*[["+tiddlers[i]['title']+"]]\n";
		}		
		wikify(out,place);
};

config.macros.crashGuard.init= function()
{
	var tiddlers = store.getDraftTiddlers(true,"modidied");
	if (tiddlers.length>0){
		story.displayTiddler(null,"CrashGuard");
	}	
};

config.shadowTiddlers["CrashGuard"]="<<crashGuard>>";