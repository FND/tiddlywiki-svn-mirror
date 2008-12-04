if(!config.extensions) { config.extensions = {}; } //# obsolete from v2.4.2

config.extensions.lazyLoading = {};

(function(plugin) { //# set up alias

config.defaultCustomFields = {
	"server.host": "http://127.0.0.1/",	
	"server.type": "cctiddly",
	"server.workspace": "fredtest"  
};
	
// hijack loadMissingTiddler to trigger lazy loading
plugin.loadMissingTiddler = Story.prototype.loadMissingTiddler;
Story.prototype.loadMissingTiddler = function(title, fields, tiddlerElem) {
	var t = store.getTiddler(title);
	if(t && t.text) {
		return true; // XXX: ??
	} else {
		console.log("loading missing: " + title);
		//store.removeTiddler(t.title); // XXX: wrong
		return plugin.loadMissingTiddler.apply(this, arguments);
	}
};

Story.prototype.createTiddler = function(place, before, title, template, customFields) {
	var tiddlerElem = createTiddlyElement(null,"div",this.tiddlerId(title),"tiddler");
	tiddlerElem.setAttribute("refresh","tiddler");
	if(customFields)
		tiddlerElem.setAttribute("tiddlyFields",customFields);
	place.insertBefore(tiddlerElem,before);
	var defaultText = null;
	var tiddler = store.getTiddler(title);
	console.log(tiddler, tiddler ? tiddler.text : "missing: " + title, tiddler ? (tiddler.text || true) : "skinny");
	if((!store.tiddlerExists(title) && !store.isShadowTiddler(title)) || (tiddler && tiddler.text === ""))
		defaultText = this.loadMissingTiddler(title,customFields,tiddlerElem);
	this.refreshTiddler(title,template,false,customFields,defaultText);
	return tiddlerElem;
};

Story.prototype.loadMissingTiddler = function(title,fields,tiddlerElem)
{
	var tiddler = new Tiddler(title);
	tiddler.fields = typeof fields == "string" ? fields.decodeHashMap() : (fields || config.defaultCustomFields);
	var serverType = tiddler.getServerType();
	var host = tiddler.fields['server.host'];
	var workspace = tiddler.fields['server.workspace'];
	if(!serverType || !host) {
		console.log("ignoring " + title, tiddler, serverType, host, fields);
		return null;
	}
	var sm = new SyncMachine(serverType,{
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
				console.log(tiddler);

				if(tiddler && tiddler.text) {
					var downloaded = new Date();
					if(!tiddler.created)
						tiddler.created = downloaded;
					if(!tiddler.modified)
						tiddler.modified = tiddler.created;
					store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
					autoSaveChanges();
				}
				delete this;
				return true;
			},
			error: function(message) {
				displayMessage("Error loading missing tiddler from %0: %1".format([host,message]));
			}
		});
	sm.go();
	return config.messages.loadingMissingTiddler.format([title,serverType,host,workspace]);
};

})(config.extensions.lazyLoading); //# end of alias