<div title="ccUpload" modifier="ccTiddly" tags="systemConfig excludeLists excludeSearch">
<pre>	
/***
|''Name:''|ccUpload|
|''Description:''|Allows users to upload files in ccTiddly|
|''Version:''|2.1.5|
|''Date:''|Nov 27, 2007|
|''Source:''||
|''Author:''|SimonMcManus|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.6|
|''Browser:''| Firefox |
***/
//{{{

var iFrameLoad = function(){
	var uploadIframe =  document.getElementById('uploadIframe');
	var statusArea = document.getElementById("uploadStatus");
	document.getElementById("ccfile").value = ""; 
	statusArea.innerHTML = uploadIframe.contentDocument.body.innerHTML;
} 

var submitIframe = function(){
	var statusArea = document.getElementById("uploadStatus");
	statusArea.innerHTML = "Uploading your file, please wait ";	
	return true;
};

var url = "<?php echo getURL();?>";
var workspace = "<?php echo $tiddlyCfg['workspace_name'];?>";

config.macros.ccUpload = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
	
		if (workspacePermission.upload != 1)
		{
			createTiddlyElement(place,&quot;div&quot;, null, "annotation",  &quot;You do not have permissions to create a file on this server. &quot;);
			return null;
		}

		// When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
		var frm = createTiddlyElement(place,&quot;form&quot;,null,"wizard");
		frm.action="handle/upload.php"; 
		frm.id = "ccUpload";
		frm.enctype="multipart/form-data";
		frm.method = "POST";	
		frm.target = "uploadIframe";

		var body = createTiddlyElement(frm,&quot;div&quot;,null, "wizardBody");
		createTiddlyElement(body, "br");
		createTiddlyElement(body, "h1", null, null, "Upload File");
		createTiddlyElement(body, "br");
		//form content
		var step = createTiddlyElement(body,&quot;div&quot;,null, "wizardStep");
		createTiddlyElement(step, "div", "uploadStatus", "uploadStatus", "Upload your file below ");
		var username = createTiddlyElement(step,&quot;input&quot;,&quot;username&quot;, &quot;username&quot;);				
		username.name= 'username';
		username.type="HIDDEN";
		username.value= config.options.txtUserName;		
		createTiddlyElement(step, 'br');

		createTiddlyElement(step, "div", "shortStatus", "shortStatus",  "Upload your file below ");

		createTiddlyElement(step, "hr");
		var file = createTiddlyElement(step,&quot;input&quot;,&quot;ccfile&quot;, &quot;ccfile&quot;);				
		file.type = "file";
		file.name="userFile";

		var workspaceName = createTiddlyElement(step,&quot;input&quot;,&quot;workspaceName&quot;, &quot;workspaceName&quot;);				
		workspaceName.name = 'workspaceName';
		workspaceName.type="HIDDEN";
		workspaceName.value = workspace;
		createTiddlyElement(step, 'br');
		createTiddlyElement(step, 'br');

		var saveTo = createTiddlyElement(step, 'input','saveTo', 'saveTo', "workspace");				
		saveTo.type ="HIDDEN";
		saveTo.name = 'saveTo';
		saveTo.value ='workspace';

		createTiddlyElement(frm,&quot;br&quot;);
		var btn = createTiddlyElement(frm,"input",null, 'button');
		btn.setAttribute("type","submit");
		btn.value = 'Upload File';
		frm.appendChild(btn);	

		// Create the iframe
		var iframe = document.createElement("iframe");
		iframe.style.display = "none";
		iframe.id='uploadIframe';
		iframe.name='uploadIframe';
		frm.appendChild(iframe);
		iframe.onload = iFrameLoad;
		
		createTiddlyElement(frm, &quot;br&quot;);
		createTiddlyElement(frm, &quot;br&quot;);
	}
}

config.macros.ccCreate = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
	
		if (workspacePermission.upload != 1)
		{
		createTiddlyElement(place,&quot;div&quot;, null, "annotation",  &quot;You do not have permissions to create a new file on this server. &quot;);
		return null;
		}

		// When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
		var frm = createTiddlyElement(place,&quot;form&quot;,null,"wizard");
		frm.enctype="multipart/form-data";
		frm.action="handle/upload.php";
		frm.method = "POST";

		var body = createTiddlyElement(frm,&quot;div&quot;,null, "wizardBody");
		createTiddlyElement(body, "h1", null, null, "Create HTML file ");
		//form content
		var step = createTiddlyElement(body,&quot;div&quot;,null, "wizardStep");

		createTiddlyText(step, 'Filename : ');
		var htmlfile = createTiddlyElement(step,&quot;input&quot;,&quot;ccHTMLname&quot;, &quot;ccHMLname&quot;);				
		htmlfile.name = 'ccHTMLname';
		createTiddlyElement(step, 'br');

		createTiddlyElement(step, 'br');

		createTiddlyText(step, "add your HTML code to the textbox below :");
		createTiddlyElement(step, 'br');
		var htmlbox = createTiddlyElement(step,&quot;textarea&quot;,&quot;ccHTML&quot;, &quot;ccHML&quot;);				
		htmlbox.name= 'ccHTML';
		htmlbox.rows = '20';
		htmlbox.cols = '100';

		createTiddlyElement(step, 'br');

		var username = createTiddlyElement(step,&quot;input&quot;,&quot;username&quot;, &quot;username&quot;);				
		username.name= 'username';
		username.type="HIDDEN";
		username.value= config.options.txtUserName;		
		createTiddlyElement(step, 'br');


		var workspaceName = createTiddlyElement(step,&quot;input&quot;,&quot;workspaceName&quot;, &quot;workspaceName&quot;);				
		workspaceName.name = 'workspaceName';
		workspaceName.type="HIDDEN";
		workspaceName.value = workspace;

		createTiddlyText(step, "Create the file in :");


		createTiddlyElement(step,&quot;br&quot;);
		var RDuser = createTiddlyElement(step,&quot;input&quot;,&quot;user&quot;, &quot;user&quot;);
		RDuser.type = "radio";
		RDuser.name="saveTo";

		RDuser.value="user";
		createTiddlyText(step, "My User Area");

		createTiddlyElement(step,&quot;br&quot;);
		var RDworkspace = createTiddlyElement(step,&quot;input&quot;,&quot;workspace&quot;, &quot;workspace&quot;);		
		RDworkspace.type = "radio";
		RDworkspace.name="saveTo";
		RDworkspace.value="workspace";
		RDworkspace.checked="1";

		createTiddlyText(step, "Workspace Area ");
		createTiddlyElement(step,&quot;br&quot;);

		createTiddlyElement(frm,&quot;br&quot;);
		var btn = createTiddlyElement(frm,&quot;input&quot;,this.prompt, 'button');
		btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
		btn.value = &quot;Create File &quot;;
		createTiddlyElement(frm, &quot;br&quot;);
		createTiddlyElement(frm, &quot;br&quot;);

	}
}

//}}}
</pre>
</div>