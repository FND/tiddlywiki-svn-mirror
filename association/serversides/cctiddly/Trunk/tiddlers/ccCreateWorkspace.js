/***
|''Name''|ccWorkspace|
|''Description''|Allows users to create Workspaces|
|''Author''|[[Simon McManus | http://simonmcmanus.com]]
|''Version''|1.0.1|
|''Date''|12/05/08|
|''Status''|@@alpha@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccWorkspace.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccWorkspace.js|
|''License''|BSD|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''Keywords''|ccTiddly, ccWorkspace|

!Description

Allows users to create their own workspace. 

!Usage
{{{
<<ccCreateWorkspace>>
}}}

!Code

***/
//{{{


config.macros.ccCreateWorkspace = {}
merge(config.macros.ccCreateWorkspace, {
	wizardTitle:"Create Workspace",
	buttonCreateText:"create",
	buttonCreateWorkspaceText:"Create Workspace",
	buttonCreateTooltip:'Create new workspace',
	errorPermissions:"You do not have permissions to create a workspace.  You may need to log in.",
	msgPleaseWait:"Please wait, your workspace is being created.",
	msgWorkspaceAvailable:"Workspace name is available.",
	errorWorkspaceNameInUse:"Workspace name is already in use.",
	stepTitle:"Please enter workspace name",
	stepCreateHtml:"<input class='input' id='workspace_name' name='workspace_name' tabindex='1'/><span></span><input type='hidden' name='workspace_error'></input><br /><br /><h2></h2><input type='hidden' name='workspace_url'></input>",
});
	

if (isLoggedIn()) {
	config.backstageTasks.push(config.macros.ccCreateWorkspace.buttonCreateText);
	merge(config.tasks,{create: {text: config.macros.ccCreateWorkspace.buttonCreateText, tooltip: config.macros.ccCreateWorkspace.buttonCreateTooltip, content:'<<ccCreateWorkspace>>'}});
}

config.macros.ccCreateWorkspace.setStatus=function(w, element, text){
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

	}
	}else{
		config.macros.register.setStatus(params.w, "workspace_error", me.msgWorkspaceAvailable);
		
		if (window.useModRewrite == 1)
			config.macros.register.setStatus(params.w, "workspace_url", url+'/'+params.w.formElem["workspace_name"].value);			 
		else
			config.macros.register.setStatus(params.w, "workspace_url", url+'/?workspace='+params.w.formElem["workspace_name"].value);
		
			 
			
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
	w.addStep(me.stepTitle, me.stepCreateHtml);
	w.formElem["workspace_name"].onkeyup=function() {me.workspaceNameKeyPress(w);};
	w.setButtons([
		{caption: me.buttonCreateWorkspaceText, tooltip: me.buttonCreateWorkspaceTooltip, onClick:function(){config.macros.ccCreateWorkspace.createWorkspaceOnSubmit(w);}
	}]);
};
config.macros.ccCreateWorkspace.createWorkspaceOnSubmit = function(w) {
	var params = {}; 
	if (window.useModRewrite == 1)
		params.url = url+'/'+w.formElem["workspace_name"].value; 
	else
		params.url = url+'/?workspace='+w.formElem["workspace_name"].value;
	var loginResp = doHttp('POST',url+'/?&workspace='+w.formElem["workspace_name"].value,'&ccCreateWorkspace=' + encodeURIComponent(w.formElem["workspace_name"].value)+'&amp;ccAnonPerm='+encodeURIComponent("AADD"),null,null,null,config.macros.ccCreateWorkspace.createWorkspaceCallback,params);
	return false; 
};
config.macros.ccCreateWorkspace.createWorkspaceCallback = function(status,params,responseText,uri,xhr) {
	if(xhr.status==201) {
		window.location = params.url;
	} else if (xhr.status == 200) {
		displayMessage(config.macros.ccCreateWorkspace.errorWorkspaceNameInUse);
	} else if (xhr.status == 403) {
		displayMessage(config.macros.ccCreateWorkspace.errorPermissions);	
	} else {
		displayMessage(responseText);	
	}
};


