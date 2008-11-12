/***
|''Name''|TiddlyWebTiddlerSourcePlugin|
|''Description''|select tiddler source (host and bag)|
|''Author:''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/association/serversides/tiddlyweb/client/plugins/TiddlyWebTiddlerSourcePlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/association/serversides/tiddlyweb/client/plugins/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Revision History
!!v0.1 (2008-11-12)
* initial release
!To Do
* custom prompt for host and bag
* option to remove host and bag
* rename?
!Code
***/
//{{{
if(!version.extensions.TiddlyWebTiddlerSourcePlugin) { //# ensure that the plugin is only installed once
version.extensions.TiddlyWebTiddlerSourcePlugin = { installed: true };

if(!config.extensions) { config.extensions = {}; }

config.extensions.TiddlyWebTiddlerSourcePlugin = {
	init: function() {
		var tiddler = store.getTiddler("ToolbarCommands");
		if(tiddler) {
			tiddler.text = this.insertCommand(tiddler.text);
		} else {
			config.shadowTiddlers.ToolbarCommands = this.insertCommand(config.shadowTiddlers.ToolbarCommands);
		}
	},

	insertCommand: function(commands) {
		// insert tiddlerSource command next to saveTiddler -- XXX: position suboptimal
		return commands.replace(/saveTiddler/g, "saveTiddler tiddlerSource");
	}
};

config.extensions.TiddlyWebTiddlerSourcePlugin.init();

config.commands.tiddlerSource = {
	type: "popup",
	text: "source", // XXX: misleading
	tooltip: "select tiddler source",
	sourceUnset: "host and bag unset", // TODO: rename
	labelTemplate: "%0: %1",
	tooltipTemplate: "%1 on %0",

	handlePopup: function(popup, title) {
		// display active host and bag
		var tiddler = store.getTiddler(title);
		var host = tiddler.fields["server.host"];
		var bag = tiddler.fields["server.bag"];
		if(host && bag) {
			var label = this.labelTemplate.format([AdaptorBase.minHostName(host), bag])
		} else {
			label = this.sourceUnset;
		}
		createTiddlyText(createTiddlyElement(popup, "li"), label); // TODO: use properly styled DIV
		// retrieve hosts and bags currently in use
		var sources = {};
		store.forEachTiddler(function(title, tiddler) {
			var host = tiddler.fields["server.host"];
			var bag = tiddler.fields["server.bag"];
			if(host && bag) {
				if(!sources[host]) {
					sources[host] = [];
				}
				sources[host].pushUnique(bag);
			}
		});
		for(host in sources) {
			var bags = sources[host];
			for(var i = 0; i < bags.length; i++) {
				createTiddlyButton(createTiddlyElement(popup, "li"),
					this.labelTemplate.format([AdaptorBase.minHostName(host), bags[i]]),
					this.tooltipTemplate.format([host, bags[i]]),
					this.btnClick, null, null, null,
					{ tiddler: title, host: host, bag: bags[i] });
			}
		}
	},

	btnClick: function(ev) {
		var tiddler = store.getTiddler(this.getAttribute("tiddler"));
		tiddler.fields["server.host"] = this.getAttribute("host");
		tiddler.fields["server.bag"] = this.getAttribute("bag");
		story.saveTiddler(tiddler.title); // XXX: correct?
	}
};

} //# end of "install only once"
//}}}
