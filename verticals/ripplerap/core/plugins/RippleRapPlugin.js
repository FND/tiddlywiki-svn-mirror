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

	var me = config.macros.RippleRap;
	me.feedListManager = new FeedListManager();

	var baseUri = config.options.txtRippleRapConferenceURI;
	baseUri += ((baseUri.slice(-1)!='/')?"/":"");

	switch (config.options.txtRippleRapType) {
	case 'confabb':
		config.macros.RippleRapConfabb.install(me, baseUri);
		break;
	default:
		break;
	}
	
	me.feedListManager.populate();
	
	//me.getAgenda();
	//me.getNotes();
};

/*
 *  actions
 */
config.macros.RippleRap.getAgenda = function() {
	config.macros.importWorkspace.getTiddlers(config.macros.RippleRap.agenda.uri, config.macros.RippleRap.agenda.adaptor);
};

config.macros.RippleRap.putNotes = function() {
	config.macros.SharedNotes.putNotes();
};

config.macros.RippleRap.getNotes = function() {
 	var uri = config.macros.RippleRap.feedListManager.next();
	// var uri = "http://staging.confabb.com/conferences/16074/notes/feed/psd";
	console.log("GET notes from : ", uri);
	if (uri) {
		config.macros.importWorkspace.getTiddlers(uri, "rss", null, null, config.macros.SharedNotes.tagNoteAdaptorCallback);
	}

};


/*
 *  action buttons
 */
config.macros.RefreshAgenda = {};
config.macros.RefreshAgenda.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var me = config.macros.RippleRap;
                var button = createTiddlyButton(place,'GET AGENDA','Click here to download the Agenda',me.getAgenda);
                //me.getAgenda();
};

config.macros.ShareNotes = {};
config.macros.ShareNotes.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var me = config.macros.RippleRap;
                var button = createTiddlyButton(place,'PUT NOTES','Click here to share your notes',me.putNotes);
                //me.putNotes();
};

config.macros.EnjoyNotes = {};
config.macros.EnjoyNotes.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var me = config.macros.RippleRap;
                var button = createTiddlyButton(place,'GET NOTES','Click here to enjoy other people\'s notes',me.getNotes);
                //me.getNotes();
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
		var applied_template = t.getAttribute("template");
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

// Overwrite
// Return an array of tiddlers matching a search regular expression
// TiddlyWiki.prototype.search = function(searchRegExp,sortField,excludeTag,match)
// {
// 	
// 	console.log("SEARCHING! ");
// 	
// 	var candidates = this.reverseLookup("tags",excludeTag,!!match);
// 	var results = [];
// 	for(var t=0; t<candidates.length; t++) {
// 		
// 		if(candidates[t].rr_session_title)
// 			console.log(candidates[t].rr_session_title);
// 		
// 		if((candidates[t].title.search(searchRegExp) != -1) || (candidates[t].text.search(searchRegExp) != -1))
// 			results.push(candidates[t]);
// 	}
// 	if(!sortField)
// 		sortField = "title";
// 	results.sort(function(a,b) {return a[sortField] < b[sortField] ? -1 : (a[sortField] == b[sortField] ? 0 : +1);});
// 	return results;
// };



}
//}}}
