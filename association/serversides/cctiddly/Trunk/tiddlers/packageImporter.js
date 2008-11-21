// ccCreateWorkspace //

//{{{

if(isLoggedIn()){
	config.backstageTasks.push(config.macros.ccCreateWorkspace.buttonCreateText);
	merge(config.tasks,{create: {text: config.macros.ccCreateWorkspace.buttonCreateText, tooltip: config.macros.ccCreateWorkspace.buttonCreateTooltip, content:'<<ccCreateWorkspace>>'}});
}

config.macros.ccCreateWorkspace.setStatus=function(w,element,text){
	var label_var = w.getElement(element);
	removeChildren(label_var.previousSibling);
	var label = document.createTextNode(text);
	label_var.previousSibling.insertBefore(label,null);
}

config.macros.ccCreateWorkspace.workspaceNameKeyPress=function(w){
	params={};
	params.w = w;
	doHttp('POST',url+'/handle/lookupWorkspaceName.php',"ccWorkspaceLookup="+w.formElem["workspace_name"].value+"&free=1",null,null,null,config.macros.ccCreateWorkspace.workspaceNameCallback,params);	
	return false;
};
 	
config.macros.ccCreateWorkspace.workspaceNameCallback=function(status,params,responseText,uri,xhr){
	var me = config.macros.ccCreateWorkspace;
	if(responseText > 0){{
			config.macros.register.setStatus(params.w, "workspace_error", me.errorWorkspaceNameInUse);
			config.macros.register.setStatus(params.w, "workspace_url", "");
	}}else{
		config.macros.register.setStatus(params.w, "workspace_error", me.msgWorkspaceAvailable);
		if (window.useModRewrite == 1)
			config.macros.register.setStatus(params.w, "workspace_url", url+''+params.w.formElem["workspace_name"].value);			 
		else
			config.macros.register.setStatus(params.w, "workspace_url", url+'?workspace='+params.w.formElem["workspace_name"].value);
	}
};

config.macros.ccCreateWorkspace.handler =  function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	if (window.workspacePermission.canCreateWorkspace!=1) {
		createTiddlyElement(place,'div', null, "annotation",  config.macros.ccCreateWorkspace.errorPermissions);
		return null;
	}
	var me = config.macros.ccCreateWorkspace;
	var w = new Wizard();
	w.createWizard(place,me.wizardTitle);



	var tagged = store.getTaggedTiddlers("systemPackage");

	var html = "<form>";
	for(var t=0; t<tagged.length; t++){
		   html += "<input tabindex=2 type=radio name='packages' value='"+tagged[t].title+"' >"+tagged[t].title+"<br />";
		   html +=  store.getTiddlerSlice(tagged[t].title,'Description')+"<br /><br /";
	}
	var form =  html+"</form>";
	
	w.addStep(me.stepTitle, me.stepCreateHtml+form);
	w.formElem["workspace_name"].onkeyup=function() {me.workspaceNameKeyPress(w);};
	w.formElem.onsubmit = function() { config.macros.ccCreateWorkspace.createWorkspaceOnSubmit(w);  return false;};
	w.setButtons([
		{caption: me.buttonCreateWorkspaceText, tooltip: me.buttonCreateWorkspaceTooltip, onClick:function(){config.macros.ccCreateWorkspace.createWorkspaceOnSubmit(w);}
	}]);
};

config.macros.ccCreateWorkspace.createWorkspaceOnSubmit = function(w){
	var radios = w.formElem.packages;
	var packageTiddler;
	for(var z=0;z<radios.length;z++){
		if (radios[z].checked){
			selectedPackage = radios[z].value;
			break;
		}
	}
	var params = {}; 
	params.w = w;
	params.selectedPackage = selectedPackage;
	if(window.useModRewrite == 1)
	params.url = url+w.formElem["workspace_name"].value; 
	else
		params.url = url+'?workspace='+w.formElem["workspace_name"].value;
	var loginResp = doHttp('POST',url+'?&workspace='+w.formElem["workspace_name"].value+"/",'&ccCreateWorkspace=' + encodeURIComponent(w.formElem["workspace_name"].value)+'&amp;ccAnonPerm='+encodeURIComponent("AADD"),null,null,null,config.macros.ccCreateWorkspace.createWorkspaceCallback,params);
	return false; 
};

config.macros.ccCreateWorkspace.createWorkspaceCallback = function(status,params,responseText,uri,xhr) {
	if(xhr.status==201){
	   var url = store.getTiddlerSlice(params.selectedPackage,'URL');
		loadRemoteFile(url,config.macros.ccCreateWorkspace.fetchFileCallback ,params);
	}else if(xhr.status == 200){
		displayMessage(config.macros.ccCreateWorkspace.errorWorkspaceNameInUse);
	}else if(xhr.status == 403){
		displayMessage(config.macros.ccCreateWorkspace.errorPermissions);	
	}else{
		displayMessage(responseText);	
	}
};



config.macros.ccCreateWorkspace.doImport = function (params, content) {
	var importStore = new TiddlyWiki();
	importStore.importTiddlyWiki(content);
	store.suspendNotifications();
	importStore.forEachTiddler(function(title,tiddler) {
		if(!store.getTiddler(title)) {
			tiddler.fields['server.workspace'] = params.w.formElem["workspace_name"].value;
			store.saveTiddler(title,title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,false,tiddler.created);
		}
	});

}

config.macros.ccCreateWorkspace.fetchFileCallback = function(status,params,responseText,url,xhr){
	if(status && locateStoreArea(responseText))
		config.macros.ccCreateWorkspace.doImport(params, responseText);
}
//}}}

