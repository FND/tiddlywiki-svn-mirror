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
	db_connect();
	
	if( !isset($_GET['title']) ) {
		returnResult("013");
	}

	$title = formatParametersGET($_GET['title']);
	
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
	
	//check privilege for each tiddler
	$tmp = array();
	foreach( $tiddler_list as $t ) {
		if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$t['tags'])) )
		{
			$tmp[] = $t;
		}
	}
	$tiddler_list = $tmp;
	
	//print revision list
	$output = "";
	foreach($tiddler_list as $t) {
		$output .= $t['modified']." ".$t['revision']." ".$t['modifier']."\n";
	}
	print substr( $output, 0, strlen($output) - 1 );
	/*for( $i=sizeof($tiddler_list)-1; $i>=0; $i-- ) {
		print $tiddler_list[$i]['modified']." ".$tiddler_list[$i]['version']." ".$tiddler_list[$i]['modifier'];
		if( $i != 0 )
		{
			print "\n";
		}
	}*/
	returnResult("007");
?>
