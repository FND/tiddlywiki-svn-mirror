<?php
	$cct_base = "../";
	include_once($cct_base."includes/header.php");
	
	//return result/message
	function returnResult($str)
	{
		global $ccT_msg;
		db_close();
		switch($str) {
			case "007":		//successful
				break;
			case "013":		//no title passed
				exit("\n".$ccT_msg['misc']['no_title']);
				break;
			case "014":		//revision not found
				exit("\n".$ccT_msg['error']['revision_not_found']);
				break;
			default:
				exit("\n".$ccT_msg['word']['error']);
		}
	}
//////////////////////////////////////////////////////////preformat tiddler data//////////////////////////////////////////////////////////////
	//make connection to DB
	db_connect_new();
	
	if( !isset($_GET['title']) ) {
		returnResult("013");
	}

	$title = formatParametersGET($_GET['title']);
	$revision = formatParametersGET($_GET['revision']);
	
//////////////////////////////////////////////////////////start of code//////////////////////////////////////////////////////////////

	//get user and privilege and set variables
	if( strlen($username)==0 && strlen($password)==0 )
	{
		$user = user_create();		//get username password from cookie
	}else{
		$user = user_create($username,"",0,"",$password,1);
	}
	
	//get tiddler with certain title to obtain its tiddler_id
	$tiddler = db_tiddlers_mainSelectTitle($title);
	if( $tiddler === FALSE ) {//not found
		returnResult("014");
	}

	//use tiddler_id to obtain list of tiddler for revision
	$tiddler_list = db_tiddlers_backupSelectOid($tiddler['id']);
	
	//find revision
	foreach( $tiddler_list as $t ) {
		if( $revision == $t['revision'] ) {		//if revision equals, check privilege
			if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$t['tags'])) ) {	//if read privilege ok, output
				print $title."\n";
				print $t['title']."\n";
				print $t['body']."\n";
				print $t['modifier']."\n";
				print $t['modified']."\n";
				print $tiddler['created']."\n";
				print $t['tags']."\n";
				print $t['version']."\n";
				print $t['fields'];
				returnResult("007");
			}else{		//if no read privilege, stop
				returnResult("014");
			}
		}
	}
	returnResult("014");	//error if not found
?>
