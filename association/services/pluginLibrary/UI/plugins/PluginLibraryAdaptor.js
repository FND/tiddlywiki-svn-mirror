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

if(plugins === undefined) { var plugins = {}; }

plugins.PluginLibraryAdaptor = {
	host: "http://burningchrome.com:8090",

	/**
	 * retrieve plugins matching the search query
	 * @param {String} host Plugin Library URL
	 * @param {Function} callback function to execute for each tiddler being retrieved
	 */
	getMatches: function(query, userParams, callback) { // XXX: rename?
		displayMessage("retrieving list of plugins matching '" + query + "'..."); // TODO: i18n
		var adaptor = new TiddlyWebAdaptor();
		var context = {
			host: this.host,
			query: query
		};
		return adaptor.getSearchResults(context, userParams, this.getMatchesCallback);
	},

	/**
	 * retrieve individual tiddlers
	 * @param {Object} context context object with members host, callback
	 * @param {Function} callback function to execute for each tiddler being retrieved
	 * @return {Boolean} success
	 */
	getMatchesCallback: function(context, userParams) { // XXX: rename?
		if(!context.status) {
			displayMessage("error retrieving data from server"); // XXX: TBD
			return false; // XXX: raise exception?
		}
		displayMessage("found " + context.tiddlers.length + " matching plugins"); // TODO: i18n
		var plugins = context.tiddlers;
		if(plugins) {
			for(var i = 0; i < plugins.length; i++) {
				if(!store.tiddlerExists(plugins[i].title)) { // XXX: potentially harmful?
					var subContext = {
						host: context.host,
						bag: plugins[i].fields["server.bag"]
					};
					context.adaptor.getTiddler(plugins[i].title, subContext, userParams, userParams.callback);
				} else {
					context.tiddler = plugins[i].title; // XXX: hacky?
					userParams.callback(context, userParams);
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
		var userParams = {
			callback: this.displayTiddler
		};
		plugins.PluginLibraryAdaptor.getMatches(query, userParams);
	},

	displayTiddler: function(context, userParams) {
		var plugin = context.tiddler;
		if(plugin instanceof Tiddler) { // XXX: hacky?
			plugin.fields.doNotSave = true;
			var dirtyState = store.dirty;
			plugin = store.saveTiddler(plugin.title, plugin.title, plugin.text,
				plugin.modifier, plugin.modified, plugin.tags, plugin.fields, true,
				plugin.created);
			store.dirty = dirtyState;
		}
		story.displayTiddler(null, plugin, config.macros.ImportPlugins.pluginViewTemplate);
	}
};

config.commands.keepTiddler = { // TODO: rename?
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
