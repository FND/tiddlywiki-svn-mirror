<?php

$cct_base = "../";
include_once($cct_base."includes/header.php");


$title = formatParametersGET($_REQUEST['title']);
$revision = formatParametersGET($_REQUEST['revision']);


if( !isset($_GET['title']) ) {
	//returnResult("013");
	sendHeader(400,$ccT_msg['misc']['no_title'],"",1);
}

if( !isset($_GET['revision']) ) {
	//returnResult("013");
	sendHeader(204,$ccT_msg['error']['revision_not_found'],"",1);
}

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
			echo '{"created":"'.$t['created'].'", "text":"'.tiddler_bodyEncode($t['body']).'", "tags":"'.$t['tags'].'", "modified":"'.$t['modified'].'", "bag":"", "title":"METITLE", "modifier":"'.$t['modifier'].'", "revision":'.$t['revision'].'}';
		//	sendHeader(200,"", $output,1);
			//returnResult("007");
		}else{		//if no read privilege, stop
			sendHeader(204,$ccT_msg['error']['revision_not_found'],"",1);
			//returnResult("014");
		}
	}
}
//sendHeader(204,$ccT_msg['error']['revision_not_found'],"",1);
?>
