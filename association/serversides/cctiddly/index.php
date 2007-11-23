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

////////////OPEN ID STUFF]

include('../openid/examples/tiddler.php');

// dispatch the event based on url args.
dispatch();

// Our helpful display page.
$buf = <<< END
  %s
  &lt;div id="login"&gt;
    &lt;form action="%s" method="get"&gt;     
    OpenID: &lt;input  style='background: url(http://mojo.bt.com/images/login-bg.gif) no-repeat #FFF 5px;font-size:1.2em;color:#84807C;border:solid 1px #DFD8D1;
		padding:0.2em;
   padding-left:28px;' type="text" name="identity_url" class="identity_url" /&gt;
    &lt;input type="submit" value="Verify" /&gt;
    &lt;/form&gt;
  &lt;/div&gt;
END;
 $oid =  sprintf( $buf, drawAlert($_message), $_SERVER['HTTP_REFERER'] );

/// END OF OID
// LOGIN THEN REFRESH. 
// check if user is logged in 
//	echo $user['verified'] = user_validate();	
	//logout
	if( isset($_GET['logout']) && $_GET['logout']==1 )
	{
		user_logout();
		
		//redirect to itself to refresh and clear out "logout=1" string
		header("Location: ".$_SERVER['PHP_SELF'].'?'.str_replace("logout=1&","",$_SERVER['QUERY_STRING']));
	}
	
	
	//reqLogin
	if( $tiddlyCfg['pref']['reqLogin'] == 1 || ( isset($_POST['cctuser']) && isset($_POST['cctpass']) ) )
	{

		if( isset($_POST['cctuser']) && isset($_POST['cctpass']) )		//set cookie for login
		{	
				$user['verified'] = user_login(formatParametersPOST($_POST['cctuser']),formatParametersPOST($_POST['cctpass']));
			//error_log('login', 0);
			header("Location: ".$_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']);		//redirect to itself to refresh
		}
		//////////////////////////////////////////print login box if not logged in or not in the right group////////////////////////////////
		$user = user_create();
		

		if( !$user['verified'] )		//if not logged on, display login screen
		{
			?>
			<html><head></head>
			<body><?php if($usr_val==0){?> <html><form action='<?=queryString();?>' method=post><input type=text value=simon id=cctuser name=cctuser width=15><input type=password rows=5 id=cctpass name=cctpass>
			<input type=submit value=login> </form></html><?php } else {?> <html><p>Welcome <?php echo $usr?></p><a href='<?php echo $_SERVER['PHP_SELF'];?>?logout=1&'>Logout</a></html><?php } ?>
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
<base href='http://wikidev.osmosoft.com/svn/' />
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
		print "<link rel='alternate' type='application/rss+xml' title='RSS' href='".$tiddlyCfg['pref']['instance_name']."/$config.xml'>";
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



<?


///////////////////////////// CREATE LOGIN/CREATE SHADOW TIDDLERS ///////////////////////////////////////////////////////////

$logged_in_create_tiddlers = "<div tiddler='SiteTitle' tags=''>Error 404 - Please click below to create this instance </div>
<div  tiddler='CreateInstance' tags=''>&lt;html&gt;&lt;form action='' method='POST'&gt; &lt;input type='text' value='".$tiddlyCfg['pref']['instance_name']."' id='instance_name' name='instance_name'/&gt;&lt;input type='Submit' value='Create the Instance' /&gt; &lt;/form&gt;&lt;/html&gt;</div>
<div  tiddler='MainMenu' tags=''></div>

<div  tiddler='GettingStarted' tags=''>a simple explainaition on how to use TiddlyWiki &lt;br /&gt;

[[Logout|".$_SERVER['PHP_SELF']."?logout=1&]]
</div>
<div  tiddler='DefaultTiddlers' tags=''>[[CreateInstance]][[GettingStarted]]</div>";

$login_to_view_tiddlers =  "<div tiddler='SiteTitle' tags=''>Please Login to view the content of this page</div>
<div tiddler='MainMenu' tags=''></div>";

$login_to_create_tiddlers = "<div tiddler='SiteTitle' tags=''>Error 404 - Please login to create this instance</div>";

$default_login_tiddler = "<div tiddler='DefaultTiddlers' tags=''>GettingStarted</div>";


$login = "<div tiddler='Please Login' tags=''>&lt;html&gt;&lt;form action='' method=post&gt;".$ccT_msg['loginpanel']['username']."&lt;input type=text value=simon id=cctuser name=cctuser width=15&gt;&lt;br /&gt;".$ccT_msg['loginpanel']['password']."&lt;input type=password rows=5 id=cctpass name=cctpass&gt;&lt;br /&gt;&lt;input type=submit value=login&gt; &lt;/form&gt;".$oid."&lt;/html&gt;Username:
<<option txtUserName>>
Password:
<<option pasSecretCode>>
Welcome anonymous [[login|-/index.php?]]</div>
<div tiddler='SiteSubtitle' tags=''>Please Login to view this TiddlyWiki.</div>";



$cut_down_view = "<div tiddler='StyleSheetLayout' tags=''>/*{{{*/\n* html .tiddler {height:1%;}\n\nbody {font-size:.75em; font-family:arial,helvetica; margin:0; padding:0;}\n\nh1,h2,h3,h4,h5,h6 {font-weight:bold; text-decoration:none;}\nh1,h2,h3 {padding-bottom:1px; margin-top:1.2em;margin-bottom:0.3em;}\nh4,h5,h6 {margin-top:1em;}\nh1 {font-size:1.35em;}\nh2 {font-size:1.25em;}\nh3 {font-size:1.1em;}\nh4 {font-size:1em;}\nh5 {font-size:.9em;}\n\nhr {height:1px;}\n\na {text-decoration:none;}\n\ndt {font-weight:bold;}\n\nol {list-style-type:decimal;}\nol ol {list-style-type:lower-alpha;}\nol ol ol {list-style-type:lower-roman;}\nol ol ol ol {list-style-type:decimal;}\nol ol ol ol ol {list-style-type:lower-alpha;}\nol ol ol ol ol ol {list-style-type:lower-roman;}\nol ol ol ol ol ol ol {list-style-type:decimal;}\n\n.txtOptionInput {width:11em;}\n\n#contentWrapper .chkOptionInput {border:0;}\n\n.externalLink {text-decoration:underline;}\n\n.indent {margin-left:3em;}\n.outdent {margin-left:3em; text-indent:-3em;}\ncode.escaped {white-space:nowrap;}\n\n.tiddlyLinkExisting {font-weight:bold;}\n.tiddlyLinkNonExisting {font-style:italic;}\n\n/* the 'a' is required for IE, otherwise it renders the whole tiddler in bold */\na.tiddlyLinkNonExisting.shadow {font-weight:bold;}\n\n#mainMenu .tiddlyLinkExisting,\n	#mainMenu .tiddlyLinkNonExisting,\n	#sidebarTabs .tiddlyLinkNonExisting {font-weight:normal; font-style:normal;}\n#sidebarTabs .tiddlyLinkExisting {font-weight:bold; font-style:normal;}\n\n.header {position:relative;}\n.header a:hover {background:transparent;}\n.headerShadow {position:relative; padding:4.5em 0em 1em 1em; left:-1px; top:-1px;}\n.headerForeground {position:absolute; padding:4.5em 0em 1em 1em; left:0px; top:0px;}\n\n.siteTitle {font-size:3em;}\n.siteSubtitle {font-size:1.2em;}\n\n#mainMenu {position:absolute; left:0; width:10em; text-align:right; line-height:1.6em; padding:1.5em 0.5em 0.5em 0.5em; font-size:1.1em;}\n\n#sidebar {position:absolute; right:3px; width:16em; font-size:.9em;}\n#sidebarOptions {padding-top:0.3em;}\n#sidebarOptions a {margin:0em 0.2em; padding:0.2em 0.3em; display:block;}\n#sidebarOptions input {margin:0.4em 0.5em;}\n#sidebarOptions .sliderPanel {margin-left:1em; padding:0.5em; font-size:.85em;}\n#sidebarOptions .sliderPanel a {font-weight:bold; display:inline; padding:0;}\n#sidebarOptions .sliderPanel input {margin:0 0 .3em 0;}\n#sidebarTabs .tabContents {width:15em; overflow:hidden;}\n\n.wizard {padding:0.1em 1em 0em 2em;}\n.wizard h1 {font-size:2em; font-weight:bold; background:none; padding:0em 0em 0em 0em; margin:0.4em 0em 0.2em 0em;}\n.wizard h2 {font-size:1.2em; font-weight:bold; background:none; padding:0em 0em 0em 0em; margin:0.4em 0em 0.2em 0em;}\n.wizardStep {padding:1em 1em 1em 1em;}\n.wizard .button {margin:0.5em 0em 0em 0em; font-size:1.2em;}\n.wizardFooter {padding:0.8em 0.4em 0.8em 0em;}\n.wizardFooter .status {padding:0em 0.4em 0em 0.4em; margin-left:1em;}\n.wizard .button {padding:0.1em 0.2em 0.1em 0.2em;}\n\n#messageArea {position:fixed; top:2em; right:0em; margin:0.5em; padding:0.5em; z-index:2000; _position:absolute;}\n.messageToolbar {display:block; text-align:right; padding:0.2em 0.2em 0.2em 0.2em;}\n#messageArea a {text-decoration:underline;}\n\n.tiddlerPopupButton {padding:0.2em 0.2em 0.2em 0.2em;}\n.popupTiddler {position: absolute; z-index:300; padding:1em 1em 1em 1em; margin:0;}\n\n.popup {position:absolute; z-index:300; font-size:.9em; padding:0; list-style:none; margin:0;}\n.popup .popupMessage {padding:0.4em;}\n.popup hr {display:block; height:1px; width:auto; padding:0; margin:0.2em 0em;}\n.popup li.disabled {padding:0.4em;}\n.popup li a {display:block; padding:0.4em; font-weight:normal; cursor:pointer;}\n.listBreak {font-size:1px; line-height:1px;}\n.listBreak div {margin:2px 0;}\n\n.tabset {padding:1em 0em 0em 0.5em;}\n.tab {margin:0em 0em 0em 0.25em; padding:2px;}\n.tabContents {padding:0.5em;}\n.tabContents ul, .tabContents ol {margin:0; padding:0;}\n.txtMainTab .tabContents li {list-style:none;}\n.tabContents li.listLink { margin-left:.75em;}\n\n#contentWrapper {display:block;}\n#splashScreen {display:none;}\n\n#displayArea {margin:1em 17em 0em 14em;}\n\n.toolbar {text-align:right; font-size:.9em;}\n\n.tiddler {padding:1em 1em 0em 1em;}\n\n.missing .viewer,.missing .title {font-style:italic;}\n\n.title {font-size:1.6em; font-weight:bold;}\n\n.missing .subtitle {display:none;}\n.subtitle {font-size:1.1em;}\n\n.tiddler .button {padding:0.2em 0.4em;}\n\n.tagging {margin:0.5em 0.5em 0.5em 0; float:left; display:none;}\n.isTag .tagging {display:block;}\n.tagged {margin:0.5em; float:right;}\n.tagging, .tagged {font-size:0.9em; padding:0.25em;}\n.tagging ul, .tagged ul {list-style:none; margin:0.25em; padding:0;}\n.tagClear {clear:both;}\n\n.footer {font-size:.9em;}\n.footer li {display:inline;}\n\n.annotation {padding:0.5em; margin:0.5em;}\n\n* html .viewer pre {width:99%; padding:0 0 1em 0;}\n.viewer {line-height:1.4em; padding-top:0.5em;}\n.viewer .button {margin:0em 0.25em; padding:0em 0.25em;}\n.viewer blockquote {line-height:1.5em; padding-left:0.8em;margin-left:2.5em;}\n.viewer ul, .viewer ol {margin-left:0.5em; padding-left:1.5em;}\n\n.viewer table, table.twtable {border-collapse:collapse; margin:0.8em 1.0em;}\n.viewer th, .viewer td, .viewer tr,.viewer caption,.twtable th, .twtable td, .twtable tr,.twtable caption {padding:3px;}\ntable.listView {font-size:0.85em; margin:0.8em 1.0em;}\ntable.listView th, table.listView td, table.listView tr {padding:0px 3px 0px 3px;}\n\n.viewer pre {padding:0.5em; margin-left:0.5em; font-size:1.2em; line-height:1.4em; overflow:auto;}\n.viewer code {font-size:1.2em; line-height:1.4em;}\n\n.editor {font-size:1.1em;}\n.editor input, .editor textarea {display:block; width:100%; font:inherit;}\n.editorFooter {padding:0.25em 0em; font-size:.9em;}\n.editorFooter .button {padding-top:0px; padding-bottom:0px;}\n\n.fieldsetFix {border:0; padding:0; margin:1px 0px 1px 0px;}\n\n.sparkline {line-height:1em;}\n.sparktick {outline:0;}\n\n.zoomer {font-size:1.1em; position:absolute; overflow:hidden;}\n.zoomer div {padding:1em;}\n\n* html #backstage {width:99%;}\n* html #backstageArea {width:99%;}\n#backstageArea {display:none; position:relative; overflow: hidden; z-index:150; padding:0.3em 0.5em 0.3em 0.5em;}\n#backstageToolbar {position:relative;}\n#backstageArea a {font-weight:bold; margin-left:0.5em; padding:0.3em 0.5em 0.3em 0.5em;}\n#backstageButton {display:none; position:absolute; z-index:175; top:0em; right:0em;}\n#backstageButton a {padding:0.1em 0.4em 0.1em 0.4em; margin:0.1em 0.1em 0.1em 0.1em;}\n#backstage {position:relative; width:100%; z-index:50;}\n#backstagePanel {display:none; z-index:100; position:absolute; margin:0em 3em 0em 3em; padding:1em 1em 1em 1em;}\n.backstagePanelFooter {padding-top:0.2em; float:right;}\n.backstagePanelFooter a {padding:0.2em 0.4em 0.2em 0.4em;}\n#backstageCloak {display:none; z-index:20; position:absolute; width:100%; height:100px;}\n\n.whenBackstage {display:none;}\n.backstageVisible .whenBackstage {display:block;}#sidebar {display:none} .backstageArea {display:none} #backstageToolbar {display:none}\n/*}}}*/</div>

<div tiddler='ViewTemplate' tags=''>&lt;!--{{{--&gt;\n&lt;div class='title' macro='view title'&gt;&lt;/div&gt;\n\n&lt;div class='viewer' macro='view text wikified'&gt;&lt;/div&gt;\n&lt;div class='tagClear'&gt;&lt;/div&gt;\n&lt;!--}}}--&gt;</div>

";

$logged_in_view = "<div tiddler='ViewTemplate' tags=''>&lt;!--{{{--&gt;\n&lt;div class='toolbar' macro='toolbar closeTiddler closeOthers +editTiddler &gt; fields syncing permalink references jump'&gt;&lt;/div&gt;\n&lt;div class='title' macro='view title'&gt;&lt;/div&gt;\n&lt;div class='subtitle'&gt;&lt;span macro='view modifier link'&gt;&lt;/span&gt;, &lt;span macro='view modified date'&gt;&lt;/span&gt; (&lt;span macro='message views.wikified.createdPrompt'&gt;&lt;/span&gt; &lt;span macro='view created date'&gt;&lt;/span&gt;)&lt;/div&gt;\n&lt;div class='tagging' macro='tagging'&gt;&lt;/div&gt;\n&lt;div class='tagged' macro='tags'&gt;&lt;/div&gt;\n&lt;div class='viewer' macro='view text wikified'&gt;&lt;/div&gt;\n&lt;div class='tagClear'&gt;&lt;/div&gt;\n&lt;!--}}}--&gt;</div>
<div tiddler='StyleSheetLayout' tags=''>/*{{{*/\n* html .tiddler {height:1%;}\n\nbody {font-size:.75em; font-family:arial,helvetica; margin:0; padding:0;}\n\nh1,h2,h3,h4,h5,h6 {font-weight:bold; text-decoration:none;}\nh1,h2,h3 {padding-bottom:1px; margin-top:1.2em;margin-bottom:0.3em;}\nh4,h5,h6 {margin-top:1em;}\nh1 {font-size:1.35em;}\nh2 {font-size:1.25em;}\nh3 {font-size:1.1em;}\nh4 {font-size:1em;}\nh5 {font-size:.9em;}\n\nhr {height:1px;}\n\na {text-decoration:none;}\n\ndt {font-weight:bold;}\n\nol {list-style-type:decimal;}\nol ol {list-style-type:lower-alpha;}\nol ol ol {list-style-type:lower-roman;}\nol ol ol ol {list-style-type:decimal;}\nol ol ol ol ol {list-style-type:lower-alpha;}\nol ol ol ol ol ol {list-style-type:lower-roman;}\nol ol ol ol ol ol ol {list-style-type:decimal;}\n\n.txtOptionInput {width:11em;}\n\n#contentWrapper .chkOptionInput {border:0;}\n\n.externalLink {text-decoration:underline;}\n\n.indent {margin-left:3em;}\n.outdent {margin-left:3em; text-indent:-3em;}\ncode.escaped {white-space:nowrap;}\n\n.tiddlyLinkExisting {font-weight:bold;}\n.tiddlyLinkNonExisting {font-style:italic;}\n\n/* the 'a' is required for IE, otherwise it renders the whole tiddler in bold */\na.tiddlyLinkNonExisting.shadow {font-weight:bold;}\n\n#mainMenu .tiddlyLinkExisting,\n	#mainMenu .tiddlyLinkNonExisting,\n	#sidebarTabs .tiddlyLinkNonExisting {font-weight:normal; font-style:normal;}\n#sidebarTabs .tiddlyLinkExisting {font-weight:bold; font-style:normal;}\n\n.header {position:relative;}\n.header a:hover {background:transparent;}\n.headerShadow {position:relative; padding:4.5em 0em 1em 1em; left:-1px; top:-1px;}\n.headerForeground {position:absolute; padding:4.5em 0em 1em 1em; left:0px; top:0px;}\n\n.siteTitle {font-size:3em;}\n.siteSubtitle {font-size:1.2em;}\n\n#mainMenu {position:absolute; left:0; width:10em; text-align:right; line-height:1.6em; padding:1.5em 0.5em 0.5em 0.5em; font-size:1.1em;}\n\n#sidebar {position:absolute; right:3px; width:16em; font-size:.9em;}\n#sidebarOptions {padding-top:0.3em;}\n#sidebarOptions a {margin:0em 0.2em; padding:0.2em 0.3em; display:block;}\n#sidebarOptions input {margin:0.4em 0.5em;}\n#sidebarOptions .sliderPanel {margin-left:1em; padding:0.5em; font-size:.85em;}\n#sidebarOptions .sliderPanel a {font-weight:bold; display:inline; padding:0;}\n#sidebarOptions .sliderPanel input {margin:0 0 .3em 0;}\n#sidebarTabs .tabContents {width:15em; overflow:hidden;}\n\n.wizard {padding:0.1em 1em 0em 2em;}\n.wizard h1 {font-size:2em; font-weight:bold; background:none; padding:0em 0em 0em 0em; margin:0.4em 0em 0.2em 0em;}\n.wizard h2 {font-size:1.2em; font-weight:bold; background:none; padding:0em 0em 0em 0em; margin:0.4em 0em 0.2em 0em;}\n.wizardStep {padding:1em 1em 1em 1em;}\n.wizard .button {margin:0.5em 0em 0em 0em; font-size:1.2em;}\n.wizardFooter {padding:0.8em 0.4em 0.8em 0em;}\n.wizardFooter .status {padding:0em 0.4em 0em 0.4em; margin-left:1em;}\n.wizard .button {padding:0.1em 0.2em 0.1em 0.2em;}\n\n#messageArea {position:fixed; top:2em; right:0em; margin:0.5em; padding:0.5em; z-index:2000; _position:absolute;}\n.messageToolbar {display:block; text-align:right; padding:0.2em 0.2em 0.2em 0.2em;}\n#messageArea a {text-decoration:underline;}\n\n.tiddlerPopupButton {padding:0.2em 0.2em 0.2em 0.2em;}\n.popupTiddler {position: absolute; z-index:300; padding:1em 1em 1em 1em; margin:0;}\n\n.popup {position:absolute; z-index:300; font-size:.9em; padding:0; list-style:none; margin:0;}\n.popup .popupMessage {padding:0.4em;}\n.popup hr {display:block; height:1px; width:auto; padding:0; margin:0.2em 0em;}\n.popup li.disabled {padding:0.4em;}\n.popup li a {display:block; padding:0.4em; font-weight:normal; cursor:pointer;}\n.listBreak {font-size:1px; line-height:1px;}\n.listBreak div {margin:2px 0;}\n\n.tabset {padding:1em 0em 0em 0.5em;}\n.tab {margin:0em 0em 0em 0.25em; padding:2px;}\n.tabContents {padding:0.5em;}\n.tabContents ul, .tabContents ol {margin:0; padding:0;}\n.txtMainTab .tabContents li {list-style:none;}\n.tabContents li.listLink { margin-left:.75em;}\n\n#contentWrapper {display:block;}\n#splashScreen {display:none;}\n\n#displayArea {margin:1em 17em 0em 14em;}\n\n.toolbar {text-align:right; font-size:.9em;}\n\n.tiddler {padding:1em 1em 0em 1em;}\n\n.missing .viewer,.missing .title {font-style:italic;}\n\n.title {font-size:1.6em; font-weight:bold;}\n\n.missing .subtitle {display:none;}\n.subtitle {font-size:1.1em;}\n\n.tiddler .button {padding:0.2em 0.4em;}\n\n.tagging {margin:0.5em 0.5em 0.5em 0; float:left; display:none;}\n.isTag .tagging {display:block;}\n.tagged {margin:0.5em; float:right;}\n.tagging, .tagged {font-size:0.9em; padding:0.25em;}\n.tagging ul, .tagged ul {list-style:none; margin:0.25em; padding:0;}\n.tagClear {clear:both;}\n\n.footer {font-size:.9em;}\n.footer li {display:inline;}\n\n.annotation {padding:0.5em; margin:0.5em;}\n\n* html .viewer pre {width:99%; padding:0 0 1em 0;}\n.viewer {line-height:1.4em; padding-top:0.5em;}\n.viewer .button {margin:0em 0.25em; padding:0em 0.25em;}\n.viewer blockquote {line-height:1.5em; padding-left:0.8em;margin-left:2.5em;}\n.viewer ul, .viewer ol {margin-left:0.5em; padding-left:1.5em;}\n\n.viewer table, table.twtable {border-collapse:collapse; margin:0.8em 1.0em;}\n.viewer th, .viewer td, .viewer tr,.viewer caption,.twtable th, .twtable td, .twtable tr,.twtable caption {padding:3px;}\ntable.listView {font-size:0.85em; margin:0.8em 1.0em;}\ntable.listView th, table.listView td, table.listView tr {padding:0px 3px 0px 3px;}\n\n.viewer pre {padding:0.5em; margin-left:0.5em; font-size:1.2em; line-height:1.4em; overflow:auto;}\n.viewer code {font-size:1.2em; line-height:1.4em;}\n\n.editor {font-size:1.1em;}\n.editor input, .editor textarea {display:block; width:100%; font:inherit;}\n.editorFooter {padding:0.25em 0em; font-size:.9em;}\n.editorFooter .button {padding-top:0px; padding-bottom:0px;}\n\n.fieldsetFix {border:0; padding:0; margin:1px 0px 1px 0px;}\n\n.sparkline {line-height:1em;}\n.sparktick {outline:0;}\n\n.zoomer {font-size:1.1em; position:absolute; overflow:hidden;}\n.zoomer div {padding:1em;}\n\n* html #backstage {width:99%;}\n* html #backstageArea {width:99%;}\n#backstageArea {display:none; position:relative; overflow: hidden; z-index:150; padding:0.3em 0.5em 0.3em 0.5em;}\n#backstageToolbar {position:relative;}\n#backstageArea a {font-weight:bold; margin-left:0.5em; padding:0.3em 0.5em 0.3em 0.5em;}\n#backstageButton {display:none; position:absolute; z-index:175; top:0em; right:0em;}\n#backstageButton a {padding:0.1em 0.4em 0.1em 0.4em; margin:0.1em 0.1em 0.1em 0.1em;}\n#backstage {position:relative; width:100%; z-index:50;}\n#backstagePanel {display:none; z-index:100; position:absolute; margin:0em 3em 0em 3em; padding:1em 1em 1em 1em;}\n.backstagePanelFooter {padding-top:0.2em; float:right;}\n.backstagePanelFooter a {padding:0.2em 0.4em 0.2em 0.4em;}\n#backstageCloak {display:none; z-index:20; position:absolute; width:100%; height:100px;}\n\n.whenBackstage {display:none;}\n.backstageVisible .whenBackstage {display:block;}\n/*}}}*/</div>";




if (!$user['verified'])
{ // user is not varified 
	if (count($tiddlyCfg['pref']['instance_settings']) < 1)
	{   // instance does not exist 
		echo $login_to_create_tiddlers;
		echo $cut_down_view;
		echo $login;
	}
	else
	{	// instance does exist
		echo $login;
		//echo $login_to_view_tiddlers;
		
		if (stristr($tiddlyCfg['privilege_misc']['group_default_privilege']['anonymous'], 'D'))
		{
		echo "<div tiddler='DefaultTiddlers' tags=''>[[Please Login]] GettingStarted</div>";
			
			echo $cut_down_view ;
			//echo $logged_in_view;
		}
		else
		{
			echo $cut_down_view ;
		}
	}
}
else
{ // user is varified 
	if (count($tiddlyCfg['pref']['instance_settings']) < 1)
	{   // instance does not exist 
		echo $cut_down_view;
		echo $logged_in_create_tiddlers;
	} 
	else
	{ // user varified and instance exists 
		echo $logged_in_view;
 	}
}
///////////////////////////// END  LOGIN/CREATE SHADOW TIDDLERS ///////////////////////////////////////////////////////////

?>

<div tiddler="OptionsPanel" tags="">These InterfaceOptions for customising TiddlyWiki are saved in your browser\n\nYour username for signing your edits. Write it as a WikiWord (eg JoeBloggs)\n\n&lt;&lt;option txtUserName&gt;&gt;\n&lt;&lt;option chkSaveBackups&gt;&gt; SaveBackups\n&lt;&lt;option chkAutoSave&gt;&gt; AutoSave\n&lt;&lt;option chkRegExpSearch&gt;&gt; RegExpSearch\n&lt;&lt;option chkCaseSensitiveSearch&gt;&gt; CaseSensitiveSearch\n&lt;&lt;option chkAnimate&gt;&gt; EnableAnimations\n\n----\nAlso see AdvancedOptions</div>
<div tiddler="PageTemplate" tags="">&lt;!--{{{--&gt;\n&lt;div class='header' macro='gradient vert [[ColorPalette::PrimaryLight]] [[ColorPalette::PrimaryMid]]'&gt;\n&lt;div class='headerShadow'&gt;\n&lt;span class='siteTitle' refresh='content' tiddler='SiteTitle'&gt;&lt;/span&gt;&amp;nbsp;\n&lt;span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'&gt;&lt;/span&gt;\n&lt;/div&gt;\n&lt;div class='headerForeground'&gt;\n&lt;span class='siteTitle' refresh='content' tiddler='SiteTitle'&gt;&lt;/span&gt;&amp;nbsp;\n&lt;span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'&gt;&lt;/span&gt;\n&lt;/div&gt;\n&lt;/div&gt;\n&lt;div id='mainMenu' refresh='content' tiddler='MainMenu'&gt;&lt;/div&gt;\n&lt;div id='sidebar'&gt;\n&lt;div id='sidebarOptions' refresh='content' tiddler='SideBarOptions'&gt;&lt;/div&gt;\n&lt;div id='sidebarTabs' refresh='content' force='true' tiddler='SideBarTabs'&gt;&lt;/div&gt;\n&lt;/div&gt;\n&lt;div id='displayArea'&gt;\n&lt;div id='messageArea'&gt;&lt;/div&gt;\n&lt;div id='tiddlerDisplay'&gt;&lt;/div&gt;\n&lt;/div&gt;\n&lt;!--}}}--&gt;</div>
<div tiddler="StyleSheetColors" tags="">/*{{{*/\nbody {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}\n\na {color:[[ColorPalette::PrimaryMid]];}\na:hover {background-color:[[ColorPalette::PrimaryMid]]; color:[[ColorPalette::Background]];}\na img {border:0;}\n\nh1,h2,h3,h4,h5,h6 {color:[[ColorPalette::SecondaryDark]]; background:transparent;}\nh1 {border-bottom:2px solid [[ColorPalette::TertiaryLight]];}\nh2,h3 {border-bottom:1px solid [[ColorPalette::TertiaryLight]];}\n\n.button {color:[[ColorPalette::PrimaryDark]]; border:1px solid [[ColorPalette::Background]];}\n.button:hover {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::SecondaryLight]]; border-color:[[ColorPalette::SecondaryMid]];}\n.button:active {color:[[ColorPalette::Background]]; background:[[ColorPalette::SecondaryMid]]; border:1px solid [[ColorPalette::SecondaryDark]];}\n\n.header {background:[[ColorPalette::PrimaryMid]];}\n.headerShadow {color:[[ColorPalette::Foreground]];}\n.headerShadow a {font-weight:normal; color:[[ColorPalette::Foreground]];}\n.headerForeground {color:[[ColorPalette::Background]];}\n.headerForeground a {font-weight:normal; color:[[ColorPalette::PrimaryPale]];}\n\n.tabSelected{color:[[ColorPalette::PrimaryDark]];\n	background:[[ColorPalette::TertiaryPale]];\n	border-left:1px solid [[ColorPalette::TertiaryLight]];\n	border-top:1px solid [[ColorPalette::TertiaryLight]];\n	border-right:1px solid [[ColorPalette::TertiaryLight]];\n}\n.tabUnselected {color:[[ColorPalette::Background]]; background:[[ColorPalette::TertiaryMid]];}\n.tabContents {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::TertiaryPale]]; border:1px solid [[ColorPalette::TertiaryLight]];}\n.tabContents .button {border:0;}\n\n#sidebar {}\n#sidebarOptions input {border:1px solid [[ColorPalette::PrimaryMid]];}\n#sidebarOptions .sliderPanel {background:[[ColorPalette::PrimaryPale]];}\n#sidebarOptions .sliderPanel a {border:none;color:[[ColorPalette::PrimaryMid]];}\n#sidebarOptions .sliderPanel a:hover {color:[[ColorPalette::Background]]; background:[[ColorPalette::PrimaryMid]];}\n#sidebarOptions .sliderPanel a:active {color:[[ColorPalette::PrimaryMid]]; background:[[ColorPalette::Background]];}\n\n.wizard {background:[[ColorPalette::PrimaryPale]]; border:1px solid [[ColorPalette::PrimaryMid]];}\n.wizard h1 {color:[[ColorPalette::PrimaryDark]]; border:none;}\n.wizard h2 {color:[[ColorPalette::Foreground]]; border:none;}\n.wizardStep {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];\n	border:1px solid [[ColorPalette::PrimaryMid]];}\n.wizardStep.wizardStepDone {background:[[ColorPalette::TertiaryLight]];}\n.wizardFooter {background:[[ColorPalette::PrimaryPale]];}\n.wizardFooter .status {background:[[ColorPalette::PrimaryDark]]; color:[[ColorPalette::Background]];}\n.wizard .button {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::SecondaryLight]]; border: 1px solid;\n	border-color:[[ColorPalette::SecondaryPale]] [[ColorPalette::SecondaryDark]] [[ColorPalette::SecondaryDark]] [[ColorPalette::SecondaryPale]];}\n.wizard .button:hover {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::Background]];}\n.wizard .button:active {color:[[ColorPalette::Background]]; background:[[ColorPalette::Foreground]]; border: 1px solid;\n	border-color:[[ColorPalette::PrimaryDark]] [[ColorPalette::PrimaryPale]] [[ColorPalette::PrimaryPale]] [[ColorPalette::PrimaryDark]];}\n\n#messageArea {border:1px solid [[ColorPalette::SecondaryMid]]; background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]];}\n#messageArea .button {color:[[ColorPalette::PrimaryMid]]; background:[[ColorPalette::SecondaryPale]]; border:none;}\n\n.popupTiddler {background:[[ColorPalette::TertiaryPale]]; border:2px solid [[ColorPalette::TertiaryMid]];}\n\n.popup {background:[[ColorPalette::TertiaryPale]]; color:[[ColorPalette::TertiaryDark]]; border-left:1px solid [[ColorPalette::TertiaryMid]]; border-top:1px solid [[ColorPalette::TertiaryMid]]; border-right:2px solid [[ColorPalette::TertiaryDark]]; border-bottom:2px solid [[ColorPalette::TertiaryDark]];}\n.popup hr {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::PrimaryDark]]; border-bottom:1px;}\n.popup li.disabled {color:[[ColorPalette::TertiaryMid]];}\n.popup li a, .popup li a:visited {color:[[ColorPalette::Foreground]]; border: none;}\n.popup li a:hover {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; border: none;}\n.popup li a:active {background:[[ColorPalette::SecondaryPale]]; color:[[ColorPalette::Foreground]]; border: none;}\n.popupHighlight {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}\n.listBreak div {border-bottom:1px solid [[ColorPalette::TertiaryDark]];}\n\n.tiddler .defaultCommand {font-weight:bold;}\n\n.shadow .title {color:[[ColorPalette::TertiaryDark]];}\n\n.title {color:[[ColorPalette::SecondaryDark]];}\n.subtitle {color:[[ColorPalette::TertiaryDark]];}\n\n.toolbar {color:[[ColorPalette::PrimaryMid]];}\n.toolbar a {color:[[ColorPalette::TertiaryLight]];}\n.selected .toolbar a {color:[[ColorPalette::TertiaryMid]];}\n.selected .toolbar a:hover {color:[[ColorPalette::Foreground]];}\n\n.tagging, .tagged {border:1px solid [[ColorPalette::TertiaryPale]]; background-color:[[ColorPalette::TertiaryPale]];}\n.selected .tagging, .selected .tagged {background-color:[[ColorPalette::TertiaryLight]]; border:1px solid [[ColorPalette::TertiaryMid]];}\n.tagging .listTitle, .tagged .listTitle {color:[[ColorPalette::PrimaryDark]];}\n.tagging .button, .tagged .button {border:none;}\n\n.footer {color:[[ColorPalette::TertiaryLight]];}\n.selected .footer {color:[[ColorPalette::TertiaryMid]];}\n\n.sparkline {background:[[ColorPalette::PrimaryPale]]; border:0;}\n.sparktick {background:[[ColorPalette::PrimaryDark]];}\n\n.error, .errorButton {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::Error]];}\n.warning {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::SecondaryPale]];}\n.lowlight {background:[[ColorPalette::TertiaryLight]];}\n\n.zoomer {background:none; color:[[ColorPalette::TertiaryMid]]; border:3px solid [[ColorPalette::TertiaryMid]];}\n\n.imageLink, #displayArea .imageLink {background:transparent;}\n\n.annotation {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; border:2px solid [[ColorPalette::SecondaryMid]];}\n\n.viewer .listTitle {list-style-type:none; margin-left:-2em;}\n.viewer .button {border:1px solid [[ColorPalette::SecondaryMid]];}\n.viewer blockquote {border-left:3px solid [[ColorPalette::TertiaryDark]];}\n\n.viewer table, table.twtable {border:2px solid [[ColorPalette::TertiaryDark]];}\n.viewer th, .viewer thead td, .twtable th, .twtable thead td {background:[[ColorPalette::SecondaryMid]]; border:1px solid [[ColorPalette::TertiaryDark]]; color:[[ColorPalette::Background]];}\n.viewer td, .viewer tr, .twtable td, .twtable tr {border:1px solid [[ColorPalette::TertiaryDark]];}\n\n.viewer pre {border:1px solid [[ColorPalette::SecondaryLight]]; background:[[ColorPalette::SecondaryPale]];}\n.viewer code {color:[[ColorPalette::SecondaryDark]];}\n.viewer hr {border:0; border-top:dashed 1px [[ColorPalette::TertiaryDark]]; color:[[ColorPalette::TertiaryDark]];}\n\n.highlight, .marked {background:[[ColorPalette::SecondaryLight]];}\n\n.editor input {border:1px solid [[ColorPalette::PrimaryMid]];}\n.editor textarea {border:1px solid [[ColorPalette::PrimaryMid]]; width:100%;}\n.editorFooter {color:[[ColorPalette::TertiaryMid]];}\n\n#backstageArea {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::TertiaryMid]];}\n#backstageArea a {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::Background]]; border:none;}\n#backstageArea a:hover {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; }\n#backstageArea a.backstageSelTab {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}\n#backstageButton a {background:none; color:[[ColorPalette::Background]]; border:none;}\n#backstageButton a:hover {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::Background]]; border:none;}\n#backstagePanel {background:[[ColorPalette::Background]]; border-color: [[ColorPalette::Background]] [[ColorPalette::TertiaryDark]] [[ColorPalette::TertiaryDark]] [[ColorPalette::TertiaryDark]];}\n.backstagePanelFooter .button {border:none; color:[[ColorPalette::Background]];}\n.backstagePanelFooter .button:hover {color:[[ColorPalette::Foreground]];}\n#backstageCloak {background:[[ColorPalette::Foreground]]; opacity:0.6; filter:'alpha(opacity:60)';}\n/*}}}*/</div>
<div tiddler="StyleSheetLocale" tags="">/***\nStyleSheet for use when a translation requires any css style changes.\nThis StyleSheet can be used directly by languages such as Chinese, Japanese and Korean which use a logographic writing system and need larger font sizes.\n***/\n\n/*{{{*/\nbody {font-size:0.8em;}\n.headerShadow {position:relative; padding:3.5em 0em 1em 1em; left:-1px; top:-1px;}\n.headerForeground {position:absolute; padding:3.5em 0em 1em 1em; left:0px; top:0px;}\n\n#sidebarOptions {font-size:1.05em;}\n#sidebarOptions a {font-style:normal;}\n#sidebarOptions .sliderPanel {font-size:0.95em;}\n\n.subtitle {font-size:0.8em;}\n\n.viewer table.listView {font-size:1em;}\n\n.htmlarea .toolbarHA table {border:1px solid ButtonFace; margin:0em 0em;}\n/*}}}*/</div>
<div tiddler="StyleSheetPrint" tags="">/*{{{*/\n@media print {\n#mainMenu, #sidebar, #messageArea, .toolbar, #backstageButton, #backstageArea {display: none ! important;}\n#displayArea {margin: 1em 1em 0em 1em;}\n/* Fixes a feature in Firefox 1.5.0.2 where print preview displays the noscript content */\nnoscript {display:none;}\n}\n/*}}}*/</div>
<div tiddler="LoginTiddler" tags="">
<?php if($usr_val==0){?> &lt;html&gt;&lt;form action='<?=queryString();?>' method=post&gt;&lt;input type=text value=simon id=cctuser name=cctuser width=15&gt;&lt;input type=password rows=5 id=cctpass name=cctpass&gt;&lt;input type=submit value=login&gt; &lt;/form&gt;&lt;/html&gt;<?php } else {?> &lt;html&gt;&lt;p&gt;Welcome <?php echo $usr?>&lt;/p&gt;&lt;a href='?logout=1&'&gt;Logout&lt;/a&gt;&lt;/html&gt;<?php } ?>
</div>

</div>
<!--POST-SHADOWAREA-->
<div id="storeArea">

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
