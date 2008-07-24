/***
|''Name''|TeamTasksCLI|
|''Description''|command-line interface for TeamTasks|
|''Author''|FND|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#TeamTasksCLI|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
!Revision History
!!v0.1 (2008-07-24)
* initial release
!To Do
* parse commands
* mapping nanoformats<->fields
* check for valid field values
* seamless integration (no separation between title and markers)?
!Code
***/
//{{{
if(!version.extensions.TeamTasksCLI) {
version.extensions.TeamTasksCLI = {
	installed: true,
	separator: "||"
};

// hijack story.saveTiddler() to extract commands
Story.prototype.saveTiddler_TTCLI = Story.prototype.saveTiddler;
Story.prototype.saveTiddler = function(title, minorUpdate) {
	title = version.extensions.TeamTasksCLI.extractCommands(title);
	return Story.prototype.saveTiddler_TTCLI.apply(this, arguments);
};

// hijack store.saveTiddler() to modify fields
TiddlyWiki.prototype.saveTiddler_TTCLI = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title, newTitle, newBody, modifier,
	modified, tags, fields, clearChangeCount, created) {
	var tiddler = TiddlyWiki.prototype.saveTiddler_TTCLI.apply(this, arguments);
	version.extensions.TeamTasksCLI.applyCommands(tiddler);
	return tiddler;
};

// extract commands from tiddler title
version.extensions.TeamTasksCLI.extractCommands = function(title) {
	this.commands = null;
	var components = title.split(this.separator);
	if(components.length > 1) {
		this.commands = components.pop().trim().split(" "); // DEBUG: too simplistic? (does not allow multi-word commands)
		title = components.join(this.separator).trim();
	}
	return title;
};

// apply commands to tiddler fields
version.extensions.TeamTasksCLI.applyCommands = function(tiddler) {
	console.log(tiddler.fields); // DEBUG
	this.commands = { // DEBUG: for testing purposes only
		tt_priority: "High",
		tt_scope: "Work",
		tt_status: "Pending",
		tt_user: "PhilHawksworth"
	};
	for(cmd in this.commands) {
    	store.setValue(tiddler, cmd, this.commands[cmd]); // DEBUG: doesn't trigger AutoSave!?
	}
	console.log(tiddler.fields); // DEBUG
};

} //# end of "install only once"
//}}}
