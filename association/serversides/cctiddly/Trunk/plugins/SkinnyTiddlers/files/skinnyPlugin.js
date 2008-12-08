if(!config.extensions) { config.extensions = {}; } //# obsolete from v2.4.2

config.extensions.lazyLoading = {};

(function(plugin) { //# set up alias

Story.prototype.loadMissingTiddlerContents = function(tiddler) {
	var title = tiddler.title;
	var serverType = tiddler.getServerType();
	var host = tiddler.fields["server.host"];
	var workspace = tiddler.fields["server.workspace"]; // XXX: bag?
	if(!serverType || !host) {
		console.log("ignoring " + title);
		return null;
	}
	var sm = new SyncMachine(serverType, {
		start: function() {
			return this.openHost(host,"openWorkspace");
		},

		openWorkspace: function() {
			return this.openWorkspace(workspace,"getTiddler");
		},

		getTiddler: function() {
			return this.getTiddler(title,"onGetTiddler");
		},

		onGetTiddler: function(context) {
			var tiddler = context.tiddler;
			if(tiddler && tiddler.text) {
				if(!tiddler.created) {
					tiddler.created = new Date();
				}
				if(!tiddler.modified) {
					tiddler.modified = tiddler.created;
				}
				store.saveTiddler(tiddler.title, tiddler.title,
					tiddler.text, tiddler.modifier, tiddler.modified,
					tiddler.tags, tiddler.fields, true, tiddler.created);
				autoSaveChanges();
			}
			delete this;
			return true;
		},

		error: function(message) {
			displayMessage("Error loading missing tiddler contents from %0: %1".format([host, message]));
		}
	});
	sm.go();
	return config.messages.loadingMissingTiddler.format([title, serverType, host,workspace]);
};

// override createTiddler to trigger lazy loading of tiddler contents
Story.prototype.createTiddler = function(place, before, title, template, customFields) {
	console.log("in cT"); // DEBUG
	var tiddlerElem = createTiddlyElement(null, "div", this.tiddlerId(title), "tiddler");
	tiddlerElem.setAttribute("refresh", "tiddler");
	if(customFields) {
		tiddlerElem.setAttribute("tiddlyFields", customFields);
	}
	place.insertBefore(tiddlerElem, before);
	var defaultText = null;
	var tiddler = store.getTiddler(title);
	if(!store.tiddlerExists(title) && !store.isShadowTiddler(title)) {
		console.log("loading missing tiddler: " + title); // DEBUG
		defaultText = this.loadMissingTiddler(title, customFields, tiddlerElem);
	} else if(!tiddler.text) { // XXX: faulty check!?
		console.log("loading missing contents: " + title); // DEBUG
		defaultText = this.loadMissingTiddlerContents(tiddler);
	}
	this.refreshTiddler(title, template, false, customFields, defaultText);
	return tiddlerElem;
};

})(config.extensions.lazyLoading); //# end of alias