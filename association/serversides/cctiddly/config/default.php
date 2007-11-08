<?php
// database/table
$tiddlyCfg['db']['host'] = "...";		//sql host
$tiddlyCfg['db']['login'] = "...";		//login name
$tiddlyCfg['db']['pass'] = "...";		//login password
$tiddlyCfg['db']['name'] = "cct";		//db name

$tiddlyCfg['table']['pref'] = "";		//table prefix
$tiddlyCfg['table']['name'] = "tiddly_wiki_entry";
$tiddlyCfg['table']['backup'] = "tiddly_wiki_entry_version";

// site preferences
$tiddlyCfg['pref']['tw_ver'] = "tiddlywiki"; // choose between different version of TW, or adaptation
$tiddlyCfg['pref']['language'] = "en"; // choose between different version of TW, or adaptation
$tiddlyCfg['pref']['version'] = 1; // 0 = no versions stored, 1 = all versions stored.  The version number is always updated
$tiddlyCfg['pref']['reqLogin'] = 0;		//require login to access the page. A blank page with login box would appear for anonymous users if enabled [0=disable; 1=enable]



//ADDED BY SIMONMCMANUS

$tiddlyCfg['pref']['session_timeout'] = 10;		//cookies expire time, in minutes [0=disable]
$tiddlyCfg['pref']['ldap_server'] = '127.0.0.1';	
// END OF SIMONMCMANUS


$tiddlyCfg['pref']['cookies'] = 0;		//cookies expire time, in minutes [0=disable]
$tiddlyCfg['pref']['appendModifier'] = 0;		//append modifier name as tag
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
$tiddlyCfg['user'] = array("username"=>"password", "simon"=>"password");		//username password pair, empty array allow everyone to edit the tiddly online (except locked titles)

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
$tiddlyCfg['privilege_misc']['rss'] = array("admin");				//user allow to upload rss, put in group names here like $tiddlyCfg['privilege_misc']['rss'] = array("<group1>", "<group2>");
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
			READ: allowed		the user is allowed to read
			INSERT: deny		the user is NOT allowed to insert a tiddler with a certain tag
			EDIT: allowed		the user is allow to edit the tiddler
			DELETE: undefined	undefined privilege. This would be replaced by either allowed or deny depending on the config "undefined_privilege"
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
$tiddlyCfg['privilege_misc']['group_default_privilege']['anonymous'] = "AUUD";
$tiddlyCfg['privilege_misc']['group_default_privilege']['user'] = "AAAA";

////////////////////////////////////////////////////////ADVANCE PRIVILEGE for tags//////////////////////////////////////////////////////
/*
	assign privilege to specific tag using groups
	this is of the format
		$tiddlyCfg['privilege']['<put your group name here>']['<put your tag name here>'] = "<put your privilege here>";
	EXAMPLE: this would deny anonymous users to insert/edit/delete systemConfig tags but still allow it to run
		$tiddlyCfg['privilege']['anonymous']['systemConfig'] = "ADDD";
*/
$tiddlyCfg['privilege']['anonymous']['systemConfig'] = "ADDD";

//The following privilege are for blog
//$tiddlyCfg['privilege']['anonymous']['comments'] = "AADD";		//allow comments to be post anonymously

//misc
$tiddlyCfg['developing']=0;		//developing mode, 0=release mode, 1=developing, -1 release mode, but can be override with parameter
?>