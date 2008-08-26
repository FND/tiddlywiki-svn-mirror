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
	
	

if (isLoggedIn()){
	config.backstageTasks.push('create');
	merge(config.tasks,{create: {text: 'create', tooltip: 'Create new workspace', content:'<<ccCreateWorkspace>>'}});
}
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
	createTiddlyElement(step, "br");
	anonTitle = createTiddlyElement(step,'b', null, "checkTitle",  'Anonymous Users Can');
	createTiddlyElement(step, "br");
		createTiddlyElement(step, "br");
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
	createTiddlyElement(step, "br");
	

	var a=createTiddlyElement(step, "div", "createWorkspaceButton", "submit")
	var btn=createTiddlyElement(null,'input',this.prompt,'button');
	btn.setAttribute('type','submit');
	btn.value="Create Workspace";
	a.appendChild(btn);
	createTiddlyElement(a,"span",'workspaceStatus','',null);
	createTiddlyElement(step, "br");
	
	
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
	if (window.useModRewrite == 1)
		params.url = url+'/'+this.ccWorkspaceName.value; 
	else
		params.url = url+'/?workspace='+this.ccWorkspaceName.value;
			
	// disable create workspace button 
	var submit=document.getElementById('createWorkspaceButton');
	submit.disabled=true;
	submit.setAttribute("class","buttonDisabled");
	document.getElementById('workspaceStatus').innerHTML='Please wait, your workspace is being created.';
	
	
	

	var loginResp = doHttp('POST',url+'/?&workspace='+this.ccWorkspaceName.value,'&ccCreateWorkspace=' + encodeURIComponent(this.ccWorkspaceName.value)+'&amp;ccAnonPerm='+encodeURIComponent(anon),null,null,null,config.macros.ccCreateWorkspace.createWorkspaceCallback,params);
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
		displayMessage(responseText);	
	}
};




//{{{

config.macros.ccEditWorkspace={};	
merge(config.macros.ccEditWorkspace,{
	WizardTitleText:"Edit Notebook Permissions",
	stepEditTitle:null,
	stepLabelCreate:'Create Tiddlers',
	stepLabelRead:'Read Tiddlers',
	stepLabelUpdate:'Edit Tiddlers',
	stepLabelDelete:'Delete Tiddlers',
	stepLabelPermission:'',
	stepLabelAnon:'  Anonymous  - ',
	stepLabelUser:' Authenticated - ',
	stepLabelAdmin:' Admin - ',
	buttonSubmitCaption:" update ",
	buttonSubmitToolTip:"update notebook permissions",
	button1SubmitCaption:"back",
	button1SubmitToolTip:"review permissions",
	step2Error:"Error"
	});
	
config.macros.ccEditWorkspace.handler = function(place, macroName, params, wikifier, paramString, tiddler){
	if (workspacePermission.owner!=1)
	{
		createTiddlyElement(place,'div', null, "annotation",  'You do not have permissions to create a workspace.  You may need to log in.');
		return null;
	}
	var w = new Wizard();
	w.createWizard(place, this.WizardTitleText);
	var me = config.macros.ccEditWorkspace;
	
	var booAdmin = false;
	var booUser = false;
	var booAnon = false;
	
	// Check which colums to display
	for (i = 0; i <= params.length - 1; i++) {
		switch (params[i].toLowerCase()) {
			case 'admin':
				booAdmin = true;
				break;
			case 'user':
				booUser = true;
				break;
			case 'anon':
				booAnon = true;
				break;
		}
	}
	// if nothing passed show all
	if (!booAdmin && !booUser && !booAnon) {
		booAdmin = true;
		booUser = true;
		booAnon = true;
	}
	
	var tableBodyBuffer = new Array();
	// define html here
	tableBodyBuffer.push('<table  border=1px>');
	tableBodyBuffer.push('	<tr">');
	tableBodyBuffer.push('		<th>' + this.stepLabelPermission + '</th>');
	if (booAnon) {
		tableBodyBuffer.push('		<th>' + this.stepLabelAnon + '</th>');
	}
	if (booUser) {
		tableBodyBuffer.push('		<th>' + this.stepLabelUser + '</th>');
	}
	if (booAdmin) {
		tableBodyBuffer.push('		<th>' + this.stepLabelAdmin + '</th>');
	}
	tableBodyBuffer.push('	</tr>');
	tableBodyBuffer.push('	<tr>')
	tableBodyBuffer.push('		<td>' + this.stepLabelRead + '</td>');
	if (booAnon) {
		tableBodyBuffer.push('		<td><input name="anR" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonR == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if (booUser) {
		tableBodyBuffer.push('		<td><input name="usR" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userR == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if (booAdmin) {
		tableBodyBuffer.push('		<td><input name="adR" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('	</tr>');
	tableBodyBuffer.push('	<tr>');
	tableBodyBuffer.push('		<td>' + this.stepLabelCreate + '</td>');
	if (booAnon) {
		tableBodyBuffer.push('		<td><input name="anC" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonC == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if (booUser) {
		tableBodyBuffer.push('		<td><input name="usC" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userC == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if (booAdmin) {
		tableBodyBuffer.push('		<td><input name="adC" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('	</tr>');
	tableBodyBuffer.push('	<tr>');
	tableBodyBuffer.push('		<td>' + this.stepLabelUpdate + '</td>');
	if (booAnon) {
		tableBodyBuffer.push('		<td><input name="anU" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonU == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if (booUser) {
		tableBodyBuffer.push('		<td><input name="usU" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userU == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if (booAdmin) {
		tableBodyBuffer.push('		<td><input name="adU" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('	</tr>');
	tableBodyBuffer.push('	<tr>');
	tableBodyBuffer.push('		<td>' + this.stepLabelDelete + '</td>');
	if (booAnon) {
		tableBodyBuffer.push('		<td><input name="anD" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonD == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if (booUser) {
		tableBodyBuffer.push('		<td><input name="usD" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userD == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if (booAdmin) {
		tableBodyBuffer.push('		<td><input name="adD" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('	</tr>');
	tableBodyBuffer.push('</table>');
	
	var stepHTML = tableBodyBuffer.join('');
	w.addStep(this.stepEditTitle,stepHTML);
	
	w.setButtons([
		{caption: this.buttonSubmitCaption, tooltip: this.buttonSubmitToolTip, onClick: function() {me.ewSubmit(place, macroName, params, wikifier, paramString, tiddler,w,booAnon,booUser);}
	}]);

};

config.macros.ccEditWorkspace.ewSubmit = function(place, macroName, params2, wikifier, paramString, tiddler,w, booAnon, booUser){
	//alert('got to here');
	//alert(w.formElem['anC'].checked?"boing":"boink");
	
	var trueStr = "A";
	var falseStr = "U";
	// build up string with permissions values
	
	// validate which we need to update
	var anon = '';
	var user = '';
	
	if (booAnon) {
		var anonBuffer = new Array();
		anonBuffer.push(w.formElem['anR'].checked ? trueStr : falseStr);
		anonBuffer.push(w.formElem['anC'].checked ? trueStr : falseStr);
		anonBuffer.push(w.formElem['anU'].checked ? trueStr : falseStr);
		anonBuffer.push(w.formElem['anD'].checked ? trueStr : falseStr);
		anon = anonBuffer.join('');
	}
	if (booUser) {
		var userBuffer = new Array();
		userBuffer.push(w.formElem['usR'].checked ? trueStr : falseStr);
		userBuffer.push(w.formElem['usC'].checked ? trueStr : falseStr);
		userBuffer.push(w.formElem['usU'].checked ? trueStr : falseStr);
		userBuffer.push(w.formElem['usD'].checked ? trueStr : falseStr);
		user = userBuffer.join('');
	}

	//doHttp('POST',url+'/handle/updateWorkspace.php','ccCreateWorkspace=' + encodeURIComponent(workspace)+'&amp;ccAnonPerm='+encodeURIComponent(anon),null,null,null,config.macros.ccEditWorkspace.editWorkspaceCallback,params);
	//doHttp('POST',url+'/handle/updateWorkspace.php','ccCreateWorkspace=' + encodeURIComponent(workspace)+'&amp;ccUserPerm='+encodeURIComponent(user),null,null,null,config.macros.ccEditWorkspace.editWorkspaceCallback,params);

	var params = new Array();
	params.w = w;
	params.u = user;
	params.a = anon;
	params.p = place;
	params.m =  macroName;
	params.pr = params2;
	params.wi = wikifier;
	params.ps = paramString;
	params.t = tiddler;
displayMessage(url + '/handle/updateWorkspace.php');
	doHttp('POST', url + '/handle/updateWorkspace.php', 'ccCreateWorkspace=' + encodeURIComponent(workspace) + '&ccAnonPerm=' + encodeURIComponent(anon) + '&ccUserPerm=' + encodeURIComponent(user), null, null, null, config.macros.ccEditWorkspace.editWorkspaceCallback, params);

	return false;
	
}
config.macros.ccEditWorkspace.editWorkspaceCallback = function(status,params,responseText,uri,xhr) {
	var w = params.w;
	var me = config.macros.ccEditWorkspace;
	
	if (xhr.status == 200) {
		// use the incoming parameters to set the workspace permission variables.
		if (params.a != '') {
			workspacePermission.anonR = (params.a.substr(0,1)=='A'?1:0);
			workspacePermission.anonC = (params.a.substr(1,1)=='A'?1:0);
			workspacePermission.anonU = (params.a.substr(2,1)=='A'?1:0);
			workspacePermission.anonD = (params.a.substr(3,1)=='A'?1:0);
		}
		if (params.u != '') {
			workspacePermission.userR = (params.u.substr(0,1)=='A'?1:0);
			workspacePermission.userC = (params.u.substr(1,1)=='A'?1:0);
			workspacePermission.userU = (params.u.substr(2,1)=='A'?1:0);
			workspacePermission.userD = (params.u.substr(3,1)=='A'?1:0);
		}
		w.addStep('',responseText);
		// want to set a back button here
		w.setButtons([
				{caption: me.button1SubmitCaption, tooltip: me.button1SubmitToolTip, onClick: function() {config.macros.ccEditWorkspace.refresh(params.p,	params.m,	params.pr,	params.wi,	params.ps,	params.t);}}
		]);
	}
	else{
		w.addStep(me.step2Error+': ' + xhr.status,responseText);
	}
	return false;
};
config.macros.ccEditWorkspace.refresh = function(place, macroName, params, wikifier, paramString, tiddler){
	removeChildren(place);
	config.macros.ccEditWorkspace.handler(place, macroName, params, wikifier, paramString, tiddler);
}

//}}}

//}}}