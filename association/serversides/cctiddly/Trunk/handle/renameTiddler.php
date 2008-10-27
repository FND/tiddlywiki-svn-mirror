<?php
error_log($_SERVER['REQUEST_URI']);
$cct_base = "../";
include_once($cct_base."includes/header.php");
$tiddlyCfg['workspace_name'] = $_REQUEST['workspace'];  
debug($_SERVER['PHP_SELF'], "handle");	
$tiddler = db_tiddlers_mainSelectTitle($_REQUEST['otitle']);
$ntiddler = $tiddler; 
$ntiddler['title'] = $_REQUEST['ntitle']; 

$ntiddler['revision'] = "1";
if(tiddler_update_new($tiddler['id'], $ntiddler))
{
	error_log("sending 200");
	sendHeader(200);
}
exit;
//if(!user_session_validate())
//{
//	sendHeader("401");
//	exit;	
//}



error_log($_REQUEST['otitle']."< OLD <<>> NEW >".$_REQUEST['ntitle']);


//if(user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$tiddler['tags'])))
//{
	
	$ntiddler = $tiddler; 
	$ntiddler['title'] = $_REQUEST['ntitle']; 
	
	$ntiddler['revision'] = "1";
	tiddler_update_new($tiddler['id'], $ntiddler);
//}
	debug($user['username'], "save");
?>