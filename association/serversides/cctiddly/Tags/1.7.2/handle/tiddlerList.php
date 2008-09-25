<?php
$cct_base = "../";
include_once($cct_base."includes/header.php");

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
sendHeader(200,"", substr( $output, 0, strlen($output) - 1 ),1);
?>
