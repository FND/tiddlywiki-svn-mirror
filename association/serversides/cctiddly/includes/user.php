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
	
	
	///////////////////////////////////////////////////////////////validate and login (set cookie)//////////////////////////////////////////////////
	//!	@fn bool user_validate($un)
	//!	@brief check username and password from cookie
	//!	@param $un username override
	//!	@param $pw password override, hashed password
	//!	@param $reqHash if 1, it will hash $pw
	function user_validate($un="", $pw="", $reqHash=0)
	{
		global $tiddlyCfg;
		if( strlen($un)==0 )
		{
			$un = user_getUsername();
		}
		if( strlen($pw)==0 )
		{
			//$pw = isset($_COOKIE['pasSecretCode'])?$_COOKIE['pasSecretCode']:"";		//get cookie pasSecretCode
			$pw = cookie_get('pasSecretCode');
		}
		
		if( $reqHash==1 )
		{
			$pw = user_encodePassword($pw);
		}

		//if( isset($tiddlyCfg['user'][$un]) && strcmp(md5($tiddlyCfg['user'][$un]),$pw)==0 )
		if( isset($tiddlyCfg['user'][$un]) && strcasecmp(user_encodePassword($tiddlyCfg['user'][$un]),$pw)==0 )
		{
			return TRUE;
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
		if( $reqHash==1 )
		{
			$pw = user_encodePassword($pw);
		}
		//if username password pair is right, set cookie
		if( user_validate($un, $pw) )
		{
			cookie_set('txtUserName',$un);
			cookie_set('pasSecretCode',$pw);
			return TRUE;
		}else{		//if username password pair wrong, clear cookie
			user_logout();
			return FALSE;
		}
	}
	
	//!	@fn bool user_logout()
	//!	@brief remove cookie
	function user_logout()
	{
		cookie_set('txtUserName',"");
		cookie_set('pasSecretCode',"");
		return TRUE;
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