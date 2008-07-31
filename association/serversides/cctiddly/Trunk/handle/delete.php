<?php
echo "1";
	$cct_base = "../";
	include_once($cct_base."includes/header.php");
	echo "2";
	//return result/message
	function returnResult($str)
	{
		global $ccT_msg;
	//	db_close();
		
		switch($str)
		{
			case "003":
				exit("\n".$ccT_msg['notice']['TiddlerDeleted']);
				break;
			case "014":
				exit("\n".$ccT_msg['warning']['tiddler_not_found']);		//return error to display in displayMessage and make iframe idle
				break;
			case "020":
				exit("\n".$ccT_msg['warning']['not_authorized']);		//return error to display in displayMessage and make iframe idle
				break;
			default:
				exit("\n".$ccT_msg['warning']['del_err'].": ".$str);
		}
	}

echo "3";

//////////////////////////////////////////////////////////preformat tiddler data//////////////////////////////////////////////////////////////
	//strip all slashes first and readd them before adding to SQL
	$title = formatParameters($_REQUEST['title']);

echo "4";

	//check for markup
	if( !tiddler_markupCheck($user,$title) )
	{
		sendHeader(401,$ccT_msg['warning']['not_authorized'],"",1);
	}

	echo "4";
	//get tiddler to check for privilege
	$tiddler = db_tiddlers_mainSelectTitle($title);
	if( $tiddler===FALSE ) {
		sendHeader(404,$ccT_msg['warning']['tiddler_not_found'],"",1);
		//returnResult("014");
	}
	
	//delete current tiddler
	if( user_deletePrivilege(user_tiddlerPrivilegeOfUser($user,$tiddler['tags'])) ) {
		tiddler_delete_new($tiddler['id']);		//delete current tiddler
		//returnResult("003");
		sendHeader(200,$ccT_msg['notice']['TiddlerDeleted'],"",1);
	}else{
		//returnResult("020");
		sendHeader(401,$ccT_msg['warning']['not_authorized'],"",1);
	}
	sendHeader(400,$ccT_msg['warning']['del_error'],"",1);

?>