config.macros.packageImporter = {
	
	handler: function(place,macroName,params,wikifier,paramString,tiddler){	
		var tagged = store.getTaggedTiddlers("systemPackage");
		
		var html = "<form>";
		for(var t=0; t<tagged.length; t++){
			html += "<input type=radio name='package' value='"+tagged[t].title+"' >"+tagged[t].title+"<br />";
			html +=  store.getTiddlerSlice(tagged[t].title,'Description')+"<br /><br /";
		}
		var w = new Wizard();
		w.createWizard(place,"Import Package");
		w.addStep("Import Package from :", html+"<input type=button value='add package'  onclick='config.macros.packageImporter.click(this)'/></form>");
	},
	
	fetchFile : function(location){
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
			if(!store.getTiddler(title)) {
				store.saveTiddler(title,title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,false,tiddler.created);
			}
		});
		store.resumeNotifications();
		refreshDisplay();
		window.location=window.location;
	}, 
	click : function(btn)
	{
		var tiddler = story.findContainingTiddler(btn);
		var radios = tiddler.getElementsByTagName('form')[0]['package'];
		var packageTiddler;
		for(var z=0;z<radios.length;z++){
			if (radios[z].checked){
				packageTiddler = radios[z].value;
				break;
			}
		}
		var url = store.getTiddlerSlice(packageTiddler,'URL');
		this.fetchFile(url);
		}
	
}
