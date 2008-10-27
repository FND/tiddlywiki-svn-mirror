<?php
$cct_base = "../";
include_once($cct_base."includes/header.php");
debug($_SERVER['PHP_SELF'], "handle");	

if(!user_session_validate())
{
	sendHeader("401");
	exit;	
}
$tiddlyCfg['workspace_name'] = $_REQUEST['workspace'];  
$tiddler = db_tiddlers_mainSelectTitle($_REQUEST['otitle']);

if(user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$ntiddler['tags'])) && user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$otiddler['tags'])))
{
	$ntiddler = $tiddler; 
	$ntiddler['title'] = $_REQUEST['ntitle']; 
	tiddler_update_new($tiddler['id'], $ntiddler);
}

?>