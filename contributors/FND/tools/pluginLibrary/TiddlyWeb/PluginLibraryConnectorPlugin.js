/***
|''Name''|PluginLibraryConnectorPlugin|
|''Description''|imports plugins from TiddlyWiki Plugin Library|
|''Author''|FND|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#PluginLibraryConnectorPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
!Usage
{{{
<<ImportPlugins>>
}}}
!!Examples
<<ImportPlugins>>
!Revision History
!!v0.1 (2008-07-25)
* initial release
!To Do
* rename
!Code
***/
//{{{
if(!version.extensions.PluginLibraryConnectorPlugin) {
version.extensions.PluginLibraryConnectorPlugin = { installed: true };

config.macros.ImportPlugins = {
	btnLabel: "ImportPlugins",
	btnTooltip: "connect to TiddlyWiki Plugin Library",
	btnClass: null,
	prompt: "Enter search query:",
	host: "http://burningchrome.com:8090/search.wiki?q=",

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		createTiddlyButton(place, this.btnLabel,
			this.btnTooltip || params[0] + " - " + params[1],
			this.onclick, this.btnClass);
	},

	onclick: function() {
		var query = prompt(config.macros.ImportPlugins.prompt);
		var adaptor = new FileAdaptor();
		var context = {
			host: config.macros.ImportPlugins.host + query
		}
		var success = adaptor.getTiddlerList(context, null,
			config.macros.ImportPlugins.processPlugins);
		console.log(success, new Date(), context.host); // DEBUG
	},

	processPlugins: function(context) { // DEBUG: rename?
		console.log("processing... ", new Date()); // DEBUG
		for(var i = 0; i < context.tiddlers.length; i++) {
			plugin = context.tiddlers[i];
			console.log("before", plugin); // DEBUG
			plugin.fields.doNotSave = true;
			plugin = store.saveTiddler(plugin.title, plugin.title, plugin.text,
				plugin.modifier, plugin.modified, plugin.tags, plugin.fields, true,
				plugin.created);
			console.log("after", plugin); // DEBUG
		}
	}
};

} //# end of "install only once"
//}}}
