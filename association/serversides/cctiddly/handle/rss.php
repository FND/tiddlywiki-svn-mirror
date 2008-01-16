<?php
	$cct_base = "../";
	include_once($cct_base."includes/header.php");
	
	//return result/message
	function returnResult($str)
	{
		global $ccT_msg;
		db_close();

		switch($str) {
			case "005":
				exit("\n".$ccT_msg['notice']['RSScreated']);
				break;
			case "015":		//file create error
				exit("\n".$ccT_msg['error']['rss_file_create'].". ".$ccT_msg['warning']['tiddler_overwritten']);
				break;
			case "016":		//file write error
				exit("\n".$ccT_msg['error']['rss_file_write']);		//return error to display in displayMessage and make iframe idle
				break;
			case "020":
				//logerror($ccT_msg['warning']['not_authorized'],0);			//alert user of error and stop script
				exit("\n".$ccT_msg['warning']['not_authorized']);		//return error to display in displayMessage and make iframe idle
				break;
			default:
				logerror($ccT_msg['warning']['save_error']);
				exit("\n".$ccT_msg['warning']['save_error']);
		}
	}
	
//////////////////////////////////////////////////////////preformat tiddler data//////////////////////////////////////////////////////////////
	//strip all slashes first and readd them before adding to SQL
	$body = formatParameters($_POST['rss']);

//////////////////////////////////////////////////////preliminary data check and action//////////////////////////////////////////////////////////////
	//make connection to DB
	db_connect_new();
	
	//get user and privilege and set variables
	if( strlen($username)==0 && strlen($password)==0 )
	{
		$user = user_create();		//get username password from cookie
	}else{
		$user = user_create($username,"",0,"",$password,1);
	}
	//$modifier = $user['username'];			//this is always true in local TW, set modifier = username
	
	//check authorization
	if( !tiddler_privilegeMiscCheck($user, "rss") )
	{
		returnResult("020");
	}

//////////////////////////////////////////////////////////rss save//////////////////////////////////////////////////////////////
	//save to file
	//$fhandle = fopen("./$config.xml",'w');
	$fhandle = fopen($cct_base.$tiddlyCfg['workspace_name'].".xml",'w');
	if( $fhandle===FALSE ) {		//create file error
		returnResult("015");
	}
	var_dump(fwrite($fhandle,$body));exit;
	if( fwrite($fhandle,$body)===FALSE ) {		//file write error
		returnResult("016");
	}
	
	returnResult("005");

?>
