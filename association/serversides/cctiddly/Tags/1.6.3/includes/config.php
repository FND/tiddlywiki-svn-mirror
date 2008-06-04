<?php
/**		
	@ brief This holds and sort out configuration files and default configurations
*/

// Initial Database Setup 
	$tiddlyCfg['db']['type'] = "mysql";		//sql type
	$tiddlyCfg['db']['host'] = "127.0.0.1";		//sql host
	$tiddlyCfg['db']['login'] = "root";		//login name
	$tiddlyCfg['db']['pass'] = "";		//login password
	$tiddlyCfg['db']['name'] = "cctiddly161";		//db name

// Debugging Information 
	$tiddlyCfg['developing']=0;		//developing mode, 0=release mode, 1=developing, -1 release mode, but can be override with parameter
	$tiddlyCfg['mysql_debug']=0;	 // if set to 1 will output every sql query into the logfile 

// User Managment Information 
	$tiddlyCfg['pref']['ldap_server'] = '127.0.0.1';	
	$tiddlyCfg['pref']['ldap_enabled'] = 0;	
	$tiddlyCfg['pref']['openid_enabled'] = 0;  // openid end not fully implented yet. 
	$tiddlyCfg['pref']['renew_session_on_each_request']  = 1; // if enabled will renew users session time on each save request
	$tiddlyCfg['pref']['delete_other_sessions_on_login'] = 0; // deletes all previous sessions for a user when they login, set to 0 to allow multiple logins.  
	$tiddlyCfg['users_required_in_db']=0; // users must be in the ccTiddly user database to log in.  designed for LDAP and OpenID, if set to 0 users do not need to be in the db
	$tiddlyCfg['can_create_account'] = 1; // users are allowed to register for an account 
		
// Upload Values 
	$tiddlyCfg['upload_allow_extensions'] = array("text/plain", "text/xml", "text/html", "application/msword", "application/mspowerpoint", "	application/excel", "application/x-visio", "application/pdf");
	$tiddlyCfg['max_file_size'] = 9933300000;
	
// Specify the name of each tables used by ccTiddly	
	$tiddlyCfg['table']['prefix'] = "";					//prefix			prefix of file					prefix of table name
	$tiddlyCfg['table']['suffix'] = "";					//suffix			suffix of file					suffix of table name
	$tiddlyCfg['table']['main'] = "tiddler";			//name			name of file for storing tiddlers		name of table for storing tiddlers
	$tiddlyCfg['table']['backup'] = "tiddler_revisions";	//backup	 		backup/versioned tiddlers
	$tiddlyCfg['table']['workspace'] = "workspace";		//config			settings for cct					
	$tiddlyCfg['table']['user'] = "user";				//user	 		username and password
	$tiddlyCfg['table']['group'] = "group_membership";	//group	 		group name and membership
	$tiddlyCfg['table']['privilege'] = "privileges";	//privilege 			privileges
	$tiddlyCfg['table']['admin'] = "admin_of_workspace";	//admin of workspace	admin of a particular workspace
	$tiddlyCfg['table']['session'] = "login_session";	//login session		used to create login string
	$tiddlyCfg['table']['workspace_view'] = 'workspace_view'; // used to record each viewing of a workspace
	$tiddlyCfg['table']['workspace_skin'] = 'none'; // allows a workspace to be included when viewing every other workspace on the instance. Set to ='none' if you do not want to use skins

//ccT core settings, do not affect by DB settings
	$tiddlyCfg['allow_workspace_creation'] = 1;		//0=disable, 1=allow by public, ( 2=allow by user - not implemented yet) 
	$tiddlyCfg['create_workspace'] = 1;  // allow users to create a workspace 
	$tiddlyCfg['use_mod_rewrite'] = 1;  // 1=using mod_rewrite, 0=pass parameter via ?workspace=name
	
//Workspace Default Values
	$tiddlyCfg['twLanguage'] = "en";	//predefine language
	$tiddlyCfg['keep_revision'] = 1;
	$tiddlyCfg['require_login'] = 0; 

	$tiddlyCfg['tag_tiddler_with_modifier'] = 0;
	$tiddlyCfg['char_set'] = "utf8";
	$tiddlyCfg['hashseed'] = "aigijgij";
	$tiddlyCfg['default_anonymous_perm'] = "AUUU";
	$tiddlyCfg['default_user_perm'] = "AADD";
	
//////////////////////// ::::: ADVANCED ::::: /////////////////////////
	$tiddlyCfg['deligate_session_management'] = 0; 	
	$tiddlyCfg['on_the_fly_workspace_creation'] = 0;

	$tiddlyCfg['rss_group'] = "";
	$tiddlyCfg['markup_group'] = "";
	$tiddlyCfg['tiddlywiki_type'] = "tiddlywiki";
	$tiddlyCfg['status'] = "";
	
/*
This specify whether utf8 is required [1 = enable, 0 =disable]
If you got one of the following error message, that may mean your database do not support utf8
	during upgrade:
		Query: ALTER TABLE <table name> DEFAULT CHARACTER SET utf8 COLLATE
	during regular running:
		Error Query: SET NAMES 'utf8'
*/
	$tiddlyCfg['pref']['utf8'] = 0;	

	
/////////////////////////////////////////////////////////url dependent config////////////////////////////////////////////////////.
	debug("log breaker (situated below debug function)------------------------------------------------");
	debug("QUERY_STRING: ".$_SERVER['QUERY_STRING']);
	
	// workspace name 
	$tiddlyCfg['workspace_name'] = isset($_REQUEST['workspace'])?format4Name($_REQUEST['workspace']):"";
	debug("request-workspace: ".$_REQUEST['workspace']);
	debug("workspace_name : ".$tiddlyCfg['workspace_name']);
	
	// base folder
	$tiddlyCfg['pref']['base_folder'] = str_replace('/index.php', '', $_SERVER["SCRIPT_NAME"]);
	debug("base folder: ".$tiddlyCfg['pref']['base_folder']);
	
	//upload directory
	//header("HTTP/1.0 404 Not Found");
	debug('REDIRECT_URL: '.$_SERVER['REDIRECT_URL']);

	//install new workspace??
	if (isset($_SERVER['REDIRECT_URL']) )
	{
		if (stristr($_SERVER['REDIRECT_URL'], 'msghandle.php')) {
			include('./msghandle.php');
			exit;	
		}
		$redirect_url = $_SERVER['REDIRECT_URL'];
	}	

	$tiddlyCfg['pref']['upload_dir'] = $_SERVER['DOCUMENT_ROOT'].$tiddlyCfg['pref']['base_folder'].'/uploads/';  // location of the file upload directory - assumes is it under the root folder 
	$file_location  =  $tiddlyCfg['pref']['upload_dir'].str_replace('/'.$tiddlyCfg['pref']['folder'].'/', '', $redirect_url);   // create url to file 
	//$file_url = '/'.$tiddlyCfg['pref']['folder'].'/upload/'.$workspace.''.$_SERVER['SCRIPT_NAME'];

	if(@file($file_location))
	{
		readfile($file_location);
		exit;
	}
	
/////////////////////////////////////////////////////////config dependent include////////////////////////////////////////////////////.
	//include_once($cct_base."includes/url.php");
	include_once($cct_base."includes/db.".$tiddlyCfg['db']['type'].".php");
	include($cct_base."lang/".$tiddlyCfg['twLanguage'].".php");

//////////////////////////////////////////////////////////////////////// manupulate values////////////////////////////////////////////////////.
	//sort out workspace name, only allow a-z, A-Z, 0-9, -_.
//  THIS WAS BREAKING THINGS SO I HAVE REMOVED IT FOR THE TIME BING.
//	$tiddlyCfg['workspace_name'] = preg_replace('![^a-zA-Z0-9\-_\.]!', '', $_GET['workspace']);

	//////////////////////////////////////////////////////// config file ////////////////////////////////////////////////////////
	//include default config file first before the desired config based either on config variable or URL
	//used for seamless upgrade as possible
	// GLOBAL PREFERENCES THAT PERSIST ACCROSS ALL workspaceS

	//make connection to DB and select DB name
	db_connect_new();
	
	//return array form, empty array means workspace not exist
	$workspace_settings = db_workspace_selectSettings();
	
	//if no instance found, check if instance name is empty string
	if( sizeof($workspace_settings)==0 )
	{
		if( strlen($tiddlyCfg['workspace_name'])==0 )
		{//do install
			include_once($cct_base."includes/workspace.php");
			workspace_create_new();
		}else{	//if not empty, check if installation can be done
			if( $tiddlyCfg['allow_workspace_creation']>0 )
			{//if allow workspace creation
				
				if ($_POST)
				{
					include($cct_base."includes/workspace.php");
					workspace_create($tiddlyCfg['workspace_name'], $_POST['ccAnonPerm']);
				}
				
				if( $tiddlyCfg['allow_workspace_creation']==2 )	//if =2, only allow user to create workspace
				{
					//check if user login valid
				}
				//db_workspace_install($tiddlyCfg);		//install using default parameters
			}else{	//give error message of workspace not found
				header("HTTP/1.0 404 Not Found"); 
				exit($ccT_msg['error']['workspace_not_found']);
			}
		}
	}
	//exit("2");
	//append config from db to tiddlyCfg
	$tiddlyCfg = array_merge($tiddlyCfg, $workspace_settings);
	
$tiddlyCfg['pref']['lock_title'] = array("LoginPanel");		//lock certain tiddler's title such that it can't be changed even with admin
$tiddlyCfg['pref']['uploadPluginIgnoreTitle'] = array("ccTiddly_debug_time", "UploadLog","UploadPlugin","UploadOptions");		//this specify what tiddler should uploadplugin ignore. It is recommended to put in uploadPlugin itself and the upload log. CaSe-SeNsItIvE
$tiddlyCfg['pref']['forceAnonymous'] = 1;		//if enabled, anonymous users will take "anonymous" as username
$tiddlyCfg['pref']['hashSeed'] = "145tgwg45wg4";		//used to increase security for hashing passwords. Put in a random string withing the double quotes.
$tiddlyCfg['session_expire']=120;// in minutes - If set to 0 will not expire
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

//TODO :  This value should be pulled from the database and assigned. We need to finalise how groups are going to work.

$tiddlyCfg['group']['admin'] = array("admin");

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
$tiddlyCfg['privilege_misc']['group_default_privilege']['anonymous'] = $tiddlyCfg['default_anonymous_perm'];
 $tiddlyCfg['privilege_misc']['group_default_privilege']['user'] = $tiddlyCfg['default_user_perm'];
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

$tiddlyCfg['privilege']['anonymous']['private'] = "DDDD";
$tiddlyCfg['privilege']['anonymous']['comments'] = "AADD";		//allow comments to be post anonymously
////////////////////////////////////////////////////////////////////////set default values////////////////////////////////////////////////////.

//$tiddlyCfg['pref']['cookies'] = $tiddlyCfg['pref']['cookies']*1000*60;		//convert time to minutes
$tiddlyCfg['table']['main'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['main'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['backup'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['backup'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['config'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['config'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['user'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['user'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['group'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['group'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['privilege'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['privilege'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['tiddlywiki_type'] = $cct_base."tiddlywiki/".$tiddlyCfg['tiddlywiki_type'].".js"; // plain TW file, $cct_base defined in config.php

$tiddlyCfg['version']="1.6.1";	
$tiddlyCfg['session_expire'] = ($tiddlyCfg['session_expire']==0?9999999:$tiddlyCfg['session_expire']);
$tiddlyCfg['session_expire'] = $tiddlyCfg['session_expire'] * 60;  // Converts minutes to seconds to be added to an epoch value 

?>
