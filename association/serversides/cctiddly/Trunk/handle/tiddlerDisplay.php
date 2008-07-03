<?php
	$cct_base = "../";
	include_once($cct_base."includes/header.php");
	
//////////////////////////////////////////////////////////preformat tiddler data//////////////////////////////////////////////////////////////
	if( !isset($_GET['title']) ) {
		sendHeader(400,$ccT_msg['misc']['no_title'],"",1);
	}
	
	$title = formatParametersGET($_GET['title']);
	
//////////////////////////////////////////////////////////start of code//////////////////////////////////////////////////////////////

	$tiddler = db_tiddlers_mainSelectTitle($title);
	if( $tiddler === FALSE ) {//not found
		sendHeader(204,$ccT_msg['error']['tidder_not_found'],"",1);
	}

	if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$tiddler['tags'])) ) { //if read privilege ok, output
		//print tiddler content
		$output = $title."\n";
		$output .= $tiddler['title']."\n";
		$output .= $tiddler['body']."\n";
		$output .= $tiddler['modifier']."\n";
		$output .= $tiddler['modified']."\n";
		$output .= $tiddler['created']."\n";
		$output .= $tiddler['tags']."\n";
		$output .= $tiddler['revision']."\n";
		$output .= $tiddler['fields'];
		sendHeader(200,"", $output,1);
	}else{ //if no read privilege, stop
		sendHeader(204,$ccT_msg['error']['tiddler_not_found'],"",1);
	}

	sendHeader(204,$ccT_msg['error']['tiddler_not_found'],"",1);
?>
