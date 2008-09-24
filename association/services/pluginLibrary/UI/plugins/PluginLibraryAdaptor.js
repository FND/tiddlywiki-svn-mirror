/***
|''Name''|PluginLibraryAdaptor|
|''Description''|[TBD]|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/UI/plugins/PluginLibraryConnectorPlugin.js|
|''License''|[[Creative Commons Attribution-Share Alike 3.0|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Code
***/
//{{{
if(!version.extensions.PluginLibraryAdaptor) { // TODO: rename
version.extensions.PluginLibraryAdaptor = { installed: true };

if(!plugins) { var plugins = {}; }

plugins.PluginLibraryAdaptor = {
	host: "http://burningchrome.com:8090",
	listRetrievalMsg: "retrieving list of plugins matching '%0'...",
	tiddlerRetrievalMsg: "retrieving %0 matching plugins",
	retrievalErrorMsg: "error retrieving data from server",

	/**
	 * retrieve plugins matching the search query
	 * @param {String} host Plugin Library URL
	 * @param {Function} callback function to execute for each tiddler being retrieved
	 */
	getMatches: function(query, userParams, callback) {
		displayMessage(this.listRetrievalMsg.format([query]));
		var adaptor = new TiddlyWebAdaptor();
		var context = {
			host: this.host,
			query: query,
			matchCallback: callback
		};
		return adaptor.getSearchResults(context, userParams, this.getMatchesCallback);
	},

	/**
	 * retrieve individual tiddlers
	 * @param {Object} context context object with members host, callback
	 * @param {Function} callback function to execute for each tiddler being retrieved
	 * @return {Boolean} success
	 */
	getMatchesCallback: function(context, userParams) {
		if(!context.status) {
			displayMessage(window.tiddlers.PluginLibraryAdaptor.retrievalErrorMsg);
			return false; // XXX: raise exception?
		}
		displayMessage(plugins.PluginLibraryAdaptor.tiddlerRetrievalMsg.format([context.tiddlers.length]));
		var tiddlers = context.tiddlers;
		if(tiddlers) {
			for(var i = 0; i < tiddlers.length; i++) {
				if(store.tiddlerExists(tiddlers[i].title)) {
					context.tiddler = tiddlers[i];
					context.tiddlerExists = true;
					context.matchCallback(context, userParams);
				} else {
					var subContext = {
						host: context.host,
						bag: tiddlers[i].fields["server.bag"]
					};
					context.adaptor.getTiddler(tiddlers[i].title, subContext, userParams, context.matchCallback);
				}
			}
		}
		return true;
	}
};

config.macros.ImportPlugins = { // TODO: rename
	btnLabel: "Plugin Search",
	btnTooltip: "search the TiddlyWiki Plugin Library",
	btnClass: null,
	accessKey: "f",
	pluginViewTemplate: "PluginViewTemplate",

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var wrapper = createTiddlyElement(place, "div", null, "searchBox");
		var input = createTiddlyElement(wrapper, "input", null, null, null, {
			accessKey: this.accessKey
		});
		input.onkeyup = this.onKeyPress;
		createTiddlyButton(wrapper, this.btnLabel, this.btnTooltip, this.onClick, this.btnClass);
	},

	onKeyPress: function(ev)
	{
		var e = ev || window.event;
		switch(e.keyCode) {
			case 13: // Enter
			case 10: // Enter on IE PC
				config.macros.ImportPlugins.doSearch(this.value);
				break;
			case 27: // Escape
				this.value = "";
				clearMessage();
				break;
			default:
				break;
		}
	},

	doSearch: function(query) {
		plugins.PluginLibraryAdaptor.getMatches(query, null, this.displayTiddler);
	},

	displayTiddler: function(context, userParams) {
		var tiddler = context.tiddler;
		if(!context.tiddlerExists) {
			tiddler.fields.doNotSave = true;
			var dirtyState = store.dirty;
			store.addTiddler(tiddler);
			store.dirty = dirtyState;
		}
		story.displayTiddler(null, tiddler, config.macros.ImportPlugins.pluginViewTemplate);
	}
};

config.commands.keepTiddler = {
	text: "keep",
	tooltip: "Permanently store this tiddler",

	handler: function(event, src, title) {
		var tiddler = store.getTiddler(title);
		delete tiddler.fields.doNotSave;
		return false;
	}
};

}
//}}}
