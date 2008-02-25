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
include_once($cct_base."includes/login.php");

recordTime_float("includes");

//RSS
if( strcmp($cctAction,"RSS")==0 )
{
	include_once($cct_base."handle/rss.php");
	exit;
}

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
	
// log the workspace viewing : 
$data1['username'] = $user['username'];
$data1['workspace'] = $workspace;

$data1['time'] = date( 'Y-m-d H:i:s', mktime());
db_record_insert($tiddlyCfg['table']['workspace_view'],$data1);
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
<title>
TiddlyWiki - a reusable non-linear personal web notebook
</title>
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
<?php print cct_print_includes($standalone);/*cct*/ ?>
<!--script below are ccT plugins-->
<?php print cct_print_plugins($standalone);/*cct*/ ?>
<!--End of ccT plugins-->

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
<div tiddler='CreateWorkspace' tags=''>&lt;&lt;ccCreateWorkspace&gt;&gt;</div>

<?php
require_once($cct_base."includes/workspace_exists.php");
?>

<div tiddler="OptionsPanel" tags="">These InterfaceOptions for customising TiddlyWiki are saved in your browser\n\nYour username for signing your edits. Write it as a WikiWord (eg JoeBloggs)\n\n&lt;&lt;option txtUserName&gt;&gt;\n&lt;&lt;option chkSaveBackups&gt;&gt; SaveBackups\n&lt;&lt;option chkAutoSave&gt;&gt; AutoSave\n&lt;&lt;option chkRegExpSearch&gt;&gt; RegExpSearch\n&lt;&lt;option chkCaseSensitiveSearch&gt;&gt; CaseSensitiveSearch\n&lt;&lt;option chkAnimate&gt;&gt; EnableAnimations\n\n----\nAlso see AdvancedOptions</div>
<div tiddler="PageTemplate" tags="">&lt;!--{{{--&gt;\n&lt;div 	class='header' macro='gradient vert [[ColorPalette::PrimaryLight]] [[ColorPalette::PrimaryMid]]'&gt;\n&lt;div class='headerShadow'&gt;\n&lt;span class='siteTitle' refresh='content' tiddler='SiteTitle'&gt;&lt;/span&gt;&amp;nbsp;\n&lt;span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'&gt;&lt;/span&gt;\n&lt;/div&gt;\n&lt;div class='headerForeground'&gt;\n&lt;span class='siteTitle' refresh='content' tiddler='SiteTitle'&gt;&lt;/span&gt;&amp;nbsp;\n&lt;span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'&gt;&lt;/span&gt;\n&lt;/div&gt;\n&lt;/div&gt;\n&lt;div id='mainMenu' refresh='content' tiddler='MainMenu'&gt;&lt;/div&gt;\n&lt;div id='sidebar'&gt;\n&lt;div id='sidebarOptions' refresh='content' tiddler='SideBarOptions'&gt;&lt;/div&gt;\n&lt;div id='sidebarTabs' refresh='content' force='true' tiddler='SideBarTabs'&gt;&lt;/div&gt;\n&lt;/div&gt;\n&lt;div id='displayArea'&gt;\n&lt;div id='messageArea'&gt;&lt;/div&gt;\n&lt;div id='tiddlerDisplay'&gt;&lt;/div&gt;\n&lt;/div&gt;\n&lt;!--}}}--&gt;</div>
<div tiddler="StyleSheetColors" tags="">/*{{{*/\nbody {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}\n\na {color:[[ColorPalette::PrimaryMid]];}\na:hover {background-color:[[ColorPalette::PrimaryMid]]; color:[[ColorPalette::Background]];}\na img {border:0;}\n\na,h2,h3,h4,h5,h6 {color:[[ColorPalette::SecondaryDark]]; background:transparent;}\nh1 {border-bottom:2px solid [[ColorPalette::TertiaryLight]];}\nh2,h3 {border-bottom:1px solid [[ColorPalette::TertiaryLight]];}\n\n.button {color:[[ColorPalette::PrimaryDark]]; border:1px solid [[ColorPalette::Background]];}\n.button:hover {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::SecondaryLight]]; border-color:[[ColorPalette::SecondaryMid]];}\n.button:active {color:[[ColorPalette::Background]]; background:[[ColorPalette::SecondaryMid]]; border:1px solid [[ColorPalette::SecondaryDark]];}\n\n.header {background:[[ColorPalette::PrimaryMid]];}\n.headerShadow {color:[[ColorPalette::Foreground]];}\n.headerShadow a {font-weight:normal; color:[[ColorPalette::Foreground]];}\n.headerForeground {color:[[ColorPalette::Background]];}\n.headerForeground a {font-weight:normal; color:[[ColorPalette::PrimaryPale]];}\n\n.tabSelected{color:[[ColorPalette::PrimaryDark]];\n	background:[[ColorPalette::TertiaryPale]];\n	border-left:1px solid [[ColorPalette::TertiaryLight]];\n	border-top:1px solid [[ColorPalette::TertiaryLight]];\n	border-right:1px solid [[ColorPalette::TertiaryLight]];\n}\n.tabUnselected {color:[[ColorPalette::Background]]; background:[[ColorPalette::TertiaryMid]];}\n.tabContents {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::TertiaryPale]]; border:1px solid [[ColorPalette::TertiaryLight]];}\n.tabContents .button {border:0;}\n\n#sidebar {}\n#sidebarOptions input {border:1px solid [[ColorPalette::PrimaryMid]];}\n#sidebarOptions .sliderPanel {background:[[ColorPalette::PrimaryPale]];}\n#sidebarOptions .sliderPanel a {border:none;color:[[ColorPalette::PrimaryMid]];}\n#sidebarOptions .sliderPanel a:hover {color:[[ColorPalette::Background]]; background:[[ColorPalette::PrimaryMid]];}\n#sidebarOptions .sliderPanel a:active {color:[[ColorPalette::PrimaryMid]]; background:[[ColorPalette::Background]];}\n\n.wizard {background:[[ColorPalette::PrimaryPale]]; border:1px solid [[ColorPalette::PrimaryMid]];}\n.wizard h1 {color:[[ColorPalette::PrimaryDark]]; border:none;}\n.wizard h2 {color:[[ColorPalette::Foreground]]; border:none;}\n.wizardStep {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];\n	border:1px solid [[ColorPalette::PrimaryMid]];}\n.wizardStep.wizardStepDone {background:[[ColorPalette::TertiaryLight]];}\n.wizardFooter {background:[[ColorPalette::PrimaryPale]];}\n.wizardFooter .status {background:[[ColorPalette::PrimaryDark]]; color:[[ColorPalette::Background]];}\n.wizard .button {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::SecondaryLight]]; border: 1px solid;\n	border-color:[[ColorPalette::SecondaryPale]] [[ColorPalette::SecondaryDark]] [[ColorPalette::SecondaryDark]] [[ColorPalette::SecondaryPale]];}\n.wizard .button:hover {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::Background]];}\n.wizard .button:active {color:[[ColorPalette::Background]]; background:[[ColorPalette::Foreground]]; border: 1px solid;\n	border-color:[[ColorPalette::PrimaryDark]] [[ColorPalette::PrimaryPale]] [[ColorPalette::PrimaryPale]] [[ColorPalette::PrimaryDark]];}\n\n#messageArea {border:1px solid [[ColorPalette::SecondaryMid]]; background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]];}\n#messageArea .button {color:[[ColorPalette::PrimaryMid]]; background:[[ColorPalette::SecondaryPale]]; border:none;}\n\n.popupTiddler {background:[[ColorPalette::TertiaryPale]]; border:2px solid [[ColorPalette::TertiaryMid]];}\n\n.popup {background:[[ColorPalette::TertiaryPale]]; color:[[ColorPalette::TertiaryDark]]; border-left:1px solid [[ColorPalette::TertiaryMid]]; border-top:1px solid [[ColorPalette::TertiaryMid]]; border-right:2px solid [[ColorPalette::TertiaryDark]]; border-bottom:2px solid [[ColorPalette::TertiaryDark]];}\n.popup hr {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::PrimaryDark]]; border-bottom:1px;}\n.popup li.disabled {color:[[ColorPalette::TertiaryMid]];}\n.popup li a, .popup li a:visited {color:[[ColorPalette::Foreground]]; border: none;}\n.popup li a:hover {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; border: none;}\n.popup li a:active {background:[[ColorPalette::SecondaryPale]]; color:[[ColorPalette::Foreground]]; border: none;}\n.popupHighlight {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}\n.listBreak div {border-bottom:1px solid [[ColorPalette::TertiaryDark]];}\n\n.tiddler .defaultCommand {font-weight:bold;}\n\n.shadow .title {color:[[ColorPalette::TertiaryDark]];}\n\n.title {color:[[ColorPalette::SecondaryDark]];}\n.subtitle {color:[[ColorPalette::TertiaryDark]];}\n\n.toolbar {color:[[ColorPalette::PrimaryMid]];}\n.toolbar a {color:[[ColorPalette::TertiaryLight]];}\n.selected .toolbar a {color:[[ColorPalette::TertiaryMid]];}\n.selected .toolbar a:hover {color:[[ColorPalette::Foreground]];}\n\n.tagging, .tagged {border:1px solid [[ColorPalette::TertiaryPale]]; background-color:[[ColorPalette::TertiaryPale]];}\n.selected .tagging, .selected .tagged {background-color:[[ColorPalette::TertiaryLight]]; border:1px solid [[ColorPalette::TertiaryMid]];}\n.tagging .listTitle, .tagged .listTitle {color:[[ColorPalette::PrimaryDark]];}\n.tagging .button, .tagged .button {border:none;}\n\n.footer {color:[[ColorPalette::TertiaryLight]];}\n.selected .footer {color:[[ColorPalette::TertiaryMid]];}\n\n.sparkline {background:[[ColorPalette::PrimaryPale]]; border:0;}\n.sparktick {background:[[ColorPalette::PrimaryDark]];}\n\n.error, .errorButton {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::Error]];}\n.warning {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::SecondaryPale]];}\n.lowlight {background:[[ColorPalette::TertiaryLight]];}\n\n.zoomer {background:none; color:[[ColorPalette::TertiaryMid]]; border:3px solid [[ColorPalette::TertiaryMid]];}\n\n.imageLink, #displayArea .imageLink {background:transparent;}\n\n.annotation {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; border:2px solid [[ColorPalette::SecondaryMid]];}\n\n.viewer .listTitle {list-style-type:none; margin-left:-2em;}\n.viewer .button {border:1px solid [[ColorPalette::SecondaryMid]];}\n.viewer blockquote {border-left:3px solid [[ColorPalette::TertiaryDark]];}\n\n.viewer table, table.twtable {border:2px solid [[ColorPalette::TertiaryDark]];}\n.viewer th, .viewer thead td, .twtable th, .twtable thead td {background:[[ColorPalette::SecondaryMid]]; border:1px solid [[ColorPalette::TertiaryDark]]; color:[[ColorPalette::Background]];}\n.viewer td, .viewer tr, .twtable td, .twtable tr {border:1px solid [[ColorPalette::TertiaryDark]];}\n\n.viewer pre {border:1px solid [[ColorPalette::SecondaryLight]]; background:[[ColorPalette::SecondaryPale]];}\n.viewer code {color:[[ColorPalette::SecondaryDark]];}\n.viewer hr {border:0; border-top:dashed 1px [[ColorPalette::TertiaryDark]]; color:[[ColorPalette::TertiaryDark]];}\n\n.highlight, .marked {background:[[ColorPalette::SecondaryLight]];}\n\n.editor input {border:1px solid [[ColorPalette::PrimaryMid]];}\n.editor textarea {border:1px solid [[ColorPalette::PrimaryMid]]; width:100%;}\n.editorFooter {color:[[ColorPalette::TertiaryMid]];}\n\n#backstageArea {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::TertiaryMid]];}\n#backstageArea a {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::Background]]; border:none;}\n#backstageArea a:hover {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; }\n#backstageArea a.backstageSelTab {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}\n#backstageButton a {background:none; color:[[ColorPalette::Background]]; border:none;}\n#backstageButton a:hover {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::Background]]; border:none;}\n#backstagePanel {background:[[ColorPalette::Background]]; border-color: [[ColorPalette::Background]] [[ColorPalette::TertiaryDark]] [[ColorPalette::TertiaryDark]] [[ColorPalette::TertiaryDark]];}\n.backstagePanelFooter .button {border:none; color:[[ColorPalette::Background]];}\n.backstagePanelFooter .button:hover {color:[[ColorPalette::Foreground]];}\n#backstageCloak {background:[[ColorPalette::Foreground]]; opacity:0.6; filter:'alpha(opacity:60)';}\n/*}}}*/</div>
<div tiddler="StyleSheetLocale" tags="">/***\nStyleSheet for use when a translation requires any css style changes.\nThis StyleSheet can be used directly by languages such as Chinese, Japanese and Korean which use a logographic writing system and need larger font sizes.\n***/\n\n/*{{{*/\nbody {font-size:0.8em;}\n.headerShadow {position:relative; padding:3.5em 0em 1em 1em; left:-1px; top:-1px;}\n.headerForeground {position:absolute; padding:3.5em 0em 1em 1em; left:0px; top:0px;}\n\n#sidebarOptions {font-size:1.05em;}\n#sidebarOptions a {font-style:normal;}\n#sidebarOptions .sliderPanel {font-size:0.95em;}\n\n.subtitle {font-size:0.8em;}\n\n.viewer table.listView {font-size:1em;}\n\n.htmlarea .toolbarHA table {border:1px solid ButtonFace; margin:0em 0em;}\n/*}}}*/</div>
<div tiddler="StyleSheetPrint" tags="">/*{{{*/\n@media print {\n#mainMenu, #sidebar, #messageArea, .toolbar, #backstageButton, #backstageArea {display: none ! important;}\n#displayArea {margin: 1em 1em 0em 1em;}\n/* Fixes a feature in Firefox 1.5.0.2 where print preview displays the noscript content */\nnoscript {display:none;}\n}\n/*}}}*/</div>
</div>
<!--POST-SHADOWAREA-->
<div id="storeArea">
<?php
include_once($cct_base."tiddlers/include.php");
?>

<?php /*print cct_print_form($standalone);/*cct*/ ?>
</div>
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
//]]>
</script>
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