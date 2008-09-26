                                            
/***
|''Name''|ccUpload|
|''Description''|Allows users to upload files onto a ccTiddly server|
|''Author''|[[Simon McManus | http://simonmcmanus.com]]|
|''Version''|1.0.1|
|''Date''|12/05/2008|
|''Status''|@@alpha@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccUpload.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccUpload.js|
|''License''|BSD|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''Documentation''|<...>|
|''Keywords''|ccTiddly, ccUpload|

!Description

Allows users to upload files to a ccTiddly serevr. 

!Usage
{{{
<<ccUpload>>
}}}

!Code
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
		createTiddlyElement(place,'div',null,"annotation",config.macros.ccFile.errorPermissionDeniedUpload);
		return null;
	}
	var frm=createTiddlyElement(null,'form',null,"wizard");
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
	place.appendChild(frm);
	var body=createTiddlyElement(frm,'div',null,"wizardBody");
	createTiddlyElement(body,"h1",null,null,"Upload File");
	createTiddlyElement(body,"br");
	var step=createTiddlyElement(body,'div',null,"wizardStep");
	var username=createTiddlyElement(null,'input','username','username');				
	username.setAttribute("name","username");
	username.setAttribute("type","HIDDEN");
	username.value=config.options.txtUserName;		
	step.appendChild(username);
	var label=createTiddlyElement(step,"label",null,"label","File ");
	label.setAttribute("for","ccfile");
	var file=createTiddlyElement(null,'input','ccfile','input');				
	file.type="file";
	file.name="userFile";
	step.appendChild(file);
	var workspaceName=createTiddlyElement(null,'input','workspaceName','workspaceName');				
	workspaceName.setAttribute('name','workspaceName');
	workspaceName.type="HIDDEN";
	workspaceName.value=workspace;
	step.appendChild(workspaceName);
	createTiddlyElement(step,'br');
	var saveTo=createTiddlyElement(null,"input","saveTo","saveTo");	
	saveTo.setAttribute("name","saveTo");
	saveTo.type="HIDDEN";
	saveTo.value='workspace';
	saveTo.name='saveTo';
	step.appendChild(saveTo);
	createTiddlyElement(step, "br");
	var submitDiv=createTiddlyElement(step,"div",null,'submit');
	var btn=createTiddlyElement(null,"input",null,'button');
	btn.setAttribute("type","submit");
	btn.setAttribute("onClick","config.macros.ccUpload.submitiframe()");
	btn.value='Upload File';
	submitDiv.appendChild(btn);	
	createTiddlyElement(step, "br");
	// Create the iframe
	var iframe=document.createElement("iframe");
	iframe.style.display="none";
	iframe.id='uploadIframe';
	iframe.name='uploadIframe';
	iframe.onload=iFrameLoad;
	frm.appendChild(iframe);
	createTiddlyElement(step,"div",'uploadStatus');
	createTiddlyElement(step, "br");
};

config.macros.ccUpload.submitiframe=function(){
	var statusArea=document.getElementById("uploadStatus");
	statusArea.innerHTML="uploading...  &lt;img src=loading.gif /&gt; ";	
	return true;
};
 
//}}}