config.macros.packageImporter = {
	
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		createTiddlyElement(place, "h1", null, null, "Import TiddlyWiki Package");
		var s = createTiddlyElement(null,"select" ,null,null);
		s.onchange = function() {config.macros.packageImporter.click(this)};
		var tagged = store.getTaggedTiddlers("systemPackage");
		createTiddlyElement(s,"option" ,null,'please select', 'please select');

		for(var t=0; t<tagged.length; t++)
			createTiddlyElement(s,"option" ,null,tagged[t].title, tagged[t].title);
		place.appendChild(s);
		
		var html = "<form><h2>Install Package</h2><br />";
		for(var t=0; t<tagged.length; t++){
			html += "<input type=radio name='package' value='"+tagged[t].title+"' >"+tagged[t].title+"<br />";
			html +=  store.getTiddlerSlice(tagged[t].title,'Description')+"<br /><br /";
//			createTiddlyElement(place,"input" ,null,tagged[t].title, tagged[t].title, {type:'radio'});
//			createTiddlyText(place, tagged[t].title);
		}
		place.innerHTML = html+"<input type=button value='add package'  onclick='config.macros.packageImporter.click(this)'/></form>";
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
		//	console.log(tiddler.text);
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
		//console.log(package);
		var url = store.getTiddlerSlice(packageTiddler,'URL');
		//console.log(url)
		//console.log(a);
		//console.log(this);
		//alert(a.previousSibling.value);
		this.fetchFile(url);
		//displayMessage(store.getTiddlerSlice(a.value,"URL"));
		//this.fetchFile(store.getTiddlerSlice(a.value,"URL"));
	}
	
}