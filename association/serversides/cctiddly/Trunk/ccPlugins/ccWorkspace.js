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

config.backstageTasks.push('create');
merge(config.tasks,{create: {text: 'create', tooltip: 'Create new workspace', content:'&lt;&lt;ccCreateWorkspace&gt;&gt;'}});

config.macros.ccCreateWorkspace = {}
config.macros.ccCreateWorkspace.handler =  function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	// When we server this tiddler it need to know the URL of the server to post back to
	//this value is currently set in index.php, should be index.php?action=createWorkspace to prepare for modulation
	//form heading
	if (workspacePermission.create!=1)
	{
		createTiddlyElement(place,'div', null, "annotation",  'You do not have permissions to create a workspace.  You may need to log in.');
		return null;
	}
	
	var frm = createTiddlyElement(place,'form',null,"wizard");
	frm.onsubmit = this.createWorkspaceOnSubmit;

	createTiddlyElement(frm,'h1',null,null,"Create Workspace");
	createTiddlyElement(frm, 'h2', null, null,  "Get your own TiddlyWiki workspace below");

	var body = createTiddlyElement(frm,'div',null, "wizardBody");

	//form content
	var step = createTiddlyElement(body,'div',null, "wizardStep");
	//createTiddlyElement(step, "br");
	//form workspace name/url
	var url_label = createTiddlyElement(step, "label", null, "label", url);
	url_label.setAttribute("for","ccWorkspaceName");
	var workspaceName = createTiddlyElement(step,'input','ccWorkspaceName', 'input')				
	workspaceName.value = workspace;
	workspaceName.size = 15;
	workspaceName.name = 'ccWorkspaceName';
	workspaceName.onkeyup=function() {
		config.macros.ccRegister.workspaceNameKeyPress(this.value);
	};
	step.appendChild(workspaceName);
	createTiddlyElement(step,"span",'workspaceName_error','inlineError',null);

	createTiddlyElement(step,'br');

	//privilege form
	anonTitle = createTiddlyElement(step,'div', null, "checkTitle",  'Anonymous Users Can');
	//var anC = createTiddlyCheckbox(null, 'Create Tiddlers', 0);
	var span = createTiddlyElement(step, 'span', null, "checkContainer")
	var anC = createTiddlyElement(null,'input', 'anC','checkInput');
	anC.setAttribute('type','checkbox');
	if (workspacePermission.anonC==1)
	anC.setAttribute('checked','checked');    
	span.appendChild(anC);
	var anC_label = createTiddlyElement(step, "label", null, "checkLabel", "Create Tiddlers");
	anC_label.setAttribute("for","anC");
	createTiddlyElement(step,'br');

	var span = createTiddlyElement(step, 'span', null, "checkContainer")
	var anR = createTiddlyElement(null,'input', 'anR','checkInput');
	anR.setAttribute('type','checkbox');
	if (workspacePermission.anonR  == 1)
	anR.setAttribute('checked','checked');
	span.appendChild(anR);
	var anR_label = createTiddlyElement(step, "label", null, "checkLabel", "Read Tiddlers");
	anR_label.setAttribute("for","anR");
	createTiddlyElement(step,'br');

	var span = createTiddlyElement(step, 'span', null, "checkContainer")
	var anU = createTiddlyElement(null,'input', 'anU','checkInput');
	anU.setAttribute('type','checkbox');
	
	anU.setAttribute('value','1');
	
	if (workspacePermission.anonU  == 1)
	anU.setAttribute('checked','checked');
	span.appendChild(anU);
	var anU_label = createTiddlyElement(step, "label", null, "checkLabel", "Update Tiddlers");
	anU_label.setAttribute("for","anU");
	createTiddlyElement(step,'br');

	var span = createTiddlyElement(step, 'span', null, "checkContainer")
	var anD = createTiddlyElement(null,'input', 'anD','checkInput');
	anD.setAttribute('type','checkbox');
	if (workspacePermission.anonD  == 1)
	anD.setAttribute('checked','checked');
	span.appendChild(anD);
	var anD_label = createTiddlyElement(step, "label", null, "checkLabel", "Delete Tiddlers");
	anD_label.setAttribute("for","anD");
	createTiddlyElement(step,'br');

	var a=createTiddlyElement(step, "div", "createWorkspaceButton", "submit")
	var btn=createTiddlyElement(null,'input',this.prompt,'button');
	btn.setAttribute('type','submit');
	btn.value="Create Workspace";
	a.appendChild(btn);
	createTiddlyElement(a,"span",'workspaceStatus','',null);
	
};
config.macros.ccCreateWorkspace.createWorkspaceOnSubmit = function() {
	var trueStr = "A";
	var falseStr = "D";
	// build up string with permissions values
	var anon=(this.anR.checked?trueStr:falseStr);
	anon+=(this.anC.checked?trueStr:falseStr);
	anon+=(this.anU.checked?trueStr:falseStr);
	anon+=(this.anD.checked?trueStr:falseStr);
	var params = {}; 
	params.url = url+'/'+this.ccWorkspaceName.value;
	
	// disable create workspace button 
	var submit=document.getElementById('createWorkspaceButton');
	submit.disabled=true;
	submit.setAttribute("class","buttonDisabled");
	document.getElementById('workspaceStatus').innerHTML='Please wait, your workspace is being created.';
	
	
	

	var loginResp = doHttp('POST',url+'/'+this.ccWorkspaceName.value,'ccCreateWorkspace=' + encodeURIComponent(this.ccWorkspaceName.value)+'&amp;ccAnonPerm='+encodeURIComponent(anon),null,null,null,config.macros.ccCreateWorkspace.createWorkspaceCallback,params);
	return false; 
};
config.macros.ccCreateWorkspace.createWorkspaceCallback = function(status,params,responseText,uri,xhr) {
	//displayMessage(xhr.status);
	if(xhr.status==201) {
		window.location = params.url;
		//displayMessage('workspace crated');				
	} else if (xhr.status == 200) {
		displayMessage(responseText+"Workspace name is already in use.");
	} else if (xhr.status == 403) {
		displayMessage("Permission denied,the ability to create new workspaces may have been disabled by you systems administrator.");	
	} else {
		displayMessage(responseText);	
	}
};

config.macros.ccRegister.workspaceNameKeyPress=function(str){

	doHttp('POST',url+'/handle/lookupWorkspaceName.php',"ccWorkspaceLookup="+str+"&amp;free=1",null,null,null,config.macros.ccRegister.workspaceNameCallback,null);
	return false;
};

config.macros.ccRegister.workspaceNameCallback=function(status,params,responseText,uri,xhr){
	var field = "";
	if(responseText>0){{
		workspaceName_space=document.getElementById('workspaceName_error');
		workspaceName_space.innerHTML='Workspace name has already been taken';
		workspaceName_space.setAttribute("class","inlineError");
	}
	}else{
		workspaceName_space=document.getElementById('workspaceName_error');
		workspaceName_space.innerHTML="Workspace name is available";
		workspaceName_space.setAttribute("class","inlineOk");
	}
};



config.macros.ccEditWorkspace = {};
config.macros.ccEditWorkspace.handler = function(place,macroName,params,wikifier,paramString,tiddler,errorMsg) {
		
	if (workspacePermission.owner != 1)
	{
		createTiddlyElement(place,'div',null,"annotation", 'You do not have permissions to edit this workspaces permission. ');
		return null;
	}
	// When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
	var frm = createTiddlyElement(place,'form',null,"wizard");
	frm.onsubmit = this.editWorkspaceOnSubmit;
	createTiddlyElement(frm,"br");
	createTiddlyElement(frm,'h1',null,null,'Edit Workspace Permissions');
	createTiddlyElement(frm,"br");
	var body = createTiddlyElement(frm,'div',null,"wizardBody");
	var step = createTiddlyElement(body,'div',null,"wizardStep");
	createTiddlyElement(step,'h5	',null,null,'Anonymous Users Can :  ');
	
	var span = createTiddlyElement(step,'span',null,"checkContainer")
	var anC = createTiddlyCheckbox(span,null,workspacePermission.anonC);
	anC.id='anC';
	anC.setAttribute("class","checkInput");
	var anC_label = createTiddlyElement(step,"label",null,"checkLabel","Create Tiddlers");
 	anC_label.setAttribute("for","anC");
	createTiddlyElement(step,'br');
	
	
	var span = createTiddlyElement(step,'span',null,"checkContainer")
	var  anR = createTiddlyCheckbox(span,null ,workspacePermission.anonR);
	anR.id = 'anR';
	anR.setAttribute("class","checkInput");
	var anR_label = createTiddlyElement(step,"label",null,"checkLabel","Read Tiddlers");
 	anR_label.setAttribute("for","anR");

	createTiddlyElement(step,'br');
			var span = createTiddlyElement(step,'span',null,"checkContainer")
	var anU = createTiddlyCheckbox(span,null,workspacePermission.anonU);
	anU.id = 'anU';
	anU.setAttribute("class","checkInput");
	var anU_label = createTiddlyElement(step,"label",null,"checkLabel","Update Tiddlers");
 	anU_label.setAttribute("for","anU");

	createTiddlyElement(step,'br');
	
				var span = createTiddlyElement(step,'span',null,"checkContainer")
	var anD = createTiddlyCheckbox(span,null,workspacePermission.anonD);
	anD.id = 'anD';
	anD.setAttribute("class","checkInput");
	var anD_label = createTiddlyElement(step,"label",null,"checkLabel","Delete Tiddlers");
 	anD_label.setAttribute("for","anD");

	createTiddlyElement(step,'br');
	createTiddlyElement(frm,'br');
	var btn = createTiddlyElement(frm,'input',this.prompt,"button","button");
	 btn.setAttribute('type','submit');
	 btn.value = 'Edit Workspace Permissions'
	createTiddlyElement(frm,'br');
	createTiddlyElement(frm,'br');
};
	
config.macros.ccEditWorkspace.editWorkspaceOnSubmit = function() {
	var trueStr = "A";
	var falseStr = "D";
	// build up string with permissions values
	var anon=(this.anR.checked?trueStr:falseStr);
	anon+=(this.anC.checked?trueStr:falseStr);
	anon+=(this.anU.checked?trueStr:falseStr);
	anon+=(this.anD.checked?trueStr:falseStr);
	doHttp('POST',url+'handle/updateWorkspace.php','ccCreateWorkspace=' + encodeURIComponent(workspace)+'&amp;ccAnonPerm='+encodeURIComponent(anon),null,null,null,config.macros.ccEditWorkspace.editWorkspaceCallback,params);
	return false;
};

config.macros.ccEditWorkspace.editWorkspaceCallback = function(status,params,responseText,uri,xhr) {
	if (xhr.status == 200) {
		displayMessage(responseText);	
	}
	return false;
};



config.macros.ccAdmin = {}
config.macros.ccAdmin.handler =  function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	var w = new Wizard();
	w.createWizard(place,"Manage Admins");
	var frm = createTiddlyElement(null,'form',null,null);
	frm.onsubmit = this.addAdminSubmit;

	var step = createTiddlyElement(frm,'div',null, "null");

	createTiddlyElement(step, 'h2', null, null,  "Create New Admin ");

	var workspace_label = createTiddlyElement(step, "label", null, "label", "Workspace");
	workspace_label.setAttribute("for","workspaceName");
	var workspaceName = createTiddlyElement(step,'input','workspaceName', 'input')				
	workspaceName.value = workspace;
	workspaceName.size = 15;
	workspaceName.name = 'workspaceName';
	createTiddlyElement(step,'br');

	var username_label = createTiddlyElement(step, "label", null, "label", 'Username  ');
	username_label.setAttribute("for","adminUsername");
	var adminUsername = createTiddlyElement(step,'input','adminUsername', 'input');				
	adminUsername.name = 'adminUsername';
	createTiddlyElement(step,'br');

	
	w.addStep("Step Number 1",frm.innerHTML);
	w.setButtons([{caption: 'Add User', tooltip: 'Add User', onClick: this.addAdminSubmit}]);
}


config.macros.ccAdmin.addAdminSubmit = function(e) {
		var me = config.macros.ccAdmin;
		var w = new Wizard(this);
	//	displayMessage(w.formElem.adminUsername.value);
	doHttp('POST',url+'/handle/workspaceAdmin.php','username='+w.formElem.adminUsername.value+'&workspace_name='+w.formElem.workspaceName.value,null,null,null,config.macros.ccAdmin.addAdminCallback,params);
return false; 
};



config.macros.ccAdmin.listFilesCallback = function(status,params,responseText,uri,xhr) {
	createTiddlyElement(params.place,'hr');
	createTiddlyElement(params.place,'br');
	createTiddlyElement(params.place, 'h2', null, null,  "Existing Files ");
		var a = eval( "[" +responseText+ "]" );
		for(var e=0; e < a.length; e++){  
			var link=createExternalLink(params.place,url+'/uploads/workspace/'+workspace+'/'+a[e]);
			link.textContent=a[e];
			createTiddlyElement(params.place, "br");
		}
}

config.macros.ccAdmin.listALlCallback = function(status,params,responseText,uri,xhr) {
	createTiddlyElement(params.place,'hr');
	createTiddlyElement(params.place,'br');
	createTiddlyElement(params.place, 'h2', null, null,  "Existing Admins ");
	
	var a = eval(responseText);
		//var a = eval( "" +responseText+ "" );
		for(var e=0; e < a.length; e++){ 		
			createTiddlyElement(params.place, 'b', null, null,  a[e].username);
			createTiddlyElement(params.place, 'i', null, null,  ' last visited '+a[e].lastVisit);
			var link=createExternalLink(params.place,url+'/handle/WorkspaceAdmin.php?action=DELETEADMIN&username='+a[e]+'&workspace_name='+workspace);
			link.textContent='(x)';
			createTiddlyElement(params.place, "br");
		
		}
}



config.macros.ccAdmin.addAdminCallback = function(status,params,responseText,uri,xhr) {
//displayMessage(xhr.status);
if(xhr.status)
{
	displayMessage('You do not have permission to add new admin users to the specified workspace.');
}
displayMessage(responseText);
};




config.macros.ccAdmin1= {}
config.macros.ccAdmin1.handler =  function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	
	var frm = createTiddlyElement(place,'form',null,"wizard");
	frm.onsubmit = this.addAdminSubmit;

	createTiddlyElement(frm,'h1',null,null,"Admin Area");
	createTiddlyElement(frm, 'h2', null, null,  "Sort out your permissions below");

	var body = createTiddlyElement(frm,'div',null, "wizardBody");

	//form content
	var step = createTiddlyElement(body,'div',null, "wizardStep");
	//createTiddlyElement(step, "br");
	//form workspace name/url
	createTiddlyElement(step, 'h2', null, null,  "Create New Admin ");

	var workspace_label = createTiddlyElement(step, "label", null, "label", "Workspace");
	workspace_label.setAttribute("for","workspaceName");
	var workspaceName = createTiddlyElement(step,'input','workspaceName', 'input')				
	workspaceName.value = workspace;
	workspaceName.size = 15;
	workspaceName.name = 'workspaceName';
	createTiddlyElement(step,'br');
		
	var username_label = createTiddlyElement(step, "label", null, "label", 'Username  ');
	username_label.setAttribute("for","adminUsername");
	var adminUsername = createTiddlyElement(step,'input','adminUsername', 'input');				
	adminUsername.name = 'adminUsername';

	
	createTiddlyElement(step,'br');
	var btn = createTiddlyElement(step,'input',this.prompt,"button","button");
	 btn.setAttribute('type','submit');
	 btn.value = 'Add User as Admin to Workspace';
	
	
	
	params = {};
	params.place = step;
		doHttp('POST',url+'/handle/workspaceAdmin.php','action=LISTALL&workspace_name='+workspace,null,null,null,config.macros.ccAdmin.listALlCallback,params);
	doHttp('POST',url+'/handle/listFiles.php','workspace_name='+workspace,null,null,null,config.macros.ccAdmin.listFilesCallback,params);

	
}


//}}}