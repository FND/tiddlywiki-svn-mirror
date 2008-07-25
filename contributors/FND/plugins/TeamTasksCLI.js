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
!!v0.1 (2008-07-25)
* initial release
!To Do
* documentation
* efficiency enhancements
* check for valid field values
* seamless integration (no separation between title and markers)?
!Code
***/
//{{{
if(!version.extensions.TeamTasksCLI) {
version.extensions.TeamTasksCLI = {
	installed: true,
	cfgTiddler: "TTCommands",
	separator: "||",

	// extract commands from tiddler title
	extractCommands: function(title) {
		var components = title.split(this.separator);
		if(components.length > 1) {
			this.commandString = components.pop().trim();
			title = components.join(this.separator).trim();
		}
		return title;
	},

	// apply commands to tiddler fields
	applyCommands: function(tiddler) {
		var commands = this.parseCommands();
		for(cmd in commands) {
			store.setValue(tiddler, cmd, commands[cmd]);
		}
	},

	// parse commands
	parseCommands: function() {
		if(this.commandString) {
			var commands = {};
			var slices = store.calcAllSlices(this.cfgTiddler);
			var components = this.commandString.split(" "); // DEBUG: too simplistic? (does not allow multi-word commands)
			for(var i = 0; i < components.length; i++) {
				for(key in slices) {
					var field = "tt_" + key.toLowerCase().substr(0, key.length-11); // DEBUG: use generic function (TeamTasks refactoring required)
					var marker = slices[key];
					var re = new RegExp(marker.escapeRE() + "(.*)"); // DEBUG: use split()?
					var match = components[i].match(re);
					if(match) {
						commands[field] = match[1];
					}
				}
			}
			this.commandString = null;
			return commands;
		}
	}
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

// adapted from Simon Willison (http://simonwillison.net/2006/Jan/20/escape/)
String.prototype.escapeRE = function() {
	if(!arguments.callee.sRE) {
		var specials = [
			"/", ".", "*", "+", "?", "|",
			"(", ")", "[", "]", "{", "}", "\\"
		];
		arguments.callee.sRE = new RegExp("(\\" + specials.join("|\\") + ")", "g");
	}
	return this.replace(arguments.callee.sRE, "\\$1");
};

} //# end of "install only once"
//}}}
