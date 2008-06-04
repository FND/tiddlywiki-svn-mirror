<?php
	$cct_base = "../";
	include_once($cct_base."includes/header.php");

	//return result/message
	function returnResult($str)
	{
		global $ccT_msg;
		db_close();

		switch($str) {
			case "001":		//insert
				sendHeader(201,$ccT_msg['notice']['TiddlerSaved'],"",1);
				/*header("HTTP/1.0 201 Created");
				exit($ccT_msg['notice']['TiddlerSaved']);
				break;*/
			case "002":		//update
				//mail ( "receiever@example.com", "TiddlyWiki changes (title:".$title.")", $body."\n\n".$tags);
				sendHeader(200,$ccT_msg['notice']['TiddlerSaved'],"",1);
			case "004":		//update
				//mail ( "receiever@example.com", "TiddlyWiki changes (title:".$title.")", $body."\n\n".$tags);
				//logerror($ccT_msg['warning']['tiddler_overwritten'],0);			//alert user of warning
				sendHeader(200,$ccT_msg['notice']['TiddlerSaved'].". ".$ccT_msg['warning']['tiddler_overwritten'],"",1);
			case "012":
				//logerror($ccT_msg['warning']['tiddler_need_reload'],0);			//alert user of error and stop script
				sendHeader(403,$ccT_msg['warning']['tiddler_need_reload'],"",1);
			case "013":		//no title passed
				sendHeader(400,$ccT_msg['misc']['no_title'],"",1);
			case "020":
				//logerror($ccT_msg['warning']['not_authorized'],0);			//alert user of error and stop script
				sendHeader(401,$ccT_msg['warning']['not_authorized'],"",1);
			default:
				logerror($ccT_msg['warning']['save_error']);
				sendHeader(400,$ccT_msg['warning']['save_error'].": ".$str,"",1);
		}
	}
	
//////////////////////////////////////////////////////////preformat tiddler data//////////////////////////////////////////////////////////////
	if( !isset($_POST['tiddler']) ) {
		returnResult("no tiddler passed");
	}
	//strip all slashes first and readd them before adding to SQL
	$ntiddler = formatParameters($_POST['tiddler']);
	$oldTitle = formatParameters($_POST['otitle']);
	$oldModified = formatParameters(isset($_POST['omodified'])?$_POST['omodified']:"");
	$oldChangecount = formatParameters(isset($_POST['ochangecount'])?$_POST['ochangecount']:"");
	
	//explode tiddler DIV into array
	$ntiddler = tiddler_htmlToArray($ntiddler);
	$ntiddler = tiddler_create($ntiddler[0]['title'], 
								$ntiddler[0]['body'], 
								$ntiddler[0]['modifier'], 
								$ntiddler[0]['modified'], 
								$ntiddler[0]['tags'], 
								"","","",//id, creator, created
								$ntiddler[0]['fields']);

//////////////////////////////////////////////////////preliminary data check and action//////////////////////////////////////////////////////////////
	//make connection to DB
	//db_connect_new();
	
	//get user and privilege and set variables
	/*if( strlen($username)==0 && strlen($password)==0 )
	{
		$user = user_create();		//get username password from cookie
	}else{
		$user = user_create($username,"",0,"",$password,1);
	}*/
	//$modifier = $user['username'];			//this is always true in local TW, set modifier = username
	
	//if anonymous and forceAnonymous is on, change username and modifier to $ccT_msg['loginpanel']['anoymous']
	if( $user['verified'] === FALSE && $tiddlyCfg['pref']['forceAnonymous']==1 )
	{
		$user['username'] = $ccT_msg['loginpanel']['anoymous'];
		$ntiddler['modifier'] = $ccT_msg['loginpanel']['anoymous'];
	}
	
	//append modifier as tag
	if( $tiddlyCfg['pref']['tag_tiddler_with_modifier']==1 )
	{
		$modifier_add = (strpos($ntiddler['modifier']," ")?
							"[[".$ntiddler['modifier']."]]":
							$ntiddler['modifier']);
		
		if( strpos($ntiddler['tags'],$modifier_add)===FALSE )
		{
			$ntiddler['tags'] .= " ".$modifier_add;
		}
	}
	
	//check for markup
	if( !tiddler_markupCheck($user,$title) )
	{
		returnResult("020");
	}
	
	//check if empty title
	if( strlen($ntiddler['title']) == 0 )
	{
		returnResult("013");
	}

	///////////////////////////////////////////////////////////////decide action/////////////////////////////////////////////////////////
	/*SCENERIO
		old title		new title (in DB)	old = new title inserted?		action
		N			N			NA					INSERT
		N			Y			NA					new OVERWRITE another tiddler
		Y			Y			Y					UPDATE (title not changed)
		Y			N			N					edit title name UPDATE
		Y			Y			N					one tiddler overwrite another OVERWRITE
		
	PROCEDURE
		if otitle NOT exist and both old and new title not found
			create new tiddler								[INSERT]
		
	*/
	//	old title NOT exist:
	//		creating new tiddler		[INSERT]
	//		user dont have right to read, and created a new tiddler which may overwrite an existing one		[OVERWRITE]
	//	old title exist:
	//		different to new title		[RENAME]
	//		same as new title		[UPDATE]
	//check if old title exist
	//	if not exist, either it is creating new tiddler
	//		or it wasn't displayed for that user, which can overwrite another tiddler
	//	declare otitle false
	//if old title exist, is it the same as new tiddler?

	
	//check if new tiddler title already exist, FALSE if not exist
	$tiddler = db_tiddlers_mainSelectTitle($ntiddler['title']);
	//if otitle exist, search for old tiddler, FALSE if not exist
	if( $oldTitle===NULL ) {
		$otiddler = FALSE;
	}else{
		$otiddler = db_tiddlers_mainSelectTitle($oldTitle,$tiddlyCfg['table']['main'],$tiddlyCfg['workspace_name']);
	}
	
	$save_status = 0;		//use to store save action [insert, overwrite, update]
	
	/////////////////////////////////////////////INSERT
	//insert tiddler if both are not found in DB
	if( $otiddler===FALSE ) {
		if( $tiddler===FALSE ) {	//otiddler and ntiddler not exist = insert
			$save_status = "insert";

		}else{						//otiddler not exist, ntiddler exist, new overwrite another, use otiddler id
			$save_status = "newOverwrite";
	
			//$save_status = "update";
		}
	}else{			//END OF old tiddler not exist
		
					
		if( $tiddler===FALSE ) {		//otiddler exist, ntiddler not exist = rename tiddler
			$save_status = "update";
	
		}else{		//END OF old tiddler exist, new tiddler not exist
										//otiddler and ntiddler exist
			if( $otiddler['id'] == $tiddler['id'] ) {
				$save_status = "update";
			}else{	//overwrite another tiddler
				$save_status = "overwriteAnother";
			}
		}
	}
	///////////////////////////////////////////////////////////////insert/////////////////////////////////////////////////////////
	if( strcmp($save_status, "insert") == 0 ) {
		if( user_insertPrivilege(user_tiddlerPrivilegeOfUser($user,$ntiddler['tags'])) ) {
			$ntiddler['creator'] = $ntiddler['modifier'];
			$ntiddler['created'] = $ntiddler['modified'];
			$ntiddler['revision'] = 1;
			tiddler_insert_new($ntiddler);
			returnResult("001");
		}else{
			returnResult("020");
		}
	}
	///////////////////////////////////////////////////////////////new tiddler overwrite existing/////////////////////////////////////////////////////////
	//warning: if two users creat the same title tiddler without loading each other, the old one would be overwrited without warning!!!
	if( strcmp($save_status, "newOverwrite") == 0 ) {
				//require edit privilege on new and old tags
		if( 	user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$ntiddler['tags'])) 
			&& 	user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$tiddler['tags'])) )
		{
			$ntiddler['id'] = $tiddler['id'];
			$ntiddler['creator'] = $tiddler['creator'];
			$ntiddler['created'] = $tiddler['created'];
			$ntiddler['revision'] = $tiddler['revision']+1;
			tiddler_update_new($tiddler['id'], $ntiddler);
			returnResult("004");
		}else{
			returnResult("020");
		}
	}

	///////////////////////////////////////////////////////////////update/////////////////////////////////////////////////////////
	//$saveResult = saveTiddly( $oldTitle, $oldModified, $ntiddler);
	if( strcmp($save_status, "update") == 0 ) {
						debug("ipdares2");
		if( strcmp($otiddler['modified'],$oldModified)!=0 ) {		//ask to reload if modified date differs
			returnResult("012");
		}
				//require edit privilege on new and old tags
		if( 	user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$ntiddler['tags'])) 
			&& 	user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$otiddler['tags'])) )
		{
			$ntiddler['creator'] = $otiddler['creator'];
			$ntiddler['created'] = $otiddler['created'];
			$ntiddler['revision'] = $otiddler['revision']+1;
			tiddler_update_new($otiddler['id'], $ntiddler);
			returnResult( "002" );
		}else{
			returnResult( "020" );
		}
	}
	///////////////////////////////////////////////////////////////overwriteAnother/////////////////////////////////////////////////////////
	//$saveResult = saveTiddly( $oldTitle, $oldModified, $ntiddler);
	if( strcmp($save_status, "overwriteAnother") == 0 ) {
		if( strcmp($otiddler['modified'],$oldModified)!=0 ) {		//ask to reload if modified date differs
			returnResult("012");
		}
		
		//delete current tiddler
		if( user_deletePrivilege(user_tiddlerPrivilegeOfUser($user,$tiddler['tags'])) ) {
			tiddler_delete_new($tiddler['id']);		//delete current tiddler
		}else{
			returnResult("020");
		}
		
		//update otiddler to new data
				//require edit privilege on new and old tags
		if( 	user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$ntiddler['tags'])) 
			&& 	user_editPrivilege(user_tiddlerPrivilegeOfUser($user,$otiddler['tags'])) )
		{
			$ntiddler['creator'] = $otiddler['creator'];
			$ntiddler['created'] = $otiddler['created'];
			$ntiddler['revision'] = $otiddler['revision']+1;
			tiddler_update_new($otiddler['id'], $ntiddler);
			returnResult( "004" );
		}else{
			returnResult( "020" );
		}
	}
	///////////////////////////////////////////////////////////////result manipulate/////////////////////////////////////////////////////////
	
	
?>
