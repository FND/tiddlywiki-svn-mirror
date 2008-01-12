<?php
/**
	@file
		
	@brief This holds and sort out configuration files and default configurations
*/
//////////////////////////////////////////////////////// default configurations ////////////////////////////////////////////////////////
	$tiddlyCfg['db']['type'] = "mysql";		//sql type
	$tiddlyCfg['db']['host'] = "db";		//sql host
	$tiddlyCfg['db']['login'] = "root";		//login name
	$tiddlyCfg['db']['pass'] = "0p3ns0urc3";		//login password
	$tiddlyCfg['db']['name'] = "cctiddly_public";		//db name
	
	$tiddlyCfg['table']['prefix'] = "";					//prefix			prefix of file					prefix of table name
	$tiddlyCfg['table']['suffix'] = "";					//suffix			suffix of file					suffix of table name
	$tiddlyCfg['table']['main'] = "tiddler";			//name			name of file for storing tiddlers		name of table for storing tiddlers
	$tiddlyCfg['table']['backup'] = "tiddler_revisions";	//backup	 		backup/versioned tiddlers
	$tiddlyCfg['table']['instance'] = "instance";		//config			settings for cct					
	$tiddlyCfg['table']['user'] = "user";				//user	 		username and password
	$tiddlyCfg['table']['group'] = "group_membership";	//group	 		group name and membership
	$tiddlyCfg['table']['privilege'] = "privileges";	//privilege 			privileges
	$tiddlyCfg['table']['admin'] = "admin_of_instance";	//admin of instance	admin of a particular instance
	$tiddlyCfg['table']['session'] = "login_session";	//login session		used to create login string
	
	//workspace default values
	$tiddlyCfg['allow_workspace_creation'] = 1;		//0=disable, 1=allow by public, 2=allow by user
	$tiddlyCfg['twLanguage'] = "en";	//predefine language
	$tiddlyCfg['keep_revision'] = 1;
	$tiddlyCfg['require_login'] = 0; //mins
	$tiddlyCfg['session_expire'] = 2000; //mins
	$tiddlyCfg['tag_tiddler_with_modifier'] = 0;
	$tiddlyCfg['char_set'] = "utf8";
	$tiddlyCfg['hashseed'] = "aigijgij";
	$tiddlyCfg['default_anonymous_perm'] = "AUUU";
	$tiddlyCfg['default_user_perm'] = "AAAA";
	$tiddlyCfg['rss_group'] = "";
	$tiddlyCfg['markup_group'] = "";
	$tiddlyCfg['pref']['twFile'] = "tiddlywiki";
	
	//.",'".$data['hashseed']."'"
	//.",'".$data['debug']."'"		//is this equivilant to developing?
	//.",'".$data['status']."'"		//what should this be defined as?
	//.",'".$data['tiddlywiki_type']."'"		//twFile?

/*
This specify whether utf8 is required [1 = enable, 0 =disable]
If you got one of the following error message, that may mean your database do not support utf8
	during upgrade:
		Query: ALTER TABLE <table name> DEFAULT CHARACTER SET utf8 COLLATE
	during regular running:
		Error Query: SET NAMES 'utf8'
*/
	$tiddlyCfg['pref']['utf8'] = 0;	
	$tiddlyCfg['pref']['ldap_server'] = '127.0.0.1';	
	$tiddlyCfg['pref']['ldap_enabled'] = 0;	
	$tiddlyCfg['pref']['openid_enabled'] = 0;  // openid end not fully implented yet. 
	$tiddlyCfg['pref']['delete_other_sessions_on_login'] = 0; // deletes all previous sessions for a user when they login, set to 0 to allow multiple logins.  
	//$tiddlyCfg['pref']['instance_pos'] = 2;  // set to 1 if runningning in the root dir, specifies the position in the URL where the instance name is provided.  eg www.osmosoft.com/1/2/3/4/5/6/7/8/9/
	$tiddlyCfg['developing']=0;		//developing mode, 0=release mode, 1=developing, -1 release mode, but can be override with parameter
	$tiddlyCfg['mysql_debug']=0;	 // if set to 1 will output every sql query into the logfile 
	
	include_once($cct_base."includes/url.php");
	include_once($cct_base."includes/db.".$tiddlyCfg['db']['type'].".php");
	include($cct_base."lang/".$tiddlyCfg['twLanguage'].".php");

//////////////////////////////////////////////////////////////////////// manupulate values////////////////////////////////////////////////////.
	//sort out instance name, only allow a-z, A-Z, 0-9, -_.
//  THIS WAS BREAKING THINGS SO I HAVE REMOVED IT FOR THE TIME BING.
//	$tiddlyCfg['instance_name'] = preg_replace('![^a-zA-Z0-9\-_\.]!', '', $_GET['instance']);

	//////////////////////////////////////////////////////// config file ////////////////////////////////////////////////////////
	//include default config file first before the desired config based either on config variable or URL
	//used for seamless upgrade as possible
	// GLOBAL PREFERENCES THAT PERSIST ACCROSS ALL INSTANCES

	
$link = db_connectDB();

db_selectDB($tiddlyCfg['db']['name']);

// create the instance if it does not already exist.

if ($instance == '')  
{
	$array['name'] = 'home';
	$tiddlyCfg['pref']['instance_settings'] = db_record_select('instance', $array);
} else {

	$array['name'] = $instance;
	$tiddlyCfg['pref']['instance_settings'] = db_record_select('instance', $array);
}

// If the instance name was empty or the instance name provided does not exist. 
// TODO : WHAT IF ITS THE HOME INSTANCE : 
//debug( count($tiddlyCfg['pref']['instance_settings']) );
if (!isset($_POST['cctuser']) && count($tiddlyCfg['pref']['instance_settings']) < 1  )
{	
	if ($_POST)
	{
		include($cct_base."includes/instance.php");
		instance_create($_POST['ccCreateWorkspace'], $_POST['ccAnonPerm']);
	}
	else
	{
		header("HTTP/1.0 404 Not Found"); 
	}
}



// the instance does not exist yet. 
if (count($tiddlyCfg['pref']['instance_settings']) < 1)
{
 	// let show the form to create an instance
 	// we need to set the settings manually as there is not record in the database
 	$tiddlyCfg['pref']['twFile'] = 'tiddlywiki';//$settings[0]['tiddlywiki_type']; // choose between different version of TW, or adaptation
	$tiddlyCfg['twLanguage'] = 'en'; // choose between different version of TW, or adaptation
	$tiddlyCfg['keep_revision'] = 0; // 0 = no versions stored, 1 = all versions stored.  The version number is always updated
	$tiddlyCfg['require_login'] = 0;	//require login to access the page. A blank page with login box would appear for anonymous users if enabled [0=disable; 1=enable]		$tiddlyCfg['tag_tiddler_with_modifier'] ='';		//append modifier name as tag		
}
else
{
	// the instance exists so lets get
	//  GET THE SETTINGS FROM THE DATABASE 
	$tiddlyCfg['pref']['twFile'] = 'tiddlywiki';//$settings[0]['tiddlywiki_type']; // choose between different version of TW, or adaptation
	$tiddlyCfg['twLanguage'] = $tiddlyCfg['pref']['instance_settings'][0]['twLanguage']; // choose between different version of TW, or adaptation
	$tiddlyCfg['keep_revision'] = $tiddlyCfg['pref']['instance_settings'][0]['keep_revision']; // 0 = no versions stored, 1 = all versions stored.  The version number is always updated
	$tiddlyCfg['require_login'] = $tiddlyCfg['pref']['instance_settings'][0]['require_login'];	//require login to access the page. A blank page with login box would appear for anonymous users if enabled [0=disable; 1=enable]
	// uncommenting the below line will let the session timeout be specified per instance
	//$tiddlyCfg['session_expire'] = $tiddlyCfg['pref']['instance_settings'][0]['cookie_expire'];
	$tiddlyCfg['tag_tiddler_with_modifier'] =$tiddlyCfg['pref']['instance_settings'][0]['tag_tiddler_with_modifier'];		//append modifier name as tag
}


$tiddlyCfg['pref']['lock_title'] = array("LoginPanel");		//lock certain tiddler's title such that it can't be changed even with admin
$tiddlyCfg['pref']['uploadPluginIgnoreTitle'] = array("ccTiddly_debug_time", "UploadLog","UploadPlugin","UploadOptions");		//this specify what tiddler should uploadplugin ignore. It is recommended to put in uploadPlugin itself and the upload log. CaSe-SeNsItIvE
$tiddlyCfg['pref']['forceAnonymous'] = 1;		//if enabled, anonymous users will take "anonymous" as username
$tiddlyCfg['pref']['hashSeed'] = "145tgwg45wg4";		//used to increase security for hashing passwords. Put in a random string withing the double quotes.
/*
	This specify whether utf8 is required [1 = enable, 0 =disable]
	If you got one of the following error message, that may mean your database do not support utf8
		during upgrade:
			Query: ALTER TABLE <table name> DEFAULT CHARACTER SET utf8 COLLATE
		during regular running:
			Error Query: SET NAMES 'utf8'
*/
$tiddlyCfg['pref']['utf8'] = 0;

////////////////////////////////////////////////////users and privileges////////////////////////////////////////////////////
/*
	username and password pair
	This should be in the form
		$tiddlyCfg['user'] = array("username" => "password");
	or for multiple username and password, separate with comma
		$tiddlyCfg['user'] = array("username1" => "password1", "username2" => "password2);
*/
//username password pair

// SIMONMCMANUS - THIS DOES NOT APPEAR TO BE USED ANYMORE 

//$tiddlyCfg['user'] = array("username"=>"password", "simon"=>"password");		//username password pair, empty array allow everyone to edit the tiddly online (except locked titles)

/*
	put username here would insert them into groups.
	NOTE: a user in more than one group is possible
	this is in the form
		$tiddlyCfg['group']['admin'] = array("<username1>", "<username2>");
		$tiddlyCfg['group']['<any group name>'] = array("<username3>", "<username4>");
	
	predefined group:
		anonymous (include all users without username password pair)
		user (users with username and password pair)
*/
$tiddlyCfg['group']['admin'] = array("simon");

/*
	various config on privileges
*/
$tiddlyCfg['privilege_misc']['rss'] = array("user");				//user allow to upload rss, put in group names here like $tiddlyCfg['privilege_misc']['rss'] = array("<group1>", "<group2>");
$tiddlyCfg['privilege_misc']['upload'] = array("admin");			//user allow to upload the whole TW or import TW, put in group names here
$tiddlyCfg['privilege_misc']['markup'] = array("admin");			//user allow to change markup

/*
	new privilege system****************************************WARNING: read this first before changing the config or unexpected behaviour would result
	PRIVILEGE SYSTEM
		The new privilege system consist of four character, each represent a different action
	privilege order
		read/insert/edit/delete
	privilege value
		allow (A)
		deny (D)
		undefine/unchange (U)
	EXAMPLE
		for a privilege string "ADAU", the privilege for a particular tiddler to the user would be
		R	READ: allowed		the user is allowed to read
		C	INSERT: deny		the user is NOT allowed to insert a tiddler with a certain tag
		U	EDIT: allowed		the user is allow to edit the tiddler
		D	DELETE: undefined	undefined privilege. This would be replaced by either allowed or deny depending on the config "undefined_privilege"
	UNDEFINED (normally treated as DENY, see settings below) can be overwrited by ALLOW
	DENY has the highest priority and could not be overwrite by ALLOW/UNDEFINED
	NOTE: if a tiddler has several tag, of which one has deny in one of the privilege, it would be treated as deny on that privilege
	NOTE: rename a tiddler requires EDIT privilege
	NOTE: overwrite one tiddler with new tiddler requires EDIT privilege
	NOTE: overwrite a tiddler(A) with another tiddler(B) require DELETE privilege for tiddler (A) , and EDIT for the overwritting tiddler (B)
*/

//default privileges
$tiddlyCfg['privilege_misc']['undefined_privilege'] = "D";		//defined what should undefined (U) be treated as
$tiddlyCfg['privilege_misc']['default_privilege'] = "AUUU";		//default privilege for all group and tags
//default privileges for certain groups, applied after default_privilege
//		it is in the form: $tiddlyCfg['privilege_misc']['group_default_privilege']['<group name>']
$tiddlyCfg['privilege_misc']['group_default_privilege']['anonymous'] = $tiddlyCfg['pref']['instance_settings'][0]['default_anonymous_perm'];
 $tiddlyCfg['privilege_misc']['group_default_privilege']['user'] = $tiddlyCfg['pref']['instance_settings'][0]['default_user_perm'];
  $tiddlyCfg['privilege_misc']['group_default_privilege']['admin'] = "AAAA";
////////////////////////////////////////////////////////ADVANCE PRIVILEGE for tags//////////////////////////////////////////////////////
/*
	assign privilege to specific tag using groups
	this is of the format
		$tiddlyCfg['privilege']['<put your group name here>']['<put your tag name here>'] = "<put your privilege here>";
	EXAMPLE: this would deny anonymous users to insert/edit/delete systemConfig tags but still allow it to run
		$tiddlyCfg['privilege']['anonymous']['systemConfig'] = "ADDD";
*/

$tiddlyCfg['privilege']['admin']['systemConfig'] = "AAAA";
$tiddlyCfg['privilege']['user']['systemConfig'] = "AAAA";
//The following privilege are for blog
//$tiddlyCfg['privilege']['anonymous']['comments'] = "AADD";		//allow comments to be post anonymously
////////////////////////////////////////////////////////////////////////set default values////////////////////////////////////////////////////.

//$tiddlyCfg['pref']['cookies'] = $tiddlyCfg['pref']['cookies']*1000*60;		//convert time to minutes
$tiddlyCfg['table']['main'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['main'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['backup'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['backup'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['config'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['config'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['user'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['user'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['group'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['group'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['privilege'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['privilege'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['pref']['twFile'] = $cct_base."tiddlywiki/".$tiddlyCfg['pref']['twFile'].".js"; // plain TW file, $cct_base defined in config.php

$tiddlyCfg['version']="1.3";	
?>