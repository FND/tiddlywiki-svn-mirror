<div title="ccAssignments" modifier="ccTiddly" tags="systemConfig ccTiddly excludeSearch excludeLists">
<pre>
/*{{{*/
	
window.ccTiddlyVersion = '<?php echo $tiddlyCfg['version'];?>';
window.workspacePermission= {};
window.url = "<?php echo getURL();?>";
window.workspace = "<?php echo $tiddlyCfg['workspace_name'];?>";


<?php 

if ($tiddlyCfg['workspace_name'] == ""){
	?>
		window.fullUrl = window.url;	
	<?php
} elseif ($tiddlyCfg['use_mod_rewrite'] == 1){ 
	?>
	window.fullUrl = window.url+"/"+window.workspace;
		<?php

}else{
	?>
	window.fullUrl = window.url+"?workspace="+window.workspace;
	<?php
}
if ($tiddlyCfg['use_mod_rewrite'] == 1)
{
?>
	window.useModRewrite = 1;
<?php
}
?>

config.defaultCustomFields = {"server.host":window.url, "server.type":"cctiddly", "server.workspace":window.workspace};

if (config.options.txtTheme == "")
config.options.txtTheme = '<?php echo $tiddlyCfg['txtTheme'];?>';

<?php
if(isset($error404) && $error404 == true)
{
?>
	var titleTiddler = store.createTiddler('SiteTitle');
	titleTiddler.text = "'<?php echo $tiddlyCfg['workspace_name'];?>' does not exists";
	var subTitleTiddler = store.createTiddler('SiteSubtitle');
	subTitleTiddler.text = 'The workspace you requested does not exist.';
	var subTitleTiddler = store.createTiddler('MainMenu');
	subTitleTiddler.text = '';	
	config.shadowTiddlers.DefaultTiddlers = 'CreateWorkspace';
	refreshDisplay();
<?php
}

if ($user['verified'] && $workspace_create == "A" &&  $tiddlyCfg['allow_workspace_creation'] ==1)
{
	echo "workspacePermission.create = 1;\n";
}
if ($user['verified'] && user_isAdmin($user['username'], $tiddlyCfg['workspace_name']))
{
	echo "workspacePermission.upload = 1;";
	echo "workspacePermission.owner = 1;";
} else if ($tiddlyCfg['only_workspace_admin_can_upload'] != 1)
{
	echo "workspacePermission.upload = 1;";
}


if ($user['verified'])
{
?>
window.loggedIn ="1";
<?php
}
else{
?>

<?php
}

$anonPerm  = stringToPerm($tiddlyCfg['default_anonymous_perm']);
$userPerm  = stringToPerm($tiddlyCfg['default_user_perm']);	

?>



workspacePermission.anonC = <?php echo permToBinary($anonPerm['create']); ?> ;
workspacePermission.anonR = <?php echo permToBinary($anonPerm['read']); ?>; 
workspacePermission.anonU = <?php echo permToBinary($anonPerm['update']); ?>;
workspacePermission.anonD = <?php echo permToBinary($anonPerm['delete']); ?>;



workspacePermission.userC = <?php echo permToBinary($userPerm['create']); ?> ;
workspacePermission.userR = <?php echo permToBinary($userPerm['read']); ?>; 
workspacePermission.userU = <?php echo permToBinary($userPerm['update']); ?>;
workspacePermission.userD = <?php echo permToBinary($userPerm['delete']); ?>;

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
	loggedIn:<?php echo  isset($usr_val)?user_session_validate():0;?>
};

config.defaultCustomFields = {"server.host":window.url, "server.type":"cctiddly", "server.workspace":window.workspace};

//  Change the options for advanced settings. 

merge(config.macros.options,{
	wizardTitle:"Advanced settings",
	step1Title:null,
		unknownDescription: "//(unknown)//",
	listViewTemplate: {
		columns: [
			{name: 'Option', field: 'option', title: "", type: 'String'},
			{name: 'Description', field: 'description', title: "", type: 'WikiText'}
			],
			rowClasses: [
						{className: 'lowlight', field: 'lowlight'}
						]
}
	});
	
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
	
	merge(config.macros.options,{
		wizardTitle: "Change Settings",
		step1Title: "",
		step1Html: '<input type="hidden" name="markList"></input><br><input type="hidden" checked="false" name="chkUnknown"></input>These options are saved in a cookie.'
	});

	
// ccTiddly Macros Assignments 


/*}}}*/
</pre>
</div>