/***
|''Name''|ccEditWorkspace|
|''Description''|Allows users to update the permissions of a workspace in ccTiddly|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|1.0.1|
|''Date''|12/05/2008|
|''Status''|@@alpha@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/tiddlers/plugins/ccEditWorkspace.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/tiddlers/plugins/ccEditWorkspace.js|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''Keywords''|ccTiddly ccEditWorkspace|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
|''Date:''|Nov 6, 2008|
|''Version:''|0.1|

!Description
Allows users to update the permissions of a workspace in ccTiddly

!Usage
{{{
<<ccEditWorkspace>>
}}}

!Code
***/
//{{{
	
config.macros.ccEditWorkspace={};	
merge(config.macros.ccEditWorkspace,{
	WizardTitleText:"Edit Workspace Permissions",
	stepEditTitle:null,
	stepLabelCreate:'Create',
	stepLabelRead:'Read',
	stepLabelUpdate:'Edit',
	stepLabelDelete:'Delete',
	stepLabelPermission:'',
	stepLabelAnon:'  Anonymous   ',
	stepLabelUser:' Authenticated   ',
	stepLabelAdmin:' Admin  ',
	buttonSubmitCaption:"Update Workspace Permissions",
	buttonSubmitToolTip:"Update workspace permissions",
	button1SubmitCaption:"ok",
	button1SubmitToolTip:"review permissions",
	step2Error:"Error", 
	errorTextPermissionDenied:"You do not have permissions to edit this workspace permissions.  You may need to log in.",
	errorUpdateFailed:"Permissions Not changed"
});
	
config.macros.ccEditWorkspace.handler = function(place, macroName, params, wikifier, paramString, tiddler){
	var me = config.macros.ccEditWorkspace;
	if(workspacePermission.owner !=1){
		createTiddlyElement(place,'div', null, "annotation",  me.errorTextPermissionDenied);
		return null;
	}
	var w = new Wizard();
	w.createWizard(place, this.WizardTitleText);
	var booAdmin = false;
	var booUser = false;
	var booAnon = false;
	// Check which colums to display
	for(i = 0; i <= params.length - 1; i++){
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
	if(!booAdmin && !booUser && !booAnon){
		booAdmin = true;
		booUser = true;
		booAnon = true;
	}
	var tableBodyBuffer = new Array();
	tableBodyBuffer.push('<table border=0px class="listView twtable">');
	tableBodyBuffer.push('<tr">');
	tableBodyBuffer.push('<th>' + this.stepLabelPermission + '</th>');
	if(booAnon){
		tableBodyBuffer.push('<th>' + this.stepLabelAnon + '</th>');
	}
	if(booUser){
		tableBodyBuffer.push('<th>' + this.stepLabelUser + '</th>');
	}
	if(booAdmin){
		tableBodyBuffer.push('<th>' + this.stepLabelAdmin + '</th>');
	}
	tableBodyBuffer.push('</tr>');
	tableBodyBuffer.push('<tr>')
	tableBodyBuffer.push('<th align="right">'+this.stepLabelRead+'</th>');
	if(booAnon){
		tableBodyBuffer.push('<td><input name="anR" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonR == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booUser){
		tableBodyBuffer.push('<td><input name="usR" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userR == 1 ? 'checked' : '');
		tableBodyBuffer.push('></input></td>');
	}
	if(booAdmin){
		tableBodyBuffer.push('<td><input name="adR" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('</tr>');
	tableBodyBuffer.push('<tr>');
	tableBodyBuffer.push('<th  align="right">' + this.stepLabelCreate + '</th>');
	if(booAnon){
		tableBodyBuffer.push('<td><input name="anC" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonC == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booUser){
		tableBodyBuffer.push('<td><input name="usC" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userC == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booAdmin){
		tableBodyBuffer.push('<td><input name="adC" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('</tr>');
	tableBodyBuffer.push('<tr>');
	tableBodyBuffer.push('<th  align="right">' + this.stepLabelUpdate + '</th>');
	if(booAnon){
		tableBodyBuffer.push('<td><input name="anU" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonU == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booUser){
		tableBodyBuffer.push('<td><input name="usU" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userU == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booAdmin){
		tableBodyBuffer.push('<td><input name="adU" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('</tr>');
	tableBodyBuffer.push('<tr>');
	tableBodyBuffer.push('<th  align="right">' + this.stepLabelDelete + '</th>');
	if(booAnon){
		tableBodyBuffer.push('<td><input name="anD" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.anonD == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booUser){
		tableBodyBuffer.push('<td><input name="usD" class="checkInput" type="checkbox" ');
		tableBodyBuffer.push(workspacePermission.userD == 1 ? 'checked' : '');
		tableBodyBuffer.push(' ></input></td>');
	}
	if(booAdmin){
		tableBodyBuffer.push('<td><input name="adD" class="checkInput" type="checkbox" checked disabled></input></td>');
	}
	tableBodyBuffer.push('</tr>');
	tableBodyBuffer.push('</table>');
	var stepHTML = tableBodyBuffer.join('');
	w.addStep(this.stepEditTitle,stepHTML);
	w.setButtons([
		{caption: this.buttonSubmitCaption, tooltip: this.buttonSubmitToolTip, onClick: function() {me.ewSubmit(place, macroName, params, wikifier, paramString, tiddler,w,booAnon,booUser);}
	}]);

};

config.macros.ccEditWorkspace.ewSubmit = function(place, macroName, params2, wikifier, paramString, tiddler,w, booAnon, booUser){
	var trueStr = "A";
	var falseStr = "U";
	var anon = '';
	var user = '';
	if(booAnon){
		var anonBuffer = new Array();
		anonBuffer.push(w.formElem['anR'].checked ? trueStr : falseStr);
		anonBuffer.push(w.formElem['anC'].checked ? trueStr : falseStr);
		anonBuffer.push(w.formElem['anU'].checked ? trueStr : falseStr);
		anonBuffer.push(w.formElem['anD'].checked ? trueStr : falseStr);
		anon = anonBuffer.join('');
	}
	if(booUser){
		var userBuffer = new Array();
		userBuffer.push(w.formElem['usR'].checked ? trueStr : falseStr);
		userBuffer.push(w.formElem['usC'].checked ? trueStr : falseStr);
		userBuffer.push(w.formElem['usU'].checked ? trueStr : falseStr);
		userBuffer.push(w.formElem['usD'].checked ? trueStr : falseStr);
		user = userBuffer.join('');
	}
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
	doHttp('POST', url + '/handle/updateWorkspace.php', 'ccCreateWorkspace=' + encodeURIComponent(workspace) + '&ccAnonPerm=' + encodeURIComponent(anon) + '&ccUserPerm=' + encodeURIComponent(user), null, null, null, config.macros.ccEditWorkspace.editWorkspaceCallback, params);
	return false;
}
config.macros.ccEditWorkspace.editWorkspaceCallback = function(status,params,responseText,uri,xhr){
	var w = params.w;
	var me = config.macros.ccEditWorkspace;
	if(xhr.status == 200){
		// use the incoming parameters to set the workspace permission variables.
		if (params.a != ''){
			workspacePermission.anonR = (params.a.substr(0,1)=='A'?1:0);
			workspacePermission.anonC = (params.a.substr(1,1)=='A'?1:0);
			workspacePermission.anonU = (params.a.substr(2,1)=='A'?1:0);
			workspacePermission.anonD = (params.a.substr(3,1)=='A'?1:0);
		}
		if (params.u != ''){
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
	}else{
		w.addStep(me.step2Error+': ' + xhr.status,config.macros.ccEditWorkspace.errorUpdateFailed);
	}
	return false;
};
config.macros.ccEditWorkspace.refresh = function(place, macroName, params, wikifier, paramString, tiddler){
	removeChildren(place);
	config.macros.ccEditWorkspace.handler(place, macroName, params, wikifier, paramString, tiddler);
}
//}}}