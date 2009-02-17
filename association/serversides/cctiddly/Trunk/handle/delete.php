<?php
$cct_base = "../";
include_once($cct_base."includes/header.php");
debug($_SERVER['PHP_SELF'], "handle");	

//return result/message
$title = formatParametersPOST($_POST['title']);

//check for markup
if( !tiddler_markupCheck($user,$title) )
{
	sendHeader(401);
}
//get tiddler to check for privilege
$tiddler = db_tiddlers_mainSelectTitle($title);
if( $tiddler===FALSE ) {
//	sendHeader(404);
}

if(user_deletePrivilege(user_tiddlerPrivilegeOfUser($user,$tiddler['tags']))) {
echo "tryin";
	tiddler_delete_new($tiddler['id']);		//delete current tiddler
	sendHeader(200);
}else{
	sendHeader(401);
}

?>
