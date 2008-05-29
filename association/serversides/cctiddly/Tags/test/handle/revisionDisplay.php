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
	
	if( !isset($_GET['revision']) ) {
		//returnResult("013");
		sendHeader(204,$ccT_msg['error']['revision_not_found'],"",1);
	}
	
	$title = formatParametersGET($_GET['title']);
	$revision = formatParametersGET($_GET['revision']);
	
//////////////////////////////////////////////////////////start of code//////////////////////////////////////////////////////////////

	//get tiddler with certain title to obtain its tiddler_id
	$tiddler = db_tiddlers_mainSelectTitle($title);
	if( $tiddler === FALSE ) {//not found
		//returnResult("014");
		sendHeader(204,$ccT_msg['error']['revision_not_found'],"",1);
	}

	//use tiddler_id to obtain list of tiddler for revision
	$tiddler_list = db_tiddlers_backupSelectOid($tiddler['id']);
	
	//find revision
	foreach( $tiddler_list as $t ) {
		if( $revision == $t['revision'] ) {		//if revision equals, check privilege
			if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$t['tags'])) ) {	//if read privilege ok, output
				$output = $title."\n";
				$output .= $t['title']."\n";
				$output .= $t['body']."\n";
				$output .= $t['modifier']."\n";
				$output .= $t['modified']."\n";
				$output .= $tiddler['created']."\n";
				$output .= $t['tags']."\n";
				$output .= $t['revision']."\n";
				$output .= $t['fields'];
				sendHeader(200,"", $output,1);
				//returnResult("007");
			}else{		//if no read privilege, stop
				sendHeader(204,$ccT_msg['error']['revision_not_found'],"",1);
				//returnResult("014");
			}
		}
	}
	sendHeader(204,$ccT_msg['error']['revision_not_found'],"",1);
?>
