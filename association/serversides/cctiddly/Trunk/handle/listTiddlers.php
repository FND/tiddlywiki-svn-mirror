<?php
//TODO - check user has permission and only reutrn tiddlers to which the user has permission

$cct_base = "../";
include_once($cct_base."includes/header.php");
include_once($cct_base."includes/login.php");
$tiddlyCfg['workspace_name'] = $_REQUEST['workspace'];
$tiddlers = getAllVersionTiddly($title);
$t = array();
$tiddlers = getAllTiddlers();
$skin_tiddlers = getSkinTiddlers($_REQUEST['skin']); 
$tiddlers = array_merge($skin_tiddlers, $tiddlers); 
$a = "[";
if( sizeof($tiddlers)>0 )
{
	foreach( $tiddlers as $t )
	{
		if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$t['tags'])) ) { //if read privilege ok, output
			$a .= "{'title':'".$t['title']."', 'revision':".$t['revision']."}".",";
		}else{ //if no read privilege, stop
			sendHeader(204,$ccT_msg['error']['tiddler_not_found'],"",1);
		}
		
	}
}
echo substr($a,0,strlen($a)-1); 
echo "]";
	
	
?>