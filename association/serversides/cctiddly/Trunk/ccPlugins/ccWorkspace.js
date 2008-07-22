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
<<ccEditWorkspace>>
}}}

!Code
***/
//{{{

config.backstageTasks.push('create');
merge(config.tasks,{create: {text: 'create', tooltip: 'Create new workspace', content:'<<ccCreateWorkspace>>'}});
	
config.macros.ccCreateWorkspace = {};
config.macros.ccCreateWorkspace.handler =  function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	if (workspacePermission.create!=1){
		createTiddlyElement(place,'div', null, "annotation",  'You do not have permissions to create a workspace.  You may need to log in.');
		return null;
	}
	var w = new Wizard();
	w.createWizard(place,"Workspace Administration");
	var step1 =  "<table border=0	><tr><td>Please enter the workspace name: </td><td><input  name=ccWorkspaceName value="+workspace+" /></td></tr><tr><td colspan=2>"+url+"</td></tr></table>";
	w.addStep("enter workspace name below",step1);
	
	//<tr border=0><td  border=0><h3>Anonymous users permissions:</h3></td><td></td></tr><tr><td  align='right'><input align='right' name='anonCreate' type='checkbox'></td><td>Create Tiddlers</td></tr><tr><td  align='right'><input name='anonRead' type='checkbox' checked=true></td><td>Read Tiddlers</td></tr><tr><td align='right'><input name='anonUpdate' type='checkbox'></td><td>Update Tiddlers</td></tr><tr><td  align='right'><input name='anonDelete' type='checkbox'></td><td>Delete Tiddlers</td></tr>
	w.formElem.ccWorkspaceName.onkeyup = function() {config.macros.ccRegister.workspaceNameKeyPress(w);}
	w.setButtons([
		{caption: 'Create Workspace', tooltip: 'Advanced workspace configuration', onClick:config.macros.ccCreateWorkspace.setPerm }
	]);	
};

config.macros.ccCreateWorkspace.setPerm = function(){
	var w = new Wizard(this);
	w.clear();
	w.addStep("Configure Permissions for workspace: ","<table><tr border=2><th></th><th>A<br />n<br />o<br />n<br /> </th><th>U<br />s<br />e<br />r<br />s</th><th>A<br />d<br />m<br />i<br />n</th></tr><tr><th>Create</th><td><input align='right' name='adminCreate' type='checkbox' checked='true'></td><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td></tr><tr><th>Read</th><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td></tr><tr><th>Update</th><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td></tr><tr><th>Delete</th><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td><td><input align='right' name='adminCreate' type='checkbox' checked='true' ></td></tr></table>");
	w.setButtons([
		{caption: 'Next', tooltip: 'proceed', onClick:config.macros.ccCreateWorkspace.userPerm },
		{caption: 'Advanced', tooltip: 'Advanced workspace configuration', onClick:config.macros.ccCreateWorkspace.adminPerm }
	]);
};

config.macros.ccCreateWorkspace.userPerm = function(){
	var w = new Wizard(this);
	w.clear();
	w.addStep("Logged in Users can : ","<table><tr border=0><td  border=0><h3>Logged In Users Can</h3></td><td><span id=statusBox></span></td></tr><tr><td  align='right'><input align='right' name='userCreate' type='checkbox' checked='true'></td><td>Create Tiddlers</td></tr><tr><td  align='right'><input name='userRead' type='checkbox' checked=true></td><td>Read Tiddlers</td></tr><tr><td align='right'><input name='userUpdate' type='checkbox'></td><td>Update Tiddlers</td></tr><tr><td  align='right'><input name='userDelete' type='checkbox'></td><td>Delete Tiddlers</td></tr></table>");
	w.setButtons([
		{caption: 'Next', tooltip: 'proceed', onClick:config.macros.ccCreateWorkspace.userPerm },
		{caption: 'cancel', tooltip: 'Advanced workspace configuration', onClick:config.macros.ccCreateWorkspace.adminPerm }
	]);
};

config.macros.ccCreateWorkspace.createWorkspaceOnSubmit = function() {
	var w = new Wizard(this);
	var me = config.macros.login;
	var trueStr = "A";
	var falseStr = "D";
	// build up string with permissions values
	var anon=(w.formElem.anonRead.checked?trueStr:falseStr);
	anon+=(w.formElem.anonCreate.checked?trueStr:falseStr);
	anon+=(w.formElem.anonUpdate.checked?trueStr:falseStr);
	anon+=(w.formElem.anonDelete.checked?trueStr:falseStr);
	var params = {}; 
	params.url = url+'/'+w.formElem.ccWorkspaceName.value;
	// disable create workspace button 
	var loginResp = doHttp('POST',url+'/'+w.formElem.ccWorkspaceName.value,'ccCreateWorkspace=' + encodeURIComponent(w.formElem.ccWorkspaceName.value)+'&ccAnonPerm='+encodeURIComponent(anon),null,null,null,config.macros.ccCreateWorkspace.createWorkspaceCallback,params);
	return false; 
};
config.macros.ccCreateWorkspace.createWorkspaceCallback = function(status,params,responseText,uri,xhr) {
	//displayMessage(xhr.status);
	if(xhr.status==201) {
		window.location = params.url;
		//displayMessage('workspace crated');				
	} else if (xhr.status == 200) {
		displayMessage("Workspace name is already in use.");
	} else if (xhr.status == 403) {
		displayMessage("Permission denied,the ability to create new workspaces may have been disabled by you systems administrator.");	
	} else {
		displayMessage(xhr.status);	
	}
};

config.macros.ccRegister.workspaceNameKeyPress=function(w){
	doHttp('POST',url+'/handle/lookupWorkspaceName.php',"ccWorkspaceLookup="+w.formElem.ccWorkspaceName.value+"&free=1",null,null,null,config.macros.ccRegister.workspaceNameCallback,w);
	return false;
};

config.macros.ccRegister.workspaceNameCallback=function(status,params,responseText,uri,xhr){
	var w = params;
	var field = "";
	if(responseText>0){{
		workspaceName_space=document.getElementById('workspaceName_error');
		workspaceName_space.innerHTML='Workspace name has already been taken';
		workspaceName_space.setAttribute("class","inlineError");
	}
	}else{
	//	console.log(w.bodyElem);
	//	workspaceName_space=getElementById('submitBox');
	//	workspaceName_space.innerHTML="Workspace name is available";
	//	workspaceName_space.setAttribute("class","inlineOk");
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
	createTiddlyElement(step,'h5',null,null,'Anonymous Users Can :  ');
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
	doHttp('POST',url+'/handle/updateWorkspace.php','ccCreateWorkspace=' + encodeURIComponent(workspace)+'&amp;ccAnonPerm='+encodeURIComponent(anon),null,null,null,config.macros.ccEditWorkspace.editWorkspaceCallback,params);
	return false;
};

config.macros.ccEditWorkspace.editWorkspaceCallback = function(status,params,responseText,uri,xhr) {
	if (xhr.status == 200) {
		displayMessage(responseText);	
	}
	return false;
};



//}}}