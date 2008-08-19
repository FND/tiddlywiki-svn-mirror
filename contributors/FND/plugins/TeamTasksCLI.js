/***
|''Name''|TeamTasksCLI|
|''Description''|command-line interface for [[TeamTasks|http://getteamtasks.com]]|
|''Author''|FND|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#TeamTasksCLI|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
!Usage
When entering a task title, use nanoformats defined in [[TTCommands]] to populate task fields.
!!Examples
{{{
My Task >> +High @Work #Pending u:PhilHawksworth
}}}
!Revision History
!!v0.1 (2008-07-25)
* initial release
!To Do
* efficiency enhancements
* check for valid field values
!Code
***/
//{{{
if(!version.extensions.TeamTasksCLI) {
version.extensions.TeamTasksCLI = { installed: true };

if(!plugins) { var plugins = {}; }
plugins.TeamTasksCLI = {
	cfgTiddler: "TTCommands",
	separator: ">>",

	// extract commands from tiddler title
	extractCommands: function(title) {
		var separator = store.getTiddlerSlice(this.cfgTiddler, "Separator") || this.separator;
		var components = title.split(separator);
		if(components.length > 1) {
			this.commandString = components.pop().trim();
			title = components.join(separator).trim();
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
					var field = "tt_" + key.toLowerCase().substr(0, key.length - 11); // DEBUG: use generic function (requires minor refactoring in TeamTasks core)
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

config.shadowTiddlers.TTCommands = "|Separator|>>|\n"
	+ "|ScopeDefinitions|@|\n"
	+ "|PriorityDefinitions|+|\n"
	+ "|StatusDefinitions|#|\n"
	+ "|UserDefinitions|u:|";

// hijack saveTiddler handler to extract commands from title
config.commands.saveTiddler.handler_TTCLI = config.commands.saveTiddler.handler;
config.commands.saveTiddler.handler = function(event, src, title) {
	// get title edit field
	var t = story.findContainingTiddler(src);
	var els = t.getElementsByTagName("input");
	for(var i = 0; i < els.length; i++) {
		if(els[i].getAttribute("edit") == "title") {
			var el = els[i];
			break;
		}
	}
	// modify field
	if(el) {
		el.value = plugins.TeamTasksCLI.extractCommands(el.value);
	}
	return this.handler_TTCLI.apply(this, arguments);
};

// hijack Store.saveTiddler() to modify fields
TiddlyWiki.prototype.saveTiddler_TTCLI = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title, newTitle, newBody, modifier,
	modified, tags, fields, clearChangeCount, created) {
	var tiddler = this.saveTiddler_TTCLI.apply(this, arguments);
	plugins.TeamTasksCLI.applyCommands(tiddler);
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
