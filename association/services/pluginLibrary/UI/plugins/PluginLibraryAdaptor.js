/***
|''Name''|PluginLibraryAdaptor|
|''Description''|[TBD]|
|''Author''|FND|
|''Version''|0.1.1|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/UI/plugins/PluginLibraryConnectorPlugin.js|
|''License''|[[Creative Commons Attribution-Share Alike 3.0|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Code
***/
//{{{
if(!version.extensions.PluginLibraryAdaptor) { // TODO: rename
version.extensions.PluginLibraryAdaptor = { installed: true };

if(!config.extensions) { config.extensions = {}; }

if(!config.options.txtPluginLibrarySearchResults) {
	config.options.txtPluginLibrarySearchResults = "25";
}

config.extensions.PluginLibraryAdaptor = {
	host: "plugins.tiddlywiki.org/tiddlyweb",
	activeSearchRequest: false,

	getMatches: function(query, userParams, callback) {
		if(this.activeSearchRequest) {
			return false;
		}
		this.activeSearchRequest = true;
		var adaptor = new TiddlyWebAdaptor();
		var context = {
			host: this.host,
			workspace: "plugins",
			query: query,
			matchesCallback: callback
		};
		context.filters = "[text[" + query + "]]" +
			" [count[" + config.options.txtPluginLibrarySearchResults + "]]";
		return adaptor.getTiddlerList(context, userParams, this.getMatchesCallback);
	},

	getMatchesCallback: function(context, userParams) {
		context.matchesCallback(context, userParams);
		config.extensions.PluginLibraryAdaptor.activeSearchRequest = false;
	}
};

config.macros.ImportPlugins = { // TODO: rename -- XXX: move to separate plugin
	btnLabel: "Search",
	btnTooltip: "search the TiddlyWiki Plugin Library",
	btnClass: null,
	accessKey: "f",

	listRetrievalMsg: "retrieving list of plugins matching '%0'...",
	matchCountMsg: "found %0 matching plugins",
	noMatchMsg: "no plugins found matching '%0'",
	serverErrorMsg: "error retrieving data from server",

	pluginViewTemplate: "PluginViewTemplate",

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var wrapper = createTiddlyElement(place, "div", null, "searchBox");
		var input = createTiddlyElement(wrapper, "input", null, null, null, {
			accessKey: this.accessKey
		});
		input.onkeyup = this.onKeyPress;
		createTiddlyButton(wrapper, this.btnLabel, this.btnTooltip, this.onClick, this.btnClass);
	},

	onClick: function(ev) {
		var query = this.parentNode.getElementsByTagName("input")[0].value;
		config.macros.ImportPlugins.doSearch(query);
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
		displayMessage(this.listRetrievalMsg.format([query]));
		config.extensions.PluginLibraryAdaptor.getMatches(query, null, this.displayTiddlers);
	},

	displayTiddlers: function(context, userParams) {
		clearMessage();
		if(!context.status) {
			if(context.httpStatus == 404) {
				displayMessage(config.macros.ImportPlugins.noMatchMsg.format([context.query]));
			} else {
				displayMessage(config.macros.ImportPlugins.serverErrorMsg);
			}
			return false;
		}
		displayMessage(config.macros.ImportPlugins.matchCountMsg.format([context.tiddlers.length]));
		var tiddlers = context.tiddlers;
		for(var i = 0; i < tiddlers.length; i++) {
			if(!store.tiddlerExists(tiddlers[i].title)) { // lazy loading of tiddler contents
				tiddlers[i].fields.doNotSave = true;
				tiddlers[i].fields["server.host"] = config.extensions.PluginLibraryAdaptor.host;
				tiddlers[i].fields["server.type"] = "tiddlyweb";
			}
			story.displayTiddler(null, tiddlers[i], config.macros.ImportPlugins.pluginViewTemplate, null, null, String.encodeHashMap(tiddlers[i].fields));
		}
		return true;
	}
};

config.paramifiers.search = {
	onstart: function(v) {
		config.macros.ImportPlugins.doSearch(v);
	}
};

config.commands.storeToggle = { // XXX: move to separate plugin
	temporaryText: "keep",
	permanentText: "\u221A keep",
	temporaryTooltip: "Permanently store this tiddler",
	permanentTooltip: "Do not permanently store this tiddler",
	targetTiddler: "ExtensionBasket",

	isEnabled: function(tiddler) { // XXX: hacky abuse
		if(!tiddler.fields.doNotSave) {
			this.text = this.permanentText;
			this.tooltip = this.permanentTooltip;
		} else {
			this.text = this.temporaryText;
			this.tooltip = this.temporaryTooltip;
		}
		return true;
	},

	handler: function(event, src, title) {
		var tiddler = store.getTiddler(title);
		if(tiddler.fields.doNotSave) {
			delete tiddler.fields.doNotSave;
			removeChildren(src);
			createTiddlyText(src, this.permanentText);
			src.title = this.permanentTooltip;
		} else {
			tiddler.fields.doNotSave = true;
			removeChildren(src);
			createTiddlyText(src, this.temporaryText);
			src.title = this.temporaryTooltip;
		}
		store.notify(this.targetTiddler, true);
		return false;
	}
};

// override loadMissingTiddler to make it bag-aware (cf. ticket #696)
Story.prototype.loadMissingTiddler = function(title,fields,tiddlerElem) {
	var getTiddlerCallback = function(context) {
		var tiddler = context.tiddler;
		if(tiddler && tiddler.text) {
			if(!tiddler.created) {
				tiddler.created = new Date();
			}
			if(!tiddler.modified) {
				tiddler.modified = tiddler.created;
			}
			var dirtyState = store.dirty;
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
			store.dirty = dirtyState;
			autoSaveChanges();
		}
		context.adaptor.close();
		delete context.adpator;
	};
	var tiddler = new Tiddler(title);
	tiddler.fields = typeof fields == "string" ?  fields.decodeHashMap() : (fields ? fields : {});
	context = {
		tiddler: tiddler,
		serverType: tiddler.getServerType(),
		host: tiddler.fields['server.host'],
		bag: tiddler.fields['server.bag']
	};
	if(!context.serverType) {
		return;
	}
	var adaptor = new config.adaptors[context.serverType]();
	adaptor.getTiddler(title,context,null,getTiddlerCallback);
	return config.messages.loadingMissingTiddler.format([title,context.serverType,context.host,context.workspace]);
};

// hijack httpReq to throttle simultaneous XHRs -- TODO: move to separate plugin; use HttpManagerPlugin (employs actual queueing)
config.options.XHRCount = 0; // XXX: namespace abuse
config.options.txtXHRThrottleDelay = 1000;
config.options.txtXHRThrottleAmount = 5;
var httpReq_orig = httpReq;
httpReq = function(type, url, callback, params, headers, data, contentType, username, password, allowCache) {
	if(config.options.XHRCount >= config.options.txtXHRThrottleAmount) {
		var defer = function() {
			return httpReq(type, url, callback, params, headers, data, contentType, username, password, allowCache);
		};
		setTimeout(defer, config.options.txtXHRThrottleDelay);
	} else {
		config.options.XHRCount++;
		var callbackWrapper = function(status, params, responseText, url, x) {
			config.options.XHRCount--;
			return callback(status, params, responseText, url, x);
		};
		var args = [type, url, callbackWrapper, params, headers, data, contentType, username, password, allowCache];
		return httpReq_orig.apply(this, args);
	}
};

}
//}}}
