<?php	
//////////////////////////////////////////////////////// description ////////////////////////////////////////////////////////
	/**
		@file
		
		@brief This is a php version of TiddlyWiki, which provide server side functions allowing the wiki to be editted over HTTP.
		
		@author: CoolCold
		@email: cctiddly.coolcold@dfgh.net
	*/
	
	/**
		features:
			-standalone: make standalone version of tiddly
			-access control: only users with correct secret code can change content
			-privacy control: can hide certain tags from display to unauthorized user
			-versioning: see all versions of a particular tiddly
			
		acknowledgement:
			This is derived from phpTiddlyWiki written by Patrick Curry [http://www.patrickcurry.com/tiddly/]
			
		license:
			This is licensed under GPL v2
			http://www.gnu.org/licenses/gpl.txt

	*/
	/**
		requirement:
			config.php - config variable
			language.php - error msgs
	*/
	

//////////////////////////////////////////////////////// FUNCTIONS ////////////////////////////////////////////////////////


	//!	@fn array getAllTiddlers()
	//!	@brief get all tiddlers in nested array, removing ones the user do not have read privilege
	function getAllTiddlers($user="")
	{
		global $tiddlyCfg;
		
		//get all data from db
		//db_connect();
		$tiddlers = tiddler_selectAll();
		
		//check permission and print
		if( strlen($user)==0 )
		{
			$user = user_create();
		}
		if( sizeof($tiddlers)>0 )
		{
			$return_tiddlers = array();
			foreach( $tiddlers as $t )
			{
				//obtain privilege from tag
				//move tiddlers to another array
				if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$t['tags'])) )
				{
					//tiddler_outputDIV($t);
					$return_tiddlers[$t['title']] = $t;
				}
			}
			return $return_tiddlers;		//tiddlers would be in the form array("<title>"=>array("title"=>"<title>", .....
		}
		return array();
	}

	//!	@fn bool getAllVersionTiddly($title)
	//!	@brief print all version of a particular tiddler, remove ones the user don't have read privilege.
	//!	@param $title title of required tiddler
	function getAllVersionTiddly($title)
	{
		global $tiddlyCfg;
		
		//get current tiddler id

		$tiddler_id = tiddler_selectTitle($title);
		debug('getAllVersionTiddly - get current tiddler ok ');
		//return empty array if not found
		if( sizeof($tiddler_id)==0 )
		{
			return array();
		}
		
		debug('get tiddlers from the revisions table.');
		$tiddlers = tiddler_selectBackupID($tiddler_id['id']);

		$user = user_create();
		
		if( sizeof($tiddlers)>0 )
		{
			$return_tiddlers = array();
			foreach( $tiddlers as $t )
			{
				//obtain privilege from tag
				//move tiddlers to another array
				if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$t['tags'])) )
				{
					//tiddler_outputDIV($t);
					//$t['title'] .= " version ".$t['version'];
					//$return_tiddlers[$t['title']] = $t;
					$return_tiddlers[] = $t;
				}
			}
			return $return_tiddlers;		//tiddlers would be in the form array("<title>"=>array("title"=>"<title>", .....
		}
		return array();
	}

	//!	@fn getTiddlersWithTags($yesTags,$noTags)
	//!	@brief get tiddlers with and without certain tags
	//!	@param $yesTags tag array, display tiddlers with this tag
	//!	@param $noTags tag array, not display tiddlers with this tag
	function getTiddlersWithTags($yesTags,$noTags)
	{
		global $tiddlyCfg;
		//get all data from db
		$tiddlers = tiddler_selectAll();
		
		//check permission and print
		if( strlen($user)==0 )
		{
			$user = user_create();
		}
		if( sizeof($tiddlers)>0 )
		{
			$return_tiddlers = array();
			foreach( $tiddlers as $t )
			{
				//obtain privilege from tag
				//move tiddlers to another array
				if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$t['tags'])) )
				{
					//check for tags
					$tag = tiddler_breakTag($t['tags']);
					$tmp = array_merge($tag,$noTags);
					
					if( sizeof($tmp) == sizeof(array_flip(array_flip($tmp))) )		//if no $noTags, continue
					{
						$tmp = array_merge($tag,$yesTags);
						//if no yesTags, assume only want to remove some tag thus all but $noTags are returned
						//if $yesTags exist, display only if $yesTags is in tiddler
						if( sizeof($yesTags)==0 || sizeof($tmp) != sizeof(array_flip(array_flip($tmp))) )
						{
							$return_tiddlers[$t['title']] = $t;
						}
					}
				}
			}
			return $return_tiddlers;		//tiddlers would be in the form array("<title>"=>array("title"=>"<title>", .....
		}
		return array();
	}
///////////////////////////////////////////////////////////////get tiddlers/////////////////////////////////////////
	
	//!	@fn bool saveTiddly($otitle, $title, $body, $modifier="YourName", $tags="")
	//!	@brief save tiddler
	//!	@param $otitle current title
	//!	@param $title new title
	//!	@param $body new body
	//!	@param $modifier person adding/changing the tiddler
	//!	@param $tags tags
	//function saveTiddly($otitle, $title, $body, $modified, $omodified, $modifier="YourName", $tags="", $username="", $password="", $overwrite=0)
	function saveTiddly($otitle, $omodified, $ntiddler, $username="", $password="", $overwrite=0)
	{
		global $tiddlyCfg;
				debug('saveTiddly');
		//SCENERIO
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
		
		//lock title check
		if( in_array($ntiddler['title'],$tiddlyCfg['pref']['lock_title']) )
		{
			debug("lock titles");
			return "020";
		}
		
		//get user and privilege and set variables
		if( strlen($username)==0 && strlen($password)==0 )
		{
			$user = user_create();
		}else{
			$user = user_create($username,"",0,"",$password,1);
		}
		//$modifier = $user['username'];			//this is always true in local TW, set modifier = username
		
		//if anonymous and forceAnonymous is on, change username and modifier to $ccT_msg['loginpanel']['anoymous']
		if( $user['verified'] === FALSE && $tiddlyCfg['pref']['forceAnonymous']==1 )
		{
			global $ccT_msg;
			$user['username'] = $ccT_msg['loginpanel']['anoymous'];
			$ntiddler['modifier'] = $ccT_msg['loginpanel']['anoymous'];
		}
		
		//check for markup
		if( !tiddler_markupCheck($user,$title) )
		{
			debug("markup check");
			return "020";
		}
		
		$tiddler = tiddler_selectTitle(tiddler_create($ntiddler['title']));			//tiddler with title $title
		if( $otitle===NULL )		//$otitle not exist
		{
			$otiddler = array();
		}elseif( strcmp($ntiddler['title'],$otitle)==0 ){		//$otitle same as $ntiddler['title'], EDIT without changing title
			//$otiddler = $tiddler;
			if( sizeof($tiddler)>0 )		//if $title exist
			{
				if( strcmp("TiddlySnip",$omodified)!=0 )
				{
					if( strcmp($tiddler['modified'],$omodified)!=0 )		//ask to reload if modified date differs
					{
						return "012";
					}
					return updateTiddler($user, $ntiddler, $tiddler);
				}else{
					if( $overwrite==1 )		//overwrite
					{
						return updateTiddler($user, $ntiddler, $tiddler);
					}elseif( $overwrite==2 )		//append
					{
						$ntiddler['body'] = $tiddler['body'].$ntiddler['body'];
						$ntiddler['tags'] = $tiddler['tags'].$ntiddler['tags'];
						return updateTiddler($user, $ntiddler, $tiddler);
					}
					return "015";		//tiddler existed
				}
			}else{				//both title not exist and use insert
				$otiddler = array();
			}
		}else{
			$otiddler = tiddler_selectTitle(tiddler_create($otitle));		//tiddler with $otitle
		}
		
		//insert tiddler if both are not found
		if( sizeof($tiddler)==0 && sizeof($otiddler)==0 ) {
			return insertTiddler($user,$ntiddler);
		}
		
		//if old title not exist, but new title exist, treat as overwrite (new tiddler overwrite another)
		if( sizeof($tiddler)!=0 && sizeof($otiddler)==0 ) {
			$result = updateTiddler($user, $ntiddler, $tiddler);
			if( strcmp($result,"002")==0 )		//if success, warn of overwrite
			{
				return "004";
			}
			return $result;
		}
		
		//$otitle exist, $title not exist, treat as editting/modify (rename  tiddler)
		if( sizeof($tiddler)==0 && sizeof($otiddler)!=0 )
		{
			//if old title exist, check if old modified time matches to new one
			if( strcmp($otiddler['modified'],$omodified)!=0 )		//ask to reload if modified date differs
			{
				return "012";
			}
			
			return updateTiddler($user, $ntiddler, $otiddler);
		}
		
		//both $otitle and $title exist and title different, $title overwrite $otitle, delete $title
		if( sizeof($tiddler)!=0 && sizeof($otiddler)!=0 )
		{
			//if old title exist, check if old modified time matches to new one
			if( strcmp($otiddler['modified'],$omodified)!=0 )		//ask to reload if modified date differs
			{
				return "012";
			}
			
			$result = deleteTiddler($user, $tiddler);
			if( strcmp($result,"003")!=0 )		//if delete unsuccessful, return
			{
				return $result;
			}
			$result = updateTiddler($user, $ntiddler, $otiddler);
			if( strcmp($result,"002")==0 )		//if update successful, notify of overwrite
			{
				return "004";
			}
			return $result;
		}
		
		return "010";
	}

	//!	@fn string insertTiddler($userArr,$tiddlerArr)
	//!	@brief insert tiddler into DB
	//!	@param $userArr user array
	//!	@param $tiddlerArr tiddler array
	function insertTiddler($userArr,$tiddlerArr)
	{
		if( user_insertPrivilege(user_tiddlerPrivilegeOfUser($userArr,$tiddlerArr['tags'])) )
		{
			$ntiddler = tiddler_create($title, $body, $modifier, $modified, $tags);
			$tiddlerArr['creator'] = $tiddlerArr['modifier'];
			$tiddlerArr['created'] = $tiddlerArr['modified'];
			$tiddlerArr['version'] = 1;
			tiddler_insert($tiddlerArr);
			return "001";
		}else{
			return "020";
		}
	}
	
	//!	@fn string updateTiddler($userArr,$tiddlerArr)
	//!	@brief update a tiddler in DB
	//!	@param $userArr user array
	//!	@param $tiddlerArr new tiddler array, data to be inserted into db
	//!	@param $otiddlerArr old tiddler array, the tiddler that requires update
	function updateTiddler($userArr, $tiddlerArr, $otiddlerArr)
	{
		//require edit privilege on new and old tags
		if( 	user_editPrivilege(user_tiddlerPrivilegeOfUser($userArr,$tiddlerArr['tags'])) 
			&& 	user_editPrivilege(user_tiddlerPrivilegeOfUser($userArr,$otiddlerArr['tags'])) )
		{
			$tiddlerArr['creator'] = $otiddlerArr['creator'];
			$tiddlerArr['created'] = $otiddlerArr['created'];
			$tiddlerArr['version'] = $otiddlerArr['version']+1;
			tiddler_update($otiddlerArr, $tiddlerArr);
			return "002";
		}else{
			return "020";
		}
	}
	
	//!	@fn string deleteTiddler($userArr,$tiddlerArr)
	//!	@brief delete a tiddler in DB
	//!	@param $userArr user array
	//!	@param $tiddlerArr new tiddler array, data to be inserted into db
	function deleteTiddler($userArr, $tiddlerArr)
	{
		//require edit privilege on new and old tags
		if( user_deletePrivilege(user_tiddlerPrivilegeOfUser($userArr,$tiddlerArr['tags'])) )
		{
			tiddler_delete($tiddlerArr);		//delete current tiddler
			return "003";
		}else{
			return "020";
		}
	}

	
	//!	@fn bool deleteTiddly($title)
	//!	@brief delete tiddler, does not delete in backup table
	//!	@param $title title to be deleted
	function deleteTiddly($title)
	{
		$user = user_create();

		//check for extra privilege if title is markup
		if( !tiddler_markupCheck($user,$title) )
		{
			return "020";
		}

		$tiddler = tiddler_selectTitle(tiddler_create($title));		//tiddler to delete
		debug('Number ofTiddlers found matching the title'.sizeof($tiddler));
		if( sizeof($tiddler)==0 )		//check if tiddler exist
		{
			return "014";
		}
		
		return deleteTiddler($user, $tiddler);
	}
	
	
	//  Returns time in TiddlyWiki format from Epoch time stamp.
	function epochToTiddlyTime($timestamp)
	{
		return date('YmdHi', $timestamp); 
	}

//////////////////////////////////////////////////////// format related////////////////////////////////////////////////////////
	//!	@fn cookie_set($k,$v)
	//!	@brief set cookie, apply rawurlencode before setting cookie for compatibility with TW
	//!	@param $k cookie name
	//!	@param $v cookie value
	function cookie_set($k,$v)
	{
		global $tiddlyCfg;
		$expire =  time()+$tiddlyCfg['pref']['session_expire'];	
		if(setcookie($k,rawurlencode($v), $expire,"/"))
			return true;
		else
			return false;
	}
	
	
	
	function cookie_kill($k)
	{
		global $tiddlyCfg;
		return @setcookie($k, "", time() - 3600);
	}
	
	
	
	//!	@fn cookie_get($k)
	//!	@brief get cookie, apply rawurldecode before return and empty string if not exist
	//!	@param $k cookie name
	function cookie_get($k)
	{
		return (isset($_COOKIE[$k])?rawurldecode($_COOKIE[$k]):"");
	}
//////////////////////////////////////////////////////// format related////////////////////////////////////////////////////////
	//!	@fn formatParameters($str)
	//!	@brief format string for use in processing (from AJAX). Different from others in that string is escaped using "encodeURIComponent"
	//!	@param $str string to format
	function formatParameters($str)
	{
		$result = (get_magic_quotes_gpc()?stripslashes($str):$str);
		return utf8RawUrlDecode($result);
	}
	
	//!	@fn formatParametersGET($str)
	//!	@brief format string from GET for use in processing
	//!	@param $str string to format
	function formatParametersGET($str)
	{
		return (get_magic_quotes_gpc()?stripslashes($str):$str);
	}
	
	//!	@fn formatParametersPOST($str)
	//!	@brief format string from POST
	//!	@param $str string to format
	function formatParametersPOST($str)
	{
		return (get_magic_quotes_gpc()?stripslashes($str):$str);
	}
	/**
	* RFC1738 compliant replacement to PHP's rawurldecode - which actually works with unicode (using utf-8 encoding)
	* @author Ronen Botzer
	* @param $source [STRING]
	* @return unicode safe rawurldecoded string [STRING]
	* @access public
	*/
	function utf8RawUrlDecode ($source) {
		return rawurldecode($source);
	}

//////////////////////////////////////////////////////// error related////////////////////////////////////////////////////////
	//!	@fn bool logerror( $display_error, $stop_script=0, $record_error="" )
	//!	@brief log error in this function
	//!	@param $display_error displayed error
	//!	@param $stop_script exit script if 1 is passed
	//!	@param $record_error error that goes in log, use display error if different
	function logerror( $display_error, $stop_script=0, $record_error="" )
	{
		if( strlen($display_error)>0 )
		{
			//tiddly_alert($display_error);
		}
		debug( $record_error );
	
		
		if( $stop_script == 1 )		//display error and exit
		{
			exit();
			return TRUE;
		}
		return TRUE;
	}

	//!	@fn string queryString()
	//!	@brief return the query string
	function queryString()
	{
		//return urlencode($_SERVER['QUERY_STRING']);
		return ($_SERVER['QUERY_STRING']);
	}
//////////////////////////////////////////////////////// debug only////////////////////////////////////////////////////////

	//!	@fn bool debugV($str)
	//!	@brief debug function, replace var_dump so any var_dump left in the code won't be notice
	//!	@param $str string to be var_dumped
	function debugV($str)
	{
		global $tiddlyCfg;
		global $standalone;
		if( $tiddlyCfg['developing']==1 && $standalone!=1 )
		{
			var_dump($str);print '<br>';
		}
		return TRUE;
	}
	
	//!	@fn bool debug($str)
	//!	@brief debug function, similar to debugV but use print instead
	//!	@param $str string to be printed
	//!	@param $break include linebreak [0=no line break]
	function debug($str, $break=1)
	{
		global $tiddlyCfg;
		global $standalone;
		if( $tiddlyCfg['developing']==1 && $standalone!=1 )
		{
			//print $str;
			error_log($str, 0);
			if( $break>0 )
			{
	//			print '<br>';
			}
		}
		return TRUE;
	}

?>