/***
|''Name''|TiddlyWebTiddlerSourcePlugin|
|''Description''|select tiddler source (host and bag)|
|''Author:''|FND|
|''Version''|0.1.1|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/association/serversides/tiddlyweb/client/plugins/TiddlyWebTiddlerSourcePlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/association/serversides/tiddlyweb/client/plugins/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Revision History
!!v0.1 (2008-11-12)
* initial release
!To Do
* don't modify store; append input fields (cf. addCustomFields)
* handling of other server.* fields (e.g. in clearSource)?
* limit to edit mode
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
		// insert tiddlerSource command next to saveTiddler -- XXX: position not ideal!?
		return commands.replace(/saveTiddler/g, "saveTiddler tiddlerSource");
	}
};

config.extensions.TiddlyWebTiddlerSourcePlugin.init();

config.commands.tiddlerSource = {
	type: "popup",
	text: "source", // XXX: misleading
	tooltip: "select tiddler source",

	labels: {
		sourceTemplate: "%0: %1",
		sourceUnset: "host and bag unset", // TODO: rename
		btnClearSource: "remove source fields",
		btnCustomSource: "set custom source"
	},
	tooltips: {
		sourceTemplate: "%1 on %0",
		btnClearSource: "", // TODO?
		btnCustomSource: "" // TODO?
	},

	headerClass: "", // TODO: rename

	handlePopup: function(popup, title) {
		// display active host and bag
		var tiddler = store.getTiddler(title);
		if(tiddler) {
			var host = tiddler.fields["server.host"];
			var bag = tiddler.fields["server.bag"];
		}
		if(host && bag) {
			var label = this.labels.sourceTemplate.format([AdaptorBase.minHostName(host), bag]);
		} else {
			label = this.labels.sourceUnset;
		}
		createTiddlyText(createTiddlyElement(popup, "li", null, this.headerClass), label);
		// generate standard controls
		if(host && bag) {
			createTiddlyButton(createTiddlyElement(popup, "li"), this.labels.btnClearSource,
				this.tooltips.btnClearSource, function() { this.clearSource(title); });
		}
		createTiddlyButton(createTiddlyElement(popup, "li"), this.labels.btnCustomSource,
			this.tooltips.btnCustomSource, function() { this.customSource(title); });
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
		var generateSourceButton = function(popup, title, host, bag) {
			var context = config.commands.tiddlerSource; // XXX: rename?
			createTiddlyButton(createTiddlyElement(popup, "li"),
					context.labels.sourceTemplate.format([AdaptorBase.minHostName(host), bag]),
					context.tooltips.sourceTemplate.format([host, bag]),
					function() { context.selectSource(title, host, bag); });
		};
		for(host in sources) {
			var bags = sources[host];
			for(var i = 0; i < bags.length; i++) {
				generateSourceButton(popup, title, host, bags[i]);
			}
		}
	},

	selectSource: function(title, host, bag) { // XXX: if source existed before, this amounts to renaming!?
		var tiddler = store.getTiddler(title);
		tiddler.fields["server.host"] = host;
		tiddler.fields["server.bag"] = bag;
		story.saveTiddler(tiddler.title); // XXX: correct?
	},

	clearSource: function(title) { // XXX: pointless, as TiddlyWeb sets those fields!?
		var tiddler = store.getTiddler(title);
		delete tiddler.fields["server.host"];
		delete tiddler.fields["server.bag"];
		story.saveTiddler(tiddler.title); // XXX: correct?
	},

	customSource: function(title) { // TODO: don't use prompt
		var tiddler = store.getTiddler(title);
		tiddler.fields["server.host"] = prompt("enter host"); // TODO: i18n -- XXX: use minHostName?
		tiddler.fields["server.bag"] = prompt("enter bag name"); // TODO: i18n
		story.saveTiddler(tiddler.title); // XXX: correct?
	}
};

} //# end of "install only once"
//}}}
