<div title="ccAssignments" modifier="ccTiddly" tags="systemConfig ccTiddly excludeSearch excludeLists">
<pre>
/*{{{*/
	
window.ccTiddlyVersion = '<?php echo $tiddlyCfg['version'];?>';
window.workspacePermission= {};
window.url = "<?php echo getURL();?>";
window.workspace = "<?php echo $tiddlyCfg['workspace_name'];?>";


config.defaultCustomFields = {"server.host":window.url, "server.type":"ccTiddly", "server.workspace":window.workspace};


<?php
if($theme == "simple")
{
	?>
	
	<?php
}
if($error404 == true)
{
?>
	var titleTiddler = store.createTiddler('SiteTitle');
	titleTiddler.text = '404 - Workspace does not exists';
	var subTitleTiddler = store.createTiddler('SiteSubtitle');
	subTitleTiddler.text = '';
	config.shadowTiddlers.DefaultTiddlers = 'CreateWorkspace';
	refreshDisplay();
<?php
}

if ($workspace_create == "A" &&  $tiddlyCfg['allow_workspace_creation'] ==1)
{
	echo "workspacePermission.create = 1;\n";
}
if (user_isAdmin($user['username'], $tiddlyCfg['workspace_name']))
{
	echo "workspacePermission.upload = 1;";
	echo "workspacePermission.owner = 1;";
} else if ($tiddlyCfg['only_workspace_admin_can_upload'] != 1)
{
	echo "workspacePermission.upload = 1;";
}

$anonPerm  = stringToPerm($tiddlyCfg['default_anonymous_perm']);


if ($user['verified'])
{
?>
window.loggedIn ="1";
<?php
}
else{
?>

setStylesheet("#sidebarOptions{display:none}#sidebar{display:none}#mainMenu {display:none}#sidebar, #sidebarTabs{display:none}", config.refreshers.styleSheet);
//config.options.txtTheme = 'simpleTheme';	
<?php
}
?>
	
workspacePermission.anonC = <?php echo permToBinary($anonPerm['create']); ?> ;
workspacePermission.anonR = <?php echo permToBinary($anonPerm['read']); ?>; 
workspacePermission.anonU = <?php echo permToBinary($anonPerm['update']); ?>;
workspacePermission.anonD = <?php echo permToBinary($anonPerm['delete']); ?>;

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
?>

window.workspace_delete = "<?php echo $workspace_delete;?>";
window.workspace_udate = "<?php echo $workspace_udate;?>";
window.can_create_account = "<?php echo $tiddlyCfg['can_create_account'];?>";
window.openid_enabled = "<?php echo $tiddlyCfg['pref']['openid_enabled']; ?>";

var serverside={
	url:"<?php echo getURL();?>",		//server url, for use in local TW or TW hosted elsewhere
	workspace:"<?php echo $tiddlyCfg['workspace_name'];?>",
	queryString:"<?php echo queryString();?>",
	debug:<?php print $tiddlyCfg['developing'] ?>,		//debug mode, display alert box for each action
	passwordTime:0,		//defines how long password variable store in cookie. 0 = indefinite
	messageDuration:5000,				//displayMessage autoclose duration (in milliseconds), 0=leave open

	lingo:{		//message for different language
		uploadStoreArea:"<?php print $ccT_msg['notice']['uploadStoreArea'] ?>",
		rss:"<?php print $ccT_msg['notice']['uploadRSS'] ?>",
		timeOut:"<?php print $ccT_msg['notice']['timeOut'] ?>",
		error:"<?php print $ccT_msg['notice']['error'] ?>",
		click4Details:"<?php print $ccT_msg['notice']['click4Details'] ?>",
		returnedTextTitle:"<?php print $ccT_msg['notice']['returnedTextTitle'] ?>",
		anonymous:"<?php print $ccT_msg['loginpanel']['anoymous'] ?>",
		login:{
			login:"<?php print $ccT_msg['loginpanel']['login'] ?>",
			loginFailed:"<?php print $ccT_msg['loginpanel']['loginFailed'] ?>",
			loginPrompt:"<?php print $ccT_msg['loginpanel']['loginPrompt'] ?>",
			logout:"<?php print $ccT_msg['loginpanel']['logout'] ?>",
			logoutPrompt:"<?php print $ccT_msg['loginpanel']['logoutPrompt'] ?>"
		},
		revision:{
			text:"<?php print $ccT_msg['word']['revision'] ?>",
			tooltip:"<?php print $ccT_msg['misc']['revision_tooltip'] ?>",
			popupNone:"<?php print $ccT_msg['warning']['no_revision'] ?>",
			error:"<?php print $ccT_msg['error']['revision_error'] ?>",
			notExist:"<?php print $ccT_msg['error']['revision_not_found'] ?>"
		}
	},
	loggedIn:<?php echo  $usr_val?user_session_validate():0;?>,
	status:{		//require translation later
		200: "OK",
		201: "Created",
		204: "Empty",
		207: "MultiStatus",
		401: "Unauthorized",
		403: "Forbidden",
		404: "Not found",
		405: "Method not allowed"
	},
	fn:{}		//server-side function
};

// TODO : which to use? neither seem to work. 

config.defaultCustomFields = {"server.host":window.url, "server.type":"ccTiddly", "server.workspace":window.workspace};

config.defaultAdaptor = 'cctiddly';

merge(config.optionsDesc,{
	txtUserName: "",
	chkRegExpSearch: "Enable regular expressions for searches",
	chkCaseSensitiveSearch: "Case-sensitive searching",
	chkIncrementalSearch: "Incremental key-by-key searching",
	chkAnimate: "Enable animations",
	chkSaveBackups: "",
	chkAutoSave: "",
	txtTheme: "Change the TiddlyWiki theme being used",
	chkGenerateAnRssFeed: "",
	chkSaveEmptyTemplate: "",
	chkOpenInNewWindow: "Open external links in a new window",
	chkToggleLinks: "Clicking on links to open tiddlers causes them to close",
	chkHttpReadOnly: "",
	chkForceMinorUpdate: "",
	chkConfirmDelete: "Require confirmation before deleting tiddlers",
	chkInsertTabs: "Use the tab key to insert tab characters instead of moving between fields",
	txtBackupFolder: "",
	txtMaxEditRows: "Maximum number of rows in edit boxes",
	txtFileSystemCharSet: "Default character set for saving changes (Firefox/Mozilla only)"});


//setStylesheet(store.getRecursiveTiddlerText("ccStyleSheet",10),"ccStyleSheet");

/*}}}*/
</pre>
</div>