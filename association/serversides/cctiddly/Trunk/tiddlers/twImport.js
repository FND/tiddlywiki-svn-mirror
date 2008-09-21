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
merge(config.macros.stats, {
	graph24HourTitle:"Last 24 hours.",
	graph24HourDesc:"This shows the number of users who have viewed this workspace in the past 24 hours.",
	graph20MinsTitle:"The Last 20 Minutes.",
	graph20MinsDesc:"this shows users who have viewed this workspace over the last 20 minutes.",
	graph7DaysTitle:"Last 7 days.",
	graph7DaysDesc:"This shows the number of users who have viewed this workspace in the last 7 days.",
	graph5MonthsTitle:"Last 5 months.",
	graph5MonthsDesc:"This shows the number of users who have viewed this workspace in the past 30 days."
});

config.macros.stats.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var params;
	params.place = place;
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=LISTWORKSPACES',null,null,null,config.macros.stats.listWorkspaces,params);
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

config.macros.stats.max = function(array) {
	return Math.max.apply(Math, array);
}

config.macros.stats.dataCallback = function(status,params,responseText,uri,xhr){	
	if(xhr.status==401)
	{
		createTiddlyElement(params.container, "h4", null, null, "Permissions Denied to data for "+params.title+" You need to be an administrator on the "+workspace+" workspace.");
		return false;
	}
	var res = eval("[" + responseText + "]");
	
	var d=[];
	var l="";
	for(var c=0; c<res.length; c++){
		d[c]= res[c].hits;
		l+=res[c].date+"|";
	}
	var maxValue = config.macros.stats.max(d);
 	params.gData = config.macros.stats.simpleEncode(d,maxValue);
	params.XLabel = l.substring(0, l.length -1);
	params.YLabel = "0|"+maxValue+"|";
	var image = 'http://chart.apis.google.com/chart?cht=lc&chs=100x75&chd='+params.gData+'&chxt=x,y&chxl=0:||1:|';
	var div = createTiddlyElement(params.container, "div", null, "div_button");
	
	setStylesheet(".div_button:hover {opacity:0.8; cursor: pointer} .div_button{ padding:5px;color:#555;background-color:white;} ", "DivButton");
	div.onclick = function()
	{
		var full = "http://chart.apis.google.com/chart?cht=lc&chs=800x375&chd="+params.gData+"&chxt=x,y&chxl=1:|"+params.YLabel+"0:|"+params.XLabel+"&chf=c,lg,90,EEEEEE,0.5,ffffff,20|bg,s,FFFFFF&&chg=10.0,10.0&";
		setStylesheet(
		"#errorBox .button {padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
		"html > body > #backstageCloak {height:"+window.innerHeight*2+"px;}"+
		"#errorBox {border:1px solid #ccc;background-color: #fff; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
		var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
		box.innerHTML =  "<a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><h3>"+params.title+"</h3><br />";
		box.style.position = 'absolute';
		box.style.height= "460px";
		box.style.width= "800px";
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
//	var w = new Wizard();
//	w.createWizard(params.place,"TiTle");
//	w.addStep("Import Package from :", div);
}

config.macros.stats.switchWorkspace = function(params){
	removeChildren(params.container);
	config.macros.stats.refresh(params);	
}

config.macros.stats.refresh = function(params) {
	var me = config.macros.stats;
	var select = document.getElementById("statsWorkspaceName");
	if(select[select.selectedIndex].value!="")
		workspace = select[select.selectedIndex].value;
	createTiddlyElement(params.container, "h2", null, null , workspace);
	params = { container: params.container, url: window.url+"/handle/instanceStats.php?graph=minute&workspace="+workspace,title:me.graph20MinsTitle, desc:me.graph20MinsDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.stats.dataCallback,params);
	params = { container:params.container, url:  window.url+"/handle/instanceStats.php?graph=hour&workspace="+workspace,title:me.graph24HourTitle, desc:me.graph24HourDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.stats.dataCallback,params);
	params = { container: params.container, url:  window.url+"/handle/instanceStats.php?graph=day&workspace="+workspace,title:me.graph7DaysTitle, desc:me.graph7DaysDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.stats.dataCallback,params);
	params = { container: params.container, url:  window.url+"/handle/instanceStats.php?graph=month&workspace="+workspace,title:me.graph5MonthsTitle, desc:me.graph5MonthsDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.stats.dataCallback,params);	
}

config.macros.stats.listWorkspaces = function(status,params,responseText,uri,xhr) {
	var frm = createTiddlyElement(params.place,'form',null,null);
	var me = config.macros.stats;
	var s = createTiddlyElement(null,"select","statsWorkspaceName",null,"workspaceName");
	var i = createTiddlyElement(s,"option",null,null,"");
	
	s.name = 'workspaceName';
	s.onchange = function() {config.macros.stats.switchWorkspace(params) ;};
	var workspaces = eval('[ '+responseText+' ]');
	for(var d=0; d < workspaces.length; d++){
		var i = createTiddlyElement(s,"option",null,null,workspaces[d]);
		i.value = workspaces[d];
		if (workspace == workspaces[d]){
			// select the workspace being viewed
		}
	}
	params.place.appendChild(s);
	params.container=createTiddlyElement(params.place, "div", "container");
	config.macros.stats.refresh(params);
}
