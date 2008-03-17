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

var url = "<?php echo getURL();?>";
var workspace = "<?php echo $tiddlyCfg['workspace_name'];?>";

config.macros.ccUpload = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
		// When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
		var frm = createTiddlyElement(place,&quot;form&quot;,null,null);
	//	frm.enctype="multipart/form-data";
		frm.action ="handle/upload.php";
		frm.method ="POST";
		
		var htmlbox = createTiddlyElement(frm,&quot;textarea&quot;,&quot;ccHTML&quot;, &quot;ccHML&quot;);				
		htmlbox.name= 'ccHTML';
		htmlbox.rows = '20';
		htmlbox.cols = '100';
		
			createTiddlyElement(frm, 'br');
			createTiddlyText(frm, 'Username : ');

		var username = createTiddlyElement(frm,&quot;input&quot;,&quot;ccUsername&quot;, &quot;ccUsername&quot;);				
		username.name= 'ccUsername';
		username.value= config.options.txtUserName;		
		
			createTiddlyElement(frm, 'br');
			createTiddlyText(frm, 'Filename : ');

		var htmlfile = createTiddlyElement(frm,&quot;input&quot;,&quot;ccHTMLname&quot;, &quot;ccHMLname&quot;);				
		htmlfile.name = 'ccHTMLname';

	//	var file = createTiddlyElement(frm,&quot;input&quot;,&quot;ccfile&quot;, &quot;ccfile&quot;);				
	//	file.type = "file";
	//	file.name="userfile";
		createTiddlyElement(frm, 'br');
		createTiddlyText(frm, 'Workspace : ');
		
		var workspaceName = createTiddlyElement(frm,&quot;input&quot;,&quot;workspaceName&quot;, &quot;workspaceName&quot;);				
		workspaceName.name = 'workspaceName';
		workspaceName.value = workspace;
		
			
		createTiddlyElement(frm,&quot;br&quot;);
		
		createTiddlyText(frm, "Save the file to :");
		
		
		createTiddlyElement(frm,&quot;br&quot;);
		var RDuser = createTiddlyElement(frm,&quot;input&quot;,&quot;user&quot;, &quot;user&quot;)				;
		RDuser.type = "radio";
		RDuser.name="saveTo";
		
		RDuser.value="user";
		createTiddlyText(frm, "My User Area");
		
		createTiddlyElement(frm,&quot;br&quot;);
		var RDworkspace = createTiddlyElement(frm,&quot;input&quot;,&quot;workspace&quot;, &quot;workspace&quot;);		
		RDworkspace.type = "radio";
		RDworkspace.name="saveTo";
		RDworkspace.value="workspace";
		RDworkspace.checked="1";
		
		createTiddlyText(frm, "Workspace Area ");
		createTiddlyElement(frm,&quot;br&quot;);
		
		createTiddlyElement(frm,&quot;br&quot;);
		var btn = createTiddlyElement(frm,&quot;input&quot;,this.prompt);
		btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
		btn.value = &quot;Upload File &quot;;
	}
}
//}}}
</pre>
</div>
	
	
