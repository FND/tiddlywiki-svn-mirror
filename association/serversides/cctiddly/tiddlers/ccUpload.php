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
<?php

$scheme = 'http';
if (isset($_SERVER['HTTPS']) and $_SERVER['HTTPS'] == 'on') {
	$scheme .= 's';
}

?>
var url = "<?php echo $scheme.$_SERVER['SERVER_NAME'].str_replace('/index.php', '',  $_SERVER['SCRIPT_NAME']);?>";
var workspace = "<?php echo $tiddlyCfg['workspace_name'];?>";

config.macros.ccUpload = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
		// When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
		var frm = createTiddlyElement(place,&quot;form&quot;,null,null);
		frm.enctype="multipart/form-data";
		frm.action ="handle/upload.php?workspace=simonmcmanus";
		frm.method ="POST";
		var file = createTiddlyElement(frm,&quot;input&quot;,&quot;ccfile&quot;, &quot;ccfile&quot;);				
		file.type = "file";
		file.name="userfile";
		
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
		RDworkspace.value="user";
		
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
	
	
