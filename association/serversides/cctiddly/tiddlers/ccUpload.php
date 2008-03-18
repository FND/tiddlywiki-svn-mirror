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
		var frm = createTiddlyElement(place,&quot;form&quot;,null,"wizard");
		frm.enctype="multipart/form-data";
	frm.action="handle/upload.php";
	frm.method = "POST";
		 
			var body = createTiddlyElement(frm,&quot;div&quot;,null, "wizardBody");
createTiddlyElement(body, "h1", null, null, "Create HTML file: ");
			//form content
			var step = createTiddlyElement(body,&quot;div&quot;,null, "wizardStep");
		
			createTiddlyText(step, 'Filename : ');
			var htmlfile = createTiddlyElement(step,&quot;input&quot;,&quot;ccHTMLname&quot;, &quot;ccHMLname&quot;);				
			htmlfile.name = 'ccHTMLname';
				createTiddlyElement(step, 'br');
				
					createTiddlyElement(step, 'br');
			
		createTiddlyText(step, "add your HTML code to the textbox below : ");
		var htmlbox = createTiddlyElement(step,&quot;textarea&quot;,&quot;ccHTML&quot;, &quot;ccHML&quot;);				
		htmlbox.name= 'ccHTML';
		htmlbox.rows = '20';
		htmlbox.cols = '100';
		
			createTiddlyElement(step, 'br');
	
		var username = createTiddlyElement(step,&quot;input&quot;,&quot;ccUsername&quot;, &quot;ccUsername&quot;);				
		username.name= 'ccUsername';
		username.type="HIDDEN";
		username.value= config.options.txtUserName;		
			createTiddlyElement(step, 'br');
			

		var file = createTiddlyElement(step,&quot;input&quot;,&quot;ccfile&quot;, &quot;ccfile&quot;);				
		file.type = "file";
		file.name="userfile";
		
		var workspaceName = createTiddlyElement(step,&quot;input&quot;,&quot;workspaceName&quot;, &quot;workspaceName&quot;);				
		workspaceName.name = 'workspaceName';
		workspaceName.type="HIDDEN";
		workspaceName.value = workspace;
		
		createTiddlyText(step, "Create the file in :");
		
		
		createTiddlyElement(step,&quot;br&quot;);
		var RDuser = createTiddlyElement(step,&quot;input&quot;,&quot;user&quot;, &quot;user&quot;)				;
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
	
	
