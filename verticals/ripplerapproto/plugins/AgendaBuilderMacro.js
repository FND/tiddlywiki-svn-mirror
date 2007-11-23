/*********************
 * AgendaBuilderMacro *
 *********************/

/***
|''Name''|AgendaBuilderMacro|
|''Author''|JayFresh|
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]]|
|''Version''|1|
|''~CoreVersion''|2.2.5|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/AgendaBuilderMacro.js|
|''Description''|builds a tabbed agenda menu out of tiddlers tagged with "session"|
|''Syntax''|<<agendaMenu>>|
|''Status''|@@experimental@@|
|''Contributors''||
|''Contact''|jon at osmosoft dot com|
|''Comments''|please post to http://groups.google.com/TiddlyWikiDev|
|''Dependencies''||
|''Browser''||
|''ReleaseDate''||
|''Icon''||
|''Screenshot''||
|''Tags''||
|''CodeRepository''|See Source above|

! Background

The AgendaBuilderMacro was built of part of the "RippleRap" project, to automatically create a conference agenda out of tiddlers that contained the metadata about each conference session. The plugin looks for tiddlers tagged "session" and uses those to create the Agenda. It was designed so that it could be updated - if another method downloads new session tiddlers, it can set the Agenda.isCurrent flag to false and then the Agenda will rebuild when the macro is next run (presumably on a tiddler refresh).

! Re-use guidelines

The AgendaBuilderMacro will plug into any TiddlyWiki where it is desirable to create a menu from a set of tiddlers with a particular tag. The tiddler should contain the slices: speaker, start, end, blurb, date, track.

***/
//{{{ 
/*********
 * Agenda
 *********/
Agenda = {};
// params array for the tab macro, filled by create_tab_tiddlers
Agenda.tabsParams = [];
// Fix for slices regex not correctly matching slices of the form "key:\nkey:value"
//TiddlyWiki.prototype.slicesRE = /(?:[\'\/]*~?([\.\w]+)[\'\/]*\:[\'\/]* *(.*?)\s*$)|(?:\|[\'\/]*~?([\.\w]+)\:?[\'\/]*\|\s*(.*?)\s*\|)/gm;

// function to gather agenda items
Agenda.getItems = function() {
	var filter = "[tag[session]]";
	return store.filterTiddlers(filter);
};

// function to return array of names of tracks the agenda covers
Agenda.getTracks = function() {
	var tracks = [];
	var items = Agenda.getItems();
	for (var i=0;i<items.length;i++) {
		tracks.pushUnique(store.getTiddlerSlice(items[i].title,"track"));
	}	
	return tracks;
};

// function to return agenda items for a single track sorted by start time
Agenda.getTrack = function(track) {
	var trackItems = [];
	var items = Agenda.getItems();
	for (var i=0;i<items.length;i++) {
		if (store.getTiddlerSlice(items[i].title,"track") == track) {
			trackItems.push(items[i]);
		}
	}
	trackItems.sort(function(a,b){
		var a_start = store.getTiddlerSlice(a.title,"start");
		var b_start = store.getTiddlerSlice(b.title,"start");
		return a_start < b_start ? -1 : (a_start == b_start ? 0 : 1);
	});
	return trackItems;
};

// create the right tiddlers to populate the tabs in the agendaMenu
// returns params array for tab macro
Agenda.create_tab_tiddlers = function() {
	var params = [];
	var titlePrefix = "TabAgenda";
	var textPrefix = "<<agendaMenuByTrack ";
	var textSuffix = ">>";
	var tracks = Agenda.getTracks();
	// start by adding the selected tab param
	params.push("txtAgendaTab");
	for (var i=0;i<tracks.length;i++) {
		var title = titlePrefix+tracks[i];
		var text = textPrefix+tracks[i]+textSuffix;
		store.saveTiddler(title,title,text);
		params.push(tracks[i]);
		params.push(tracks[i]);
		params.push(title);
	}
	return params;
};

// Find the people who have written notes about a session
// Returns an array of objects of the form {userName:xxx,noteText:xxx,date:xxx,my_note:true/false}
Agenda.getSessionNotesByPerson = function(session_title) {
	var people = [];
	store.forEachTiddler(function(title,tiddler) {
		// cycle through all of the sessions tiddler for this session 
		if(title.startsWith(session_title) && session_title!=title) {
			var user = tiddler.modifier;
			var note = tiddler.title;
			var datestamp = tiddler.modified;
			var text = tiddler.text;
			var my_note = (user == config.options.txtUserName) ? true : false;
			people.push({userName:user,noteTitle:note,sessionTitle:session_title,noteText:text,date:datestamp,my_note:my_note});
			people.sort(function(a,b) {
				return a.modified < b.modified ? -1 : (a.modified == b.modified ? 0 : 1);
			});
		}
	});
	return people;
};

Agenda.init = function() {
	// set up the tiddlers for the tabs macro in agendaMenu
	Agenda.tabsParams = Agenda.create_tab_tiddlers();
	
	// Add a LifeStream tab.
	Agenda.tabsParams.push('Elsewhere');
	Agenda.tabsParams.push('Elsewhere');
	Agenda.tabsParams.push('LifeStream');

	// set default selected tab in agendaMenu
	config.options.txtAgendaTab = "";
};
Agenda.init();

/*******************
 * agendaMenu
 * agendaMenuByTrack
 *******************/
config.macros.agendaMenu = {};

config.macros.agendaMenu.handler = function(place,macroName) {
	// set up the variables and tiddlers for running the tabs macro
	config.macros.tabs.handler(place,macroName,Agenda.tabsParams);
};

config.macros.agendaMenuByTrack = {};

config.macros.agendaMenuByTrack.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	// create the agenda menu for a single track
	// params[0] is the day
	var trackItems = Agenda.getTrack(params[0]);
	if (!trackItems) {
		displayMessage("error with agendaMenuByTrack for day: " + params[0]);
		return;
	}
	for (var i=0;i<trackItems.length;i++) {
		this.buildAgendaItem(place,trackItems[i]);
	}
};

config.macros.agendaMenuByTrack.buildAgendaItem = function(place,item) {
	// collect information from the session tiddler
	var title = item.title;
	var speaker = store.getTiddlerSlice(title,"speaker");
	var start = store.getTiddlerSlice(title,"start");
	var end = store.getTiddlerSlice(title,"end");
	var blurb = store.getTiddlerSlice(title,"blurb");
	
	// build the entry in the agendaMenu
	var agendaItem = createTiddlyElement(place,"div",null,"agendaItem");
	createTiddlyElement(agendaItem,"span",null,"time",start + " - " + end);
	createTiddlyLink(createTiddlyElement(agendaItem,"span",null,"title"), title, true);
	createTiddlyElement(agendaItem,"div",null,"speaker",speaker);
	var notesArray = Agenda.getSessionNotesByPerson(title);
	var notes = createTiddlyElement(agendaItem,"div",null,"notes");
	var notesList = createTiddlyElement(notes,"ul");
	for (var i=0; i<notesArray.length; i++) {
		var noteItem = createTiddlyLink(createTiddlyElement(notesList,"li"),notesArray[i].sessionTitle);
		var userName = notesArray[i].userName;
		if (userName) {
			var c = notesArray[i].noteTitle.indexOf("from");
			var name = notesArray[i].noteTitle.substr(c+5);
			createTiddlyText(noteItem,name);
			// createTiddlyText(noteItem,notesArray[i].userName);
		} else {
			createTiddlyText(noteItem,"anonymous");
		}
	}
};
//}}}

/*******************
* currentSession
*******************/
config.macros.currentSession = {};

config.macros.currentSession.handler = function(place) {
	// find out which agenda items are on now
	var sessions = config.macros.currentSession.find();
	var currentSessionButton = createTiddlyElement(place,"span","currentSessionButton");
	if (sessions.length === 0) {
		//createTiddlyText(currentSessionButton,"no sessions on now");
	} else if (sessions.length == 1) {
		createTiddlyText(createTiddlyLink(currentSessionButton,sessions[0].title),"Jump to current session");
	} else {
		var options = [];
		options.push({caption:"Jump to current sessions",name:""});
		for (var i=0;i<sessions.length;i++) {
			options.push({caption:sessions[i].title,name:sessions[i].title});
		}
		createTiddlyDropDown(currentSessionButton,config.macros.currentSession.onchange,options,"");
	}
};

config.macros.currentSession.onchange = function() {
	// open up the selected tiddler and move the agendaMenu to the right session
	var title = this.value;
	if (title) {
		story.displayTiddler(this,title);
	}
	// move active agenda item to title
};

config.macros.currentSession.find = function() {
	// returns an array of title for sessions on now
	// assumes agenda items have dates of the form dd/mm/yyyy GMT
	// and that item start is of the form hhmm
	var items = Agenda.getItems();
	var now = new Date();
	var sessions = [];
	for (var i=0;i<items.length;i++) {
		var then = config.macros.currentSession.getTimes(items[i]);
		// check for now being between start and end of session 
		if (then.start.getTime() < now.getTime() && then.end.getTime() > now.getTime()) {
			sessions.push(items[i]);
		}
	}
	return sessions;
};

config.macros.currentSession.getTimes = function(item) {
	// returns two dates for agenda item start and finish
	var then = {};
	var title = item.title;
	var date = store.getTiddlerSlice(title,"date");
	var start = store.getTiddlerSlice(title,"start");
	var end = store.getTiddlerSlice(title,"end");
	// guard against single digit entries in the date
	date = date.replace(/(\b)(\w)(\b)/g,"$10$2$3");
	// convert YY to YYYY, assuming everything to be after 2000
	date = date.replace(/(\b)(\d\d)$/g,"$120$2");
	// convert UK standard date of dd/mm/yyyy to expected YYYYMMDD
	var d = date.split("/").reverse().join("");
	var d1 = d+start;
	var d2 = d+end;
	then.start = Date.convertFromYYYYMMDDHHMM(d1);
	then.end = Date.convertFromYYYYMMDDHHMM(d2);
	return then;
};

/*******************
* crossBrowserHelp
*******************/
config.macros.crossBrowserHelp = {};

config.macros.crossBrowserHelp.handler = function(place) {
	// detect different help messages depending on which browser is being used
	var text = "";
	if(config.browser.isIE) {
		// IE
		text = "You're using IE";
	} else if (config.browser.isGecko) {
		// FF
		text = "You're using Firefox";
	} else if (config.browser.isSafari || config.browser.isBadSafari) {
		// Safari
		text = "You're using Safari";
	} else if (config.browser.isOpera) {
		// Opera
		text = "You're using Opera";
	}
	/* Other variables I have to play with:
	 * ieVersion: // config.browser.ieVersion[1], if it exists, will be the IE version string, eg "6.0"
	 * firefoxDate: // config.browser.firefoxDate[1], if it exists, will be Firefox release date as "YYYYMMDD"
	 * isMac:
	 * isWindows:
	 * isLinux:
	 * isUnix
	 */
	 createTiddlyText(place,text);
};