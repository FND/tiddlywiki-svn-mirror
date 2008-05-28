<div title="ccVariables" modifier="ccTiddly" tags="systemConfig ccTiddly excludeSearch excludeLists">
<pre>
/*{{{*/
	
window.ccTiddlyVersion = '<?php echo $tiddlyCfg['version'];?>';
window.workspacePermission= {};
window.url = "<?php echo getURL();?>";
window.workspace = "<?php echo $tiddlyCfg['workspace_name'];?>";



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
	config.options.txtTheme = 'simpleTheme';	
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

// PHP TO JAVASCRIPT VARIABLE ASSIGNMENT --- 
window.workspace_delete = "<?php echo $workspace_delete;?>";
window.workspace_udate = "<?php $workspace_udate;?>";
window.can_create_account = "<?php echo $tiddlyCfg['can_create_account'];?>";
window.openid_enabled = "<?php echo $tiddlyCfg['pref']['openid_enabled']; ?>";

setStylesheet(store.getRecursiveTiddlerText("ccStyleSheet",10),"ccStyleSheet");

/*}}}*/
</pre>
</div>