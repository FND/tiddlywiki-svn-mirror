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

// hijack story.gatherSaveFields() to extract commands from title -- DEBUG: highly inefficient (function is recursive)
Story.prototype.gatherSaveFields_TTCLI = Story.prototype.gatherSaveFields;
Story.prototype.gatherSaveFields = function(e, fields) {
	this.gatherSaveFields_TTCLI.apply(this, arguments);
	if(fields && fields.title) {
		fields.title = version.extensions.TeamTasksCLI.extractCommands(fields.title);
	}
};

// hijack store.saveTiddler() to modify fields
TiddlyWiki.prototype.saveTiddler_TTCLI = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title, newTitle, newBody, modifier,
	modified, tags, fields, clearChangeCount, created) {
	var tiddler = this.saveTiddler_TTCLI.apply(this, arguments);
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
	this.commands = { // DEBUG: for testing purposes only
		tt_priority: "High",
		tt_scope: "Work",
		tt_status: "Pending",
		tt_user: "PhilHawksworth"
	};
	for(cmd in this.commands) {
    	store.setValue(tiddler, cmd, this.commands[cmd]); // DEBUG: doesn't trigger AutoSave!?
	}
};

} //# end of "install only once"
//}}}
