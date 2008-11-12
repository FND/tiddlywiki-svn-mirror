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
* display current host and bag
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
	popupNone: "no hosts or bags present", // XXX: ??

	handlePopup: function(popup, title) {
		var hosts = [];
		var bags = [];
		store.forEachTiddler(function(title, tiddler) { // retrieve host and bags currently in use
			var host = tiddler.fields["server.host"];
			var bag = tiddler.fields["server.bag"];
			if(host) {
				hosts.pushUnique(host);
			}
			if(bag) { // XXX: duplication!?
				bags.pushUnique(bag);
			}
		});
		for(var i = 0; i < hosts.length; i++) {
			for(var j = 0; j < bags.length; j++) { // XXX: combining hosts and bags at will is wrong; bags are host-dependant
				createTiddlyButton(createTiddlyElement(popup, "li"),
					AdaptorBase.minHostName(hosts[i]) + ": " + bags[j],
					bags[j] + " on " + hosts[i], this.btnClick, null, null,
					null, { tiddler: title, host: hosts[i], bag: bags[i] });
			}
		}
		if(!(hosts.length && bags.length)) {
			createTiddlyText(createTiddlyElement(popup, "li", null, "disabled"), this.popupNone);
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
