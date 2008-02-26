/***
|Name:|NewHerePlugin|
|Description:|Creates the new here and new journal macros|
|Version:|3.0 ($Rev$)|
|Date:|$Date$|
|Source:|http://mopi.tiddlyspot.com/#NewHerePlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License|http://mopi.tiddlyspot.com/#TheBSDLicense|
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

