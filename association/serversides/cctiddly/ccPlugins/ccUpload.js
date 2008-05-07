/***
|''Name:''|ccUpload|
|''Description:''|Allows users to upload files in ccTiddly|
|''Version:''|2.1.5|
|''Date:''|Nov 27,2007|
|''Source:''||
|''Author:''|SimonMcManus|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.6|
|''Browser:''| Firefox |
***/
//{{{

var iFrameLoad=function(){
	var uploadIframe= document.getElementById('uploadIframe');
	var statusArea=document.getElementById("uploadStatus");
	document.getElementById("ccfile").value=""; 
	statusArea.innerHTML=uploadIframe.contentDocument.body.innerHTML;
};

config.macros.ccUpload={};
config.macros.ccUpload.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	if (workspacePermission.upload!=1){
		createTiddlyElement(place,'div',null,"annotation",'You do not have permissions to create a file on this server. ');
		return null;
	}

	// When we server this tiddler it need to know the URL of the server to post back to,this value is currently set in index.php
	var frm=createTiddlyElement(place,'form',null,"wizard");
	frm.action=window.url+"/handle/upload.php"; ; 
	frm.id="ccUpload";
	frm.enctype="multipart/form-data";
	frm.method="POST";	
	frm.target="uploadIframe";

	var body=createTiddlyElement(frm,'div',null,"wizardBody");
	createTiddlyElement(body,"h1",null,null,"Upload File");
	createTiddlyElement(body,"h2",null,null,"Upload Files to your workspace");
	createTiddlyElement(body,"br");
	//form content
	var step=createTiddlyElement(body,'div',null,"wizardStep");
	
	var username=createTiddlyElement(step,'input','username','username');				
	username.name='username';
	username.type="HIDDEN";
	username.value=config.options.txtUserName;		
	
	var label=createTiddlyElement(step,"label",null,"label","Upload your file ");
	label.setAttribute("for","ccfile");
	
	var file=createTiddlyElement(step,'input','ccfile','input');				
	file.type="file";
	file.name="userFile";
	var workspaceName=createTiddlyElement(step,'input','workspaceName','workspaceName');				
	workspaceName.name='workspaceName';
	workspaceName.type="HIDDEN";
	workspaceName.value=workspace;
	createTiddlyElement(step,'br');

	var saveTo=createTiddlyElement(step,'input','saveTo','saveTo',"workspace");				
	saveTo.type="HIDDEN";
	saveTo.name='saveTo';
	saveTo.value='workspace';
	
	var submitDiv=createTiddlyElement(step,"div",null,'submit');
	var btn=createTiddlyElement(frm,"input",null,'button');
	btn.setAttribute("type","submit");
	btn.setAttribute("onClick","config.macros.ccUpload.submitiframe()");
	btn.value='Upload File';
	submitDiv.appendChild(btn);	

	// Create the iframe
	var iframe=document.createElement("iframe");
	iframe.style.display="none";
	iframe.id='uploadIframe';
	iframe.name='uploadIframe';
	frm.appendChild(iframe);
	createTiddlyElement(step,"div",'uploadStatus');

	iframe.onload=iFrameLoad;
};

config.macros.ccUpload.submitiframe=function(){

	var statusArea=document.getElementById("uploadStatus");
	statusArea.innerHTML="uploading...  &lt;img src=loading.gif /&gt; ";	
	return true;
};
 
config.macros.ccCreate={};

config.macros.ccCreate.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	if (workspacePermission.upload !=1){
		createTiddlyElement(place,'div',null,"annotation",'You do not have permissions to create a new file on this server. ');
return null;
	}
	// When we server this tiddler it need to know the URL of the server to post back to,this value is currently set in index.php
	var frm=createTiddlyElement(place,'form',null,"wizard");

displayMessage(url);
	frm.action="hdfdandle/upload.php";
	frm.method="POST";
	createTiddlyElement(frm,"br");
	var body=createTiddlyElement(frm,'div',null,"wizardBody");
	createTiddlyElement(frm,"br");
	createTiddlyElement(body,"h1",null,null,"Create HTML file ");
	createTiddlyElement(body,"br");
	//form content
	var step=createTiddlyElement(body,'div',null,"wizardStep");

	createTiddlyText(step,'Filename : ');
	var htmlfile=createTiddlyElement(step,'input','ccHTMLName','ccHMLname');				
	htmlfile.name='ccHTMLName';
	createTiddlyElement(step,'br');
	createTiddlyElement(step,'br');

	createTiddlyText(step,"add your HTML code to the textbox below :");
	createTiddlyElement(step,'br');
	var htmlbox=createTiddlyElement(step,'textarea','ccHTML','ccHML');				
	htmlbox.name='ccHTML';
	htmlbox.rows='20';
	htmlbox.cols='100';

	createTiddlyElement(step,'br');
	var username=createTiddlyElement(step,'input','username','username');				
	username.name='username';
	username.type="HIDDEN";
	username.value=config.options.txtUserName;		
	createTiddlyElement(step,'br');

	var workspaceName=createTiddlyElement(step,'input','workspaceName','workspaceName');				
	workspaceName.name='workspaceName';
	workspaceName.type="HIDDEN";
	workspaceName.value=workspace;
	
	createTiddlyText(step,"Create the file in :");
	createTiddlyElement(step,'br');
	var RDuser=createTiddlyElement(step,'input','user','user');
	RDuser.type="radio";
	RDuser.name="saveTo";

	RDuser.value="user";
	createTiddlyText(step,"My User Area");

	createTiddlyElement(step,'br');
	var RDworkspace=createTiddlyElement(step,'input','workspace','workspace');		
	RDworkspace.type="radio";
	RDworkspace.name="saveTo";
	RDworkspace.value="workspace";
	RDworkspace.checked="1";

	createTiddlyText(step,"Workspace Area ");
	createTiddlyElement(step,'br');

	createTiddlyElement(frm,'br');
	var btn=createTiddlyElement(frm,'input',this.prompt,'button');
	btn.setAttribute('type','submit');
	btn.value='Create File ';
	createTiddlyElement(frm,'br');
	createTiddlyElement(frm,'br');
};
//}}}