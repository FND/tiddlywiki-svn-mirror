<?php

//TODO - check for users read access to the tiddler 

$cct_base = "../";
include_once($cct_base."includes/header.php");

$tiddler = db_tiddlers_mainSelectTitle($title);
if( $tiddler === FALSE ) {//not found
	sendHeader(204);
}

$tiddlyCfg['workspace_name'] = $_REQUEST['workspace'];
$tiddler = db_tiddlers_mainSelectTitle($title);
//use tiddler_id to obtain list of tiddler for revision
$t = db_tiddlers_backupSelectOid($tiddler['id']);


if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$tiddler['tags'])) ) { //if read privilege ok, output
	sendHeader(200,"", tiddlerToJson($tiddler), 1);
}else{ //if no read privilege, stop
	sendHeader(204);
}

//echo "{'created':'".$tiddler['created']."', 'text':'".$tiddler['body']."', 'tags':'".$tiddler['tags']."', 'modified':'".$tiddler['modified']."', 'bag':'', 'title':'METITLE', 'modifier':'".$tiddler['modifier']."',  'revision':".$tiddler['revision']."}";
exit;

