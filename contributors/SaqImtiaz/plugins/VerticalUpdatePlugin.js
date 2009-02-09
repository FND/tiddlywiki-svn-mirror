config.macros.updateVertical = {
	
	updated : false,
	
	init : function() {
		this.fetchFile();
	},
	
	handler : function(place) {
		createTiddlyButton(place,"upgrade vertical"||params[0],"upgrade vertical"||params[0],this.fetchFile);
	},
	
	fetchFile : function() {
		var url = store.getTiddlerText('VerticalUpgradeURL');
		if (!url){
			displayMessage("No update server found")
			return false;
		}
		loadRemoteFile(url,config.macros.updateVertical.fetchFileCallback);
		return false;
	},
	
	fetchFileCallback : function(status,params,responseText,url,xhr) {
		if(status && locateStoreArea(responseText))
			config.macros.updateVertical.doUpdate(params, responseText);
		else
			displayMessage("Could not check for software updates on the server.");
	},
	
	doUpdate : function(params,content) {
		var importStore = new TiddlyWiki();
		importStore.importTiddlyWiki(content);
		config.macros.updated = false;
		importStore.forEachTiddler(
			function(title,tiddler){
				var save = false;
				if (!store.getTiddler(title))
					save = true;
				else if (tiddler.modified.getTime() - store.getTiddler(title).modified.getTime() > 0) {
					if (! tiddler.isTagged("excludeSync"))
						save = true
				}		
				if (save) {
					store.addTiddler(tiddler)
					config.macros.updated = true;
				}
			}
		)
		if (config.macros.updated)
			displayMessage("Your notebook software has been updated. Please save and reload.");
	}
	
}
