/***
|''Name:''|RippleRapPlugin |
|''Description:''|Provide RippleRap functionality |
|''Author:''|PhilHawksworth|
|''Version:''|0.0.3|
|''Date:''|Mon May 19 14:47:44 BST 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|
***/

//{{{
	
if(!version.extensions.RippleRapPlugin) {
version.extensions.RippleRapPlugin = {installed:true};

config.options.chkTickerEval = true;
config.messages.workspaceTiddlers = "";

config.macros.RippleRap = {};

config.optionsDesc.txtRippleRapConferenceURI = "RippleRap conference base URI";

/*
 *  Initialize the application
 */
config.macros.RippleRap.init = function(){

	/*
 	 *  assert titles
	 */
	config.macros.RippleRap.labelEdition();

	/*
	 *  initiate the SharedNotes plugin
	 */
	config.macros.SharedNotes.install();

	/*
	 *  Edition specific initialisation
	 */
	var baseUri = config.options.txtRippleRapConferenceURI;
	baseUri += ((baseUri.slice(-1)!='/')?"/":"");

	config.macros.RippleRapEdition.install(baseUri);

	/*
	 *  start SharedNotes plugin
	 */
	config.macros.SharedNotes.populateNotes();
};


config.macros.RippleRap.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	params = paramString.parseParams("anon",null,true,false,false);
	var option = getParam(params,"option",null);
	switch(option) { 
		case "makeNote" : 
			this.makeNoteButton(place);
			return false;
		case "confabbReview" : 
				this.makeReviewButton(place);
				return false;
		case "showSharingPrefs" :
			this.displaySharingPreferences(place);
			break; 
		default: 
			break;
	} 
	return false;
};


// Create a button for the makeNote feature
config.macros.RippleRap.makeNoteButton = function(place){
	createTiddlyButton(place,"make notes","Make notes on this session",this.makeNoteButtonClick);
};



// Create a button for the makeNote feature
config.macros.RippleRap.makeReviewButton = function(place){
	var sessionTiddler = story.findContainingTiddler(place);
	var t = store.getTiddler(sessionTiddler.getAttribute('tiddler'));
	var uri = t.fields.rr_session_link;
	if(uri) {
		var a = createTiddlyElement(place,'a',null,null,null);
		createTiddlyText(a,"review session");
		a.setAttribute('href',uri);
		a.setAttribute('target',"_blank");
		a.setAttribute('title', "Write a review of this session on Confabb.com");				
	}
	
};

	
// make a note. Possibly for sharing.
config.macros.RippleRap.makeNoteButtonClick = function(ev){
	var e = ev ? ev : window.event;
	var target = resolveTarget(e);
	var sessionTiddler = story.findContainingTiddler(target);
	var title = sessionTiddler.getAttribute('tiddler') +" from "+ config.options.txtSharedNotesUserName;
	var fields = {};
	
	// If the notes tiddler is already displayed show it in edit mode.
	var t = story.getTiddler(title);
	if(t) {
		var applied_template = t.getAttribute("template");
		if(applied_template.substr('View'))
			template = DEFAULT_EDIT_TEMPLATE;
		fields = t.getAttribute("tiddlyFields");
		story.displayTiddler(null,title,template,false,null,fields);
		return false;
	}

	// Create a new notes tiddler if required.
	if(!store.tiddlerExists(title)) {
		var text = "";
		var modifier = config.options.txtSharedNotesUserName;
		var modified = null;
		var created = null;
		var tags = ['notes'];
		fields = {};
		fields.rr_session_id = sessionTiddler.getAttribute('tiddler');
		store.saveTiddler(title,title,text,modifier,modified,tags,fields,true,created);
	}
	// display the notes tiddler in edit mode.
	var template = DEFAULT_EDIT_TEMPLATE;
	story.displayTiddler(sessionTiddler,title,template,false,null,null,target);
	return false;
};


// Label the RippleRap edition to reflect the conference and user details.
config.macros.RippleRap.labelEdition = function() {
	var st = store.getTiddler('SiteTitle');
	var sst = store.getTiddler('SiteSubtitle');
	st.text = config.options.txtRippleRapConferenceName;
//# shouldn't be hard-coded
	var suffix = config.options.txtPoweredBy || " using Confabb ~NoteShare";
	sst.text = "notes by " + config.options.txtSharedNotesUserName + suffix;
	refreshPageTemplate();
};


// Overwrite the search plugins.
// Return an array of tiddlers matching a search regular expression
TiddlyWiki.prototype.search = function(searchRegExp,sortField,excludeTag,match) {
	var candidates = this.reverseLookup("tags",excludeTag,!!match);
	var results = [];
	for(var t=0; t<candidates.length; t++) {
		if((candidates[t].title.search(searchRegExp) != -1) || (candidates[t].text.search(searchRegExp) != -1) || (candidates[t].fields['rr_session_title'] && candidates[t].fields['rr_session_title'].search(searchRegExp) != -1))
			results.push(candidates[t]);
	}
	if(!sortField)
		sortField = "title";
	results.sort(function(a,b) {return a[sortField] < b[sortField] ? -1 : (a[sortField] == b[sortField] ? 0 : +1);});
	return results;
};


// Hijack the save tiddler function to ensure that we put notes on a save.
version.extensions.RippleRapPlugin.saveTiddler = store.saveTiddler;
store.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created) {
	
	//If this was a note tiddler, trigger the upload.
	var t = store.getTiddler(title);
	if(t && t.isTagged('notes')) {
		if(config.options.txtSharedNotesUserName) 
			modifier = config.options.txtSharedNotesUserName;
	}	
	//save the tiddler.
	version.extensions.RippleRapPlugin.saveTiddler.apply(this,arguments);
	
	if(t && t.isTagged('notes')) {
		config.macros.SharedNotes.putNotes();
	}
};


//#Overwrite the refresh all tiddler function.
Story.prototype.refreshAllTiddlers = function(force) {
	var place = this.getContainer();
	var e = place.firstChild;
	if(!e)
		return;
	this.refreshTiddler(e.getAttribute("tiddler"),force ? null : e.getAttribute("template"),true);
	while((e = e.nextSibling) !== null) {
		var template = e.getAttribute("template");
		if(template && (0>template.toLower().indexOf("edit"))){
			this.refreshTiddler(e.getAttribute("tiddler"),force ? null : e.getAttribute("template"),true);			
		}
	}
};

}
//}}}
