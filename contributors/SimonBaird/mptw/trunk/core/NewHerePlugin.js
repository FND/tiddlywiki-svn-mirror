/***
| Name:|NewHerePlugin|
| Description:|Creates the new here and new journal macros|
| Version:|3.0 ($Rev$)|
| Date:|$Date$|
| Source:|http://mptw.tiddlyspot.com/#NewHerePlugin|
| Author:|Simon Baird <simon.baird@gmail.com>|
***/
//{{{
merge(config.macros, {
	newHere: {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			wikify("<<newTiddler "+paramString+" tag:[["+tiddler.title+"]]>>",place,null,tiddler);
		}
	},
	newJournalHere: {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			wikify("<<newJournal "+paramString+" tag:[["+tiddler.title+"]]>>",place,null,tiddler);
		}
	}
});

//}}}

