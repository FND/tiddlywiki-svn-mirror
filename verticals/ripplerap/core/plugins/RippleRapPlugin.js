/***
|''Name:''|RippleRapPLugin |
|''Description:''|Provide a RippleRap functionality |
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

config.macros.RippleRap = {};


// Initialise the application.
config.macros.RippleRap.init = function(){

	// Render local tiddler in the RippleRap UI as required.
	// TBD: move this config into "feed" tiddlers
	var agendauri, agendaadaptor;
	var notesuri, notesadaptor;

	var uri = config.options.txtRippleRapConferenceURI;
	uri += ((uri.slice(-1)!='/')?"/":"");

	switch (config.options.txtRippleRapType) {
	case 'confabb':
		agendauri = uri + "sessionlist";
		agendaadaptor = "confabbagenda";

		notesuri = uri + "notes/shared";
		notesadaptor = "confabbnotes";
		break;
	default:
		break;
	}
	
	config.macros.importWorkspace.getTiddlers(agendauri, agendaadaptor);
	config.macros.SharedNotes.adaptor = notesadaptor;
	config.macros.SharedNotes.uri = notesuri;
	
	config.macros.RippleRap.initFeedListMangager();
};


config.macros.RippleRap.initFeedListMangager = function() {
	config.macros.RippleRap.feedListManager = new FeedListManager();
	// Add the uris to the feedListManager
	var baseuri = config.options.txtRippleRapBaseUri;
	config.macros.RippleRap.feedListManager.add(baseuri+'/notes',null,'opml');
};


/*
	TODO call this from the timer.
*/
// get the notes for the next feed returned by the feedlist manager
config.macros.RippleRap.getNotes = function(feedlistManager) {
	var openHostCallback = function(context,userParams) {
		if(context.status) {
			context.adaptor.openWorkspace(null,context,userParams,openWorkspaceCallback);
			return true;
		}
		displayMessage(context.statusText);
		return false;
	};
	var openWorkspaceCallback = function(context,userParams) {
		if(context.status) {
			context.adaptor.getTiddlerList(context,null,config.macros.RippleRap.getTiddlerListCallback);
			return true;
		}
		displayMessage(context.statusText);
		return false;
	};
	uri = feedlistManager.next();
	var adapator = new ConfabbNotesAdaptor();
	var context = {};
	var userParams = {};
	adaptor.openHost(uri,context,userParams,openHostCallback);	
};


config.macros.RippleRap.getTiddlerListCallback = function(context,userParams) {
	var tiddlers = context.tiddlers;
	for(var i=0;i<tiddlers.length;i++) {
		var tiddler = tiddlers[i];
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		story.refreshTiddler(tiddler.title,1,true);		
	}
};


config.macros.RippleRap.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var params = paramString.parseParams("anon",null,true,false,false);
	var option = getParam(params,"option",null);
	switch(option) { 
		case "makeNote" : 
			this.makeNoteButton(place);
			break; 
		case "showSharingPrefs" :
			this.displaySharingPreferences(place);
			break; 
		default: 
			break;
	} 
};


// Create a button for the makeNote feature
config.macros.RippleRap.makeNoteButton = function(place){
	createTiddlyButton(place,"make notes","Make notes on this session",this.makeNoteButtonClick);
};


// make a note. Possibly for sharing.
config.macros.RippleRap.makeNoteButtonClick = function(ev){
	var e = ev ? ev : window.event;
	var target = resolveTarget(e);
	var sessionTiddler = story.findContainingTiddler(target);
	var title = sessionTiddler.getAttribute('tiddler') +" from "+ config.options.txtUserName;
	
	// If the notes tiddler is already displayed show it in edit mode.
	var t = story.getTiddler(title);
	if(t) {
		applied_template = t.getAttribute("template");
		if(applied_template.substr('View'))
			template = DEFAULT_EDIT_TEMPLATE;
		var fields = t.getAttribute("tiddlyFields");
		story.displayTiddler(null,title,template,false,null,fields);
		return;
	}

	// Create a new notes tiddler if required.
	if(!store.tiddlerExists(title)) {
		var text = "";
		var modifier = config.options.txtUserName;
		var modified = null;
		var created = null;
		var tags = ['notes'];
		var fields = {};
		fields.rr_session_id = sessionTiddler.getAttribute('tiddler');
		store.saveTiddler(title,title,text,modifier,modified,tags,fields,true,created);
	}
	// display the notes tiddler in edit mode.
	var template = DEFAULT_EDIT_TEMPLATE;
	story.displayTiddler(sessionTiddler,title,template,false,null,null,target);

};


// Display discovered noted in the agenda UI
config.macros.RippleRap.displayNotesLinks = function(){



};


// provide a global checkbox to enable disable sharing of notes
config.macros.RippleRap.setSharingPreferences = function(){

	

};


// provide a global checkbox to enable disable sharing of notes
config.macros.RippleRap.displaySharingPreferences = function(place){


};




}
//}}}
