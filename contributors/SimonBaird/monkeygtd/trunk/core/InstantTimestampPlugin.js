/***
| Name:|InstantTimestampPlugin|
| Created by:|SimonBaird|
| Location:|http://instanttimestamp.tiddlyspot.com/|
| Version:|1.0.5 (17-Jan-2007)|
| Requires:|~TW2.x|
!Description
If you enter {ts} in your tiddler content (without the spaces) it will be replaced with a timestamp when you save the tiddler. Full list:
* {ts} or {t} -> timestamp
* {ds} or {d} -> datestamp
* !ts or !t at start of line -> !!timestamp
* !ds or !d at start of line -> !!datestamp
(I added the extra ! since that's how I like it. Remove it from translations below if required)
!Notes
* Change the timeFormat and dateFormat below to suit your preference.
* See also AutoCorrectPlugin
!History
* 17-Jan-07, version 1.0.5
** added fields param to saveTiddler method needed in TW 2.1+
* 06-Apr-06, version 1.0.4
** removed the AutoCorrect stuff and put it in AutoCorrectPlugin
* 05-Apr-06, version 1.0.3
** now have exclusion by tag and tiddler name, probably less important here than in AutoCorrectPlugin
* 05-Apr-06, version 1.0.2
** put matches into array to and eval them to allow generic substitutions
* 05-Apr-06, version 1.0.1
** added ds for datestamp as suggested by DanielBaird
** made case insensitive
** Added translation for !t at start of line
* 05-Apr-06, version 1.0.0
** written after suggestion by Achim Wessling 
!Code
***/
//{{{

config.InstantTimestamp = {

	// adjust to suit
	timeFormat: 'DD/0MM/YY 0hh:0mm',
	dateFormat: 'DD/0MM/YY',

	translations: [
		[/^!ts?$/img,  "'!!'+now.formatString(config.InstantTimestamp.timeFormat)"],
		[/^!ds?$/img,  "'!!'+now.formatString(config.InstantTimestamp.dateFormat)"],
		[/\{ts?\}/ig, "now.formatString(config.InstantTimestamp.timeFormat)"],
		[/\{ds?\}/ig, "now.formatString(config.InstantTimestamp.dateFormat)"]
	],

	excludeTags: [
		"noAutoCorrect",
		"html",
		"CSS",
		"css",
		"systemConfig",
		"zsystemConfig",
		"Plugins",
		"Plugin",
		"plugins",
		"plugin",
		"javascript",
		"code"
	],

	excludeTiddlers: [
		"StyleSheet",
		"StyleSheetLayout",
		"StyleSheetColors",
		"StyleSheetPrint"
	]

}; 

if (!Array.prototype.contains)
	Array.prototype.contains = function(item) {
		return (this.find(item) != null);
	};

if (!Array.prototype.containsAny)
	Array.prototype.containsAny = function(items) {
		for (var i=0;i<items.length;i++)
			if (this.contains(items[i]))
				return true;
		return false;
	};

TiddlyWiki.prototype.saveTiddler_mptw_instanttimestamp = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields) {

	tags = (typeof(tags) == "string") ? tags.readBracketedList() : tags;
	var conf = config.InstantTimestamp;

	if ( !tags.containsAny(conf.excludeTags) && !conf.excludeTiddlers.contains(newTitle) ) {

		var now = new Date();
		var trans = config.InstantTimestamp.translations;
		for (var i=0;i<trans.length;i++) {
			newBody = newBody.replace(trans[i][0], eval(trans[i][1]));
		}
	}

	return this.saveTiddler_mptw_instanttimestamp(title,newTitle,newBody,modifier,modified,tags,fields);
}

//}}}

