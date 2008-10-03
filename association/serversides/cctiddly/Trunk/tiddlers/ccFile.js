config.macros.ccFile = {};

merge(config.macros.ccFile,{
	wizardTitleText:"Manage Files",
	wizardStepText:"Manage files in workspace.",
	buttonDeleteText:"Delete Files",
	buttonDeleteTooltip:"Click to Delete files.",
	buttonUploadText:"Upload File",
	buttonUploadTooltip:"Click to Upload files.",
	buttonCancelText:"Cancel",
	buttonCancelTooltip:"Click to cancel.",
	labelFiles:"Existing Files ",
	errorPermissionDeniedTitle:"Permission Denied",
	errorPermissionDeniedUpload:"You do not have permissions to create a file on this server. ",
	errorPermissionDeniedView:"You do not have permissions to view files in this workspace. ",
	listAdminTemplate: {
	columns: [	
	{name: 'wiki text', field: 'wikiText', title: "", type: 'WikiText'},
	{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
	{name: 'Name', field: 'name', title: "File", type: 'WikiText'},
	{name: 'Size', field: 'fileSize', title: "size", type: 'String'}
	],
	rowClasses: [
	{className: 'lowlight', field: 'lowlight'}
	]}
});


var iFrameLoad=function(){
	var uploadIframe = document.getElementById('uploadIframe');
	var statusArea = document.getElementById("uploadStatus");
	document.getElementById("ccfile").value=""; 
	statusArea.innerHTML=uploadIframe.contentDocument.body.innerHTML;
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
		}
			 }, 
		{caption: me.buttonUploadText, tooltip: me.buttonUploadTooltip, onClick: function(e){ 
			config.macros.ccFile.addFileDisplay(null, params); return false 
			} }]);
};

config.macros.ccFile.delFileSubmit=function(e, params) {
	var listView = params.w.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	for(var e=0; e < rowNames.length; e++) 
	doHttp('POST',url+'/handle/listFiles.php','action=DELETEFILE&file='+rowNames[e]+'&workspace_name='+workspace,null,null,null,config.macros.ccFile.delFileCallback,params);
	return false; 
};

config.macros.ccFile.delFileCallback=function(status,params,responseText,uri,xhr) {
	config.macros.ccFile.refresh(params.w);
};

config.macros.ccFile.addFileDisplay = function(e, params) {
	var frmWrapper=createTiddlyElement(null,'div',"frmWrapper", "frmWrapper");
	var frm=createTiddlyElement(frmWrapper,'form',null,"wizardStep");
	var step = frm;
	//frmWrapper.appendChild(frm);
	if(navigator.appName=="Microsoft Internet Explorer")
	{
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

	var username=createTiddlyElement(null,'input','username','username');				
	username.setAttribute("name","username");
	username.setAttribute("type","HIDDEN");
	username.value=config.options.txtUserName;		
	step.appendChild(username);
	
	var label=createTiddlyElement(step,"label",null,"label","Upload your file ");
	label.setAttribute("for","ccfile");
	var file=createTiddlyElement(null,'input','ccfile','input');				
	file.type="file";
	file.name="userFile";
	step.appendChild(file);
	
	var workspaceName=createTiddlyElement(null,'input','workspaceName','workspaceName');				
	workspaceName .setAttribute('name','workspace');
	workspaceName.type="HIDDEN";
	workspaceName.value=workspace;
	step.appendChild(workspaceName);
	
	createTiddlyElement(step,'br');
	var saveTo=createTiddlyElement(null,"input","saveTo","saveTo");	

	//saveTo.setAttribute("type","HIDDEN");
	saveTo.setAttribute("name","saveTo");
	saveTo.type="HIDDEN";
	saveTo.value='workspace';
	saveTo.name='saveTo';
	step.appendChild(saveTo);
	
	var iframe=document.createElement("iframe");
	iframe.style.display="none";
	iframe.id='uploadIframe';
	iframe.name='uploadIframe';
	iframe.onload=iFrameLoad;
	frm.appendChild(iframe);
	createTiddlyElement(step,"div",'uploadStatus');
	params.w.addStep("sd","<input type='hidden' name='placeholder'/>");
	params.w.formElem.placeholder.parentNode.appendChild(frmWrapper);
	
	params.w.setButtons([
		{caption: config.macros.ccFile.buttonCancelText, tooltip: config.macros.ccFile.buttonCancelTooltip, onClick: function() {
			config.macros.ccFile.refresh(params.w);
		}
	},
	{caption: config.macros.ccFile.buttonUploadText, tooltip: config.macros.ccFile.buttonUploadTooltip, onClick: function() {
		params.w.formElem.uploadForm.submit();
	}
}
	]);
};

function addOption(selectbox,text,value ){
	var optn = document.createElement("OPTION");
	optn.text = text;
	optn.value = value;
	selectbox.options.add(optn);
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
				wikiText:'<html><img onclick=alert("a"); src="'+a[e].url+'" style="width: 70px; "/></html>',
				lastVisit:a[e].lastVisit,
				fileSize:a[e].fileSize
			});
		}
	} catch (ex)
	{
		params.w.setButtons([
			{caption: me.buttonUploadText, tooltip: me.buttonUploadTooltip, onClick: function(w){
				
				config.macros.ccFile.addFileDisplay(e, params);
				//story.displayTiddler(null,"Upload");
			
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

