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
$cct_base = "";
include_once($cct_base."includes/header.php");

include_once($cct_base."includes/print.php");
recordTime_float("includes");


if ($_POST['logout'] || $_REQUEST['logout'])
{
	user_logout('You have logged out.');
	header("Location: ".str_replace("index.php", "", $_SERVER['PHP_SELF']));
}	
	
	echo $_REQUEST['msg'];

///////////////////////////////RSS
	if( strcmp($cctAction,"RSS")==0 )
	{
		include_once($cct_base."handle/rss.php");
		exit;
	}
///////////////////////////////CC: user variable defined in header and $user['verified'] can be used directly to check user validation
 // check to see if user is logged in or not and then assign permissions accordingly. 
//if ($user['verified'] = user_session_validate())
if ($user['verified'] == user_session_validate())
{
 $workspace_permissions = $tiddlyCfg['default_user_perm'];
	
} else {

	$workspace_permissions = $tiddlyCfg['default_anonymous_perm'];
}

if ($workspace_permissions == "")
{
	$workspace_permissions = "DDDD";
}

$workspace_read = substr($workspace_permissions, 0, 1);
$workspace_create = substr($workspace_permissions, 1, 1);
$workspace_udate = substr($workspace_permissions, 2, 1);
$workspace_delete = substr($workspace_permissions, 3, 1);
$workspace_settings_count= count($workspace_settings);
//echo $user['verified'];
//echo $workspace_permissions;

// display open id bits if it is enabled. 
//if ($tiddlyCfg['pref']['openid_enabled'] ==1)
//{

	require_once "includes/o/common.php";





//}

	//check if getting revision
	if( isset($_GET['title']) )
	{
		$tiddlers = getAllVersionTiddly($title);
		$t = array();
		foreach( $tiddlers as $tid )
		{
			$tid['title'] .= " revision ".$tid['revision'];
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
<base href='http://<?php echo $_SERVER['SERVER_NAME'];?>/<?php echo $tiddlyCfg['pref']['base_folder'];?>/' />
<head>
<script type="text/javascript">
//<![CDATA[
var version = {title: "TiddlyWiki", major: 2, minor: 2, revision: 5, date: new Date("Aug 24, 2007"), extensions: {}};
//]]>
</script>
<!--
TiddlyWiki created by Jeremy Ruston, (jeremy [at] osmosoft [dot] com)

Copyright (c) UnaMesa Association 2004-2007

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this
list of conditions and the following disclaimer in the documentation and/or other
materials provided with the distribution.

Neither the name of the UnaMesa Association nor the names of its contributors may be
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
		
		if(is_file($tiddlyCfg['pref']['upload_dir'] .$tiddlyCfg['workspace_name']."/$config.xml"))
			print "<link rel='alternate' type='application/rss+xml' title='RSS' href='".$tiddlyCfg['workspace_name']."/$config.xml'>";

	}
?>
<!--PRE-HEAD-END-->
<title> TiddlyWiki - a reusable non-linear personal web notebook </title>
<?php print cct_print_includes($standalone);/*cct*/ ?>
<!--script below are ccT plugins-->
<?php print cct_print_plugins($standalone);/*cct*/ ?>
<!--End of ccT plugins-->

<style type="text/css">
#saveTest {display:none;}
#messageArea {display:none;}
#copyright {display:none;}
#storeArea {display:none;}
#storeArea div {padding:0.5em; margin:1em 0em 0em 0em; border-color:#fff #666 #444 #ddd; border-style:solid; border-width:2px; overflow:auto;}
#shadowArea {display:none;}
#javascriptWarning {width:100%; text-align:center; font-weight:bold; background-color:#dd1100; color:#fff; padding:1em 0em;}
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
<body onload="main();" onunload="if(window.checkUnsavedChanges) checkUnsavedChanges(); if(window.scrubNodes) scrubNodes(document.body);">
<!--PRE-BODY-START-->
<?php 

	if( isset( $tiddlers['MarkupPreBody'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPreBody']['body']);
	}
?>
<!--PRE-BODY-END-->
<div id="copyright">
Welcome to TiddlyWiki created by Jeremy Ruston, Copyright &copy; 2007 UnaMesa Association
</div>
<noscript>
	<div id="javascriptWarning">This page requires JavaScript to function properly.<br /><br />If you are using Microsoft Internet Explorer you may need to click on the yellow bar above and select 'Allow Blocked Content'. You must then click 'Yes' on the following security warning.</div>
</noscript>
<div id="saveTest"></div>
<div id="backstageCloak"></div>
<div id="backstageButton"></div>
<div id="backstageArea"><div id="backstageToolbar"></div></div>
<div id="backstage">
	<div id="backstagePanel"></div>
</div>
<div id="contentWrapper"></div>
<div id="contentStash"></div>
<div id="shadowArea">
<div tiddler="ColorPalette" tags="">Background: #fff\nForeground: #000\nPrimaryPale: #8cf\nPrimaryLight: #18f\nPrimaryMid: #04b\nPrimaryDark: #014\nSecondaryPale: #ffc\nSecondaryLight: #fe8\nSecondaryMid: #db4\nSecondaryDark: #841\nTertiaryPale: #eee\nTertiaryLight: #ccc\nTertiaryMid: #999\nTertiaryDark: #666\nError: #f88</div>
<div tiddler="EditTemplate" tags="">&lt;!--{{{--&gt;\n&lt;div class='toolbar' macro='toolbar +saveTiddler -cancelTiddler deleteTiddler'&gt;&lt;/div&gt;\n&lt;div class='title' macro='view title'&gt;&lt;/div&gt;\n&lt;div class='editor' macro='edit title'&gt;&lt;/div&gt;\n&lt;div macro='annotations'&gt;&lt;/div&gt;\n&lt;div class='editor' macro='edit text'&gt;&lt;/div&gt;\n&lt;div class='editor' macro='edit tags'&gt;&lt;/div&gt;&lt;div class='editorFooter'&gt;&lt;span macro='message views.editor.tagPrompt'&gt;&lt;/span&gt;&lt;span macro='tagChooser'&gt;&lt;/span&gt;&lt;/div&gt;\n&lt;!--}}}--&gt;</div>

<div  tiddler='CreateWorkspace' tags=''>&lt;&lt;ccCreateWorkspace&gt;&gt;</div>

<?


///////////////////////////// CREATE LOGIN/CREATE SHADOW TIDDLERS ///////////////////////////////////////////////////////////



$cut_down_view = "<div tiddler='StyleSheetLayout' tags=''>/*{{{*/\n* html .tiddler {height:1%;}\n\nbody {font-size:.75em; font-family:arial,helvetica; margin:0; padding:0;}\n\nh1,h2,h3,h4,h5,h6 {font-weight:bold; text-decoration:none;}\nh1,h2,h3 {padding-bottom:1px; margin-top:1.2em;margin-bottom:0.3em;}\nh4,h5,h6 {margin-top:1em;}\nh1 {font-size:1.35em;}\nh2 {font-size:1.25em;}\nh3 {font-size:1.1em;}\nh4 {font-size:1em;}\nh5 {font-size:.9em;}\n\nhr {height:1px;}\n\na {text-decoration:none;}\n\ndt {font-weight:bold;}\n\nol {list-style-type:decimal;}\nol ol {list-style-type:lower-alpha;}\nol ol ol {list-style-type:lower-roman;}\nol ol ol ol {list-style-type:decimal;}\nol ol ol ol ol {list-style-type:lower-alpha;}\nol ol ol ol ol ol {list-style-type:lower-roman;}\nol ol ol ol ol ol ol {list-style-type:decimal;}\n\n.txtOptionInput {width:11em;}\n\n#contentWrapper .chkOptionInput {border:0;}\n\n.externalLink {text-decoration:underline;}\n\n.indent {margin-left:3em;}\n.outdent {margin-left:3em; text-indent:-3em;}\ncode.escaped {white-space:nowrap;}\n\n.tiddlyLinkExisting {font-weight:bold;}\n.tiddlyLinkNonExisting {font-style:italic;}\n\n/* the 'a' is required for IE, otherwise it renders the whole tiddler in bold */\na.tiddlyLinkNonExisting.shadow {font-weight:bold;}\n\n#mainMenu .tiddlyLinkExisting,\n	#mainMenu .tiddlyLinkNonExisting,\n	#sidebarTabs .tiddlyLinkNonExisting {font-weight:normal; font-style:normal;}\n#sidebarTabs .tiddlyLinkExisting {font-weight:bold; font-style:normal;}\n\n.header {position:relative;}\n.header a:hover {background:transparent;}\n.headerShadow {position:relative; padding:4.5em 0em 1em 1em; left:-1px; top:-1px;}\n.headerForeground {position:absolute; padding:4.5em 0em 1em 1em; left:0px; top:0px;}\n\n.siteTitle {font-size:3em;}\n.siteSubtitle {font-size:1.2em;}\n\n#mainMenu {position:absolute; left:0; width:10em; text-align:right; line-height:1.6em; padding:1.5em 0.5em 0.5em 0.5em; font-size:1.1em;}\n\n#sidebar {position:absolute; right:3px; width:16em; font-size:.9em;}\n#sidebarOptions {padding-top:0.3em;}\n#sidebarOptions a {margin:0em 0.2em; padding:0.2em 0.3em; display:block;}\n#sidebarOptions input {margin:0.4em 0.5em;}\n#sidebarOptions .sliderPanel {margin-left:1em; padding:0.5em; font-size:.85em;}\n#sidebarOptions .sliderPanel a {font-weight:bold; display:inline; padding:0;}\n#sidebarOptions .sliderPanel input {margin:0 0 .3em 0;}\n#sidebarTabs .tabContents {width:15em; overflow:hidden;}\n\n.wizard {padding:0.1em 1em 0em 2em;}\n.wizard h1 {font-size:2em; font-weight:bold; background:none; padding:0em 0em 0em 0em; margin:0.4em 0em 0.2em 0em;}\n.wizard h2 {font-size:1.2em; font-weight:bold; background:none; padding:0em 0em 0em 0em; margin:0.4em 0em 0.2em 0em;}\n.wizardStep {padding:1em 1em 1em 1em;}\n.wizard .button {margin:0.5em 0em 0em 0em; font-size:1.2em;}\n.wizardFooter {padding:0.8em 0.4em 0.8em 0em;}\n.wizardFooter .status {padding:0em 0.4em 0em 0.4em; margin-left:1em;}\n.wizard .button {padding:0.1em 0.2em 0.1em 0.2em;}\n\n#messageArea {position:fixed; top:2em; right:0em; margin:0.5em; padding:0.5em; z-index:2000; _position:absolute;}\n.messageToolbar {display:block; text-align:right; padding:0.2em 0.2em 0.2em 0.2em;}\n#messageArea a {text-decoration:underline;}\n\n.tiddlerPopupButton {padding:0.2em 0.2em 0.2em 0.2em;}\n.popupTiddler {position: absolute; z-index:300; padding:1em 1em 1em 1em; margin:0;}\n\n.popup {position:absolute; z-index:300; font-size:.9em; padding:0; list-style:none; margin:0;}\n.popup .popupMessage {padding:0.4em;}\n.popup hr {display:block; height:1px; width:auto; padding:0; margin:0.2em 0em;}\n.popup li.disabled {padding:0.4em;}\n.popup li a {display:block; padding:0.4em; font-weight:normal; cursor:pointer;}\n.listBreak {font-size:1px; line-height:1px;}\n.listBreak div {margin:2px 0;}\n\n.tabset {padding:1em 0em 0em 0.5em;}\n.tab {margin:0em 0em 0em 0.25em; padding:2px;}\n.tabContents {padding:0.5em;}\n.tabContents ul, .tabContents ol {margin:0; padding:0;}\n.txtMainTab .tabContents li {list-style:none;}\n.tabContents li.listLink { margin-left:.75em;}\n\n#contentWrapper {display:block;}\n#splashScreen {display:none;}\n\n#displayArea {margin:1em 17em 0em 14em;}\n\n.toolbar {text-align:right; font-size:.9em;}\n\n.tiddler {padding:1em 1em 0em 1em;}\n\n.missing .viewer,.missing .title {font-style:italic;}\n\n.title {font-size:1.6em; font-weight:bold;}\n\n.missing .subtitle {display:none;}\n.subtitle {font-size:1.1em;}\n\n.tiddler .button {padding:0.2em 0.4em;}\n\n.tagging {margin:0.5em 0.5em 0.5em 0; float:left; display:none;}\n.isTag .tagging {display:block;}\n.tagged {margin:0.5em; float:right;}\n.tagging, .tagged {font-size:0.9em; padding:0.25em;}\n.tagging ul, .tagged ul {list-style:none; margin:0.25em; padding:0;}\n.tagClear {clear:both;}\n\n.footer {font-size:.9em;}\n.footer li {display:inline;}\n\n.annotation {padding:0.5em; margin:0.5em;}\n\n* html .viewer pre {width:99%; padding:0 0 1em 0;}\n.viewer {line-height:1.4em; padding-top:0.5em;}\n.viewer .button {margin:0em 0.25em; padding:0em 0.25em;}\n.viewer blockquote {line-height:1.5em; padding-left:0.8em;margin-left:2.5em;}\n.viewer ul, .viewer ol {margin-left:0.5em; padding-left:1.5em;}\n\n.viewer table, table.twtable {border-collapse:collapse; margin:0.8em 1.0em;}\n.viewer th, .viewer td, .viewer tr,.viewer caption,.twtable th, .twtable td, .twtable tr,.twtable caption {padding:3px;}\ntable.listView {font-size:0.85em; margin:0.8em 1.0em;}\ntable.listView th, table.listView td, table.listView tr {padding:0px 3px 0px 3px;}\n\n.viewer pre {padding:0.5em; margin-left:0.5em; font-size:1.2em; line-height:1.4em; overflow:auto;}\n.viewer code {font-size:1.2em; line-height:1.4em;}\n\n.editor {font-size:1.1em;}\n.editor input, .editor textarea {display:block; width:100%; font:inherit;}\n.editorFooter {padding:0.25em 0em; font-size:.9em;}\n.editorFooter .button {padding-top:0px; padding-bottom:0px;}\n\n.fieldsetFix {border:0; padding:0; margin:1px 0px 1px 0px;}\n\n.sparkline {line-height:1em;}\n.sparktick {outline:0;}\n\n.zoomer {font-size:1.1em; position:absolute; overflow:hidden;}\n.zoomer div {padding:1em;}\n\n* html #backstage {width:99%;}\n* html #backstageArea {width:99%;}\n#backstageArea {display:none; position:relative; overflow: hidden; z-index:150; padding:0.3em 0.5em 0.3em 0.5em;}\n#backstageToolbar {position:relative;}\n#backstageArea a {font-weight:bold; margin-left:0.5em; padding:0.3em 0.5em 0.3em 0.5em;}\n#backstageButton {display:none; position:absolute; z-index:175; top:0em; right:0em;}\n#backstageButton a {padding:0.1em 0.4em 0.1em 0.4em; margin:0.1em 0.1em 0.1em 0.1em;}\n#backstage {position:relative; width:100%; z-index:50;}\n#backstagePanel {display:none; z-index:100; position:absolute; margin:0em 3em 0em 3em; padding:1em 1em 1em 1em;}\n.backstagePanelFooter {padding-top:0.2em; float:right;}\n.backstagePanelFooter a {padding:0.2em 0.4em 0.2em 0.4em;}\n#backstageCloak {display:none; z-index:20; position:absolute; width:100%; height:100px;}\n\n.whenBackstage {display:none;}\n.backstageVisible .whenBackstage {display:block;}  #sidebar {display:none;} \n/*}}}*/</div>

<div tiddler='ViewTemplate' tags=''>&lt;!--{{{--&gt;\n&lt;div class='title' macro='view title'&gt;&lt;/div&gt;\n\n&lt;div class='viewer' macro='view text wikified'&gt;&lt;/div&gt;\n&lt;div class='tagClear'&gt;&lt;/div&gt;\n&lt;!--}}}--&gt;</div>
";

$logged_in_view = "<div tiddler='ViewTemplate' tags=''>&lt;!--{{{--&gt;\n&lt;div class='toolbar' macro='toolbar closeTiddler closeOthers +editTiddler &gt; fields syncing permalink references jump'&gt;&lt;/div&gt;\n&lt;div class='title' macro='view title'&gt;&lt;/div&gt;\n&lt;div class='subtitle'&gt;&lt;span macro='view modifier link'&gt;&lt;/span&gt;, &lt;span macro='view modified date'&gt;&lt;/span&gt; (&lt;span macro='message views.wikified.createdPrompt'&gt;&lt;/span&gt; &lt;span macro='view created date'&gt;&lt;/span&gt;)&lt;/div&gt;\n&lt;div class='tagging' macro='tagging'&gt;&lt;/div&gt;\n&lt;div class='tagged' macro='tags'&gt;&lt;/div&gt;\n&lt;div class='viewer' macro='view text wikified'&gt;&lt;/div&gt;\n&lt;div class='tagClear'&gt;&lt;/div&gt;\n&lt;!--}}}--&gt;</div>
<div tiddler='StyleSheetLayout' tags=''>/*{{{*/\n* html .tiddler {height:1%;}\n\nbody {font-size:.75em; font-family:arial,helvetica; margin:0; padding:0;}\n\nh1,h2,h3,h4,h5,h6 {font-weight:bold; text-decoration:none;}\nh1,h2,h3 {padding-bottom:1px; margin-top:1.2em;margin-bottom:0.3em;}\nh4,h5,h6 {margin-top:1em;}\nh1 {font-size:1.35em;}\nh2 {font-size:1.25em;}\nh3 {font-size:1.1em;}\nh4 {font-size:1em;}\nh5 {font-size:.9em;}\n\nhr {height:1px;}\n\na {text-decoration:none;}\n\ndt {font-weight:bold;}\n\nol {list-style-type:decimal;}\nol ol {list-style-type:lower-alpha;}\nol ol ol {list-style-type:lower-roman;}\nol ol ol ol {list-style-type:decimal;}\nol ol ol ol ol {list-style-type:lower-alpha;}\nol ol ol ol ol ol {list-style-type:lower-roman;}\nol ol ol ol ol ol ol {list-style-type:decimal;}\n\n.txtOptionInput {width:11em;}\n\n#contentWrapper .chkOptionInput {border:0;}\n\n.externalLink {text-decoration:underline;}\n\n.indent {margin-left:3em;}\n.outdent {margin-left:3em; text-indent:-3em;}\ncode.escaped {white-space:nowrap;}\n\n.tiddlyLinkExisting {font-weight:bold;}\n.tiddlyLinkNonExisting {font-style:italic;}\n\n/* the 'a' is required for IE, otherwise it renders the whole tiddler in bold */\na.tiddlyLinkNonExisting.shadow {font-weight:bold;}\n\n#mainMenu .tiddlyLinkExisting,\n	#mainMenu .tiddlyLinkNonExisting,\n	#sidebarTabs .tiddlyLinkNonExisting {font-weight:normal; font-style:normal;}\n#sidebarTabs .tiddlyLinkExisting {font-weight:bold; font-style:normal;}\n\n.header {position:relative;}\n.header a:hover {background:transparent;}\n.headerShadow {position:relative; padding:4.5em 0em 1em 1em; left:-1px; top:-1px;}\n.headerForeground {position:absolute; padding:4.5em 0em 1em 1em; left:0px; top:0px;}\n\n.siteTitle {font-size:3em;}\n.siteSubtitle {font-size:1.2em;}\n\n#mainMenu {position:absolute; left:0; width:10em; text-align:right; line-height:1.6em; padding:1.5em 0.5em 0.5em 0.5em; font-size:1.1em;}\n\n#sidebar {position:absolute; right:3px; width:16em; font-size:.9em;}\n#sidebarOptions {padding-top:0.3em;}\n#sidebarOptions a {margin:0em 0.2em; padding:0.2em 0.3em; display:block;}\n#sidebarOptions input {margin:0.4em 0.5em;}\n#sidebarOptions .sliderPanel {margin-left:1em; padding:0.5em; font-size:.85em;}\n#sidebarOptions .sliderPanel a {font-weight:bold; display:inline; padding:0;}\n#sidebarOptions .sliderPanel input {margin:0 0 .3em 0;}\n#sidebarTabs .tabContents {width:15em; overflow:hidden;}\n\n.wizard {padding:0.1em 1em 0em 2em;}\n.wizard h1 {font-size:2em; font-weight:bold; background:none; padding:0em 0em 0em 0em; margin:0.4em 0em 0.2em 0em;}\n.wizard h2 {font-size:1.2em; font-weight:bold; background:none; padding:0em 0em 0em 0em; margin:0.4em 0em 0.2em 0em;}\n.wizardStep {padding:1em 1em 1em 1em;}\n.wizard .button {margin:0.5em 0em 0em 0em; font-size:1.2em;}\n.wizardFooter {padding:0.8em 0.4em 0.8em 0em;}\n.wizardFooter .status {padding:0em 0.4em 0em 0.4em; margin-left:1em;}\n.wizard .button {padding:0.1em 0.2em 0.1em 0.2em;}\n\n#messageArea {position:fixed; top:2em; right:0em; margin:0.5em; padding:0.5em; z-index:2000; _position:absolute;}\n.messageToolbar {display:block; text-align:right; padding:0.2em 0.2em 0.2em 0.2em;}\n#messageArea a {text-decoration:underline;}\n\n.tiddlerPopupButton {padding:0.2em 0.2em 0.2em 0.2em;}\n.popupTiddler {position: absolute; z-index:300; padding:1em 1em 1em 1em; margin:0;}\n\n.popup {position:absolute; z-index:300; font-size:.9em; padding:0; list-style:none; margin:0;}\n.popup .popupMessage {padding:0.4em;}\n.popup hr {display:block; height:1px; width:auto; padding:0; margin:0.2em 0em;}\n.popup li.disabled {padding:0.4em;}\n.popup li a {display:block; padding:0.4em; font-weight:normal; cursor:pointer;}\n.listBreak {font-size:1px; line-height:1px;}\n.listBreak div {margin:2px 0;}\n\n.tabset {padding:1em 0em 0em 0.5em;}\n.tab {margin:0em 0em 0em 0.25em; padding:2px;}\n.tabContents {padding:0.5em;}\n.tabContents ul, .tabContents ol {margin:0; padding:0;}\n.txtMainTab .tabContents li {list-style:none;}\n.tabContents li.listLink { margin-left:.75em;}\n\n#contentWrapper {display:block;}\n#splashScreen {display:none;}\n\n#displayArea {margin:1em 17em 0em 14em;}\n\n.toolbar {text-align:right; font-size:.9em;}\n\n.tiddler {padding:1em 1em 0em 1em;}\n\n.missing .viewer,.missing .title {font-style:italic;}\n\n.title {font-size:1.6em; font-weight:bold;}\n\n.missing .subtitle {display:none;}\n.subtitle {font-size:1.1em;}\n\n.tiddler .button {padding:0.2em 0.4em;}\n\n.tagging {margin:0.5em 0.5em 0.5em 0; float:left; display:none;}\n.isTag .tagging {display:block;}\n.tagged {margin:0.5em; float:right;}\n.tagging, .tagged {font-size:0.9em; padding:0.25em;}\n.tagging ul, .tagged ul {list-style:none; margin:0.25em; padding:0;}\n.tagClear {clear:both;}\n\n.footer {font-size:.9em;}\n.footer li {display:inline;}\n\n.annotation {padding:0.5em; margin:0.5em;}\n\n* html .viewer pre {width:99%; padding:0 0 1em 0;}\n.viewer {line-height:1.4em; padding-top:0.5em;}\n.viewer .button {margin:0em 0.25em; padding:0em 0.25em;}\n.viewer blockquote {line-height:1.5em; padding-left:0.8em;margin-left:2.5em;}\n.viewer ul, .viewer ol {margin-left:0.5em; padding-left:1.5em;}\n\n.viewer table, table.twtable {border-collapse:collapse; margin:0.8em 1.0em;}\n.viewer th, .viewer td, .viewer tr,.viewer caption,.twtable th, .twtable td, .twtable tr,.twtable caption {padding:3px;}\ntable.listView {font-size:0.85em; margin:0.8em 1.0em;}\ntable.listView th, table.listView td, table.listView tr {padding:0px 3px 0px 3px;}\n\n.viewer pre {padding:0.5em; margin-left:0.5em; font-size:1.2em; line-height:1.4em; overflow:auto;}\n.viewer code {font-size:1.2em; line-height:1.4em;}\n\n.editor {font-size:1.1em;}\n.editor input, .editor textarea {display:block; width:100%; font:inherit;}\n.editorFooter {padding:0.25em 0em; font-size:.9em;}\n.editorFooter .button {padding-top:0px; padding-bottom:0px;}\n\n.fieldsetFix {border:0; padding:0; margin:1px 0px 1px 0px;}\n\n.sparkline {line-height:1em;}\n.sparktick {outline:0;}\n\n.zoomer {font-size:1.1em; position:absolute; overflow:hidden;}\n.zoomer div {padding:1em;}\n\n* html #backstage {width:99%;}\n* html #backstageArea {width:99%;}\n#backstageArea {display:none; position:relative; overflow: hidden; z-index:150; padding:0.3em 0.5em 0.3em 0.5em;}\n#backstageToolbar {position:relative;}\n#backstageArea a {font-weight:bold; margin-left:0.5em; padding:0.3em 0.5em 0.3em 0.5em;}\n#backstageButton {display:none; position:absolute; z-index:175; top:0em; right:0em;}\n#backstageButton a {padding:0.1em 0.4em 0.1em 0.4em; margin:0.1em 0.1em 0.1em 0.1em;}\n#backstage {position:relative; width:100%; z-index:50;}\n#backstagePanel {display:none; z-index:100; position:absolute; margin:0em 3em 0em 3em; padding:1em 1em 1em 1em;}\n.backstagePanelFooter {padding-top:0.2em; float:right;}\n.backstagePanelFooter a {padding:0.2em 0.4em 0.2em 0.4em;}\n#backstageCloak {display:none; z-index:20; position:absolute; width:100%; height:100px;}\n\n.whenBackstage {display:none;}\n.backstageVisible .whenBackstage {display:block;}  \n/*}}}*/</div>";


if (!$user['verified'])
{
	$default_tiddlers = '[[Please Login]]';
	echo "<div  tiddler='DefaultTiddlers' tags=''>".$default_tiddlers."[[GettingStarted]]</div>";
}

// TODO : check the user has permission to create before display CreateWorkspace in default tiddlers
$create_workspace = "<div tiddler='SiteTitle' tags=''>Error 404 - Workspace does not exist</div>
<div  tiddler='MainMenu' tags=''></div>
<div  tiddler='SiteSubtitle' tags=''>Create it below </div>

<div  tiddler='GettingStarted' tags=''>a simple explainaition on how to use TiddlyWiki &lt;br /&gt;[[Logout|".$_SERVER['PHP_SELF']."?logout=1&]]</div>
<div  tiddler='DefaultTiddlers' tags=''>".$default_tiddlers."[[CreateWorkspace]][[GettingStarted]]</div>";


$login = "<div tiddler='Please Login' tags=''> &lt;&lt;ccLogin&gt;&gt;</div>	";
	
	
if ($workspace_settings_count < 1)
{   // workspace does not exist
	echo $cut_down_view;
	echo $create_workspace;
	echo $login;
} 
else
{ // workspace exists 
	echo $logged_in_view;
	echo $login;
}

///////////////////////////// END  LOGIN/CREATE SHADOW TIDDLERS ///////////////////////////////////////////////////////////
?>
<div tiddler="OptionsPanel" tags="">These InterfaceOptions for customising TiddlyWiki are saved in your browser\n\nYour username for signing your edits. Write it as a WikiWord (eg JoeBloggs)\n\n&lt;&lt;option txtUserName&gt;&gt;\n&lt;&lt;option chkSaveBackups&gt;&gt; SaveBackups\n&lt;&lt;option chkAutoSave&gt;&gt; AutoSave\n&lt;&lt;option chkRegExpSearch&gt;&gt; RegExpSearch\n&lt;&lt;option chkCaseSensitiveSearch&gt;&gt; CaseSensitiveSearch\n&lt;&lt;option chkAnimate&gt;&gt; EnableAnimations\n\n----\nAlso see AdvancedOptions</div>
<div tiddler="PageTemplate" tags="">&lt;!--{{{--&gt;\n&lt;div 	class='header' macro='gradient vert [[ColorPalette::PrimaryLight]] [[ColorPalette::PrimaryMid]]'&gt;\n&lt;div class='headerShadow'&gt;\n&lt;span class='siteTitle' refresh='content' tiddler='SiteTitle'&gt;&lt;/span&gt;&amp;nbsp;\n&lt;span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'&gt;&lt;/span&gt;\n&lt;/div&gt;\n&lt;div class='headerForeground'&gt;\n&lt;span class='siteTitle' refresh='content' tiddler='SiteTitle'&gt;&lt;/span&gt;&amp;nbsp;\n&lt;span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'&gt;&lt;/span&gt;\n&lt;/div&gt;\n&lt;/div&gt;\n&lt;div id='mainMenu' refresh='content' tiddler='MainMenu'&gt;&lt;/div&gt;\n&lt;div id='sidebar'&gt;\n&lt;div id='sidebarOptions' refresh='content' tiddler='SideBarOptions'&gt;&lt;/div&gt;\n&lt;div id='sidebarTabs' refresh='content' force='true' tiddler='SideBarTabs'&gt;&lt;/div&gt;\n&lt;/div&gt;\n&lt;div id='displayArea'&gt;\n&lt;div id='messageArea'&gt;&lt;/div&gt;\n&lt;div id='tiddlerDisplay'&gt;&lt;/div&gt;\n&lt;/div&gt;\n&lt;!--}}}--&gt;</div>
<div tiddler="StyleSheetColors" tags="">/*{{{*/\nbody {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}\n\na {color:[[ColorPalette::PrimaryMid]];}\na:hover {background-color:[[ColorPalette::PrimaryMid]]; color:[[ColorPalette::Background]];}\na img {border:0;}\n\na,h2,h3,h4,h5,h6 {color:[[ColorPalette::SecondaryDark]]; background:transparent;}\nh1 {border-bottom:2px solid [[ColorPalette::TertiaryLight]];}\nh2,h3 {border-bottom:1px solid [[ColorPalette::TertiaryLight]];}\n\n.button {color:[[ColorPalette::PrimaryDark]]; border:1px solid [[ColorPalette::Background]];}\n.button:hover {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::SecondaryLight]]; border-color:[[ColorPalette::SecondaryMid]];}\n.button:active {color:[[ColorPalette::Background]]; background:[[ColorPalette::SecondaryMid]]; border:1px solid [[ColorPalette::SecondaryDark]];}\n\n.header {background:[[ColorPalette::PrimaryMid]];}\n.headerShadow {color:[[ColorPalette::Foreground]];}\n.headerShadow a {font-weight:normal; color:[[ColorPalette::Foreground]];}\n.headerForeground {color:[[ColorPalette::Background]];}\n.headerForeground a {font-weight:normal; color:[[ColorPalette::PrimaryPale]];}\n\n.tabSelected{color:[[ColorPalette::PrimaryDark]];\n	background:[[ColorPalette::TertiaryPale]];\n	border-left:1px solid [[ColorPalette::TertiaryLight]];\n	border-top:1px solid [[ColorPalette::TertiaryLight]];\n	border-right:1px solid [[ColorPalette::TertiaryLight]];\n}\n.tabUnselected {color:[[ColorPalette::Background]]; background:[[ColorPalette::TertiaryMid]];}\n.tabContents {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::TertiaryPale]]; border:1px solid [[ColorPalette::TertiaryLight]];}\n.tabContents .button {border:0;}\n\n#sidebar {}\n#sidebarOptions input {border:1px solid [[ColorPalette::PrimaryMid]];}\n#sidebarOptions .sliderPanel {background:[[ColorPalette::PrimaryPale]];}\n#sidebarOptions .sliderPanel a {border:none;color:[[ColorPalette::PrimaryMid]];}\n#sidebarOptions .sliderPanel a:hover {color:[[ColorPalette::Background]]; background:[[ColorPalette::PrimaryMid]];}\n#sidebarOptions .sliderPanel a:active {color:[[ColorPalette::PrimaryMid]]; background:[[ColorPalette::Background]];}\n\n.wizard {background:[[ColorPalette::PrimaryPale]]; border:1px solid [[ColorPalette::PrimaryMid]];}\n.wizard h1 {color:[[ColorPalette::PrimaryDark]]; border:none;}\n.wizard h2 {color:[[ColorPalette::Foreground]]; border:none;}\n.wizardStep {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];\n	border:1px solid [[ColorPalette::PrimaryMid]];}\n.wizardStep.wizardStepDone {background:[[ColorPalette::TertiaryLight]];}\n.wizardFooter {background:[[ColorPalette::PrimaryPale]];}\n.wizardFooter .status {background:[[ColorPalette::PrimaryDark]]; color:[[ColorPalette::Background]];}\n.wizard .button {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::SecondaryLight]]; border: 1px solid;\n	border-color:[[ColorPalette::SecondaryPale]] [[ColorPalette::SecondaryDark]] [[ColorPalette::SecondaryDark]] [[ColorPalette::SecondaryPale]];}\n.wizard .button:hover {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::Background]];}\n.wizard .button:active {color:[[ColorPalette::Background]]; background:[[ColorPalette::Foreground]]; border: 1px solid;\n	border-color:[[ColorPalette::PrimaryDark]] [[ColorPalette::PrimaryPale]] [[ColorPalette::PrimaryPale]] [[ColorPalette::PrimaryDark]];}\n\n#messageArea {border:1px solid [[ColorPalette::SecondaryMid]]; background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]];}\n#messageArea .button {color:[[ColorPalette::PrimaryMid]]; background:[[ColorPalette::SecondaryPale]]; border:none;}\n\n.popupTiddler {background:[[ColorPalette::TertiaryPale]]; border:2px solid [[ColorPalette::TertiaryMid]];}\n\n.popup {background:[[ColorPalette::TertiaryPale]]; color:[[ColorPalette::TertiaryDark]]; border-left:1px solid [[ColorPalette::TertiaryMid]]; border-top:1px solid [[ColorPalette::TertiaryMid]]; border-right:2px solid [[ColorPalette::TertiaryDark]]; border-bottom:2px solid [[ColorPalette::TertiaryDark]];}\n.popup hr {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::PrimaryDark]]; border-bottom:1px;}\n.popup li.disabled {color:[[ColorPalette::TertiaryMid]];}\n.popup li a, .popup li a:visited {color:[[ColorPalette::Foreground]]; border: none;}\n.popup li a:hover {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; border: none;}\n.popup li a:active {background:[[ColorPalette::SecondaryPale]]; color:[[ColorPalette::Foreground]]; border: none;}\n.popupHighlight {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}\n.listBreak div {border-bottom:1px solid [[ColorPalette::TertiaryDark]];}\n\n.tiddler .defaultCommand {font-weight:bold;}\n\n.shadow .title {color:[[ColorPalette::TertiaryDark]];}\n\n.title {color:[[ColorPalette::SecondaryDark]];}\n.subtitle {color:[[ColorPalette::TertiaryDark]];}\n\n.toolbar {color:[[ColorPalette::PrimaryMid]];}\n.toolbar a {color:[[ColorPalette::TertiaryLight]];}\n.selected .toolbar a {color:[[ColorPalette::TertiaryMid]];}\n.selected .toolbar a:hover {color:[[ColorPalette::Foreground]];}\n\n.tagging, .tagged {border:1px solid [[ColorPalette::TertiaryPale]]; background-color:[[ColorPalette::TertiaryPale]];}\n.selected .tagging, .selected .tagged {background-color:[[ColorPalette::TertiaryLight]]; border:1px solid [[ColorPalette::TertiaryMid]];}\n.tagging .listTitle, .tagged .listTitle {color:[[ColorPalette::PrimaryDark]];}\n.tagging .button, .tagged .button {border:none;}\n\n.footer {color:[[ColorPalette::TertiaryLight]];}\n.selected .footer {color:[[ColorPalette::TertiaryMid]];}\n\n.sparkline {background:[[ColorPalette::PrimaryPale]]; border:0;}\n.sparktick {background:[[ColorPalette::PrimaryDark]];}\n\n.error, .errorButton {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::Error]];}\n.warning {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::SecondaryPale]];}\n.lowlight {background:[[ColorPalette::TertiaryLight]];}\n\n.zoomer {background:none; color:[[ColorPalette::TertiaryMid]]; border:3px solid [[ColorPalette::TertiaryMid]];}\n\n.imageLink, #displayArea .imageLink {background:transparent;}\n\n.annotation {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; border:2px solid [[ColorPalette::SecondaryMid]];}\n\n.viewer .listTitle {list-style-type:none; margin-left:-2em;}\n.viewer .button {border:1px solid [[ColorPalette::SecondaryMid]];}\n.viewer blockquote {border-left:3px solid [[ColorPalette::TertiaryDark]];}\n\n.viewer table, table.twtable {border:2px solid [[ColorPalette::TertiaryDark]];}\n.viewer th, .viewer thead td, .twtable th, .twtable thead td {background:[[ColorPalette::SecondaryMid]]; border:1px solid [[ColorPalette::TertiaryDark]]; color:[[ColorPalette::Background]];}\n.viewer td, .viewer tr, .twtable td, .twtable tr {border:1px solid [[ColorPalette::TertiaryDark]];}\n\n.viewer pre {border:1px solid [[ColorPalette::SecondaryLight]]; background:[[ColorPalette::SecondaryPale]];}\n.viewer code {color:[[ColorPalette::SecondaryDark]];}\n.viewer hr {border:0; border-top:dashed 1px [[ColorPalette::TertiaryDark]]; color:[[ColorPalette::TertiaryDark]];}\n\n.highlight, .marked {background:[[ColorPalette::SecondaryLight]];}\n\n.editor input {border:1px solid [[ColorPalette::PrimaryMid]];}\n.editor textarea {border:1px solid [[ColorPalette::PrimaryMid]]; width:100%;}\n.editorFooter {color:[[ColorPalette::TertiaryMid]];}\n\n#backstageArea {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::TertiaryMid]];}\n#backstageArea a {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::Background]]; border:none;}\n#backstageArea a:hover {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; }\n#backstageArea a.backstageSelTab {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}\n#backstageButton a {background:none; color:[[ColorPalette::Background]]; border:none;}\n#backstageButton a:hover {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::Background]]; border:none;}\n#backstagePanel {background:[[ColorPalette::Background]]; border-color: [[ColorPalette::Background]] [[ColorPalette::TertiaryDark]] [[ColorPalette::TertiaryDark]] [[ColorPalette::TertiaryDark]];}\n.backstagePanelFooter .button {border:none; color:[[ColorPalette::Background]];}\n.backstagePanelFooter .button:hover {color:[[ColorPalette::Foreground]];}\n#backstageCloak {background:[[ColorPalette::Foreground]]; opacity:0.6; filter:'alpha(opacity:60)';}\n/*}}}*/</div>
<div tiddler="StyleSheetLocale" tags="">/***\nStyleSheet for use when a translation requires any css style changes.\nThis StyleSheet can be used directly by languages such as Chinese, Japanese and Korean which use a logographic writing system and need larger font sizes.\n***/\n\n/*{{{*/\nbody {font-size:0.8em;}\n.headerShadow {position:relative; padding:3.5em 0em 1em 1em; left:-1px; top:-1px;}\n.headerForeground {position:absolute; padding:3.5em 0em 1em 1em; left:0px; top:0px;}\n\n#sidebarOptions {font-size:1.05em;}\n#sidebarOptions a {font-style:normal;}\n#sidebarOptions .sliderPanel {font-size:0.95em;}\n\n.subtitle {font-size:0.8em;}\n\n.viewer table.listView {font-size:1em;}\n\n.htmlarea .toolbarHA table {border:1px solid ButtonFace; margin:0em 0em;}\n/*}}}*/</div>
<div tiddler="StyleSheetPrint" tags="">/*{{{*/\n@media print {\n#mainMenu, #sidebar, #messageArea, .toolbar, #backstageButton, #backstageArea {display: none ! important;}\n#displayArea {margin: 1em 1em 0em 1em;}\n/* Fixes a feature in Firefox 1.5.0.2 where print preview displays the noscript content */\nnoscript {display:none;}\n}\n/*}}}*/</div>

</div>
<!--POST-SHADOWAREA-->
<div id="storeArea">
	
	

	
	
<div title="ccWorkspace" modifier="ccTiddly"  tags="systemConfig excludeLists excludeSearch" >
<pre>	/***
|''Name:''|ccCreateWorkspace|
|''Description:''|Allows users to create workspaces in ccTiddly|
|''Version:''|2.1.5|
|''Date:''|Nov 27, 2007|
|''Source:''||
|''Author:''|SimonMcManus|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.6|
|''Browser:''| Firefox |
***/
//{{{

var url = "http://<?php echo $_SERVER['SERVER_NAME'].str_replace('/index.php', '',  $_SERVER['SCRIPT_NAME']);?>";
	var workspace = "<?php echo $tiddlyCfg['workspace_name'];?>";


<?php


if ($workspace_create == "A" ||   $tiddlyCfg['allow_workspace_creation'] ==1)
{

?>

config.backstageTasks.push(&quot;create&quot;);
merge(config.tasks,{
    create: {text: &quot;create&quot;, tooltip: &quot;Create new workspace&quot;, content:'&lt;&lt;ccCreateWorkspace&gt;&gt;'}});


config.macros.ccCreateWorkspace = {

	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
	// When we server this tiddler it need to know the URL of the server to post back to
	//this value is currently set in index.php, should be index.php?action=createWorkspace to prepare for modulation
		//form heading
		var frm = createTiddlyElement(place,&quot;form&quot;,null,"wizard");
		frm.onsubmit = this.createWorkspaceOnSubmit;
		createTiddlyElement(frm,&quot;h1&quot;, null, null,  &quot;Create new workspace &quot;);
		createTiddlyElement(frm,&quot;br&quot;);
		createTiddlyText(frm, "You can get your own TiddlyWiki by filling in the form below.");
		createTiddlyElement(frm,&quot;br&quot;);
		createTiddlyElement(frm,&quot;br&quot;);
		
		var body = createTiddlyElement(frm,&quot;div&quot;,null, "wizardBody");
		
		//form content
		var step = createTiddlyElement(body,&quot;div&quot;,null, "wizardStep");
		
		//form workspace name/url
		createTiddlyText(step,url+"/");
		var workspaceName = createTiddlyElement(step,&quot;input&quot;,&quot;ccWorkspaceName&quot;, &quot;ccWorkspaceName&quot;)				
		workspaceName.value = workspace;
		workspaceName.size = 15;
		workspaceName.name = 'ccWorkspaceName';
		createTiddlyElement(step,&quot;br&quot;);

		//privilege form
		createTiddlyElement(step,&quot;h4&quot;, null, null,  &quot;Anonymous Users Can :  &quot;);
	//	var anC = createTiddlyCheckbox(null, &quot;Create Tiddlers&quot;, 0);
		
		
		
		
		
		 var anC = createTiddlyElement(null,&quot;input&quot;, &quot;anC&quot;,&quot;anC&quot;);
	     anC.setAttribute(&quot;type&quot;,&quot;checkbox&quot;);
	     step.appendChild(anC);
		 createTiddlyText(step, "Create Tiddlers");
		 createTiddlyElement(step,&quot;br&quot;);
		 
		  var anR = createTiddlyElement(null,&quot;input&quot;, &quot;anR&quot;,&quot;anR&quot;);
	     anR.setAttribute(&quot;type&quot;,&quot;checkbox&quot;);
	     step.appendChild(anR);
		 createTiddlyText(step, "Read Tiddlers");
	createTiddlyElement(step,&quot;br&quot;);
		 
		  var anU = createTiddlyElement(null,&quot;input&quot;, &quot;anU&quot;,&quot;anU&quot;);
	     anU.setAttribute(&quot;type&quot;,&quot;checkbox&quot;);
	     step.appendChild(anU);
		 createTiddlyText(step, "Update Tiddlers");
	createTiddlyElement(step,&quot;br&quot;);
		 
		  var anD = createTiddlyElement(null,&quot;input&quot;, &quot;anD&quot;,&quot;anD&quot;);
	     anD.setAttribute(&quot;type&quot;,&quot;checkbox&quot;);
	     step.appendChild(anD);
		 createTiddlyText(step, "Delete Tiddlers");
		createTiddlyElement(step,&quot;br&quot;);
		
		
	
//		anC.id='anC';
//		frm.appendChild(anC);
//		createTiddlyElement(step,&quot;br&quot;);
//		var  anR = createTiddlyCheckbox(step, &quot;Read Tiddler&quot;, 1);
	//	anR.id = 'anR';
	//	createTiddlyElement(step,&quot;br&quot;);
	//	var anU = createTiddlyCheckbox(step, &quot;Updates Tiddlers &quot;, 0);
	//	anU.id = 'anU';
	//	createTiddlyElement(step,&quot;br&quot;);
	//	var anD = createTiddlyCheckbox(step, &quot;Delete Tiddlers&quot;, 0);
	//	anD.id = 'anD';
		createTiddlyElement(step,&quot;br&quot;);
		createTiddlyElement(frm,&quot;br&quot;);
		
		
		

	var btn = createTiddlyElement(null,&quot;input&quot;,this.prompt,&quot;button&quot;);
		btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
		btn.value = &quot;Create workspace&quot;
	    step.appendChild(btn);




	 	//createTiddlyElement(frm,&quot;br&quot;);
		//createTiddlyElement(frm,&quot;br&quot;);
		//createTiddlyElement(step,&quot;h2&quot;, null, null,  &quot;Registered Users  Can:  &quot;);
		//var usC = createTiddlyCheckbox(frm, &quot;Create Tiddlers&quot;, 1);
		//usC.id = 'usC';
		//createTiddlyElement(frm,&quot;br&quot;);
		//var usR = createTiddlyCheckbox(frm, &quot;Read Tiddler&quot;, 1);
		//usR.id = 'usR';
		//createTiddlyElement(frm,&quot;br&quot;);
		//var usU = createTiddlyCheckbox(frm, &quot;Updates Tiddlers &quot;, 1);
		//usU.id = 'usU';
		//createTiddlyElement(frm,&quot;br&quot;);
		//var usD = createTiddlyCheckbox(frm, &quot;Delete Tiddlers&quot;, 1);
		//usD.id='usD';
		//createTiddlyElement(frm,&quot;br&quot;);
		//createTiddlyElement(frm,&quot;hr&quot;);
		//createTiddlyText(frm,&quot;As the Workspace owner you will have all the above permissions&quot;);
		//createTiddlyElement(frm,&quot;br&quot;);
	},
	createWorkspaceOnSubmit: function() {
		var trueStr = "A";
		var falseStr = "D";
		// build up string with permissions values
		var anon=(this.anR.checked?trueStr:falseStr);
		anon+=(this.anC.checked?trueStr:falseStr);
		anon+=(this.anU.checked?trueStr:falseStr);
		anon+=(this.anD.checked?trueStr:falseStr);
		//var user=(this.usC.checked?trueStr:falseStr);
		//user+=(this.usR.checked?trueStr:falseStr);
		//user+=(this.usU.checked?trueStr:falseStr);
		//user+=(this.usD.checked?trueStr:falseStr);
		var params = {}; 
		params.url = url+'/'+this.ccWorkspaceName.value;
		var loginResp = doHttp('POST', url+'/'+this.ccWorkspaceName.value, &quot;ccCreateWorkspace=&quot; + encodeURIComponent(this.ccWorkspaceName.value)+&quot;&amp;ccAnonPerm=&quot;+encodeURIComponent(anon),null,null,null, config.macros.ccCreateWorkspace.createWorkspaceCallback,params);

		return false; 

	},
	createWorkspaceCallback: function(status,params,responseText,uri,xhr) {
	//	displayMessage(xhr.status);
		if(xhr.status==201) {
			window.location = params.url;
			//displayMessage('workspace crated');				
		} else if (xhr.status == 200) {
			displayMessage("Workspace name is already in use.");
		} else if (xhr.status == 403) {
			displayMessage("Permission denied, the ability to create new workspaces may have been disabled by you systems administrator.");	
		} else {
			displayMessage(responseText);	
		}

	}

}

<?php
}
?>
config.macros.ccListWorkspaces = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
		// When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
		<?php
		$result = db_workspace_selectAllPublic();
		while ($row = db_fetch_assoc($result))
		{
			echo "var item = createTiddlyElement(place, 'A', null, null,  &quot;".$row['name']."&quot;);\n";
			if( $tiddlyCfg['mod_rewrite']==1 ) {
				echo "item.href= url+'/".$row['name']."';\n";
			}else{
				echo "item.href= url+'?workspace=".$row['name']."';\n";
			}
			echo "createTiddlyElement(place,&quot;br&quot;);";
		}
		?>
		createTiddlyText(place, "a<?php echo  db_num_rows($result);?>");
	}
}

config.macros.ccEditWorkspace = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
		// When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
		var frm = createTiddlyElement(place,&quot;form&quot;,null,"wizard");
		frm.onsubmit = this.createWorkspaceOnSubmit;
		createTiddlyElement(frm,&quot;h1&quot;, null, null,  &quot;Edit Workspace Permissions :  &quot;);
		var body = createTiddlyElement(frm,&quot;div&quot;,null, "wizardBody");
		var step = createTiddlyElement(body,&quot;div&quot;,null, "wizardStep");
	
		createTiddlyElement(step,&quot;h4&quot;, null, null,  &quot;Anonymous Users Can :  &quot;);
		var anC = createTiddlyCheckbox(step, &quot;Create Tiddlers&quot;, 0);
		anC.id='anC';
		createTiddlyElement(step,&quot;br&quot;);
		var  anR = createTiddlyCheckbox(step, &quot;Read Tiddler&quot;, 1);
		anR.id = 'anR';
		createTiddlyElement(step,&quot;br&quot;);
		var anU = createTiddlyCheckbox(step, &quot;Updates Tiddlers &quot;, 0);
		anU.id = 'anU';
		createTiddlyElement(step,&quot;br&quot;);
		var anD = createTiddlyCheckbox(step, &quot;Delete Tiddlers&quot;, 0);
		anD.id = 'anD';
		createTiddlyElement(step,&quot;br&quot;);
		
		createTiddlyElement(frm,&quot;br&quot;);
		var btn = createTiddlyElement(frm,&quot;input&quot;,this.prompt,"button", "button");
		 btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
		 btn.value = &quot;edit workspace permissions&quot;
		createTiddlyElement(frm,&quot;br&quot;);
		createTiddlyElement(frm,&quot;br&quot;);
			}
}
//}}}
</pre>
</div>

<div title="SiteProxy" modifier="ccTiddly" tags="systemTiddler ProxyService  excludeLists excludeSearch">
<pre>handle/proxy.php?feed=</pre>
</div>

<div title="ccLoadRemoteFileThroughProxy" tags="systemConfig ProxyService excludeLists excludeSearch">
<pre>
/***
|''Name:''|ccLoadRemoteFileThroughProxy (previous LoadRemoteFileHijack)|
|''Description:''|When the TiddlyWiki file is located on the web (view over http) the content of [[SiteProxy]] tiddler is added in front of the file url. If [[SiteProxy]] does not exist "/proxy/" is added. |
|''Version:''|1.1.0|
|''Date:''|mar 17, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#LoadRemoteFileHijack|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0|
***/
//{{{
	version.extensions.LoadRemoteFileThroughProxy = {
	major: 1, minor: 1, revision: 0, 
	date: new Date("mar 17, 2007"), 
	source: "http://tiddlywiki.bidix.info/#LoadRemoteFileThroughProxy"};

	if (!window.bidix) window.bidix = {}; // bidix namespace
	if (!bidix.core) bidix.core = {};

	bidix.core.loadRemoteFile = loadRemoteFile;
	loadRemoteFile = function(url,callback,params)
	{
		if ((document.location.toString().substr(0,4) == "http") && (url.substr(0,4) == "http")){ 
			url = store.getTiddlerText("SiteProxy", "/proxy/") + url;
		}
		return bidix.core.loadRemoteFile(url,callback,params);
	}
//}}}
</pre>
</div>

<div title="ccAbout" modifier="ccTiddly" tags="systemConfig excludeLists excludeSearch">
<pre>	/***
	|''Name:''|ccAbout|
	|''Description:''|Allows you to find out about your ccTiddly installation|
	|''Version:''|2.1.5|
	|''Date:''|Nov 27, 2007|
	|''Source:''||
	|''Author:''|SimonMcManus|
	|''License:''|[[BSD open source license]]|
	|''~CoreVersion:''|2.1.6|
	|''Browser:''| Firefox |
	***/
//{{{
	config.backstageTasks.push(&quot;about&quot;);
	// remove the save button from backstage
	if(config.backstageTasks[0] == 'save');
		config.backstageTasks.shift();
	merge(config.tasks,{
	    about: {text: &quot;about&quot;, tooltip: &quot;Find out more about ccTiddly &quot;, content: '&lt;&lt;ccAbout&gt;&gt;'}

	});
config.macros.ccAbout = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
		
		createTiddlyElement(place, "h1","","","About ccTiddly");
	
	
	createTiddlyElement(place, "br");
	var str = "more info about ccTiddly can be found  at http://tiddlywiki.org/wiki/CcTiddly" ;
	createTiddlyText(place, str);
	
	}
}
//}}}
</pre>
</div>


	
	
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

var url = "http://<?php echo $_SERVER['SERVER_NAME'].str_replace('/index.php', '',  $_SERVER['SCRIPT_NAME']);?>";
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
	
	
	

<div title="ccLogin" modifier="ccTiddly"  tags="systemConfig excludeLists excludeSearch" >
<pre>	
/***
|''Name:''|ccLogin|
|''Description:''|Login Plugin for ccTiddly|
|''Version:''|2.1.5|
|''Date:''|Nov 27, 2007|
|''Source:''||
|''Author:''|SimonMcManus|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.6|
|''Browser:''| Firefox |
***/

	//{{{

	config.backstageTasks.push(&quot;login&quot;);
	merge(config.tasks,{
	    login: {text: &quot;login&quot;, tooltip: &quot;Login to your TiddlyWiki&quot;, content: '&lt;&lt;ccLogin&gt;&gt;'}
	});
	
	
	<?php 
	if ($workspace_create == "D")
	{
		// REMOVE "new tiddler" and "new Journal link"
		// SHOW LOGIN TIDDLER
		?>
		// hide new journal
		config.macros.newJournal.handler=function(place,macroName,params,wikifier,paramString,tiddler){};

		// hide new tiddler 
		config.macros.newTiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler){};
		<?php
	} 
	
	if ($workspace_read == "D")
	{
		// DONT ANY OF RIGHT SIDE BAR 
		// SHOW LOGIN TIDDLER
		?>
//		displayMessage("You do NOT have read permissions. Please login to view the full Tiddlywiki");
		<?php
	} 	
	?>
	config.macros.toolbar.isCommandEnabled = function(command,tiddler)
	{	
	var title = tiddler.title;
	<?php
	if ($workspace_delete == "D")
	{
		// REMOVE OPTION TO DELETE TIDDLERS 
		?>	if (command.text=='delete')	
			return false;
	<?php
	}
	if ($workspace_udate == "D")
	{
		// REMOVE EDIT LINK FROM TIDDLERS 
		?>	if (command.text=='edit')	
			return false;
	<?php
	}
	?>
	var ro = tiddler.isReadOnly();

	var shadow = store.isShadowTiddler(title) && !store.tiddlerExists(title);
	return (!ro || (ro && !command.hideReadOnly)) && !(shadow && command.hideShadow);

	}
	
		var url = "http://<?php echo $_SERVER['SERVER_NAME'].str_replace('/index.php', '',  $_SERVER['SCRIPT_NAME']);?>";
	// Returns output var with output.txtUsername and output.sessionToken
	
	function findToken(cookieStash) {
	    var output = {};
	    var cookies =cookieStash.split(&quot;\n&quot;);
	    for(var c=0; c&lt; cookies.length ; c++) {
	        var cl = cookies[c].split(&quot;;&quot;);
	        for(var e=0; e&lt;cl.length; e++) {
	            var p = cl[e].indexOf(&quot;=&quot;);
	            if(p != -1) {
	                var name = cl[e].substr(0,p).trim();
	                var value = cl[e].substr(p+1).trim();       
	                if (name== 'txtUserName') {
	                    output.txtUserName = value;
	                }
	                if (name== 'sessionToken') {
	                    output.sessionToken = value;
	                }
	            }
	        }
	    }
	    return output;
	}

config.macros.ccLoginStatus = {
	    handler: function(place,macroName,params,wikifier,paramString,tiddler) {

        var loginDiv = createTiddlyElement(place,&quot;div&quot;,null,&quot;loginDiv&quot;,null);
	        this.refresh(loginDiv);
	    },
	    
	    	    refresh: function(place, errorMsg) {
	      var loginDivRef = document.getElementById (&quot;LoginDiv&quot;);
	     removeChildren(loginDivRef);
         var wrapper = createTiddlyElement(place,&quot;div&quot;);
	        var cookieValues = findToken(document.cookie);

	        if ( cookieValues.sessionToken && cookieValues.sessionToken!== 'invalid' && cookieValues.txtUserName) {
	        
				var str = wikify(&quot;You are logged in as &quot; + cookieValues.txtUserName, wrapper);
	
	
	
		  		var frm = createTiddlyElement(n,&quot;form&quot;,null);
	   			frm.action = "";
	    		frm.method = "get";
	            //frm.onsubmit = config.macros.ccLogin.logoutOnSubmit;
        wrapper.appendChild(frm);	
        
        
	            var logout = createTiddlyElement(null,&quot;input&quot;, logout, logout);
	           logout.setAttribute(&quot;type&quot;,&quot;hidden&quot;);
	            logout.value = &quot;1&quot;;   
	            logout.name = &quot;logout&quot;;   
	            frm.appendChild(logout);	
	    
	    
	    
	            var btn = createTiddlyElement(null,&quot;input&quot;, null);
	           btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
	            btn.value = &quot;Logout&quot;;   
	            frm.appendChild(btn);	
	    
	    
	    
	    
	        } else {
				var str = wikify(&quot;[[Please Login	]]&quot;, wrapper);
				
	        }
	        
	        }
	        
	        


}
	config.macros.ccLogin = {
	    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
	       // var img = createTiddlyElement(place,&quot;img&quot;);
	       // img.src = 'http://www.cot.org.uk/designforliving/companies/logos/bt.jpg ';
	        var loginDiv = createTiddlyElement(place,&quot;div&quot;,null,&quot;loginDiv&quot;,null);
	        this.refresh(loginDiv);
	    },

	    refresh: function(place, errorMsg) {
	        var loginDivRef = document.getElementById (&quot;LoginDiv&quot;);
	        removeChildren(loginDivRef);
	        var wrapper = createTiddlyElement(place,&quot;div&quot;);
	        var cookieValues = findToken(document.cookie);

	        if ( cookieValues.sessionToken &amp;&amp;  cookieValues.sessionToken!== 'invalid' &amp;&amp; cookieValues.txtUserName) {
	            // user is logged in
	            var msg = createTiddlyElement(wrapper,&quot;div&quot;);
	            wikify(&quot;You are logged in as &quot; + cookieValues.txtUserName, msg);
	          
	          
	          
		  		var frm = createTiddlyElement(n,&quot;form&quot;,null);
	   			frm.action = "";
	    		frm.method = "get";
	            //frm.onsubmit = config.macros.ccLogin.logoutOnSubmit;
        wrapper.appendChild(frm);	
        
        
	            var logout = createTiddlyElement(null,&quot;input&quot;, logout, logout);
	           logout.setAttribute(&quot;type&quot;,&quot;hidden&quot;);
	            logout.value = &quot;1&quot;;   
	            logout.name = &quot;logout&quot;;   
	            frm.appendChild(logout);	
	    
	    
	    
	            var btn = createTiddlyElement(null,&quot;input&quot;, null);
	           btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
	            btn.value = &quot;Logout&quot;;   
	            frm.appendChild(btn);	
	            
	            
	        } else {
	            //user not logged in.
	            
	            var frm = createTiddlyElement(wrapper,&quot;form&quot;,null, "wizard");
	            frm.onsubmit = this.loginOnSubmit;
	 			           var body = createTiddlyElement(frm,&quot;h1&quot;,null,null, "");
	          
	            createTiddlyText(frm,&quot;username/password should get you in.&quot;);	
	            
	            createTiddlyElement(frm,&quot;br&quot;);
	            createTiddlyElement(frm,&quot;br&quot;);
	            var body = createTiddlyElement(frm,&quot;div&quot;,null, "wizardBody");
	            var step = createTiddlyElement(body,&quot;div&quot;,null, "wizardStep");
				
	 //createTiddlyElement(frm,&quot;h1&quot;, null, null,  &quot;Login is Required&quot;);
	            if (errorMsg!= null)
	            {  
	                createTiddlyElement(step,&quot;span&quot;, null, null, errorMsg);
	          		createTiddlyElement(step,&quot;br&quot;);
	          	}
	         	createTiddlyElement(step,&quot;br&quot;);
	            createTiddlyText(step,&quot;Username: &quot;);
	            var txtuser = createTiddlyElement(step,&quot;input&quot;,&quot;cctuser&quot;, &quot;cctuser&quot;)
	            if (cookieValues.txtUserName !=null) {
	                txtuser.value =cookieValues.txtUserName ;
	            }
	            createTiddlyElement(step,&quot;br&quot;);
	            createTiddlyText(step,&quot;Password : &quot;);
	        
	       var txtpass =   createTiddlyElement(null, &quot;input&quot;, &quot;cctpass&quot;, &quot;cctpass&quot;, null, {&quot;type&quot;:&quot;password&quot;});
	        //  var txtpass = createTiddlyElement(step,&quot;input&quot;, &quot;cctpass&quot;,&quot;cctpass&quot;);
	         txtpass.setAttribute(&quot;type&quot;,&quot;password&quot;);
	         
	        
	        step.appendChild(txtpass);
			createTiddlyElement(frm,&quot;br&quot;);
			var btn = createTiddlyElement(null,&quot;input&quot;,this.prompt, "button");
			btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
			btn.value = &quot;Login&quot;
			frm.appendChild(btn);
		
			
			var oidfrm = createTiddlyElement(step,&quot;form&quot;,null, null);
			oidfrm.method = 'get';
			oidfrm.action='includes/o/try_auth.php';
		
		
		
			createTiddlyElement(oidfrm,&quot;br&quot;);
			createTiddlyText(oidfrm, 'OpenID:');
			
			var oidaction = createTiddlyElement(null,&quot;input&quot;,null);
			oidaction.setAttribute(&quot;type&quot;,&quot;hidden&quot;);
			oidaction.setAttribute(&quot;value&quot;,&quot;verify&quot;);
			oidfrm.appendChild(oidaction);
			
			var oidid = createTiddlyElement(null,&quot;input&quot;,null);
			oidid.setAttribute(&quot;type&quot;,&quot;text&quot;);
			oidid.setAttribute(&quot;name&quot;,&quot;openid_identifier&quot;);
			oidfrm.appendChild(oidid);
			
			var oidsub = createTiddlyElement(null,&quot;input&quot;,null);
			oidsub.setAttribute(&quot;type&quot;,&quot;submit&quot;);
			oidsub.setAttribute(&quot;value&quot;,&quot;Verify&quot;);
			oidfrm.appendChild(oidsub);
			
	
	// TODO : DELETE 		
	//		var oidurl = createTiddlyElement(null,&quot;input&quot;,&quot;oidurl&quot;);
	//		oidurl.setAttribute(&quot;type&quot;,&quot;hidden&quot;);
	//		oidurl.setAttribute(&quot;value&quot;, url+"/"+workspace);		
	//		oidurl.setAttribute(&quot;name&quot;, &quot;oidurl&quot;);
	//		oidfrm.appendChild(oidurl);
			
			
			createTiddlyElement(frm,&quot;br&quot;);
			createTiddlyElement(frm,&quot;br&quot;);
			}
	     },

	    killLoginCookie: function() {
	        var c = 'sessionToken=invalid';
	        c+= &quot;; expires=Fri, 1 Jan 1811 12:00:00 UTC; path=/&quot;;
	        document.cookie = c;
	        },

	    logoutOnSubmit: function() {
	        var loginDivRef = findRelated(this,&quot;loginDiv&quot;,&quot;className&quot;,&quot;parentNode&quot;);
	        removeChildren(loginDivRef);
		     
	        document.cookie = &quot;sessionToken=invalid;   expires=15/02/2009 00:00:00&quot;;
	        //config.macros.ccLogin.refresh(loginDivRef);
	        doHttp('POST', url+'msghandle.php', &quot;logout=1&quot;);
	        		window.location = window.location;      
	return false;
	    },


	    logoutCallback: function(status,params,responseText,uri,xhr) {
	   
	 //return true;
	    },

	    loginOnSubmit: function() {
	        var user = document.getElementById('cctuser').value;
	        var pass = document.getElementById('cctpass').value;
	        var params = {}; 
	        params.origin = this;
	        var loginResp = doHttp('POST', url+'/msghandle.php', &quot;cctuser=&quot; + encodeURIComponent(user)+&quot;&amp;cctpass=&quot;+encodeURIComponent(pass),null,null,null, config.macros.ccLogin.loginCallback,params);
	    
	       return false;
	    },

	    loginCallback: function(status,params,responseText,uri,xhr) {
	        if (status==true) {
	         // displayMessage('CONECTION was ok ');
	        }
	     var cookie;
	     cookie = xhr.getResponseHeader(&quot;Set-Cookie&quot;);
	   
	        var cookieValues = findToken(cookie);
	        
	        config.macros.ccLogin.saveCookie(cookieValues);
	        if(xhr.status != 401) {
				window.location = window.location;
			} else {
				if (xhr.responseText != "")
					displayMessage(xhr.responseText);
	
				var loginDivRef = findRelated( params.origin,&quot;loginDiv&quot;,&quot;className&quot;,&quot;parentNode&quot;);
		        removeChildren(loginDivRef);
				config.macros.ccLogin.refresh(loginDivRef, 'Login Failed ');
					
			}
			return true;
			 },


	       saveCookie: function(cookieValues) {
	        // Save the session token in cookie.
	        var c = 'sessionToken' + &quot;=&quot; + cookieValues.sessionToken;
	        c+= &quot;; expires=Fri, 1 Jan 2811 12:00:00 UTC; path=&quot;;
	        document.cookie = c;
	        // Save the txtUserName in the normal tiddlywiki format
	       if (cookieValues.txtUserName !=null) {
	             config.options.txtUserName = cookieValues.txtUserName;
	            saveOptionCookie(&quot;txtUserName&quot;);
	        }
	   }
	}
	//}}}

</pre>
</div>


<?php
	if( $standalone )
	{
?>
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

		print "<div tiddler=\"ccTiddly_debug_time\" modified=\"000000000000\" modifier=\"ccTiddly\" created=\"000000000000\" temp.ccTrevision=\"1\" tags=\"debug\">";
		for( $i=1; $i<sizeof($time); $i++ )
		{
			print $time[$i]["name"]." = ".(round($time[$i]["time"]-$time[0]["time"],3))."s\\n";
		}
		print "</div>";
	}
?>
</div>
<?php /*print cct_print_form($standalone);/*cct*/ ?>

<!--POST-STOREAREA-->
<!--POST-BODY-START-->
<?php 
	if( isset( $tiddlers['MarkupPostBody'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPostBody']['body']);
	}
?>
<!--POST-BODY-END-->
<script type="text/javascript">
//<![CDATA[
if(useJavaSaver)
	document.write("<applet style='position:absolute;left:-1px' name='TiddlySaver' code='TiddlySaver.class' archive='TiddlySaver.jar' width='1' height='1'></applet>");
//]]>
</script>
<!--POST-SCRIPT-START-->
<!--POST-SCRIPT-END-->
</body>
</html>
