(function() {

// hijack loadMissingTiddler to trigger lazy loading
plugin.loadMissingTiddler = Story.prototype.loadMissingTiddler;
Story.prototype.loadMissingTiddler = function(title, fields, tiddlerElem) {
	var tiddler = store.getTiddler(title);
	if(tiddler && tiddler.text) {
		return true;
	} else if(tiddler) {
		console.log("loading missing contents: " + title); // DEBUG
		return plugin.loadMissingTiddlerContents(tiddler);
	} else {
		console.log("loading missing tiddler: " + title); // DEBUG
		return plugin.loadMissingTiddler.apply(this, arguments);
	}
};

Story.prototype.loadMissingTiddlerContents = function(tiddler) {
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

})(); //# end of alias