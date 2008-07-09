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
	if( !isset($_GET['title']) ) {
		//returnResult("013");
		sendHeader(400,$ccT_msg['misc']['no_title'],"",1);
	}

	$title = formatParametersGET($_GET['title']);
	
	
	
	//get tiddler with certain title to obtain its tiddler_id
	$tiddler = db_tiddlers_mainSelectTitle($title);
	if( $tiddler === FALSE ) {//not found
		//returnResult("014");
		sendHeader(204,$ccT_msg['error']['revision_not_found'],"",1);
	}

	//use tiddler_id to obtain list of tiddler for revision
	$tiddler_list = db_tiddlers_backupSelectOid($tiddler['id']);
	
	//check privilege for each tiddler
	$tmp = array();
	foreach( $tiddler_list as $t ) {
		if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$t['tags'])) )
		{
			$tmp[] = $t;
		}
	}
	$tiddler_list = $tmp;
	
	if( sizeof($tiddler_list)==0 ) {		//if empty
		sendHeader(204,$ccT_msg['error']['revision_not_found'],"",1);
	}
	
	//print revision list
	$output = "";
	foreach($tiddler_list as $t) {
		$output .= $t['modified']." ".$t['revision']." ".$t['modifier']."\n";
	}
	
	
	//remove terminating "/n" using substr
	sendHeader(200,"", substr( $output, 0, strlen($output) - 1 ),1);
	//returnResult("007");
?>
