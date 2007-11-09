<?php
//////////////////////////////////////////////////////// description ////////////////////////////////////////////////////////
	/**
		@file
		
		@brief This file provides functions to validate users and obtain privileges
		
		@author: CoolCold
		@email: cctiddly.coolcold@dfgh.net
	*/
	
	/*
		license:
			This is licensed under GPL v2
			http://www.gnu.org/licenses/gpl.txt

	*/
	/**
		requirement:
	*/
	
//////////////////////////////////////////////////////// parameter check ////////////////////////////////////////////////////////

//////////////////////////////////////////////////////// FUNCTIONS ////////////////////////////////////////////////////////

	//!	@fn array user_create($username="", $group="", $verified=0, $id="")
	//!	@brief create user array, verify, obtain group and privileges
	//!	@param $username username
	//!	@param $group group that the user belongs to, in array form
	//!	@param $verified whether the username and password is correct
	//!	@param $id user id, currently useless
	//!	@param $password password override
	//!	@param $reqHash state if password need to be hashed
	function user_create($username="", $group="", $verified=0, $id="", $password="", $reqHash = 0)
	{
		$user = array();
		$user['id'] = (strlen($id)>0?(int)$id:"");		//if empty, leave it as empty. otherwise make it as int
		//get username from cookie if nothing is passed
		$user['username'] = preg_replace("![/,\\\\,?,*]!","",(strcmp($username,"")==0?user_getUsername():$username));		//no slashes, star and question mark in username
		if( strlen($password)==0 )
		{
			$user['verified'] = ($verified==0?user_validate($username):(bool)$verified);
		}else{
			$user['verified'] = ($verified==0?user_validate($username,$password,$reqHash):(bool)$verified);
		}
		//NOTE: group is always in array
		//FORMAT: $user['group'] = array("group1", "group2");
		$user['group'] = (strcmp($group,"")==0?user_getGroup($user['username'],$user['verified']):$group);
		//privilege for various tags
		//FORMAT: $user['privilege'] = array("tag1"=>"AAAA");
		$user['privilege'] = user_getPrivilege($user['group']);		
		return $user;
	}



	function user_ldap_login($un, $pw)
	{
		  error_log('LDAPLOGIN', 0);
		global $tiddlyCfg;
		$admin='cn='.$un.',ou=staff,dc=osmosoft,dc=com'; // TODO - check with andrew which of these bits can change.
		$ds=ldap_connect($tiddlyCfg['pref']['ldap_server']);  // make LDAP C
		if ($ds) 
		{	
			$r=ldap_bind($ds, $admin, $pw);// bind with appropriate dn to give access
			if(!$r)                // if the username/pass is not accepted then return false 
				return FALSE;
			ldap_close($ds); 
			return TRUE; 
		} else {
			return FALSE;
		}
	}
	
	function user_set_session($un, $pw)
	{
		 error_log('SETSESSION'.$un.$pw, 0);
		// should the initial expiry time persist or be added to?
		global $tiddlyCfg;
		$del_data['session_token']= cookie_get('passSecretCode');
		db_record_delete('login_session',$del_data);
		$insert_data['user_id'] = $un;
		$mins = date("i")+$tiddlyCfg['pref']['session_timeout'];  // add session timeout time to current time.
		$expire = strtotime(date("Y").'-'.date("m")."-".date("d")." ".date("H").":".$mins.":".date("s"));	// build up date string
		$insert_data['expire'] = date('Y-m-d H:i:s', $expire); // add expire time to data array for insert
		$insert_data['ip'] = $_SERVER['REMOTE_ADDR'];  // get the ip address
		$insert_data['session_token'] = sha1($un.$_SERVER['REMOTE_ADDR'].$expire); // colect data together and sh1 it so that we have a unique indentifier 
		cookie_set('txtUserName', $un);
		cookie_set('passSecretCode', $insert_data['session_token']);
			 error_log('SETSESSION2'.$un.$pw, 0);
		db_record_insert('login_session',$insert_data);

	}		
	
	///////////////////////////////////////////////////////////////validate and login (set cookie)//////////////////////////////////////////////////
	//!	@fn bool user_validate($un)
	//!	@brief check username and password from cookie
	//!	@param $un username override
	//!	@param $pw password over
	function user_validate($un="", $pw="")
	{
		error_log('VALIDATE'.$un.$pw, 0);
		global $tiddlyCfg;
		// if we are not passed a username and password the session has been created and we need to validate it.	
		if (!$pw || !$un)
		{
			$pw = cookie_get('passSecretCode');
			$un = cookie_get('txtUserName');
			$data['session_token'] = $pw; 
				$data['expire'] = '2007-11-09 11:31:43'; 
			//  TODO CHECK VALUE OF 			
			$results = db_record_select('login_session', $data);			// get array of results		
			if (count($results) > 0 )                   //  if the array has 1 or more sessions
			{
				$expire = strtotime($results[0]['expire']);
		 		$now = strtotime(date('Y-m-d H:i:s'));
		 		if($expire > $now)
		 		{
					//user_set_session($un, $pw);  /// if you want to be really secure you could try this. 
					return TRUE;
				}
				else 
				{
				
				  //  THIS SHOULD PROMPT THE USER FOR A PASSWOR
					user_logout();
				 	return FALSE; 
				 	
				 	//delete the cookies and session record 
				}
			}
			else
			{
				return FALSE;
			}
		}

		// session has not been created, lets try the user/pass on our ldap server. 
		if ($tiddlyCfg['pref']['ldap_enabled']==1)
		{
			if (user_ldap_login($un, $pw))	
			{
				return TRUE;
			}
		}else
		{	
			$data['id'] = $un;
			$data['password'] = sha1($pw);
			$results = db_record_select('user', $data);			// get array of results		
			if (count($results) > 0 )                   //  if the array has 1 or more sessions
			{
				return TRUE;
			}
			user_logout();
			return FALSE;
		
		}

		return FALSE;
	}
	
	
	//!	@fn bool user_login($un="", $pw="", $reqHash=0)
	//!	@brief check username and password and set them to cookies
	//!	@param $un username
	//!	@param $pw password (assume hashed password)
	//!	@param $reqHash if 1, it will hash $pw
	function user_login($un, $pw, $reqHash=0)
	{
		global $tiddlyCfg;
		error_log('LOGIN'.$un.$pw, 0);
		if( user_validate($un, $pw) )
		{
			user_set_session($un, $pw);
			return TRUE;
		}
		else
		{		//if username password pair wrong, clear cookie
			user_logout();
			return FALSE;
		}
	}
	///////////////////////////////////////////////////////////////get user info//////////////////////////////////////////////////
	//!	@fn string user_getUsername()
	//!	@brief get username from cookie
	function user_getUsername()
	{
		$u = cookie_get('txtUserName');
		if( strlen($u)==0 )
		{
			return "YourName";
		}
		return $u;
	}
	
	function user_logout()
	{
		$data['session_token']= cookie_get('passSecretCode');
		db_record_delete('login_session',$data);
		cookie_set('txtUserName', '');
		cookie_set('pasSecretCode', '');
	
		return TRUE;
	}
	
	//!	@fn array user_getGroup($un)
	//!	@brief get group a user belongs to
	//!	@param $username username required
	//!	@param $verified specify whether the user is verified or not
	function user_getGroup($username, $verified=-1)
	{
		global $tiddlyCfg;
		$verified = ($verified===-1?user_validate($username):(bool)$verified);
		
		if( $verified )
		{
			$group = array("user");		//logged on user default to "user"
			//separate admins from non_admins
			if( in_array($username, $tiddlyCfg['group']['admin']) )
			{
				$group[] = "admin";
			}else{
				$group[] = "non_admin";
			}
			//check each group to see if user belongs to them
			//will have duplicate group if belongs to admin
			while( list($gp_name, $gp_member) = each($tiddlyCfg['group']) )
			{
				if( in_array($username, $gp_member) )
				{
					$group[] = $gp_name;
				}
			}		
			return $group;
		}
		
		return array("anonymous");		//non-logged on user belongs to "anonymous" group
	}
	///////////////////////////////////////////////////////////////encode//////////////////////////////////////////////////
	//!	@fn array user_getGroup($un)
	//!	@brief get group a user belongs to
	//!	@param $username username required
	//!	@param $verified specify whether the user is verified or not
	function user_encodePassword($password)
	{
		global $tiddlyCfg;
		//return sha1($password.$tiddlyCfg['pref']['hashSeed']);
		return sha1($password);
	}
	
	///////////////////////////////////////////////////////////////privilege function//////////////////////////////////////////////////
		
	//!	@fn array user_getPrivilege($group)
	//!	@brief get privilege array in the form array(<tag>=> <privilege>)
	//!	@param $group group array, obtained with "user_getGroup" function
	//$tiddlyCfg['privilege']['default']['testtag'] = "AAAA";
	function user_getPrivilege($group)
	{
		global $tiddlyCfg;
		$privilege = array();
		
		foreach($group as $g)		//go through each group and check if privilege is set for the group
		{
			if( isset($tiddlyCfg['privilege'][$g]) )		//put in privilege array if privilege is set for the group
			{
				if( sizeof($privilege)==0 )		//if privilege is empty, just copy over the tag array
				{
					$privilege = $tiddlyCfg['privilege'][$g];
				}else{		//otherwise have to check for duplication of tags and merge
					while( list($k, $v) = each($tiddlyCfg['privilege'][$g]) )
					{
						if( isset($privilege[$k]) )
						{
							$privilege[$k] = user_mergePrivilege($privilege[$k],$v);
						}else{
							$privilege[$k] = $v;
						}
						
					}
				}
			}
		}
		
		return $privilege;
	}
	
	//!	@fn string user_mergePrivilege($p1,$p2)
	//!	@brief merge two privileges  i.e. "A"
	//!	@param $p1 privilege 1
	//!	@param $p2 privilege 2
	function user_mergePrivilege($p1,$p2)
	{
		$s = strlen($p1);		//defined such that it can be used with shorter privilege string
		for( $i=0; $i<$s; $i++ )
		{
			switch($p1[$i])
			{
				case 'D':
					break;
				case 'A':
					if( strcmp($p2[$i],'D')==0 )
					{
						$p1[$i] = 'D';
					}
					break;
				case 'U':
					$p1[$i] = $p2[$i];
					break;
			}
		}
		
		return $p1;
	}
	
	//!	@fn string user_undefinePrivilege($privilege)
	//!	@brief replace undefined privilege (U) to the one in config
	//!	@param $privilege privilege string
	function user_undefinePrivilege($privilege)
	{
		global $tiddlyCfg;
		return str_replace("U",$tiddlyCfg['privilege_misc']['undefined_privilege'],$privilege);
	}
	
	//!	@fn string user_readPrivilege($privilege)
	//!	@brief obtain read privilege from privilege string
	//!	@param $privilege privilege string
	function user_readPrivilege($privilege)
	{
		if( strcmp($privilege[0], 'A')==0 )
		{
			return TRUE;
		}
		return FALSE;
	}
	//!	@fn string user_insertPrivilege($privilege)
	//!	@brief obtain insert privilege from privilege string
	//!	@param $privilege privilege string
	function user_insertPrivilege($privilege)
	{
		if( strcmp($privilege[1], 'A')==0 )
		{
			return TRUE;
		}
		return FALSE;
	}
	//!	@fn string user_editPrivilege($privilege)
	//!	@brief obtain edit privilege from privilege string
	//!	@param $privilege privilege string
	function user_editPrivilege($privilege)
	{
		if( strcmp($privilege[2], 'A')==0 )
		{
			return TRUE;
		}
		return FALSE;
	}
	//!	@fn string user_deletePrivilege($privilege)
	//!	@brief obtain delete privilege from privilege string
	//!	@param $privilege privilege string
	function user_deletePrivilege($privilege)
	{
		if( strcmp($privilege[3], 'A')==0 )
		{
			return TRUE;
		}
		return FALSE;
	}
	
	//!	@fn string user_tiddlerPrivilegeOfUser($user,$tag)
	//!	@brief return privilege of tiddler according to the tag array/string and user privilege array
	//!	@param $user user array
	//!	@param $tag tag string or array
	function user_tiddlerPrivilegeOfUser($user,$tag)
	{
		global $tiddlyCfg;
		$privilege = $tiddlyCfg['privilege_misc']['default_privilege'];
		$privilegeArr = $user['privilege'];
		$group = $user['group'];
		
		//redefine default privilege
		foreach( $group as $g )
		{
			if( isset($tiddlyCfg['privilege_misc']['group_default_privilege'][$g]) )
			{
				$privilege = user_mergePrivilege($privilege,$tiddlyCfg['privilege_misc']['group_default_privilege'][$g]);
			}
		}
		
		//convert tag list to array if required
		if( !is_array($tag) )
		{
			if( strlen($tag)==0 )		//if no tag, return default privilege
			{
				return user_undefinePrivilege($privilege);
			}else{
				$tag = tiddler_breakTag($tag);
			}
		}
		
		//if no tag, return default privilege
		if( sizeof($tag)==0 || sizeof($privilegeArr)==0 )
		{
			return ($privilege);
		}
		
		
		//check each tag in user permission, merge if exist
		foreach( $tag as $t )
		{
			if( isset($privilegeArr[$t]) )
			{
				$privilege = user_mergePrivilege($privilege, $privilegeArr[$t]);
			}
		}
			
		//redefine undefine privilege
		return user_undefinePrivilege($privilege);
	}
?>