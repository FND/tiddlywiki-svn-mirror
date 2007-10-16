<?php
	
	//timing
	function recordTime_float($name="unnamed")
	{
		global $time;
		
		if( !isset($time) )		//stop if time var not exist
		{
			return FALSE;
		}
		
		list($usec, $sec) = explode(" ", microtime());
		$time[] = array("name"=>$name, "time"=>((float)$usec + (float)$sec));
		return TRUE;
	}
	
	$time=array();
	recordTime_float("Start");

	//includes
	include_once("includes/header.php");
	include_once("includes/print.php");
	recordTime_float("includes");
	
	//logout
	if( isset($_GET['logout']) && $_GET['logout']==1 )
	{
		user_logout();
		//redirect to itself to refresh and clear out "logout=1" string
		header("Location: ".$_SERVER['PHP_SELF'].'?'.str_replace("logout=1&","",$_SERVER['QUERY_STRING']));
	}
	//reqLogin
	if( $tiddlyCfg['pref']['reqLogin'] == 1 )
	{
		if( isset($_POST['cctuser']) && isset($_POST['cctpass']) )		//set cookie for login
		{
			user_login(formatParametersPOST($_POST['cctuser']),formatParametersPOST($_POST['cctpass']),1);
			header("Location: ".$_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']);		//redirect to itself to refresh
		}
		//////////////////////////////////////////print login box if not logged in or not in the right group////////////////////////////////
		$user = user_create();
		if( !$user['verified'] )		//if not logged on, display login screen
		{
?>
<html><head></head>
<body>
<form method="post" action="<?php print $_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']?>">
<?php print $ccT_msg['loginpanel']['username']?><input type="text" name="cctuser"><br>
<?php print $ccT_msg['loginpanel']['password']?><input type="password" name="cctpass"><br>
<input type="submit" value="<?php print $ccT_msg['loginpanel']['login'] ?>" name="ok">
</form>
</body></html>
<?php
			exit("");
		}
	}
	
	//check if getting revision
	if( isset($_GET['title']) )
	{
		$tiddlers = getAllVersionTiddly($title);
		$t = array();
		foreach( $tiddlers as $tid )
		{
			$tid['title'] .= " version ".$tid['version'];
			$t[] = $tid;
		}
		$tiddlers = $t;
	}elseif( isset($_GET['tags']) )
	{
		$tiddlers = getTiddlersWithTags($yesTags, $noTags);
	}else{
		$tiddlers = getAllTiddlers();
	}
	recordTime_float("get all tiddlers");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<script type="text/javascript">
//<![CDATA[
var version = {major: 2, minor: 1, revision: 0, date: new Date("Sep 29, 2006"), extensions: {}};
//]]>
</script>
<!--
TiddlyWiki 2.1.0 by Jeremy Ruston, (jeremy [at] osmosoft [dot] com)

Copyright (c) Osmosoft Limited 2004-2006

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this
list of conditions and the following disclaimer in the documentation and/or other
materials provided with the distribution.

Neither the name of the Osmosoft Limited nor the names of its contributors may be
used to endorse or promote products derived from this software without specific
prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
-->
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<!--PRE-HEAD-START-->
<?php 
	if( isset( $tiddlers['MarkupPreHead'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPreHead']['body']);
	}else{
		print "<link rel='alternate' type='application/rss+xml' title='RSS' href='$config.xml'>";
	}
?>
<!--PRE-HEAD-END-->
<title> TiddlyWiki - a reusable non-linear personal web notebook </title>
<?php print cct_print_includes($standalone);/*cct*/ ?>
<!--script below are ccT plugins-->
<?php print cct_print_plugins($standalone);/*cct*/ ?>
<!--End of ccT plugins-->
<style type="text/css">

#saveTest {
	display: none;
}

.zoomer {
	display: none;
}

#messageArea {
	display: none;
}

#copyright {
	display: none;
}

.popup {
	position: absolute;
}

#storeArea {
	display: none;
	margin: 4em 10em 3em;
}

#storeArea div {
 padding: 0.5em;
 margin: 1em 0em 0em 0em;
 border-color: #f0f0f0 #606060 #404040 #d0d0d0; 
 border-style: solid; 
 border-width: 2px;
 overflow: auto;
}

#javascriptWarning {
	width: 100%;
	text-align: center;
	font-weight: bold;
	background-color: #dd1100;
	color: #fff;
	padding:1em 0em; 
}

</style>
<!--POST-HEAD-START-->
<?php 
	if( isset( $tiddlers['MarkupPostHead'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPostHead']['body']);
	}
?>
<!--POST-HEAD-END-->
</head>
<body onload="main();" onunload="if(window.checkUnsavedChanges) checkUnsavedChanges();">
<!--PRE-BODY-START-->
<?php 
	if( isset( $tiddlers['MarkupPreBody'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPreBody']['body']);
	}
?>
<!--PRE-BODY-END-->
	<script type="text/javascript">
//<![CDATA[
if (useJavaSaver)
	document.write("<applet style='position:absolute;left:-1px' name='TiddlySaver' code='TiddlySaver.class' archive='TiddlySaver.jar' width='1' height='1'></applet>");
//]]>
	</script>
	<div id="copyright">
	Welcome to TiddlyWiki by Jeremy Ruston, Copyright &copy; 2006 Osmosoft Limited
	</div>
	<noscript>
		<div id="javascriptWarning">This page requires JavaScript to function properly</div>
	</noscript>
	<div id="saveTest"></div>
	<div id="contentWrapper"></div>
	<div id="contentStash"></div>
	<div id="storeArea">
<?php
	if( $standalone )
	{
?>
<div tiddler="UploadOptions" modifier="CoolCold" modified="200610211932" created="200610211932" tags="">!Options used by UploadPlugin\nUsername: &lt;&lt;option txtUploadUserName&gt;&gt;\nPassword: &lt;&lt;option pasUploadPassword&gt;&gt;\n\nUrl of the UploadService script^^(1)^^: &lt;&lt;option txtUploadStoreUrl 50&gt;&gt;\nRelative Directory where to store the file^^(2)^^: &lt;&lt;option txtUploadDir 50&gt;&gt;\nFilename of the uploaded file^^(3)^^: &lt;&lt;option txtUploadFilename 40&gt;&gt;\nDirectory to backup file on webserver^^(4)^^: &lt;&lt;option txtUploadBackupDir&gt;&gt;\n\n^^(1)^^Mandatory either in UploadOptions or in macro parameter\n^^(2)^^If empty stores in the script directory\n^^(3)^^If empty takes the actual filename\n^^(4)^^If empty existing file with same name on webserver will be overwritten\n\n&lt;&lt;upload&gt;&gt; with these options.\n\n!Upload Macro parameters\n{{{\n&lt;&lt;upload [storeUrl [toFilename [backupDir [uploadDir [username]]]]]&gt;&gt;\n	Optional positional parameters can be passed to overwrite \n	UploadOptions. \n}}}\n\n</div>
<div tiddler="UploadPlugin" modifier="CoolCold" modified="200610211933" created="200610211933" tags="systemConfig">/***\n|''Name:''|UploadPlugin|\n|''Description:''|Save to web a TiddlyWiki|\n|''Version:''|3.4.5|\n|''Date:''|Oct 15, 2006|\n|''Source:''|http://tiddlywiki.bidix.info/#UploadPlugin|\n|''Documentation:''|http://tiddlywiki.bidix.info/#UploadDoc|\n|''Author:''|BidiX (BidiX (at) bidix (dot) info)|\n|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|\n|''~CoreVersion:''|2.0.0|\n|''Browser:''|Firefox 1.5; InternetExplorer 6.0; Safari|\n|''Include:''|config.lib.file; config.lib.log; config.lib.options; PasswordTweak|\n|''Require:''|[[UploadService|http://tiddlywiki.bidix.info/#UploadService]]|\n***/\n//{{{\nversion.extensions.UploadPlugin = {\n	major: 3, minor: 4, revision: 5, \n	date: new Date(2006,9,15),\n	source: 'http://tiddlywiki.bidix.info/#UploadPlugin',\n	documentation: 'http://tiddlywiki.bidix.info/#UploadDoc',\n	author: 'BidiX (BidiX (at) bidix (dot) info',\n	license: '[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D]]',\n	coreVersion: '2.0.0',\n	browser: 'Firefox 1.5; InternetExplorer 6.0; Safari'\n};\n//}}}\n\n////+++!![config.lib.file]\n\n//{{{\nif (!config.lib) config.lib = {};\nif (!config.lib.file) config.lib.file= {\n	author: 'BidiX',\n	version: {major: 0, minor: 1, revision: 0}, \n	date: new Date(2006,3,9)\n};\nconfig.lib.file.dirname = function (filePath) {\n	var lastpos;\n	if ((lastpos = filePath.lastIndexOf(&quot;/&quot;)) != -1) {\n		return filePath.substring(0, lastpos);\n	} else {\n		return filePath.substring(0, filePath.lastIndexOf(&quot;\s\s&quot;));\n	}\n};\nconfig.lib.file.basename = function (filePath) {\n	var lastpos;\n	if ((lastpos = filePath.lastIndexOf(&quot;#&quot;)) != -1) \n		filePath = filePath.substring(0, lastpos);\n	if ((lastpos = filePath.lastIndexOf(&quot;/&quot;)) != -1) {\n		return filePath.substring(lastpos + 1);\n	} else\n		return filePath.substring(filePath.lastIndexOf(&quot;\s\s&quot;)+1);\n};\nwindow.basename = function() {return &quot;@@deprecated@@&quot;;};\n//}}}\n////===\n\n////+++!![config.lib.log]\n\n//{{{\nif (!config.lib) config.lib = {};\nif (!config.lib.log) config.lib.log= {\n	author: 'BidiX',\n	version: {major: 0, minor: 1, revision: 1}, \n	date: new Date(2006,8,19)\n};\nconfig.lib.Log = function(tiddlerTitle, logHeader) {\n	if (version.major &lt; 2)\n		this.tiddler = store.tiddlers[tiddlerTitle];\n	else\n		this.tiddler = store.getTiddler(tiddlerTitle);\n	if (!this.tiddler) {\n		this.tiddler = new Tiddler();\n		this.tiddler.title = tiddlerTitle;\n		this.tiddler.text = &quot;| !date | !user | !location |&quot; + logHeader;\n		this.tiddler.created = new Date();\n		this.tiddler.modifier = config.options.txtUserName;\n		this.tiddler.modified = new Date();\n	if (version.major &lt; 2)\n		store.tiddlers[tiddlerTitle] = this.tiddler;\n	else\n		store.addTiddler(this.tiddler);\n	}\n	return this;\n};\n\nconfig.lib.Log.prototype.newLine = function (line) {\n	var now = new Date();\n	var newText = &quot;| &quot;;\n	newText += now.getDate()+&quot;/&quot;+(now.getMonth()+1)+&quot;/&quot;+now.getFullYear() + &quot; &quot;;\n	newText += now.getHours()+&quot;:&quot;+now.getMinutes()+&quot;:&quot;+now.getSeconds()+&quot; | &quot;;\n	newText += config.options.txtUserName + &quot; | &quot;;\n	var location = document.location.toString();\n	var filename = config.lib.file.basename(location);\n	if (!filename) filename = '/';\n	newText += &quot;[[&quot;+filename+&quot;|&quot;+location + &quot;]] |&quot;;\n	this.tiddler.text = this.tiddler.text + &quot;\sn&quot; + newText;\n	this.addToLine(line);\n};\n\nconfig.lib.Log.prototype.addToLine = function (text) {\n	this.tiddler.text = this.tiddler.text + text;\n	this.tiddler.modifier = config.options.txtUserName;\n	this.tiddler.modified = new Date();\n	if (version.major &lt; 2)\n	store.tiddlers[this.tiddler.tittle] = this.tiddler;\n	else {\n		store.addTiddler(this.tiddler);\n		story.refreshTiddler(this.tiddler.title);\n		store.notify(this.tiddler.title, true);\n	}\n	if (version.major &lt; 2)\n		store.notifyAll(); \n};\n//}}}\n////===\n\n////+++!![config.lib.options]\n\n//{{{\nif (!config.lib) config.lib = {};\nif (!config.lib.options) config.lib.options = {\n	author: 'BidiX',\n	version: {major: 0, minor: 1, revision: 0}, \n	date: new Date(2006,3,9)\n};\n\nconfig.lib.options.init = function (name, defaultValue) {\n	if (!config.options[name]) {\n		config.options[name] = defaultValue;\n		saveOptionCookie(name);\n	}\n};\n//}}}\n////===\n\n////+++!![PasswordTweak]\n\n//{{{\nversion.extensions.PasswordTweak = {\n	major: 1, minor: 0, revision: 3, date: new Date(2006,8,30),\n	type: 'tweak',\n	source: 'http://tiddlywiki.bidix.info/#PasswordTweak'\n};\n//}}}\n/***\n!!config.macros.option\n***/\n//{{{\nconfig.macros.option.passwordCheckboxLabel = &quot;Save this password on this computer&quot;;\nconfig.macros.option.passwordType = &quot;password&quot;; // password | text\n\nconfig.macros.option.onChangeOption = function(e)\n{\n	var opt = this.getAttribute(&quot;option&quot;);\n	var elementType,valueField;\n	if(opt) {\n		switch(opt.substr(0,3)) {\n			case &quot;txt&quot;:\n				elementType = &quot;input&quot;;\n				valueField = &quot;value&quot;;\n				break;\n			case &quot;pas&quot;:\n				elementType = &quot;input&quot;;\n				valueField = &quot;value&quot;;\n				break;\n			case &quot;chk&quot;:\n				elementType = &quot;input&quot;;\n				valueField = &quot;checked&quot;;\n				break;\n		}\n		config.options[opt] = this[valueField];\n		saveOptionCookie(opt);\n		var nodes = document.getElementsByTagName(elementType);\n		for(var t=0; t&lt;nodes.length; t++) \n			{\n			var optNode = nodes[t].getAttribute(&quot;option&quot;);\n			if (opt == optNode) \n				nodes[t][valueField] = this[valueField];\n			}\n		}\n	return(true);\n};\n\nconfig.macros.option.handler = function(place,macroName,params)\n{\n    var opt = params[0];\n    if(config.options[opt] === undefined) {\n        return;}\n    var c;\n    switch(opt.substr(0,3)) {\n		case &quot;txt&quot;:\n			c = document.createElement(&quot;input&quot;);\n			c.onkeyup = this.onChangeOption;\n			c.setAttribute (&quot;option&quot;,opt);\n			c.className = &quot;txtOptionInput &quot;+opt;\n			place.appendChild(c);\n			c.value = config.options[opt];\n			break;\n		case &quot;pas&quot;:\n			// input password\n			c = document.createElement (&quot;input&quot;);\n			c.setAttribute(&quot;type&quot;,config.macros.option.passwordType);\n			c.onkeyup = this.onChangeOption;\n			c.setAttribute(&quot;option&quot;,opt);\n			c.className = &quot;pasOptionInput &quot;+opt;\n			place.appendChild(c);\n			c.value = config.options[opt];\n			// checkbox link with this password &quot;save this password on this computer&quot;\n			c = document.createElement(&quot;input&quot;);\n			c.setAttribute(&quot;type&quot;,&quot;checkbox&quot;);\n			c.onclick = this.onChangeOption;\n			c.setAttribute(&quot;option&quot;,&quot;chk&quot;+opt);\n			c.className = &quot;chkOptionInput &quot;+opt;\n			place.appendChild(c);\n			c.checked = config.options[&quot;chk&quot;+opt];\n			// text savePasswordCheckboxLabel\n			place.appendChild(document.createTextNode(config.macros.option.passwordCheckboxLabel));\n			break;\n		case &quot;chk&quot;:\n			c = document.createElement(&quot;input&quot;);\n			c.setAttribute(&quot;type&quot;,&quot;checkbox&quot;);\n			c.onclick = this.onChangeOption;\n			c.setAttribute(&quot;option&quot;,opt);\n			c.className = &quot;chkOptionInput &quot;+opt;\n			place.appendChild(c);\n			c.checked = config.options[opt];\n			break;\n	}\n};\n//}}}\n/***\n!! Option cookie stuff\n***/\n//{{{\nwindow.loadOptionsCookie_orig_PasswordTweak = window.loadOptionsCookie;\nwindow.loadOptionsCookie = function()\n{\n	var cookies = document.cookie.split(&quot;;&quot;);\n	for(var c=0; c&lt;cookies.length; c++) {\n		var p = cookies[c].indexOf(&quot;=&quot;);\n		if(p != -1) {\n			var name = cookies[c].substr(0,p).trim();\n			var value = cookies[c].substr(p+1).trim();\n			switch(name.substr(0,3)) {\n				case &quot;txt&quot;:\n					config.options[name] = unescape(value);\n					break;\n				case &quot;pas&quot;:\n					config.options[name] = unescape(value);\n					break;\n				case &quot;chk&quot;:\n					config.options[name] = value == &quot;true&quot;;\n					break;\n			}\n		}\n	}\n};\n\nwindow.saveOptionCookie_orig_PasswordTweak = window.saveOptionCookie;\nwindow.saveOptionCookie = function(name)\n{\n	var c = name + &quot;=&quot;;\n	switch(name.substr(0,3)) {\n		case &quot;txt&quot;:\n			c += escape(config.options[name].toString());\n			break;\n		case &quot;chk&quot;:\n			c += config.options[name] ? &quot;true&quot; : &quot;false&quot;;\n			// is there an option link with this chk ?\n			if (config.options[name.substr(3)]) {\n				saveOptionCookie(name.substr(3));\n			}\n			break;\n		case &quot;pas&quot;:\n			if (config.options[&quot;chk&quot;+name]) {\n				c += escape(config.options[name].toString());\n			} else {\n				c += &quot;&quot;;\n			}\n			break;\n	}\n	c += &quot;; expires=Fri, 1 Jan 2038 12:00:00 UTC; path=/&quot;;\n	document.cookie = c;\n};\n//}}}\n/***\n!! Initializations\n***/\n//{{{\n// define config.options.pasPassword\nif (!config.options.pasPassword) {\n	config.options.pasPassword = 'defaultPassword';\n	window.saveOptionCookie('pasPassword');\n}\n// since loadCookies is first called befor password definition\n// we need to reload cookies\nwindow.loadOptionsCookie();\n//}}}\n////===\n\n////+++!![config.macros.upload]\n\n//{{{\nconfig.macros.upload = {\n	accessKey: &quot;U&quot;,\n	formName: &quot;UploadPlugin&quot;,\n	contentType: &quot;text/html;charset=UTF-8&quot;,\n	defaultStoreScript: &quot;store.php&quot;\n};\n\n// only this two configs need to be translated\nconfig.macros.upload.messages = {\n	aboutToUpload: &quot;About to upload TiddlyWiki to %0&quot;,\n	backupFileStored: &quot;Previous file backuped in %0&quot;,\n	crossDomain: &quot;Certainly a cross-domain isue: access to an other site isn't allowed&quot;,\n	errorDownloading: &quot;Error downloading&quot;,\n	errorUploadingContent: &quot;Error uploading content&quot;,\n	fileLocked: &quot;Files is locked: You are not allowed to Upload&quot;,\n	fileNotFound: &quot;file to upload not found&quot;,\n	fileNotUploaded: &quot;File %0 NOT uploaded&quot;,\n	mainFileUploaded: &quot;Main TiddlyWiki file uploaded to %0&quot;,\n	passwordEmpty: &quot;Unable to upload, your password is empty&quot;,\n	urlParamMissing: &quot;url param missing&quot;,\n	rssFileNotUploaded: &quot;RssFile %0 NOT uploaded&quot;,\n	rssFileUploaded: &quot;Rss File uploaded to %0&quot;\n};\n\nconfig.macros.upload.label = {\n	promptOption: &quot;Save and Upload this TiddlyWiki with UploadOptions&quot;,\n	promptParamMacro: &quot;Save and Upload this TiddlyWiki in %0&quot;,\n	saveLabel: &quot;save to web&quot;, \n	saveToDisk: &quot;save to disk&quot;,\n	uploadLabel: &quot;upload&quot;	\n};\n\nconfig.macros.upload.handler = function(place,macroName,params){\n	// parameters initialization\n	var storeUrl = params[0];\n	var toFilename = params[1];\n	var backupDir = params[2];\n	var uploadDir = params[3];\n	var username = params[4];\n	var password; // for security reason no password as macro parameter\n	var label;\n	if (document.location.toString().substr(0,4) == &quot;http&quot;)\n		label = this.label.saveLabel;\n	else\n		label = this.label.uploadLabel;\n	var prompt;\n	if (storeUrl) {\n		prompt = this.label.promptParamMacro.toString().format([this.toDirUrl(storeUrl, uploadDir, username)]);\n	}\n	else {\n		prompt = this.label.promptOption;\n	}\n	createTiddlyButton(place, label, prompt, \n						function () {\n							config.macros.upload.upload(storeUrl, toFilename, uploadDir, backupDir, username, password); \n							return false;}, \n						null, null, this.accessKey);\n};\nconfig.macros.upload.UploadLog = function() {\n	return new config.lib.Log('UploadLog', &quot; !storeUrl | !uploadDir | !toFilename | !backupdir | !origin |&quot; );\n};\nconfig.macros.upload.UploadLog.prototype = config.lib.Log.prototype;\nconfig.macros.upload.UploadLog.prototype.startUpload = function(storeUrl, toFilename, uploadDir,  backupDir) {\n	var line = &quot; [[&quot; + config.lib.file.basename(storeUrl) + &quot;|&quot; + storeUrl + &quot;]] | &quot;;\n	line += uploadDir + &quot; | &quot; + toFilename + &quot; | &quot; + backupDir + &quot; |&quot;;\n	this.newLine(line);\n};\nconfig.macros.upload.UploadLog.prototype.endUpload = function() {\n	this.addToLine(&quot; Ok |&quot;);\n};\nconfig.macros.upload.basename = config.lib.file.basename;\nconfig.macros.upload.dirname = config.lib.file.dirname;\nconfig.macros.upload.toRootUrl = function (storeUrl, username)\n{\n	return root = (this.dirname(storeUrl)?this.dirname(storeUrl):this.dirname(document.location.toString()));\n}\nconfig.macros.upload.toDirUrl = function (storeUrl,  uploadDir, username)\n{\n	var root = this.toRootUrl(storeUrl, username);\n	if (uploadDir &amp;&amp; uploadDir != '.')\n		root = root + '/' + uploadDir;\n	return root;\n}\nconfig.macros.upload.toFileUrl = function (storeUrl, toFilename,  uploadDir, username)\n{\n	return this.toDirUrl(storeUrl, uploadDir, username) + '/' + toFilename;\n}\nconfig.macros.upload.upload = function(storeUrl, toFilename, uploadDir, backupDir, username, password)\n{\n	// parameters initialization\n	storeUrl = (storeUrl ? storeUrl : config.options.txtUploadStoreUrl);\n	toFilename = (toFilename ? toFilename : config.options.txtUploadFilename);\n	backupDir = (backupDir ? backupDir : config.options.txtUploadBackupDir);\n	uploadDir = (uploadDir ? uploadDir : config.options.txtUploadDir);\n	username = (username ? username : config.options.txtUploadUserName);\n	password = config.options.pasUploadPassword; // for security reason no password as macro parameter\n	if (!password || password === '') {\n		alert(config.macros.upload.messages.passwordEmpty);\n		return;\n	}\n	if (storeUrl === '') {\n		storeUrl = config.macros.upload.defaultStoreScript;\n	}\n	if (config.lib.file.dirname(storeUrl) === '') {\n		storeUrl = config.lib.file.dirname(document.location.toString())+'/'+storeUrl;\n	}\n	if (toFilename === '') {\n		toFilename = config.lib.file.basename(document.location.toString());\n	}\n\n	clearMessage();\n	// only for forcing the message to display\n	 if (version.major &lt; 2)\n		store.notifyAll();\n	if (!storeUrl) {\n		alert(config.macros.upload.messages.urlParamMissing);\n		return;\n	}\n	// Check that file is not locked\n	if (window.BidiX &amp;&amp; BidiX.GroupAuthoring &amp;&amp; BidiX.GroupAuthoring.lock) {\n		if (BidiX.GroupAuthoring.lock.isLocked() &amp;&amp; !BidiX.GroupAuthoring.lock.isMyLock()) {\n			alert(config.macros.upload.messages.fileLocked);\n			return;\n		}\n	}\n	\n	var log = new this.UploadLog();\n	log.startUpload(storeUrl, toFilename, uploadDir,  backupDir);\n	if (document.location.toString().substr(0,5) == &quot;file:&quot;) {\n		saveChanges();\n	}\n	var toDir = config.macros.upload.toDirUrl(storeUrl, toFilename, uploadDir, username);\n	displayMessage(config.macros.upload.messages.aboutToUpload.format([toDir]), toDir);\n	this.uploadChanges(storeUrl, toFilename, uploadDir, backupDir, username, password);\n	if(config.options.chkGenerateAnRssFeed) {\n		//var rssContent = convertUnicodeToUTF8(generateRss());\n		var rssContent = generateRss();\n		var rssPath = toFilename.substr(0,toFilename.lastIndexOf(&quot;.&quot;)) + &quot;.xml&quot;;\n		this.uploadContent(rssContent, storeUrl, rssPath, uploadDir, '', username, password, \n			function (responseText) {\n				if (responseText.substring(0,1) != '0') {\n					displayMessage(config.macros.upload.messages.rssFileNotUploaded.format([rssPath]));\n				}\n				else {\n					var toFileUrl = config.macros.upload.toFileUrl(storeUrl, rssPath, uploadDir, username);\n					displayMessage(config.macros.upload.messages.rssFileUploaded.format(\n						[toFileUrl]), toFileUrl);\n				}\n				// for debugging store.php uncomment last line\n				//DEBUG alert(responseText);\n			});\n	}\n	return;\n};\n\nconfig.macros.upload.uploadChanges = function(storeUrl, toFilename, uploadDir, backupDir, \n		username, password) {\n	var original;\n	if (document.location.toString().substr(0,4) == &quot;http&quot;) {\n		original =  this.download(storeUrl, toFilename, uploadDir, backupDir, username, password);\n		return;\n	}\n	else {\n		// standard way : Local file\n		\n		original = loadFile(getLocalPath(document.location.toString()));\n		if(window.Components) {\n			// it's a mozilla browser\n			try {\n				netscape.security.PrivilegeManager.enablePrivilege(&quot;UniversalXPConnect&quot;);\n				var converter = Components.classes[&quot;@mozilla.org/intl/scriptableunicodeconverter&quot;]\n									.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);\n				converter.charset = &quot;UTF-8&quot;;\n				original = converter.ConvertToUnicode(original);\n			}\n			catch(e) {\n			}\n		}\n	}\n	//DEBUG alert(original);\n	this.uploadChangesFrom(original, storeUrl, toFilename, uploadDir, backupDir, \n		username, password);\n};\n\nconfig.macros.upload.uploadChangesFrom = function(original, storeUrl, toFilename, uploadDir, backupDir, \n		username, password) {\n	var startSaveArea = '&lt;div id=&quot;' + 'storeArea&quot;&gt;'; // Split up into two so that indexOf() of this source doesn't find it\n	var endSaveArea = '&lt;/d' + 'iv&gt;';\n	// Locate the storeArea div's\n	var posOpeningDiv = original.indexOf(startSaveArea);\n	var posClosingDiv = original.lastIndexOf(endSaveArea);\n	if((posOpeningDiv == -1) || (posClosingDiv == -1))\n		{\n		alert(config.messages.invalidFileError.format([document.location.toString()]));\n		return;\n		}\n	var revised = original.substr(0,posOpeningDiv + startSaveArea.length) + \n				allTiddlersAsHtml() + &quot;\sn\st\st&quot; +\n				original.substr(posClosingDiv);\n	var newSiteTitle;\n	if(version.major &lt; 2){\n		newSiteTitle = (getElementText(&quot;siteTitle&quot;) + &quot; - &quot; + getElementText(&quot;siteSubtitle&quot;)).htmlEncode();\n	} else {\n		newSiteTitle = (wikifyPlain (&quot;SiteTitle&quot;) + &quot; - &quot; + wikifyPlain (&quot;SiteSubtitle&quot;)).htmlEncode();\n	}\n\n	revised = revised.replaceChunk(&quot;&lt;title&quot;+&quot;&gt;&quot;,&quot;&lt;/title&quot;+&quot;&gt;&quot;,&quot; &quot; + newSiteTitle + &quot; &quot;);\n	revised = revised.replaceChunk(&quot;&lt;!--PRE-HEAD-START--&quot;+&quot;&gt;&quot;,&quot;&lt;!--PRE-HEAD-END--&quot;+&quot;&gt;&quot;,&quot;\sn&quot; + store.getTiddlerText(&quot;MarkupPreHead&quot;,&quot;&quot;) + &quot;\sn&quot;);\n	revised = revised.replaceChunk(&quot;&lt;!--POST-HEAD-START--&quot;+&quot;&gt;&quot;,&quot;&lt;!--POST-HEAD-END--&quot;+&quot;&gt;&quot;,&quot;\sn&quot; + store.getTiddlerText(&quot;MarkupPostHead&quot;,&quot;&quot;) + &quot;\sn&quot;);\n	revised = revised.replaceChunk(&quot;&lt;!--PRE-BODY-START--&quot;+&quot;&gt;&quot;,&quot;&lt;!--PRE-BODY-END--&quot;+&quot;&gt;&quot;,&quot;\sn&quot; + store.getTiddlerText(&quot;MarkupPreBody&quot;,&quot;&quot;) + &quot;\sn&quot;);\n	revised = revised.replaceChunk(&quot;&lt;!--POST-BODY-START--&quot;+&quot;&gt;&quot;,&quot;&lt;!--POST-BODY-END--&quot;+&quot;&gt;&quot;,&quot;\sn&quot; + store.getTiddlerText(&quot;MarkupPostBody&quot;,&quot;&quot;) + &quot;\sn&quot;);\n\n	var response = this.uploadContent(revised, storeUrl, toFilename, uploadDir, backupDir, \n		username, password, function (responseText) {\n					if (responseText.substring(0,1) != '0') {\n						alert(responseText);\n						displayMessage(config.macros.upload.messages.fileNotUploaded.format([getLocalPath(document.location.toString())]));\n					}\n					else {\n						if (uploadDir !== '') {\n							toFilename = uploadDir + &quot;/&quot; + config.macros.upload.basename(toFilename);\n						} else {\n							toFilename = config.macros.upload.basename(toFilename);\n						}\n						var toFileUrl = config.macros.upload.toFileUrl(storeUrl, toFilename, uploadDir, username);\n						if (responseText.indexOf(&quot;destfile:&quot;) &gt; 0) {\n							var destfile = responseText.substring(responseText.indexOf(&quot;destfile:&quot;)+9, \n							responseText.indexOf(&quot;\sn&quot;, responseText.indexOf(&quot;destfile:&quot;)));\n							toFileUrl = config.macros.upload.toRootUrl(storeUrl, username) + '/' + destfile;\n						}\n						else {\n							toFileUrl = config.macros.upload.toFileUrl(storeUrl, toFilename, uploadDir, username);\n						}\n						displayMessage(config.macros.upload.messages.mainFileUploaded.format(\n							[toFileUrl]), toFileUrl);\n						if (backupDir &amp;&amp; responseText.indexOf(&quot;backupfile:&quot;) &gt; 0) {\n							var backupFile = responseText.substring(responseText.indexOf(&quot;backupfile:&quot;)+11, \n							responseText.indexOf(&quot;\sn&quot;, responseText.indexOf(&quot;backupfile:&quot;)));\n							toBackupUrl = config.macros.upload.toRootUrl(storeUrl, username) + '/' + backupFile;\n							displayMessage(config.macros.upload.messages.backupFileStored.format(\n								[toBackupUrl]), toBackupUrl);\n						}\n						var log = new config.macros.upload.UploadLog();\n						log.endUpload();\n						store.setDirty(false);\n						// erase local lock\n						if (window.BidiX &amp;&amp; BidiX.GroupAuthoring &amp;&amp; BidiX.GroupAuthoring.lock) {\n							BidiX.GroupAuthoring.lock.eraseLock();\n							// change mtime with new mtime after upload\n							var mtime = responseText.substr(responseText.indexOf(&quot;mtime:&quot;)+6);\n							BidiX.GroupAuthoring.lock.mtime = mtime;\n						}\n						\n						\n					}\n					// for debugging store.php uncomment last line\n					//DEBUG alert(responseText);\n				}\n			);\n};\n\nconfig.macros.upload.uploadContent = function(content, storeUrl, toFilename, uploadDir, backupDir, \n		username, password, callbackFn) {\n	var boundary = &quot;---------------------------&quot;+&quot;AaB03x&quot;;		\n	var request;\n	try {\n		request = new XMLHttpRequest();\n		} \n	catch (e) { \n		request = new ActiveXObject(&quot;Msxml2.XMLHTTP&quot;); \n		}\n	if (window.netscape){\n			try {\n				if (document.location.toString().substr(0,4) != &quot;http&quot;) {\n					netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');}\n			}\n			catch (e) {}\n		}		\n	//DEBUG alert(&quot;user[&quot;+config.options.txtUploadUserName+&quot;] password[&quot; + config.options.pasUploadPassword + &quot;]&quot;);\n	// compose headers data\n	var sheader = &quot;&quot;;\n	sheader += &quot;--&quot; + boundary + &quot;\sr\snContent-disposition: form-data; name=\s&quot;&quot;;\n	sheader += config.macros.upload.formName +&quot;\s&quot;\sr\sn\sr\sn&quot;;\n	sheader += &quot;backupDir=&quot;+backupDir\n				+&quot;;user=&quot; + username \n				+&quot;;password=&quot; + password\n				+&quot;;uploaddir=&quot; + uploadDir;\n	// add lock attributes to sheader\n	if (window.BidiX &amp;&amp; BidiX.GroupAuthoring &amp;&amp; BidiX.GroupAuthoring.lock) {\n		var l = BidiX.GroupAuthoring.lock.myLock;\n		sheader += &quot;;lockuser=&quot; + l.user\n				+ &quot;;mtime=&quot; + l.mtime\n				+ &quot;;locktime=&quot; + l.locktime;\n	}\n	sheader += &quot;;;\sr\sn&quot;; \n	sheader += &quot;\sr\sn&quot; + &quot;--&quot; + boundary + &quot;\sr\sn&quot;;\n	sheader += &quot;Content-disposition: form-data; name=\s&quot;userfile\s&quot;; filename=\s&quot;&quot;+toFilename+&quot;\s&quot;\sr\sn&quot;;\n	sheader += &quot;Content-Type: &quot; + config.macros.upload.contentType + &quot;\sr\sn&quot;;\n	sheader += &quot;Content-Length: &quot; + content.length + &quot;\sr\sn\sr\sn&quot;;\n	// compose trailer data\n	var strailer = new String();\n	strailer = &quot;\sr\sn--&quot; + boundary + &quot;--\sr\sn&quot;;\n	//strailer = &quot;--&quot; + boundary + &quot;--\sr\sn&quot;;\n	var data;\n	data = sheader + content + strailer;\n	//request.open(&quot;POST&quot;, storeUrl, true, username, password);\n	try {\n		request.open(&quot;POST&quot;, storeUrl, true);		\n	}\n	catch(e) {\n		alert(config.macros.upload.messages.crossDomain + &quot;\snError:&quot; +e);\n		exit;\n	}\n	request.onreadystatechange = function () {\n				if (request.readyState == 4) {\n				     if (request.status == 200)\n						callbackFn(request.responseText);\n					else\n						alert(config.macros.upload.messages.errorUploadingContent + &quot;\snStatus: &quot;+request.status.statusText);\n				}\n		};\n	request.setRequestHeader(&quot;Content-Length&quot;,data.length);\n	request.setRequestHeader(&quot;Content-Type&quot;,&quot;multipart/form-data; boundary=&quot;+boundary);\n	request.send(data); \n};\n\n\nconfig.macros.upload.download = function(uploadUrl, uploadToFilename, uploadDir, uploadBackupDir, \n	username, password) {\n	var request;\n	try {\n		request = new XMLHttpRequest();\n	} \n	catch (e) { \n		request = new ActiveXObject(&quot;Msxml2.XMLHTTP&quot;); \n	}\n	try {\n		if (uploadUrl.substr(0,4) == &quot;http&quot;) {\n			netscape.security.PrivilegeManager.enablePrivilege(&quot;UniversalBrowserRead&quot;);\n			}\n		else {\n			netscape.security.PrivilegeManager.enablePrivilege(&quot;UniversalXPConnect&quot;);\n		}\n	} catch (e) { }\n	//request.open(&quot;GET&quot;, document.location.toString(), true, username, password);\n	try {\n		request.open(&quot;GET&quot;, document.location.toString(), true);\n	}\n	catch(e) {\n		alert(config.macros.upload.messages.crossDomain + &quot;\snError:&quot; +e);\n		exit;\n	}\n	\n	request.onreadystatechange = function () {\n		if (request.readyState == 4) {\n			if(request.status == 200) {\n				config.macros.upload.uploadChangesFrom(request.responseText, uploadUrl, \n					uploadToFilename, uploadDir, uploadBackupDir, username, password);\n			}\n			else\n				alert(config.macros.upload.messages.errorDownloading.format(\n					[document.location.toString()]) + &quot;\snStatus: &quot;+request.status.statusText);\n		}\n	};\n	request.send(null);\n};\n\n//}}}\n////===\n\n////+++!![Initializations]\n\n//{{{\nconfig.lib.options.init('txtUploadStoreUrl','store.php');\nconfig.lib.options.init('txtUploadFilename','');\nconfig.lib.options.init('txtUploadDir','');\nconfig.lib.options.init('txtUploadBackupDir','');\nconfig.lib.options.init('txtUploadUserName',config.options.txtUserName);\nconfig.lib.options.init('pasUploadPassword','');\nsetStylesheet(\n	&quot;.pasOptionInput {width: 11em;}\sn&quot;+\n	&quot;.txtOptionInput.txtUploadStoreUrl {width: 25em;}\sn&quot;+\n	&quot;.txtOptionInput.txtUploadFilename {width: 25em;}\sn&quot;+\n	&quot;.txtOptionInput.txtUploadDir {width: 25em;}\sn&quot;+\n	&quot;.txtOptionInput.txtUploadBackupDir {width: 25em;}\sn&quot;+\n	&quot;&quot;,\n	&quot;UploadOptionsStyles&quot;);\nif (document.location.toString().substr(0,4) == &quot;http&quot;) {\n	config.options.chkAutoSave = false; \n	saveOptionCookie('chkAutoSave');\n}\nconfig.shadowTiddlers.UploadDoc = &quot;[[Full Documentation|http://tiddlywiki.bidix.info/l#UploadDoc ]]\sn&quot;; \n\n//}}}\n////===\n\n////+++!![Core Hijacking]\n\n//{{{\nconfig.macros.saveChanges.label_orig_UploadPlugin = config.macros.saveChanges.label;\nconfig.macros.saveChanges.label = config.macros.upload.label.saveToDisk;\n\nconfig.macros.saveChanges.handler_orig_UploadPlugin = config.macros.saveChanges.handler;\n\nconfig.macros.saveChanges.handler = function(place)\n{\n	if ((!readOnly) &amp;&amp; (document.location.toString().substr(0,4) != &quot;http&quot;))\n		createTiddlyButton(place,this.label,this.prompt,this.onClick,null,null,this.accessKey);\n};\n\n//}}}\n////===\n</div>
<?php
	}
	recordTime_float("before print tiddly");
	if( sizeof($tiddlers)>0 )
	{
		foreach( $tiddlers as $t )
		{
			tiddler_outputDIV($t);
		}
	}
	recordTime_float("after print tiddly");

	//print time tiddly in debug mode
	if( $tiddlyCfg['developing']>0 )
	{
		recordTime_float("end of script");
		//$time[] = microtime_float("end of script");

		print "<div tiddler=\"ccTiddly_debug_time\" modified=\"000000000000\" modifier=\"ccTiddly\" created=\"000000000000\" version=\"1\" tags=\"debug\">";
		for( $i=1; $i<sizeof($time); $i++ )
		{
			print $time[$i]["name"]." = ".(round($time[$i]["time"]-$time[0]["time"],3))."s\\n";
		}
		print "</div>";
	}
?>
	</div>
<?php /*print cct_print_form($standalone);/*cct*/ ?>
<!--POST-BODY-START-->
<?php 
	if( isset( $tiddlers['MarkupPostBody'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPostBody']['body']);
	}
?>
<!--POST-BODY-END-->
	</body>
</html>
