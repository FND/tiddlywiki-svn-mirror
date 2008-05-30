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
config.macros.RippleRap.agenda = {};

// Initialise the application.
config.macros.RippleRap.init = function(){

	config.macros.RippleRap.feedListManager = new FeedListManager();

	var baseUri = config.options.txtRippleRapConferenceURI;
	baseUri += ((baseUri.slice(-1)!='/')?"/":"");

	switch (config.options.txtRippleRapType) {
	case 'confabb':
		config.macros.RippleRapConfabb.install(baseUri);
		break;
	default:
		break;
	}
	
	// TBD move these to a Ticker macro
	config.macros.importWorkspace.getTiddlers(config.macros.RippleRap.agenda.uri, config.macros.RippleRap.agenda.adaptor);

	var uri = config.macros.RippleRap.feedListManager.next();
	if (uri) {
		config.macros.importWorkspace.getTiddlers(uri, "rss");
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

}
//}}}
