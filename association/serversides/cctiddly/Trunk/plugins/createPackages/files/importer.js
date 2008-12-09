config.macros.ccCreateWorkspace.createWorkspaceAdvanced = function()
{
		var tagged = store.getTaggedTiddlers("systemPackage");

		var html = "<form>";
		for(var t=0; t<tagged.length; t++){
	html += "<div id='mid' style='vertical-align:middle'>";
			if(store.getTiddlerSlice(tagged[t].title,'image')!=undefined)
				html += "<img src="+store.getTiddlerSlice(tagged[t].title,'image')+" width=50px >";
			else
				html += "<img src='http://www.google.co.uk/intl/en_uk/images/logo.gif' width=50px >";

			   html += "<input tabindex=2 type=radio name='packages' value='"+tagged[t].title+"' >"+tagged[t].title+"<br/>";
				html +="</div>";
	//		   html +=  store.getTiddlerSlice(tagged[t].title,'Description')+"<br /><br />";
		}

		return  html+"</form>";
}


// override includes radio handling.
config.macros.ccCreateWorkspace.createWorkspaceOnSubmit = function(w){
	var params = {}; 
	params.w = w;	
	var radios = w.formElem.packages;
	var packageTiddler;
	for(var z=0;z<radios.length;z++){
		if (radios[z].checked){

			params.selectedPackage  = radios[z].value;
			break;
		}
	}
	if(window.useModRewrite == 1)
		params.url = url+w.formElem["workspace_name"].value; 
	else
		params.url = url+'?workspace='+w.formElem["workspace_name"].value;
	var loginResp = doHttp('POST',url+'?&workspace='+w.formElem["workspace_name"].value+"/",'&ccCreateWorkspace=' + encodeURIComponent(w.formElem["workspace_name"].value)+'&amp;ccAnonPerm='+encodeURIComponent("AADD"),null,null,null,config.macros.ccCreateWorkspace.createWorkspaceCallback,params);
	return false; 
};




config.macros.ccCreateWorkspace.checkSaveCount = function (requests, saved) {
	if(requests == 0)
		return false;
	if(requests == saved)
		return true;
}	

config.macros.ccCreateWorkspace.doImport = function (params, content) {
	var importStore = new TiddlyWiki();
	importStore.importTiddlyWiki(content);

	config.extensions.ServerSideSavingPlugin.saveTiddlerCallback = function(context, userParams) {
		};
	window.savedCount = 0;
	window.savedRequestedCount = 0;
	importStore.forEachTiddler(function(title,tiddler) {
		if(!store.getTiddler(title)) {
			params.w.formElem.statusMarker.value='saving '+title;
			var progressDiv = createTiddlyElement(null, "div", "", "progressBar");
			params.w.formElem.statusMarker.appendChild(progressDiv);
			tiddler.fields['server.workspace'] = params.w.formElem["workspace_name"].value;
			window.workspace = params.w.formElem["workspace_name"].value; // HORRID HORRID HACK

			tiddler.fields['server.type'] = 'cctiddly';
			tiddler.fields['server.host'] = window.url;
			tiddler.fields['workspace']= window.workspace;
			store.saveTiddler(title,title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,false,tiddler.created);
			window.savedRequestedCount ++;
		}
	});
	displayMessage(window.savedRequestedCount);
	autoSaveChanges();
}

config.macros.ccCreateWorkspace.fetchFileCallback = function(status,params,responseText,url,xhr){
	if(status && locateStoreArea(responseText))
		config.macros.ccCreateWorkspace.doImport(params, responseText);
	else
		displayMessage("Package not found.  You will be provieded a standard TiddlyWiki.");
}

