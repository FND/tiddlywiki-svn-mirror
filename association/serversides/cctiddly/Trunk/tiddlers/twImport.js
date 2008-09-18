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


config.macros.stats={};

config.macros.stats.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var params;
	params = { place: place, url: "https://127.0.0.1/Trunk/handle/instanceStats.php?graph=minute",title:"Views by minute.", desc:"this shows users who have viewed this workspace by minute."};
	doHttp('GET',params.url,null, null, null, null, config.macros.stats.dataCallback,params);
	
	params = { place: place, url: "https://127.0.0.1/Trunk/handle/instanceStats.php?graph=hour",title:"Views by hour.", desc:"this shows users who have viewed this workspace by minute."};
	doHttp('GET',params.url,null, null, null, null, config.macros.stats.dataCallback,params);
	
	params = { place: place, url: "https://127.0.0.1/Trunk/handle/instanceStats.php?graph=day",title:"Views by day.", desc:"this shows users who have viewed this workspace by minute."};
	doHttp('GET',params.url,null, null, null, null, config.macros.stats.dataCallback,params);
	
	params = { place: place, url: "https://127.0.0.1/Trunk/handle/instanceStats.php?graph=month",title:"Views by month.", desc:"this shows users who have viewed this workspace by minute."};
	doHttp('GET',params.url,null, null, null, null, config.macros.stats.dataCallback,params);

}



config.macros.stats.simpleEncode = function(valueArray,maxValue) {
	var simpleEncoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var chartData = ['s:'];
	  for (var i = 0; i < valueArray.length; i++) {
	    var currentValue = valueArray[i];
	    if (!isNaN(currentValue) && currentValue >= 0) {
	    	chartData.push(simpleEncoding.charAt(Math.round((simpleEncoding.length-1) * currentValue / maxValue)));
	    }
	      else {
	      chartData.push('_');
	      }
	  }
	return chartData.join('');
}

config.macros.stats.makeGraph = function(valueArray,maxValue) {
}

config.macros.stats.max = function(array) {
	return Math.max.apply( Math, array );
}

config.macros.stats.dataCallback = function(status,params,responseText,uri,xhr){	
	var res = eval("[" + responseText + "]");
	console.log(responseText);
	var d=[];
	for(var c=0; c<res.length; c++){
		d[c]= res[c].hits;
	}
	var maxValue = config.macros.stats.max(d);
 	var image = 'http://chart.apis.google.com/chart?cht=lc&chs=100x75&chd='+config.macros.stats.simpleEncode(d,maxValue)+'&chxt=x,y&chxl=0:||1:|';
	var div = createTiddlyElement(params.place, "div");
	div.onclick = function()
	{
		var full = "http://chart.apis.google.com/chart?cht=lc&chs=800x375&chd="+config.macros.stats.simpleEncode(d)+"&chxt=x,y&chxl=0:1:|"+"label"+"&chf=c,lg,90,EEEEEE,0.5,ffffff,20|bg,s,FFFFFF&&chg=10.0,10.0&";
		console.log(full);
		setStylesheet(
		"#errorBox .button {padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
		"html > body > #backstageCloak {height:100%;}"+
		"#errorBox {border:1px solid #ccc;background-color: #eee; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
		var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
		box.innerHTML =  "<a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><br />";
		box.style.position = 'absolute';
		var img = createTiddlyElement(box, "img");
		img.src = full;
		ccTiddlyAdaptor.center(box);
		ccTiddlyAdaptor.showCloak();
	}
	var img = createTiddlyElement(div, "h2", null, null, params.title);
	var img = createTiddlyElement(div, "img");
	img.src = image;
	
	var span = createTiddlyElement(div, "div", null, "graph_label", params.desc);
	setStylesheet(".graph_label  {  position:relative; top:-60px; left:130px;}");
}





















config.macros.stats.imgCallback = function(status,params,responseText,uri,xhr){	
	var div = createTiddlyElement(params.place, "div");
	params.div = div;
	div.onclick = function()
	{
		var img = createTiddlyElement(div, "img");
		eval("var res= "+responseText+" ");
		console.log(res);
		if (!store.tiddlerExists("Graph")){
			var myTiddler = store.createTiddler("Graph");
		}else{	
			var myTiddler = store.getTiddler("Graph");
			doHttp('GET',params.url+"&full=1&desc="+params.title,null, null, null, null, config.macros.stats.imgCallbackFull,params);
		}
		myTiddler.set("Graph","<html><img src='"+res.full+"'></html>","ccTiddly", 200708091500, null, "200708091500", null);
		story.displayTiddler(null, "Graph", DEFAULT_VIEW_TEMPLATE);
	}
	   
	createTiddlyElement(div, "h2", null, null, params.title);

	//return false;
	//img.src = responseText;
	//var span = createTiddlyElement(div, "div", null, "graph_label", params.desc);
	//setStylesheet(".graph_label  {  position:relative; top:-60px; left:130px;}");

}


config.macros.stats.imgCallbackFull = function(status,params,responseText,uri,xhr){


		setStylesheet(
		"#errorBox .button {padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
		"html > body > #backstageCloak {height:100%;}"+
		"#errorBox {border:1px solid #ccc;background-color: #eee; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
		var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
		box.innerHTML =  "<a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><br />";
			box.style.position = 'absolute';
			var img = createTiddlyElement(box, "img");
			img.src = responseText;
			console.log(img.src);
			ccTiddlyAdaptor.center(box);
			ccTiddlyAdaptor.showCloak();

}

