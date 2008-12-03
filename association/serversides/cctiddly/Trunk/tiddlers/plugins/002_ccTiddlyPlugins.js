
/***
|''Name''|ccTiddlyPlugin|
|''Description''|The ccTiddlyPlugin macro contains all the macros necessary to run ccTiddly.|
|''Author''|Simon McManus|
|''Contributors''|Simon McManus, James Lelyveld|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/tiddlers/plugins/ccTiddlyPlugins.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/tiddlers/plugins/ccTiddlyPlugins.js|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
|''Date:''|Nov 6, 2008|
|''Version:''|0.1|


!Usage
{{{
<<ccAbout>>
<<ccAdmin>>
<<ccCreateWorkspace>>
<<ccEditWorkspace>>
<<ccFile>>
<<ccLogin>>
<<ccLoginStatus>>
<<ccRegister>>
<<ccStats>>

}}}

***/
//{{{

config.backstageTasks.remove("upgrade");
config.backstageTasks.remove("save");
config.backstageTasks.remove("sync");

//  ccAbout //
config.macros.ccAbout={};

config.macros.ccAbout.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	var w = new Wizard();
	var me = config.macros.ccAbout;
	w.createWizard(place,me.stepAboutTitle);
	w.addStep(null, me.stepAboutTextStart + window.ccTiddlyVersion + "<br /><br />" + me.stepAboutTextEnd);
};
//}}}



// ccAdmin //
//{{{
config.macros.ccAdmin = {}
config.macros.ccAdmin.handler = function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	var w = new Wizard();
	w.createWizard(place,config.macros.ccAdmin.WizardTitleText);
	config.macros.ccAdmin.refresh(w);
};

config.macros.ccAdmin.refresh= function(w){
	params = {};
	params.w = w;
	params.e = this;
	me = config.macros.ccAdmin;
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=LISTALL&workspace='+workspace,null,null,null,config.macros.ccAdmin.listAllCallback,params);
	w.setButtons([
		{caption: me.buttonDeleteText, tooltip: me.buttonDeleteTooltip, onClick: function(w){ 
			config.macros.ccAdmin.delAdminSubmit(null, params);
		 	return false;
		}}, 
		{caption: me.buttonAddText, tooltip: me.buttonAddTooltip, onClick: function(w){
			config.macros.ccAdmin.addAdminDisplay(null, params); return false } }]);
};

config.macros.ccAdmin.delAdminSubmit = function(e, params){
	var listView = params.w.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	var delUsers = "";
	for(var e=0; e < rowNames.length; e++) 
		delUsers += rowNames[e]+",";
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=DELETEADMIN&username='+delUsers+'&workspace='+workspace,null,null,null,config.macros.ccAdmin.addAdminCallback,params);
	return false; 
};

config.macros.ccAdmin.addAdminDisplay = function(e, params){
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=LISTWORKSPACES',null,null,null,config.macros.ccAdmin.listWorkspaces,params);
};

config.macros.ccAdmin.listWorkspaces = function(status,params,responseText,uri,xhr){
	var frm = createTiddlyElement(null,'form',null,null);
	var me = config.macros.ccAdmin;
	frm.onsubmit = config.macros.ccAdmin.addAdminSubmit;	
	params.w.addStep(me.stepAddTitle,"<input type='hidden' name='admin_placeholder'/>"+me.labelUsername+"<input name=adminUsername><br />"+me.labelWorkspace+"<select name=workspaceName />");
	var workspaces = eval('[ '+responseText+' ]');
	for(var t=0; t<workspaces.length; t++) {
		var o = createTiddlyElement(params.w.formElem.workspaceName, "option", null, null, workspaces[t]);
		o.value=workspaces[t];
		if(workspaces[t] == workspace)
			o.selected = true;
	}
	params.w.formElem.admin_placeholder.parentNode.appendChild(frm);
	params.w.setButtons([
		{caption: me.buttonCancelText, tooltip: me.buttonCancelTooltip, onClick: function(w){ config.macros.ccAdmin.refresh(params.w) } },
		{caption: me.buttonCreateText, tooltip: me.buttonCreateTooltip, onClick: function(){config.macros.ccAdmin.addAdminSubmit(null, params);  } }
	]);
};

config.macros.ccAdmin.addAdminSubmit = function(e, params){
	doHttp('POST',url+'/handle/workspaceAdmin.php','&add_username='+params.w.formElem.adminUsername.value+'&action=addNew&workspace='+params.w.formElem.workspaceName[params.w.formElem.workspaceName.selectedIndex].value,null,null,null,config.macros.ccAdmin.addAdminCallback,params);
	return false; 
};

config.macros.ccAdmin.listAllCallback = function(status,params,responseText,uri,xhr) {
	var me = config.macros.ccAdmin;
	var out = "";
	var adminUsers = [];
	if(xhr.status == 403){
		var html ='';
		params.w.addStep(me.stepErrorText+workspace, me.stepErrorTitle);
		params.w.setButtons([]);
		return false;
	}
	try{
		var a = eval(responseText);
		for(var e=0; e < a.length; e++){
			out += a[e].username;
			adminUsers.push({
			name: a[e].username,
			lastVisit:a[e].lastVisit});
		}
	}catch(ex){
			params.w.addStep(" "+workspace, me.stepNoAdminTitle);
			params.w.setButtons([
				{caption: me.buttonCreateText, tooltip: me.buttonCreateTooltip, onClick: function(){ config.macros.ccAdmin.addAdminDisplay(null, params)}}]);
			return false;
	}
	var html ='<input type="hidden" name="markList"></input>';
	params.w.addStep(me.stepManageWorkspaceTitle+workspace, html);
	var markList = params.w.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	var listView = ListView.create(listWrapper,adminUsers,config.macros.ccAdmin.listAdminTemplate);
	params.w.setValue("listView",listView);
};

config.macros.ccAdmin.addAdminCallback = function(status,params,responseText,uri,xhr) {
	config.macros.ccAdmin.refresh(params.w);
};

//  ccAutoSave //
//  ccAutoSave //

//{{{
	
//# Ensure that the plugin is only installed once.
if(!version.extensions.ccTiddlyAutoSavePlugin) {
	version.extensions.ccTiddlyAutoSavePlugin = {installed:true};

ccTiddlyAutoSave.putCallback = function(context, userParams){
	tiddler = context.tiddler;
	if (context.status){
		if (context.otitle != tiddler.title){
			var ret = invokeAdaptor('deleteTiddler',context.otitle,null,null,null,config.commands.deleteTiddlerHosted.callback,tiddler.fields);
		}
		displayMessage(ccTiddlyAutoSave.msgSaved + tiddler.title);
		tiddler.clearChangeCount();
	}else{
		displayMessage(ccTiddlyAutoSave.msgError + tiddler.title + ' ' + context.statusText);
		tiddler.incChangeCount();
	}
};

TiddlyWiki.prototype.orig_saveTiddler = TiddlyWiki.prototype.saveTiddler;	//hijack
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created){
   var tiddler = this.orig_saveTiddler(title,newTitle,newBody,modifier,modified,tags,fields,false,created); //
 //   var tiddler = this.fetchTiddler(title); //And then I get it
	var adaptor = new config.adaptors['cctiddly'];
	// put the tiddler and deal with callback
	tiddler.fields['server.host'] = window.url;
	tiddler.fields['server.type'] = config.defaultCustomFields['server.type'];
	tiddler.fields['server.workspace'] = window.workspace;
	tiddler.clearChangeCount();
	context = {};
	context.tiddler = tiddler;
	context.otitle = title;
	context.workspace = window.workspace;
	context.host = window.url;
	req = adaptor.putTiddler(tiddler, context, {}, ccTiddlyAutoSave.putCallback);
	if(req)
		store.setDirty(false);
	return req ? tiddler : false;
};
} //# end of 'install only once'
//}}}




// Import Override - ensures imported tiddlers have cctiddly server type. 
config.macros.importTiddlers.onGetTiddler = function(context,wizard)
{
	console.log("here");
	if(!context.status)
		displayMessage("Error in importTiddlers.onGetTiddler: " + context.statusText);
	var tiddler = context.tiddler;
	store.suspendNotifications();
	tiddler.fields['server.type'] = 'cctiddly';
	tiddler.fields['server.host'] = window.url;
	tiddler.fields['workspace']= window.workspace;

	store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier, tiddler.modified, tiddler.tags, tiddler.fields, false, tiddler.created);// local 
//	config.extensions.ServerSideSavingPlugin.saveTiddler(tiddler); // remote save. 
	if(!wizard.getValue("sync")) {
		store.setValue(tiddler.title,'server',null);
	}
	store.resumeNotifications();
	if(!context.isSynchronous)
		store.notify(tiddler.title,true);
	var remainingImports = wizard.getValue("remainingImports")-1;
	wizard.setValue("remainingImports",remainingImports);
	if(remainingImports == 0) {
		if(context.isSynchronous) {
			store.notifyAll();
			refreshDisplay();
		}
		wizard.setButtons([
				{caption: config.macros.importTiddlers.doneLabel, tooltip: config.macros.importTiddlers.donePrompt, onClick: config.macros.importTiddlers.onClose}
			],config.macros.importTiddlers.statusDoneImport);
		autoSaveChanges();
	}
};




// ccEditWorkspace //


//{{{
config.macros.ccEditWorkspace={};			
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

// ccFile //


//{{{
	
config.macros.ccFile = {};
var iFrameLoad=function(w){
	var uploadIframe = document.getElementById('uploadIframe');
	var a = createTiddlyElement(null, "div");
	a.innerHTML = uploadIframe.contentDocument.body.innerHTML;
	removeChildren(w.formElem.placeholder);
	w.formElem.placeholder.parentNode.appendChild(a);
	var statusArea = w.formElem.placeholder;
	document.getElementById("ccfile").value=""; 
};

config.macros.ccFile.handler=function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	var w = new Wizard();
	w.createWizard(place,config.macros.ccFile.wizardTitleText);
	config.macros.ccFile.refresh(w);
};

config.macros.ccFile.refresh=function(w){
	params = {};
	params.w = w;
	params.e = this;
	var me = config.macros.ccFile;
	doHttp('GET',url+'/handle/listFiles.php?workspace='+workspace,'',null,null,null,config.macros.ccFile.listAllCallback,params);
	w.setButtons([
		{caption: me.buttonDeleteText, tooltip: me.buttonDeleteTooltip, onClick: function(w){ 
			config.macros.ccFile.delFileSubmit(null, params);
			 return false;
		}}, 
		{caption: me.buttonUploadText, tooltip: me.buttonUploadTooltip, onClick: function(e){ 
			config.macros.ccFile.addFileDisplay(null, params); return false 
			} }
	]);
};

config.macros.ccFile.delFileSubmit=function(e, params) {
	var listView = params.w.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	for(var e=0; e < rowNames.length; e++) 
	doHttp('POST',url+'/handle/listFiles.php','action=DELETEFILE&file='+rowNames[e]+'&workspace='+workspace,null,null,null,config.macros.ccFile.delFileCallback,params);
	return false; 
};

config.macros.ccFile.delFileCallback=function(status,params,responseText,uri,xhr){
	config.macros.ccFile.refresh(params.w);
};

config.macros.ccFile.addFileDisplay = function(e, params){
	var frm = params.w.formElem;
	if(navigator.appName=="Microsoft Internet Explorer"){
		encType = frm.getAttributeNode("enctype");
	    encType.value = "multipart/form-data";
	}
	frm.setAttribute("enctype","multipart/form-data");
	frm.setAttribute("method","POST");
	frm.action=window.url+"/handle/upload.php"; 
	frm.id="ccUpload";
	frm.target="uploadIframe";
	frm.name = "uploadForm";
	frm.parentNode.appendChild(frm);
	params.w.addStep("ss", "<input id='ccfile' class='input' type='file' name='userFile'/>"+"<input type='hidden' name='placeholder'/>");
	var workspaceName=createTiddlyElement(null,'input','workspaceName','workspaceName');				
	workspaceName .setAttribute('name','workspace');
	workspaceName.type="HIDDEN";
	workspaceName.value=workspace;
	frm.appendChild(workspaceName);
	createTiddlyElement(frm,'br');
	var saveTo=createTiddlyElement(null,"input","saveTo","saveTo");	
	var iframe=document.createElement("iframe");
	iframe.style.display="none";
	iframe.id='uploadIframe';
	iframe.name='uploadIframe';
	iframe.onload = function() {
		iFrameLoad(params.w);
	}	
	frm.appendChild(iframe);
	createTiddlyElement(frm,"div",'uploadStatus');
	params.w.setButtons([
	{caption: config.macros.ccFile.buttonCancelText, tooltip: config.macros.ccFile.buttonCancelTooltip, onClick: function(){config.macros.ccFile.refresh(params.w);}
	},
	{caption: config.macros.ccFile.buttonUploadText, tooltip: config.macros.ccFile.buttonUploadTooltip, onClick: function(){params.w.formElem.submit();}
	}]);
};

function addOption(selectbox,text,value ){
	var optn = document.createElement("OPTION");
	optn.text = text;
	optn.value = value;
	selectbox.options.add(optn);
}

config.macros.ccFileImageBox = function(image){
	var full = image.src;
	setStylesheet(
	"#errorBox .button {padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
	"html > body > #backstageCloak {height:"+window.innerHeight*2+"px;}"+
	"#errorBox {border:1px solid #ccc;background-color: #fff; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
	var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
	box.innerHTML =  "<a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><h3>"+image.src+"</h3><br />";
	box.style.position = 'absolute';
	box.style.width= "800px";
	var img = createTiddlyElement(box, "img");
	img.src = full;
	ccTiddlyAdaptor.center(box);
	ccTiddlyAdaptor.showCloak();
}

config.macros.ccFile.listAllCallback = function(status,params,responseText,uri,xhr){
	var me = config.macros.ccFile;
	var out = "";
	var adminUsers = [];
	if(xhr.status!=200){
		params.w.addStep(me.errorPermissionDeniedTitle, me.errorPermissionDeniedView);
		return true;
	}
	try{
		var a = eval(responseText);
		for(var e=0; e < a.length; e++){ 		
		out += a[e].username;	
			adminUsers.push({
				htmlName: "<html><a href='"+a[e].url+"' target='new'>"+a[e].filename+"</a></html>",
				name: a[e].filename,
				wikiText:'<html><img onclick="config.macros.ccFileImageBox(this)"; src="'+a[e].url+'" style="width: 70px; "/></html>',
				lastVisit:a[e].lastVisit,
				fileSize:a[e].fileSize
			});
		}
	}catch (ex){
		params.w.setButtons([
			{caption: me.buttonUploadText, tooltip: me.buttonUploadTooltip, onClick: function(w){				
				config.macros.ccFile.addFileDisplay(e, params);
			} }]);
	}
	params.w.addStep(me.wizardStepText+workspace, "<input type='hidden' name='markList'></input>");
	var markList = params.w.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	var listView = ListView.create(listWrapper,adminUsers,config.macros.ccFile.listAdminTemplate);
	//params.w.setValue("listAdminView",listAdminView);
	params.w.setValue("listView",listView);
};

config.macros.ccFile.addFileCallback = function(status,params,responseText,uri,xhr){	
	config.macros.ccFile.refresh(params.w);
};

//}}}

function ccTiddlyAutoSave(){return this;}

// ccChangePassword //

// {{{
	
	config.macros.ccChangePassword={};
	
	config.macros.ccChangePassword.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
		var w = new Wizard();
		var me = config.macros.ccChangePassword;
		w.createWizard(place,me.title);
		w.addStep(me.subTitle+cookieString(document.cookie).txtUserName,me.step1Html);
		w.setButtons([
			{caption: me.buttonChangeText, tooltip: me.buttonChangeToolTip, onClick: function(){config.macros.ccChangePassword.doPost(w);  } }
		]);
	};

	config.macros.ccChangePassword.doPost = function (w) {
		me = config.macros.ccChangePassword;
		if(!w.formElem.new1.value || !w.formElem.new2.value || !w.formElem.old.value) {
			displayMessage(me.noticePasswordUpdateFailed);
			return false;
		}
		if(w.formElem.new1.value != w.formElem.new2.value){
			displayMessage(me.noticePasswordsNoMatch);
			return false;
		}
		doHttp("POST", url+"handle/changePassword.php", "&new1="+Crypto.hexSha1Str(w.formElem.new1.value)+"&new2="+Crypto.hexSha1Str(w.formElem.new2.value)+"&old1="+Crypto.hexSha1Str(w.formElem.old.value),null,null,null,config.macros.ccChangePassword.callback);	
	}

	config.macros.ccChangePassword.callback = function(status,context,responseText,uri,xhr) {
		if(xhr.status == 304)
			displayMessage(me.noticePasswordUpdateFailed);
		else
			displayMessage(me.noticePasswordUpdated);
	}

	//}}}
// ccLogin //

//{{{

config.macros.ccLogin={sha1:true};
	
function isLoggedIn() {
	if(window.loggedIn)
	 	return true;
	else 
		return false;
}

config.macros.saveChanges.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	if(isLoggedIn()){
		createTiddlyButton(place, config.macros.ccLogin.buttonLogout, config.macros.ccLogin.buttonLogoutToolTip, function(){
				if (window.fullUrl.indexOf("?") >0)
					window.location = window.fullUrl+"&logout=1";
				else
					window.location = window.fullUrl+"?logout=1";
			return false;
		},null,null,this.accessKey);
	}else{
		createTiddlyButton(place,config.macros.ccLogin.buttonlogin, config.macros.ccLogin.buttonLoginToolTip, function() {
			story.displayTiddler(null, "Login");
		},null,null,this.accessKey);
	}
};
	


var loginState=null;
var registerState=null;

config.macros.ccLogin.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.macros.ccLogin.refresh(place);
};
 
config.macros.ccLogin.refresh=function(place, error){
	removeChildren(place);
	var w = new Wizard();
	if (isLoggedIn()){
		w.createWizard(place,this.stepLogoutTitle);
		w.addStep(null, this.stepLogoutText+decodeURIComponent(cookieString(document.cookie).txtUserName)+"<br /><br />");
		w.setButtons([
			{caption: this.buttonLogout, tooltip: this.buttonLogoutToolTip, onClick: function() {window.location=fullUrl+"?&logout=1"}
		}]);
		return true;
	}
	w.createWizard(place,this.WizardTitleText);
	var me=config.macros.ccLogin;
	var oldForm = w.formElem.innerHTML;
	var form = w.formElem;
	if (error!==undefined)
		this.stepLoginTitle=error;	
	w.addStep(this.stepLoginTitle,me.stepLoginIntroTextHtml);
	txtPassword = findRelated(w.formElem.password,"txtPassword","className","previousSibling");
	w.formElem.password.style.display="none";
	txtPassword.onkeyup = function() {
		if(me.sha1 == true)
			w.formElem.password.value = Crypto.hexSha1Str(txtPassword.value);
		else 
			w.formElem.password.value = txtPassword.value;
	};
	txtPassword.onchange = txtPassword.onkeyup;
	w.formElem.method ="POST";
	w.formElem.onsubmit = function() {config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place); return false;};
	var submit = createTiddlyElement(null, "input");
	submit.type="submit";
	submit.style.display="none";
	w.formElem.appendChild(submit);
	var cookieValues=findToken(document.cookie);
	if (cookieValues.txtUserName!==undefined){
		w.formElem["username"].value=decodeURIComponent(cookieValues.txtUserName) ;
	}
	var footer = findRelated(form,"wizardFooter","className");
	createTiddlyButton(w.footer,this.buttonLogin,this.buttonLoginToolTip,function() {
		if (w.formElem["username"].value==""){
			displayMessage(me.msgNoUsername);
			return false;
		}
		if (w.formElem["password"].value==""){
			displayMessage(me.msgNoPassword);
			return false;
		}
		config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place);
	});
	
	
	createTiddlyButton(w.footElem,this.buttonLogin,this.buttonLoginToolTip,function() {
		config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place);
	},null, null, null,  {tabindex:'3'});
	
	if(config.macros.register!==undefined){		
		var li_register = createTiddlyElement(w.footElem, "li");
		createTiddlyButton(li_register,config.macros.register.buttonRegister,config.macros.register.buttonRegisterToolTip,function() {
				config.macros.register.displayRegister(place, w, this);
		},"nobox", null, null,  {tabindex:4});
	}
	var li_forgotten = createTiddlyElement(w.footElem, "li");
	createTiddlyButton(li_forgotten,this.buttonForgottenPassword,this.buttonForgottenPasswordToolTip,function() {
		config.macros.ccLogin.displayForgottenPassword(this, place);
	},"nobox", null, null,  {tabindex:5});

};

config.macros.ccLogin.doLogin=function(username, password, item, place){
	var w = new Wizard(item);
	var me = config.macros.ccLogin;
	var userParams = {};
	console.log(config.adaptors);
	userParams.place = place;
	var adaptor = new config.adaptors[config.defaultCustomFields['server.type']];
	var context = {};
	context.host = window.url;
	context.username = username;
	context.password = password;
	adaptor.login(context,userParams,config.macros.ccLogin.loginCallback)
	var html = me.stepDoLoginIntroText; 
	w.addStep(me.stepDoLoginTitle,html);
	w.setButtons([
		{caption: this.buttonCancel, tooltip: this.buttonCancelToolTip, onClick: function() {config.macros.ccLogin.refresh(place);}
	}]);
}

config.macros.ccLogin.loginCallback=function(context,userParams){
	if(context.status){
		window.location.reload();
	}else{
		config.macros.ccLogin.refresh(userParams.place, config.macros.ccLogin.msgLoginFailed);
	} 
};

config.macros.ccLogin.displayForgottenPassword=function(item, place){	
	var w = new Wizard(item);
	var me = config.macros.ccLogin;
	w.addStep(me.stepForgotPasswordTitle,me.stepForgotPasswordIntroText);
	w.setButtons([
		{caption: this.buttonCancel, tooltip: this.buttonCancelToolTip, onClick: function() {me.refresh(place);}}
	]);
};

//config.macros.ccLogin.sendForgottenPassword=function(item, place){	
//	var w = new Wizard(item);
//	var me = config.macros.ccLogin;
//}

config.macros.toolbar.isCommandEnabled=function(command,tiddler){	
	var title=tiddler.title;
	if (workspace_delete=="D"){
		// REMOVE OPTION TO DELETE TIDDLERS 
		if (command.text=='delete')
			return false;
	}
	if (workspace_udate=="D"){
		// REMOVE EDIT LINK FROM TIDDLERS 
		if (command.text=='edit')
			return false;
	}
	var ro=tiddler.isReadOnly();
	var shadow=store.isShadowTiddler(title) && !store.tiddlerExists(title);
	return (!ro || (ro && !command.hideReadOnly)) && !(shadow && command.hideShadow);
};

// Returns output var with output.txtUsername and output.sessionToken
function findToken(cookieStash){
	var output={};
	if (!cookieStash)
		return false;	
	//  THIS IS VERY HACKY AND SHOULD BE REFACTORED WHEN TESTS ARE IN PLACE
	var cookies=cookieStash.split('path=/');
	for(var c=0; c < cookies.length ; c++){
		var cl =cookies[c].split(";");
		for(var e=0; e < cl.length; e++){ 
			var p=cl[e].indexOf("=");
			if(p!=-1){
				var name=cl[e].substr(0,p).trim();
				var value=cl[e].substr(p+1).trim();       
				if (name=='txtUserName'){
					output.txtUserName=value;
				}
				if (name=='sessionToken'){
					output.sessionToken=value;
				}
			}
		}
	}	
	return output;
};

function cookieString(str){	
	var cookies = str.split(";");
	var output = {};
	for(var c=0; c < cookies.length; c++){
		var p = cookies[c].indexOf("=");
		if(p != -1) {
			var name = cookies[c].substr(0,p).trim();
			var value = cookies[c].substr(p+1).trim();
			if (name=='txtUserName'){
				output.txtUserName=value;
			}
			if (name=='sessionToken'){
				output.sessionToken=value;
			}
		}
	}
	return output;
}

Story.prototype.displayDefaultTiddlers = function(){
 	var tiddlers="";
	if(isLoggedIn()){        
		var url = window.location;        
		url = url.toString();        
		var bits = url.split('#');        
		if(bits.length == 1){            
			tiddlers = store.filterTiddlers(store.getTiddlerText("DefaultTiddlers"));            
			story.displayTiddlers(null, tiddlers);
		}
	}else{         
		tiddlers=store.filterTiddlers(store.getTiddlerText("AnonDefaultTiddlers"));        
		story.displayTiddlers(null, tiddlers);   
	}    
};

window.restart = function(){
	story.displayDefaultTiddlers();
	invokeParamifier(params,"onstart");
	window.scrollTo(0,0); 
};
//}}}

// ccLoginStatus //

//{{{


config.macros.ccLoginStatus={};
	
config.macros.ccLoginStatus.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var loginDiv=createTiddlyElement(place,"div",null,"loginDiv",null);
	this.refresh(loginDiv);
};
	
config.macros.ccLoginStatus.refresh=function(place,errorMsg){
       var me = config.macros.ccLoginStatus;
       var loginDivRef=document.getElementById ("LoginDiv");
       removeChildren(loginDivRef);
       var wrapper=createTiddlyElement(place,"div");
       var str = (workspace == "" ? me.textDefaultWorkspaceLoggedIn :(me.textViewingWorkspace+workspace))+"\r\n\r\n";
       if (isLoggedIn()){
			name = cookieString(document.cookie).txtUserName;
			str += me.textLoggedInAs+decodeURIComponent(name)+".\r\n\r\n";
			if (workspacePermission.owner==1){
				str += me.textAdmin;
			}
       }else{
               str += me.textNotLoggedIn;
       }
       wikify(str,wrapper);
};
//}}}

// ccOptions //
//{{{
config.macros.ccOptions={};		
config.macros.ccOptions.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var me = config.macros.ccOptions;
	if(workspacePermission.owner==1)
		wikify("[["+me.linkManageUsers+"|Manage Users]]<br />[["+me.linkPermissions+"|Permissions]]<br />[["+me.linkStats+"|Statistics]]<br />", place);
	if (isLoggedIn())
		wikify("[["+me.linkFiles+"|files]]<br />", place);
		if (isLoggedIn()){
			if (workspacePermission.canCreateWorkspace==1)
				wikify("[["+me.linkCreate+"|CreateWorkspace]]<br />", place);
			// append url function required 
			wikify("[["+me.linkPassword+"|Password]]<br />", place);
			if (window.fullUrl.indexOf("?") >0)
				wikify("[["+me.linkOffline+"|"+fullUrl+"&standalone=1]]<br />", place);
			else 
				wikify("[["+me.linkOffline+"|"+fullUrl+"?standalone=1]]<br />", place);	
		}
};

//}}}

// ccRegister //

//{{{
config.macros.register={};	
	
config.macros.register.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	//config.macros.login.refresh(place);
};

config.macros.register.displayRegister=function(place, w, item){
	var me = config.macros.register;
	var w = new Wizard(item);
	w.addStep(me.stepRegisterTitle, me.stepRegisterHtml);
	w.formElem["reg_username"].onkeyup=function() {me.isUsernameAvailable(w);};
	w.setButtons([
		{caption: me.buttonRegister, tooltip: me.buttonRegisterToolTip, onClick:function() { me.doRegister(place, w)}},
		{caption: me.buttonCancel, tooltip: me.buttonCancelToolTip, onClick: function() { config.macros.ccLogin.refresh(place)}}
	]);
	var h1 = createTiddlyElement(null, "h1", null, null, "hahahaha");
	//	w.footElem.appendChild(h1, w.footElem);
	w.footElem.firstChild.parentNode.appendChild(h1, w.footElem);
	//w.footElem.firstChild.insertBefore(h1, w.footElem);
}

config.macros.register.setStatus=function(w, element, text){
	var label_var = w.getElement(element);
	removeChildren(label_var.previousSibling);
	var label = document.createTextNode(text);
	label_var.previousSibling.insertBefore(label,null);
}

config.macros.register.doRegister=function(place, w){
	var me = config.macros.register;
	if(w.formElem["reg_username"].value==''){
		me.setStatus(w, "username_error", me.msgNoUsername);
	}else {
		me.setStatus(w, "username_error", "");
	}
	if(me.emailValid(w.formElem["reg_mail"].value)){
		me.setStatus(w, "mail_error", me.msgEmailOk);
	}else{
		me.setStatus(w, "mail_error", "invalid email address");
		return false;
	}
	if(w.formElem["reg_password1"].value==''){
		me.setStatus(w, "pass1_error", me.msgNoPassword);
		return false;
	}else{
		me.setStatus(w, "pass1_error", "");
	}
	if(w.formElem["reg_password2"].value==''){
		me.setStatus(w, "pass2_error", me.msgNoPassword);
		return false;
	}
	if(w.formElem["reg_password1"].value != w.formElem["reg_password2"].value ){
		me.setStatus(w, "pass1_error", me.msgDifferentPasswords);
		me.setStatus(w, "pass2_error", me.msgDifferentPasswords);
		return false;
	}
 	var params ={};
	params.p = Crypto.hexSha1Str(w.formElem['reg_password1'].value);
	params.u = w.formElem['reg_username'].value;
	params.place = place;
	params.w = w;
	var loginResp=doHttp('POST',url+'/handle/register.php',"username="+w.formElem['reg_username'].value+"&reg_mail="+w.formElem['reg_mail'].value+"&password="+Crypto.hexSha1Str(w.formElem['reg_password1'].value)+"&password2="+Crypto.hexSha1Str(w.formElem['reg_password2'].value),null,null,null,config.macros.register.registerCallback,params);
	w.addStep(me.step2Title, me.msgCreatingAccount);
	w.setButtons([
		{caption: me.buttonCancel, tooltip: me.buttonCancelToolTip, onClick: function() {config.macros.ccLogin.refresh(place);}
	}]);
}

config.macros.register.emailValid=function(str){
	if((str.indexOf(".") > 0) && (str.indexOf("@") > 0))
		return true;
	else
		return false;
};

config.macros.register.usernameValid=function(str){
	if((str.indexOf("_") > 0) && (str.indexOf("@") > 0))
		return false;
	else
		return true;
};

config.macros.register.registerCallback=function(status,params,responseText,uri,xhr){
	var userParams = {};
	userParams.place = params.place;
	if (xhr.status==304){
		params.w.addStep(config.macros.register.errorRegisterTitle, config.macros.register.errorRegister);
		return false;
	}	
	var adaptor = new config.adaptors[config.defaultCustomFields['server.type']];
	var context = {};
	context.host = window.url;
	context.username = params.u;
	context.password = params.p;
	adaptor.login(context,userParams,config.macros.ccLogin.loginCallback);
	return true;
}

config.macros.register.isUsernameAvailable=function(w){
	var params = {};
	params.w = w;
	doHttp('POST',url+'/handle/register.php',"username="+w.formElem["reg_username"].value+"&free=1",null,null,null,config.macros.register.isUsernameAvailabeCallback,params);
	return false;
};

config.macros.register.isUsernameAvailabeCallback=function(status,params,responseText,uri,xhr){
	var me = config.macros.register;
	var resp = (responseText > 0) ? me.msgUsernameTaken : me.msgUsernameAvailable;
	config.macros.register.setStatus(params.w, "username_error", resp);
};
//}}}

// ccStats //

//{{{
	
config.macros.ccStats={};	
	
config.macros.ccStats.handler = function(place,macroName,params,wikifier,paramString,tiddler){
	var params;
	params.place = place;
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=LISTWORKSPACES',null,null,null,config.macros.ccStats.listWorkspaces,params);
}

config.macros.ccStats.simpleEncode = function(valueArray,maxValue){
	var simpleEncoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var chartData = ['s:'];
	  for (var i = 0; i < valueArray.length; i++){
	    var currentValue = valueArray[i];
	    if (!isNaN(currentValue) && currentValue >= 0){
	    	chartData.push(simpleEncoding.charAt(Math.round((simpleEncoding.length-1) * currentValue / maxValue)));
	    }else{
	      chartData.push('_');
	    }
	  }
	return chartData.join('');
}

config.macros.ccStats.max = function(array){
	return Math.max.apply(Math, array);
}

config.macros.ccStats.dataCallback = function(status,params,responseText,uri,xhr){
	me = config.macros.ccStats;
	if(xhr.status==401){
		createTiddlyElement(params.container, "h4", null, null, me.errorPermissionDenied.format([params.title], [workspace]));
		return false;
	}
	var res = eval("[" + responseText + "]");
	var d=[];
	var l="";
	for(var c=0; c<res.length; c++){
		d[c]= res[c].hits;
		l+=res[c].date+"|";
	}
	var maxValue = config.macros.ccStats.max(d);
 	params.gData = config.macros.ccStats.simpleEncode(d,maxValue);
	params.XLabel = l.substring(0, l.length -1);
	params.YLabel = "0|"+maxValue+"|";
	var image = 'http://chart.apis.google.com/chart?cht=lc&chs=100x75&chd='+params.gData+'&chxt=x,y&chxl=0:||1:|';
	var div = createTiddlyElement(params.container, "div", null, "div_button");
	setStylesheet(".div_button:hover{opacity:0.7; cursor: pointer} .div_button{ width:100%; padding:5px;color:#555;background-color:white;} ", "DivButton");
	div.onclick = function(){
		var full = "http://chart.apis.google.com/chart?cht=lc&chs=800x375&chd="+params.gData+"&chxt=x,y&chxl=1:|"+params.YLabel+"0:|"+params.XLabel+"&chf=c,lg,90,EEEEEE,0.5,ffffff,20|bg,s,FFFFFF&&chg=10.0,10.0&";
		setStylesheet(
		"#errorBox .button{padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
		"html > body > #backstageCloak{height:"+window.innerHeight*2+"px;}"+
		"#errorBox{border:1px solid #ccc;background-color: #fff; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
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
	setStylesheet(".graph_label{  position:relative; width:300px; top:-80px; left:130px;}");
}

config.macros.ccStats.switchWorkspace = function(params){
	removeChildren(params.container);
	config.macros.ccStats.refresh(params);	
}

config.macros.ccStats.refresh = function(params){
	var me = config.macros.ccStats;
	var select = params.w.formElem.workspaces;
	if(select[select.selectedIndex].value!="")
		workspace = select[select.selectedIndex].value;
	params ={ container: params.container, url: window.url+"/handle/stats.php?graph=minute&workspace="+workspace,title:me.graph20MinsTitle, desc:me.graph20MinsDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.ccStats.dataCallback,params);
	params ={ container:params.container, url:  window.url+"/handle/stats.php?graph=hour&workspace="+workspace,title:me.graph24HourTitle, desc:me.graph24HourDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.ccStats.dataCallback,params);
	params ={ container: params.container, url:  window.url+"/handle/stats.php?graph=day&workspace="+workspace,title:me.graph7DaysTitle, desc:me.graph7DaysDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.ccStats.dataCallback,params);
	params ={ container: params.container, url:  window.url+"/handle/stats.php?graph=month&workspace="+workspace,title:me.graph5MonthsTitle, desc:me.graph5MonthsDesc};
	doHttp('GET',params.url,null, null, null, null, config.macros.ccStats.dataCallback,params);	
}

config.macros.ccStats.listWorkspaces = function(status,params,responseText,uri,xhr){
	params.container=createTiddlyElement(null, "div", "container");
	var me = config.macros.ccStats;
	var w = new Wizard();
	w.createWizard(params.place,me.stepTitle);
	w.addStep(null, "<select name='workspaces'></select><input name='stats_hol' type='hidden'></input>");
	var s = w.formElem.workspaces;	
	s.onchange = function(){config.macros.ccStats.switchWorkspace(params) ;};
	var workspaces = eval('[ '+responseText+' ]');
	for(var d=0; d < workspaces.length; d++){
		var i = createTiddlyElement(s,"option",null,null,workspaces[d]);
		i.value = workspaces[d];
		if (workspace == workspaces[d]){
			i.selected = true;
		}
	}
	params.w = w; 
	w.formElem.stats_hol.parentNode.appendChild(params.container);
	config.macros.ccStats.refresh(params);
}
//}}}

// ccCreateWorkspace //

//{{{


config.macros.ccCreateWorkspace = {};

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
html += "<div id='mid' style='vertical-align:middle'>";
		if(store.getTiddlerSlice(tagged[t].title,'image')!=undefined)
			html += "<img src="+store.getTiddlerSlice(tagged[t].title,'image')+" width=50px >";
		else
			html += "<img src='http://www.google.co.uk/intl/en_uk/images/logo.gif' width=50px >";
	
		   html += "<input tabindex=2 type=radio name='packages' value='"+tagged[t].title+"' >"+tagged[t].title+"<br/>";
			html +="</div>";
//		   html +=  store.getTiddlerSlice(tagged[t].title,'Description')+"<br /><br />";
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

config.macros.ccCreateWorkspace.createWorkspaceCallback = function(status,params,responseText,uri,xhr) {
	if(xhr.status==201){
		params.w.addStep("Please wait", "This could take afew minutes depending on your internet connection.<img src='http://www.ajaxload.info/cache/FF/FF/FF/00/00/00/37-0.gif'/>"+"<br/><br/><input width='300' name='statusMarker'/>");
		params.w.setButtons([]);
		if(params.selectedPackage) {
	   		var url = store.getTiddlerSlice(params.selectedPackage,'URL');
			loadRemoteFile(url,config.macros.ccCreateWorkspace.fetchFileCallback ,params);
		} else {
			window.location = params.url;
		}
	}else if(xhr.status == 200){
		displayMessage(config.macros.ccCreateWorkspace.errorWorkspaceNameInUse);
	}else if(xhr.status == 403){
		displayMessage(config.macros.ccCreateWorkspace.errorPermissions);	
	}else{
		displayMessage(responseText);	
	}
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
	/*
	ccTiddlyAutoSave.putCallback = function(context, userParams){
		window.savedCount ++;
		if(config.macros.ccCreateWorkspace.checkSaveCount(window.savedRequestedCount, window.savedCount))
			window.location = params.url;
	}
	*/	
	config.extensions.ServerSideSavingPlugin.saveTiddlerCallback = function(context, userParams) {
		};
	window.savedCount = 0;
	window.savedRequestedCount = 0;
	importStore.forEachTiddler(function(title,tiddler) {
		if(!store.getTiddler(title)) {
			params.w.formElem.statusMarker.value='saving '+title;
			tiddler.fields['server.workspace'] = params.w.formElem["workspace_name"].value;
			window.workspace = params.w.formElem["workspace_name"].value; // HORRID HORRID HACK
						
			tiddler.fields['server.type'] = 'cctiddly';
			tiddler.fields['server.host'] = window.url;
			tiddler.fields['workspace']= window.workspace;
			store.saveTiddler(title,title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,false,tiddler.created);
			window.savedRequestedCount ++;
		}
	});
	autoSaveChanges();
}

config.macros.ccCreateWorkspace.fetchFileCallback = function(status,params,responseText,url,xhr){
	if(status && locateStoreArea(responseText))
		config.macros.ccCreateWorkspace.doImport(params, responseText);
	else
		displayMessage("Package not found.  You will be provieded a standard TiddlyWiki.");
}




//}}}

