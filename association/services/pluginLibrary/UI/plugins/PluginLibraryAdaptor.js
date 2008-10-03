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

config.extensions.PluginLibraryAdaptor = {
	host: "plugins.tiddlywiki.org/tiddlyweb",
	listRetrievalMsg: "retrieving list of plugins matching '%0'...",
	matchCountMsg: "found %0 matching plugins",
	noMatchMsg: "no plugins found matching '%0'",
	retrievalErrorMsg: "error retrieving data from server",
	activeSearchRequest: false,

	getMatches: function(query, userParams, callback) {
		if(this.activeSearchRequest) {
			return false; // XXX: raise exception?
		}
		this.activeSearchRequest = true;
		clearMessage();
		displayMessage(this.listRetrievalMsg.format([query]));
		var adaptor = new TiddlyWebAdaptor();
		var context = {
			host: this.host,
			query: query,
			matchCallback: callback
		};
		return adaptor.getSearchResults(context, userParams, this.getMatchesCallback);
	},

	getMatchesCallback: function(context, userParams) {
		clearMessage();
		if(!context.status) {
			if(context.httpStatus == 404) {
								displayMessage(config.extensions.PluginLibraryAdaptor.noMatchMsg.format([context.query]));
			} else {
				displayMessage(config.extensions.PluginLibraryAdaptor.retrievalErrorMsg);
			}
			return false; // XXX: raise exception?
		}
		displayMessage(config.extensions.PluginLibraryAdaptor.matchCountMsg.format([context.tiddlers.length]));
		var tiddlers = context.tiddlers;
		if(tiddlers) {
			for(var i = 0; i < tiddlers.length; i++) {
				subContext = {
					tiddler: tiddlers[i]
				};
				context.matchCallback(subContext, userParams);
			}
		}
		config.extensions.PluginLibraryAdaptor.activeSearchRequest = false;
		return true;
	}
};

config.macros.ImportPlugins = { // TODO: rename -- XXX: move to separate plugin
	btnLabel: "Search",
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
		config.extensions.PluginLibraryAdaptor.getMatches(query, null, this.displayTiddler);
	},

	displayTiddler: function(context, userParams) { // lazily loads tiddler contents
		var tiddler = context.tiddler;
		if(!store.tiddlerExists(tiddler.title)) {
			tiddler.fields.doNotSave = true;
			tiddler.fields["server.host"] = config.extensions.PluginLibraryAdaptor.host;
			tiddler.fields["server.type"] = "tiddlyweb";
		}
		story.displayTiddler(null, tiddler, config.macros.ImportPlugins.pluginViewTemplate, null, null, String.encodeHashMap(tiddler.fields));
	}
};

config.paramifiers.search = {
	onstart: function(v) {
		config.macros.ImportPlugins.doSearch(v);
	}
};

config.commands.keepTiddler = { // XXX: move to separate plugin
	text: "keep",
	tooltip: "Permanently store this tiddler",

	handler: function(event, src, title) {
		var tiddler = store.getTiddler(title);
		delete tiddler.fields.doNotSave;
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
	var adaptor = new config.adaptors[context.serverType];
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
