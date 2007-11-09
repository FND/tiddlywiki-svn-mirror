/*******************
 * Agenda
 *******************/
Agenda = {};

// flag for whether agenda is up to date
Agenda.isCurrent = false;
// params array for the tab macro
Agenda.tabsParams = [];

// the list of agenda items
// Agenda.agenda = {[item objects]};
Agenda.agenda = {
	day1:[
		{
			title:"Why Vodafone rocks my world",
			date:"8/11/2007",
			start:"1700",
			end:"1800",
			speaker:"Dan Appelquist",
			blurb:"//Lots of fun//.\nHere is something\nthis too",
		},
		{
			title:"BT is rocking the boat",
			date:"8/11/2007",
			start:"1800",
			end:"1900",
			speaker:"JP Rangaswami",
			blurb:"Excellent famous chap"
		}
	],
	day2:[
		{
			title:"Why blogging is fun",
			date:"8/11/2007",
			start:"1700",
			end:"1800",
			speaker:"Robert Scoble",
			blurb:"Scobleizer\nWaaa!!!!"
		}
	],
	workshops:[
		{
			title:"How to make friends and influence people... on the web",
			date:"12/12/2007",
			start:"1000",
			end:"1100",
			speaker:"Mark Zuckerberg",
			blurb:"The master of the social graph gets down and dirty"
		}
	]
};

// map agenda items onto new shadow tiddlers
Agenda.convert_items_to_shadow = function() {
	var agenda = Agenda.agenda;
	for (var n in agenda) {
		if (agenda.hasOwnProperty(n)) {
			for (var i=0;i<agenda[n].length;i++) {
				// add the new shadow tiddler to the list
				config.shadowTiddlers[agenda[n][i].title] = "Your own notes... double-click to add";
				// populate the annotation field with the rest of the information
				config.annotations[agenda[n][i].title] = "<html><h1>" + agenda[n][i].speaker + "<\/h1><h2>" + agenda[n][i].start + " - " + agenda[n][i].end + " " + agenda[n][i].title + "<\/h2><\/html>\n" + agenda[n][i].blurb;
			}
		}
	}
};

// create the right tiddlers to populate the tabs in the agendaMenu
// returns params array for tab macro
Agenda.create_tab_tiddlers = function() {
	var agenda = Agenda.agenda;
	var params = [];
	var titlePrefix = "TabAgenda";
	var textPrefix = "<<agendaMenuByDay ";
	var textSuffix = ">>";
	// start by adding the selected tab param
	params.push("txtAgendaTab");
	for (var n in agenda) {
		if (agenda.hasOwnProperty(n)) {
			var title = titlePrefix+n;
			var text = textPrefix+n+textSuffix;
			if(!store.tiddlerExists(title)) {
				store.saveTiddler(title,title,text);
				params.push(n);
				params.push(n);
				params.push(title);
			}
		}
	}
	return params;
};

Agenda.init = function() {
	// check to see if Agenda is current before updating
	if (!Agenda.isCurrent) {
		Agenda.convert_items_to_shadow();
		// set up the tiddlers for the tabs macro in agendaMenu
		Agenda.tabsParams = Agenda.create_tab_tiddlers();
		// set default selected tab in agendaMenu
		config.options.txtAgendaTab = "";
		Agenda.isCurrent = !Agenda.isCurrent;
	}
};

Agenda.init();

/*******************
 * agendaMenu
 * agendaMenuByDay
 *******************/
config.macros.agendaMenu = {};

config.macros.agendaMenu.handler = function(place,macroName) {
	// set up the variables and tiddlers for running the tabs macro
	config.macros.tabs.handler(place,macroName,Agenda.tabsParams);
};

config.macros.agendaMenuByDay = {};

config.macros.agendaMenuByDay.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	// create the agenda menu for a single day
	// params[0] is the day
	var agenda = Agenda.agenda[params[0]];
	if (!agenda) {
		displayMessage("error with agendaMenuByDay for day: " + params[0]);
		return;
	}
	for (var i=0;i<agenda.length;i++) {
		this.buildAgendaItem(place,agenda[i]);
	}
};

config.macros.agendaMenuByDay.buildAgendaItem = function(place,item) {
	var wrapper = createTiddlyElement(place,"div",null,"agendaItem");
	var header = createTiddlyLink(createTiddlyElement(wrapper,"div",null,"agendaItemHeader"),item.title);
	createTiddlyText(createTiddlyElement(header,"span","agendaItemHeaderTime"),item.start + " - " + item.end);
	createTiddlyText(createTiddlyElement(header,"span","agendaItemHeaderSpeaker"),item.speaker);
	var text = createTiddlyElement(wrapper,"div",null,"agendaItemText");
	createTiddlyText(createTiddlyElement(text,"span",null,"agendaItemTextTitle"),item.title);
	createTiddlyText(createTiddlyElement(text,"span",null,"agendaItemTextBlurb"),item.blurb);
};

/*******************
* currentSession
*******************/
config.macros.currentSession = {};

config.macros.currentSession.handler = function(place) {
	// find out which agenda items are on now
	var sessions = config.macros.currentSession.find(Agenda.agenda);
	var currentSessionButton = createTiddlyElement(place,"span","currentSessionButton");
	if (sessions.length === 0) {
		createTiddlyText(currentSessionButton,"no sessions on now");
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

config.macros.currentSession.find = function(agenda) {
	// returns an array of title for sessions on now
	// assumes agenda items have dates of the form dd/mm/yyyy GMT
	// and that item start is of the form hhmm
	var now = new Date();
	var sessions = [];
	for (var n in agenda) {
		if (agenda.hasOwnProperty(n)) {
			for (var i=0;i<agenda[n].length;i++) {
				var then = config.macros.currentSession.time(agenda[n][i]);
				// check for now being between start and end of session 
				if (then.start.getTime() < now.getTime() && then.end.getTime() > now.getTime()) {
					sessions.push(agenda[n][i]);
				}
			}
		}
	}
	return sessions;
};

config.macros.currentSession.time = function(item) {
	// returns two dates for agenda item start and finish
	var then = {};
	// guard against single digit entries in the date
	var date = item.date.replace(/(\b)(\w)(\b)/g,"$10$2$3");
	var start = item.start;
	var end = item.end;
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