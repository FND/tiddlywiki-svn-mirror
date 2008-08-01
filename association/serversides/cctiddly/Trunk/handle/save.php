<?php
$cct_base = "../";
include_once($cct_base."includes/header.php");

		debug("AAASAVE", "steps");	

//return result/message
function returnResult($str)
{
	global $ccT_msg;
	db_close();
	switch($str) {
		case "001":		//insert
			sendHeader(201,$ccT_msg['notice']['TiddlerSaved'],"",1);
		case "002":		//update
			sendHeader(200,$ccT_msg['notice']['TiddlerSaved'],"",1);
		case "004":		//update
			sendHeader(200,$ccT_msg['notice']['TiddlerSaved'].". ".$ccT_msg['warning']['tiddler_overwritten'],"",1);
		case "012":
			sendHeader(403,$ccT_msg['warning']['tiddler_need_reload'],"",1);
		case "013":		//no title passed
			sendHeader(400,$ccT_msg['misc']['no_title'],"",1);
		case "020":
			sendHeader(401,$ccT_msg['warning']['not_authorized'],"",1);
		default:
			sendHeader(400,$ccT_msg['warning']['save_error'].": ".$str,"",1);
	}
}

// TODO set workspace name 
$ntiddler['title'] = formatParametersPOST($_POST['title']);
$oldTitle = formatParametersPOST($_POST['otitle']);
$ntiddler['modifier'] = formatParametersPOST($_POST['modifier']);
$ntiddler['modified'] = formatParametersPOST($_POST['modified']);
$ntiddler['created'] = formatParametersPOST($_POST['created']); 
$ntiddler['tags'] = formatParametersPOST($_POST['tags']);
$ntiddler['body'] =  formatParametersPOST($_POST['body']);
$ntiddler['revision'] = formatParametersPOST($_POST['revision']);
$ntiddler['fields'] = formatParametersPOST($_POST['fields']);
$oldModified = formatParametersPOST($_POST['omodified']);

$tiddler = db_tiddlers_mainSelectTitle($ntiddler['title']);
	debug("Fetch Original Tiddler  ", "steps");	
	
	debug("return : ".isset($tiddler['title'])." val = ".$tiddler['title']);
if(isset($tiddler['title']))
{
	// Tiddler with the same 	name already exisits.
	debug("Save : Title is set ", "steps");
	$otiddler = db_tiddlers_mainSelectTitle($oldTitle,$tiddlyCfg['table']['main'],$tiddlyCfg['workspace_name']);
	debug("POST orev: ".$_POST['revision'], "params");
	debug("db rev : ".$tiddler['revision'], "params");
	
	if($tiddler['revision'] >= $_POST['revision'] ) {		//ask to reload if modified date differs
		debug("RELOAD REQUIRED", "params");
		returnResult("012");
	}
			//require edit privilege on new and old tags
	if(user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$ntiddler['tags'])) && user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$otiddler['tags'])))
	{
		$ntiddler['modified'] = $ntiddler['modified']; 
		$ntiddler['creator'] = $otiddler['creator'];
		$ntiddler['created'] = $otiddler['created'];
		$ntiddler['revision'] = $otiddler['revision']+1;
		tiddler_update_new($otiddler['id'], $ntiddler);
		returnResult( "002" );
	}else{
		returnResult( "020" );	
	}
}else{
	//This Tiddler does not exist in the database.
	if( user_insertPrivilege(user_tiddlerPrivilegeOfUser($user,$ntiddler['tags'])) ) {

		$ntiddler['creator'] = $ntiddler['modifier'];
		$ntiddler['created'] = $ntiddler['modified'];
		debug($ntiddler['modified']."MOD");
		$ntiddler['revision'] = 1;
		tiddler_insert_new($ntiddler);
		returnResult("001");
	}else{
		returnResult("020");
	}
}
?>
