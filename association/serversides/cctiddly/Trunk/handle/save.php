<?php
$cct_base = "../";
include_once($cct_base."includes/header.php");

// TODO set workspace name 
$ntiddler['title'] = formatParametersPOST($_POST['title']);
$oldTitle = formatParametersPOST($_POST['otitle']);
$ntiddler['modifier'] = formatParametersPOST($_POST['modifier']);
$ntiddler['modified'] = formatParametersPOST($_POST['modified']);
$ntiddler['created'] = formatParametersPOST($_POST['created']); 
$ntiddler['tags'] = formatParametersPOST($_POST['tags']);
$ntiddler['body'] =  htmlspecialchars(utf8RawUrlDecode(formatParametersPOST($_POST['body'])));
$ntiddler['revision'] = formatParametersPOST($_POST['revision']);
$ntiddler['fields'] = formatParametersPOST($_POST['fields']);

$tiddler = db_tiddlers_mainSelectTitle($ntiddler['title']);

if(isset($tiddler['title']))
{
	// Tiddler with the same name already exisits.
	$otiddler = db_tiddlers_mainSelectTitle($oldTitle,$tiddlyCfg['table']['main'],$tiddlyCfg['workspace_name']);
	if( strcmp($otiddler['modified'],$oldModified)!=0 ) {		//ask to reload if modified date differs
		echo "page reload required"; 
//		returnResult("012");
	}
			//require edit privilege on new and old tags
	if( 	user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$ntiddler['tags'])) 
		&& 	user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$otiddler['tags'])) )
	{
		$ntiddler['creator'] = $otiddler['creator'];
		$ntiddler['created'] = $otiddler['created'];
		$ntiddler['revision'] = $otiddler['revision']+1;
		tiddler_update_new($otiddler['id'], $ntiddler);
		//returnResult( "002" );
		echo "tiddler updated";
	}else{
		echo "permissions denied";
///		returnResult( "020" );
	}
}else
{
	//This Tiddler does not exist in the database.
	if( user_insertPrivilege(user_tiddlerPrivilegeOfUser($user,$ntiddler['tags'])) ) {
		$ntiddler['creator'] = $ntiddler['modifier'];
		$ntiddler['created'] = $ntiddler['modified'];
		$ntiddler['revision'] = 1;
		tiddler_insert_new($ntiddler);
		echo "Tiddler Created";
	//	returnResult("001");
	}else{
		echo "PERMISSION DENIED";
	//	returnResult("020");
	}
}
?>
