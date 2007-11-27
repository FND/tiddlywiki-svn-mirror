<?php

	//exit("success");
	include_once("includes/header.php");
	if($tiddlyCfg['developing'])
		error_log('msghanngle.php'.$instance, 0);
		
		
		
		
		
		
		
		
		
		
		
		
///////////////////////////// START OF LOGIN BITS /////////////////////////////////////////////////	
		
		if( isset($_POST['cctuser']) && isset($_POST['cctpass']) )		//set cookie for login
		{	
			echo user_login(formatParametersPOST($_POST['cctuser']),formatParametersPOST($_POST['cctpass']));
				//	$user = user_create();
			//error_log('login', 0);
		//	header("Location: ".$_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']);		//redirect to itself to refresh
		}
		
		
////////////////////////////////////////////END OF LOGIN BITS ///////////////////////////////////////////
		
		
		
//////////////////////////////////////////////////////////initial checking and required functions////////////////////////////////////////
	if( !isset($_POST['action']) && !isset($_GET['action']) )
	{
		exit($ccT_msg['misc']['no_title']);		//not as translation string since this is not normal error
	}
	
	//return result/message
	function returnResult($str)
	{
		exit("\n".$str);		//used for ajax display result
	}
	
//////////////////////////////////////////////////////////GET//////////////////////////////////////////////////////////////
	if( isset($_GET['action']) )
	{
		//list of revision
		if( strcmp($_GET['action'],"revisionList")==0 || strcmp($_GET['action'],"revisionDisplay")==0 )
		{
			if( !isset($_GET['title']) )
			{
				returnResult($ccT_msg['misc']['no_title']);
			}
			
			$title = formatParametersGET($_GET['title']);
			
			$result = getAllVersionTiddly($title);		//get all required version
			
			//print revision list
			if( strcmp($_GET['action'],"revisionList")==0 )
			{
				for( $i=sizeof($result)-1; $i>=0; $i-- )
				{
					print $result[$i]['modified']." ".$result[$i]['version']." ".$result[$i]['modifier'];
					if( $i != 0 )
					{
						print "\n";
					}
				}
			}else{//get detailed info
				for( $i=sizeof($result)-1; $i>=0; $i-- )
				{
					if( $result[$i]['version'] == $_GET['revision'] )
					{
						print $title."\n";
						print $result[$i]['title']."\n";
						print $result[$i]['body']."\n";
						print $result[$i]['modifier']."\n";
						print $result[$i]['modified']."\n";
						$tiddler = tiddler_selectTitle(tiddler_create($title));
						print $tiddler['created']."\n";
						//print $result[$i]['created']."\n";
						print $result[$i]['tags']."\n";
						print $result[$i]['version']."\n";
						print $result[$i]['fields'];
						$i=-1;
					}
				}
				if( $i != -2 ) {
					exit($ccT_msg['error']['revision_not_found']);
				}
			}
		}
		
		exit();
	}
//////////////////////////////////////////////////////////TiddlySnip//////////////////////////////////////////////////////////////
	/*
		discussion
			http://groups.google.com/group/TiddlyWikiDev/browse_thread/thread/42c54b1a26eb82fb
		require POST variable
			action: TiddlySnip
			title: tiddler title
			body: tiddler body
			tags: tiddler tags
			username: username, also modifier
			password: password in plain text
			*overwrite: required to specify overwrite [0 = ask, 1 = overwrite, 2 = append]
		code:
			200: ok
			201: created
			204: no content
			401: unauthorized - username password error
			403: forbidden - no privilege
			405: Method Not Allowed - error for duplicated tiddler without overwrite
			406: Not Acceptable - error for empty title or body
			500: Internal Server Error - unknown error
			
			Would it all be possible to do a POST that returns all tiddler titles as an array? ZW returns something like that when the user logins in... and if we use that to check if the tiddler exists, it will save frequent trips to the server.
Something like this maybe: "?action=contents"
	*/
	
	//get all tiddler//////////////////////////////////////////////////////////////////
	if( strcmp($_GET['action'],"content")==0 )
	{
		$password = formatParametersGET($_GET['password']);
		$username = formatParametersGET($_GET['user']);						//formatting happens below

		//get all tiddlers and display them
		$tiddlers = getAllTiddlers(user_create($username,"",0,"",$password,1));		//privilege calculated here
		foreach($tiddlers as $t)
		{
			print $t['title']."\n";
		}
		exit();
	}
	
	//get single tiddler//////////////////////////////////////////////////////////////////
	if( strcmp($_GET['action'],"get")==0 )
	{
		//strip all slashes first and readd them before adding to SQL
		$title = formatParametersGET($_GET['id']);
		$password = formatParametersGET($_GET['password']);
		$username = formatParametersGET($_GET['user']);						//formatting happens below
		
		//get title
		$tiddler = tiddler_selectTitle(tiddler_create($title));
		
		//check privilege
		$user = user_create($username,"",0,"",$password,1);
		
		if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$tiddler['tags'])) )
		{
			print $tiddler['title']."\n";
			print $tiddler['body']."\n";
			print $tiddler['modifier']."\n";
			print $tiddler['modified']."\n";
			print $tiddler['created']."\n";
			print $tiddler['tag'];
		}else{
			header("HTTP/1.1 204 No Content");
		}
		exit();
	}
	
	//TiddlySnip save request//////////////////////////////////////////////////////////////////
	if( strcmp($_POST['action'],"save")==0 )
	{
		//strip all slashes first and readd them before adding to SQL
		$title = $_POST['title'];
		$body = $_POST['body'];
		$tags = $_POST['tags'];
		//$modifier = preg_replace("![/,\\\\,?,*]!","",$_POST['user']);		//no slashes, star and question mark
		$modified = date("YmdHi");
		$password = $_POST['password'];
		$username = $_POST['user'];						//formatting happens below
		if( get_magic_quotes_gpc() )
		{
			$title = stripslashes($title);
			$body = stripslashes($body);
			$tags = stripslashes($tags);
			$modified = date("YmdHi");
			$password = stripslashes($password);
			$username = stripslashes($username);		//formatting happens below
		}
		$overwrite = 0;
		if( isset($_POST['overwrite']) )		//overwrite or append
		{
			switch( $_POST['overwrite'] )
			{
				case "1":
					$overwrite = 1;
					break;
				case "2":
					$overwrite = 2;
					break;
			}
		}

		$ntiddler = tiddler_create($title, $body, $username, $modified, $tags);
		
		//if empty msg, 406 Not Acceptable
		if( strlen($title) == 0 || strlen($body) == 0 )
		{
			header("HTTP/1.1 406 Not Acceptable");
			exit();
		}
		
		//save tiddler
		$result = saveTiddly($title,"TiddlySnip", $ntiddler, $username, $password, $overwrite);
		
		switch($result)
		{
			case "001":		//insert
				header("HTTP/1.1 201 Created");
				exit();
				break;
			case "002":		//update
				header("HTTP/1.1 200 OK");
				exit();
				break;
			case "015":		//tiddler existed, overwrite not specified
				header("HTTP/1.1 405 Method Not Allowed");
				exit();
				break;
			case "020":		//not authorized
				header("HTTP/1.1 403 Forbidden");
				exit();
				break;
			default:		//unknown error
				header("HTTP/1.1 500 Internal Server Error");
				exit();
		}
	}
	
//////////////////////////////////////////////////////////ccT functions//////////////////////////////////////////////////////////////
	debug($_POST['action']);
//////////////////////////////////////////////////////////saveTiddler//////////////////////////////////////////////////////////////
	if( strcmp($_POST['action'],"saveTiddler")==0 )
	{
		//strip all slashes first and readd them before adding to SQL
		$tiddler = formatParameters($_POST['tiddler']);
		$oldtitle = formatParameters($_POST['otitle']);
		$omodified = formatParameters($_POST['omodified']);
		
		$tiddler = tiddler_htmlToArray($tiddler);
		$ntiddler = tiddler_create($tiddler[0]['title'], 
									$tiddler[0]['body'], 
									$tiddler[0]['modifier'], 
									$tiddler[0]['modified'], 
									$tiddler[0]['tags'], 
									"","","",
									$tiddler[0]['fields']);
		
		//append modifier as tag
		if( $tiddlyCfg['pref']['appendModifier']==1 )
		{
			$modifier_add = $ntiddler['modifier'];
			if( strpos($modifier_add, " ") !== FALSE )
			{
				$modifier_add = "[[".$modifier_add."]]";
			}
			
			if( strpos($ntiddler['tags'],$modifier_add)===FALSE )
			{
				$ntiddler['tags'] .= " ".$modifier_add;
			}
		}
		
		//debugV($ntiddler);
		//check if empty msg
		if( strlen($ntiddler['title']) == 0 )
		{
			logerror($ccT_msg['warning']['blank_entry'],0);
			returnResult($ccT_msg['warning']['blank_entry']);
		}
		//save entry
		$saveResult = saveTiddly( $oldtitle, $omodified, $ntiddler);
		
		switch($saveResult)
		{
			case "001":		//insert
			case "002":		//update
				//mail ( "receiever@example.com", "TiddlyWiki changes (title:".$title.")", $body."\n\n".$tags);
				returnResult($ccT_msg['notice']['TiddlerSaved']);
				break;
			case "004":		//update
				//mail ( "receiever@example.com", "TiddlyWiki changes (title:".$title.")", $body."\n\n".$tags);
				logerror($ccT_msg['warning']['tiddler_overwritten'],0);			//alert user of warning
				returnResult($ccT_msg['notice']['TiddlerSaved'].". ".$ccT_msg['warning']['tiddler_overwritten']);
				break;
			case "012":
				logerror($ccT_msg['warning']['tiddler_need_reload'],0);			//alert user of error and stop script
				returnResult($ccT_msg['warning']['tiddler_need_reload']);		//return error to display in displayMessage and make iframe idle
				break;
			case "020":
				logerror($ccT_msg['warning']['not_authorized'],0);			//alert user of error and stop script
				returnResult($ccT_msg['warning']['not_authorized']);		//return error to display in displayMessage and make iframe idle
				break;
			default:
				logerror($ccT_msg['warning']['save_error']);
				returnResult($ccT_msg['warning']['save_error']);
		}
	}

//////////////////////////////////////////////////////////removeTiddler//////////////////////////////////////////////////////////////
	if( strcmp($_POST['action'],"removeTiddler")==0 )
	{
		//remove quotes
		$title = formatParameters($_POST['title']);
		$title = tiddler_bodyEncode($title);

		debug($title);
		//remove from db if allowed
		//although removing content is effectively the same as removing the tiddly, disable delete would still allow owner to be notified and find the tiddly back in backup if required, through id
		
		$delResult = deleteTiddly($title);
		
		switch($delResult)
		{
			case "003":
				//mail ( "receiever@example.com", "TiddlyWiki changes (title:".$title.")", $body."\n\n".$tags);
				returnResult($ccT_msg['notice']['TiddlerDeleted']);
				break;
			case "014":
				logerror($ccT_msg['warning']['tiddler_not_found'],0);			//alert user of error and stop script
				returnResult($ccT_msg['warning']['tiddler_not_found']);		//return error to display in displayMessage and make iframe idle
				break;
			case "020":
				logerror($ccT_msg['warning']['not_authorized'],0);			//alert user of error and stop script
				returnResult($ccT_msg['warning']['not_authorized']);		//return error to display in displayMessage and make iframe idle
				break;
			default:
				logerror($ccT_msg['warning']['del_err']);
				returnResult($ccT_msg['warning']['del_err']);
		}
	}
//////////////////////////////////////////////////////////rss//////////////////////////////////////////////////////////////
	if( strcmp($_POST['action'],"rss")==0 )
	{
		//remove slashes
		$body = formatParameters($_POST['rss']);

		//check authorization
		$user = user_create();
		if( !tiddler_privilegeMiscCheck($user, "rss") )
		{
			logerror($ccT_msg['warning']['not_authorized'],0);			//alert user of error and stop script
			returnResult($ccT_msg['warning']['not_authorized']);		//return error to display in displayMessage and make iframe idle
		}
		
		
		//save to file
		$fhandle = fopen($tiddlyCfg['pref']['upload_dir'].$tiddlyCfg['pref']['instance_name']."/$config.xml",'w');
		if( $fhandle===FALSE )
		{
			logerror($ccT_msg['error']['rss_file_create'],0
				,$ccT_msg['error']['rss_file_create'].", ".$ccT_msg['msg']['file']."$config.xml");
			returnResult($ccT_msg['error']['rss_file_create']);
		}
		if( fwrite($fhandle,$body)===FALSE )
		{
			logerror($ccT_msg['error']['rss_file_write'],0
				,$ccT_msg['error']['rss_file_write'].", ".$ccT_msg['msg']['file']."$config.xml");
			returnResult($ccT_msg['error']['rss_file_write']);
		}
		
		returnResult($ccT_msg['notice']['RSScreated']);
	}

//////////////////////////////////////////////////////////saveChanges//////////////////////////////////////////////////////////////
	if( strcmp($_POST['action'],"upload")==0 )
	{
		//remove slashes
		$body = formatParameters($_POST['upload']);
		
		//check authorization
		$user = user_create();
		if( !tiddler_privilegeMiscCheck($user, "upload") )
		{
			logerror($ccT_msg['warning']['not_authorized'],0);			//alert user of error and stop script
			returnResult($ccT_msg['warning']['not_authorized']);		//return error to display in displayMessage and make iframe idle
		}
		
		$db_var['settings']['handleError'] = 0;		//supress log error and do error handling here
		$db_var['settings']['defaultStop'] = 0;		//do not stop script if error occurs

		debug("<table border=\"1\"><tr><th>title</th><th>action</th><th>result</th><th>error</th></tr>\n",0);
		
		//convert HTML to array form and insert into DB
		//WARNING: everything will be overwritten so beware
		$error = 0;		//error counter
		$result = tiddler_htmlToArray($body);
		
		foreach( $result as $r )
		{
			$tiddler = tiddler_selectTitle(tiddler_create($r['title']));
			$ntiddler = $r;
			//$ntiddler = tiddler_create($r['title'], $r['body'],$r['modifier'],$r['modified'],$r['tags'],"","",$r['created']);
			debug("<tr><td>".$ntiddler['title']."</td>",0);
			if( sizeof($tiddler) == 0 )		//insert tiddler if not found
			{
				debug("<td>insert</td>",0);
				$ntiddler['version'] = 1;
				$ntiddler['creator'] = $ntiddler['modifier'];		//since creator is not given, assume it is same as modifier
				if( tiddler_insert($ntiddler) === FALSE )
				{
					debug("<td>failed</td>",0);
					debug("<td>".db_error()."</td></tr>",0);
					$error++;
				}else{
					debug("<td>success</td>",0);
					debug("<td>&nbsp;</td></tr>",0);
				}
			}else{							//update tiddler if found
				debug("<td>update</td>",0);
				$ntiddler['creator'] = $tiddler['creator'];
				$ntiddler['created'] = $tiddler['created'];
				$ntiddler['version'] = $tiddler['version']+1;
				if( tiddler_update($tiddler, $ntiddler) === FALSE )
				{
					debug("<td>failed</td>",0);
					debug("<td>".db_error()."</td></tr>",0);
					$error++;
				}else{
					debug("<td>success</td>",0);
					debug("<td>&nbsp;</td></tr>",0);
				}
			}
			debug("\n",0);
		}
		debug("</table>",0);
		returnResult($ccT_msg['notice']['uploadStoreArea_complete'].': '.$error.' '.$ccT_msg['word']['error']);
	}

	exit();
?>
