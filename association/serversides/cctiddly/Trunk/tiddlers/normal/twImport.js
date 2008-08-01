config.macros.packageImporter = {
	
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		var onClick = function(){config.macros.packageImporter.fetchFile(); return false;};
		createTiddlyButton(place,'bang','bang',onClick);
		var s = createTiddlyElement(place,"select" ,null,null);
		
		createTiddlyElement(s,"option" ,null,"TeamTasks", "TeamTasks", {onSelect:function(){alert("ssss");}});
	},
	
	fetchFile : function(location){
		var location = 'http://getteamtasks.com/teamtasks.html';
		loadRemoteFile(location,config.macros.packageImporter.callback);
	},
	
	callback: function(status,params,responseText,url,xhr){
		if(status && locateStoreArea(responseText))
			config.macros.packageImporter.doImport(responseText);	
	},
	
	doImport : function(content){
		var importStore = new TiddlyWiki();
		importStore.importTiddlyWiki(content);
		store.suspendNotifications();
		importStore.forEachTiddler(function(title,tiddler) {
		//	console.log(tiddler.text);
			if(!store.getTiddler(title)) {
				store.saveTiddler(title,title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,false,tiddler.created);
			}
		});
		store.resumeNotifications();
		refreshDisplay();
	}
	
}