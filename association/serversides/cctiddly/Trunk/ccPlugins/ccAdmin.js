//{{{

//window.url = 'http://127.0.0.1/association/serversides/cctiddly/Trunk';
//window.workspace = 'testfiles';

config.macros.ccAdmin = {}
config.macros.ccAdmin.handler =  function(place,macroName,params,wikifier,paramString,tiddler, errorMsg){
	var w = new Wizard();
	w.createWizard(place,"Workspace Administration");
	config.macros.ccAdmin.refresh(w);
};

config.macros.ccAdmin.refresh= function(w){
	params = {};
	params.w = w;
	params.e = this;
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=LISTALL&workspace_name='+workspace,null,null,null,config.macros.ccAdmin.listAllCallback,params);
	w.setButtons([
		{caption: 'Delete Users', tooltip: 'Delete User', onClick: function(w){ 
			config.macros.ccAdmin.delAdminSubmit(null, params);
		 	return false;
		}}, 
	{caption: 'Add User', tooltip: 'Add User', onClick: function(w){ config.macros.ccAdmin.addAdminDisplay(null, params); return false } }]);

};

config.macros.ccAdmin.delAdminSubmit = function(e, params) {
	var listView = params.w.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	//displayMessage(rowNames);
	var delUsers = "";
	for(var e=0; e < rowNames.length; e++) 
			delUsers += rowNames[e]+",";
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=DELETEADMIN&username='+delUsers+'&workspace_name='+workspace,null,null,null,config.macros.ccAdmin.addAdminCallback,params);
	return false; 
};

config.macros.ccAdmin.addAdminDisplay = function(e, params) {
	doHttp('POST',url+'/handle/workspaceAdmin.php','action=LISTWORKSPACES',null,null,null,config.macros.ccAdmin.listWorkspaces,params);
};

config.macros.ccAdmin.listWorkspaces = function(status,params,responseText,uri,xhr) {
	
	var frm = createTiddlyElement(null,'form',null,null);
	frm.onsubmit = this.addAdminSubmit;
	var step = createTiddlyElement(frm,'div',null, "null");
	var workspace_label = createTiddlyElement(step, "label", null, "label", "Workspace");
	workspace_label.setAttribute("for","workspaceName");

	var s = createTiddlyElement(null,"select",null,null,"a");
	s.name = 'workspaceName';
	
	var workspaces = eval('[ '+responseText+' ]');
	
	for(var d=0; d < workspaces.length; d++){
		var i = createTiddlyElement(s,"option",null,null,workspaces[d]);
		i.value = workspaces[d];
		if (workspace == workspaces[d])
		{
			// select the workspace being viewed
		}

	}
	step.appendChild(s);

	createTiddlyElement(step,'br');
	var username_label = createTiddlyElement(step, "label", null, "label", 'Username  ');
	username_label.setAttribute("for","adminUsername");
	var adminUsername = createTiddlyElement(step,'input','adminUsername', 'input');				
	adminUsername.name = 'adminUsername';
	createTiddlyElement(step,'br');

	params.w.addStep("Add a new Workspace Administrator",frm.innerHTML);
	params.w.setButtons([
		{caption: 'Cancel', tooltip: 'Cancel adding new user', onClick: function(w){ config.macros.ccAdmin.refresh(params.w) } },
		{caption: 'Make User Admin', tooltip: 'Make User Admin of Workspace', onClick: function(w){ config.macros.ccAdmin.addAdminSubmit(null, params) } }	
	]);
	createTiddlyElement(params.step,'input','workspaceName', 'input')				
}

function addOption(selectbox,text,value )
{
	var optn = document.createElement("OPTION");
	optn.text = text;
	optn.value = value;
	selectbox.options.add(optn);
}

config.macros.ccAdmin.addAdminSubmit = function(e, params) {
	//	var listView = params.w.getValue("listView");
	//	var rowNames = ListView.getSelectedRows(listView);
	//	displayMessage(rowNames);
	doHttp('POST',url+'/handle/workspaceAdmin.php','username='+params.w.formElem.adminUsername.value+'&workspace_name='+params.w.formElem.workspaceName.value,null,null,null,config.macros.ccAdmin.addAdminCallback,params);
	return false; 
};

config.macros.ccAdmin.listAllCallback = function(status,params,responseText,uri,xhr) {
	var me = config.macros.ccAdmin;
	var out = "";
	var adminUsers = [];
	if(xhr.status == 401)
	{
		displayMessage("Permission Denied.");
		var html ='You need to be an administrator of this workspace';
		params.w.addStep("Permission Denied to edit workspace : "+workspace, html);
		params.w.setButtons([]);
		return false;
	}
	var a = eval(responseText);
	for(var e=0; e < a.length; e++){ 		
	//	createTiddlyElement(params.place, 'b', null, null,  a[e].username);
	//	createTiddlyElement(params.place, 'i', null, null,  ' last visited '+a[e].lastVisit);
	//	var link=createExternalLink(params.place,url+'/handle/WorkspaceAdmin.php?action=DELETEADMIN&username='+a[e]+'&workspace_name='+workspace);
	//	link.textContent='(x)';
	//	createTiddlyElement(params.place, "br");
	out += a[e].username;
		adminUsers.push({
			name: a[e].username,
			lastVisit:a[e].lastVisit,
		});
	}
	//listedTiddlers.sort(function(a,b) {return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1);});
	// Display the listview"
	var html ='<input type="hidden" name="markList"></input>';
	params.w.addStep("Manage administrators for workspace : "+workspace, html);
	var markList = params.w.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	var listView = ListView.create(listWrapper,adminUsers,config.macros.ccAdmin.listAdminTemplate);
	//params.w.setValue("listAdminView",listAdminView);
	params.w.setValue("listView",listView);
};


merge(config.macros.ccAdmin,{
	listAdminTemplate: {
	columns: [	
		{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
		{name: 'Name', field: 'name', title: "Username", type: 'String'},
		{name: 'Last Visit', field: 'lastVisit', title: "Last Login", type: 'String'}
	],
	rowClasses: [
		{className: 'lowlight', field: 'lowlight'}
	]}
});

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

config.macros.ccAdmin.addAdminCallback = function(status,params,responseText,uri,xhr) {	
	config.macros.ccAdmin.refresh(params.w);
};

//}}}