<?php

// Initial Database Setup 

$tiddlyCfg['db']['type'] = "mysql";		//sql type
$tiddlyCfg['db']['host'] = "127.0.0.1";		//sql host
$tiddlyCfg['db']['login'] = "root";		//login name
$tiddlyCfg['db']['pass'] = "";		//login password
$tiddlyCfg['db']['name'] = "cct17";		//db name
$tiddlyCfg['db']['port'] = "3306"; // db port 

// Debugging Information 

$tiddlyCfg['developing'] = 1;		//developing mode. If set to 2 will override debug setting below and output everything into the debug file. 
$tiddlyCfg['debug']['mysql'] = 0;	 // if set to x1 will output every sql query into the logfile 
$tiddlyCfg['debug']['login'] = 1;
$tiddlyCfg['debug']['handle'] = 0;
$tiddlyCfg['debug']['config'] = 0;
$tiddlyCfg['debug']['params'] = 1;
$tiddlyCfg['debug']['fail'] = 0;
$tiddlyCfg['debug']['steps'] = 0;
$tiddlyCfg['debug']['display_logs'] = 0;
$tiddlyCfg['debug']['secret'] = "bigsecret";

// User Managment Information 

$tiddlyCfg['pref']['delete_other_sessions_on_login'] = 0; // deletes all previous sessions for a user when they login, set to 0 to allow multiple logins.  
$tiddlyCfg['pref']['renew_session_on_each_request']  = 1; // if enabled will renew users session time on each save request
$tiddlyCfg['users_required_in_db']=0; // users must be in the ccTiddly user database to log in.  designed for LDAP and OpenID, if set to 0 users do not need to be in the db
$tiddlyCfg['can_create_account'] = 1; // users are allowed to register for an account 
	
//LDAP

$tiddlyCfg['pref']['ldap_server'] = '127.0.0.1';	
$tiddlyCfg['pref']['ldap_enabled'] = 0;	
$tiddlyCfg['pref']['ldap_username']	= "CN=blah blah blah ";
$tiddlyCfg['pref']['ldap_password'] = "PASSWORD";
$tiddlyCfg['pref']['ldap_connection_string'] = "ldap:/.....";

// OpenID

$tiddlyCfg['pref']['openid_enabled'] = 0;  // openid not fully implented yet. 


// Offline Mode 
// .tiddler and .js files to be loaded from the ccPlugins directory when the user is takes ccTiddly in offline mode. 
$tiddlyCfg['pref']['offline']['tiddler'] = array("ccTheme", "smmTheme", "purpleTheme", "taggedTemplateTweak", "ValueSwitcherPlugin");
$tiddlyCfg['pref']['offline']['js'] = array("ccAdaptor");

//Deligated Session Managment 
 
$tiddlyCfg['pref']['deligate_session_url'] = "http://uvoke.com/sys/uvokechecksess.wcgp?s=";
$tiddlyCfg['deligate_session_management'] = 0; 	
	
// Upload Values 
	$tiddlyCfg['allowed_proxy_list'] = array('wikipedia.org', 'google.com', 'visualtw.ouvaton.org', 'en.wikipedia.org', 'wikiedia.org', 'martinswiki.com', 'tiddly-twab.com', 'tiddlythemes.com', 'tiddlytools.com', 'tiddlywiki.org', 'osmosoft.com', 'wiki.osmosoft.com', 'tiddlytools.com', 'tiddlythemes.com', 'wikidev.osmosoft.com', 'itw.bidix.info', '127.0.0.1', 'localhost', 'getteamtasks.com', 'mptw.tiddlyspot.com');
	
	
$tiddlyCfg['upload_allow_extensions'] = array("text/plain", "text/xml", "text/html", "application/msword", "application/mspowerpoint", "	application/excel", "application/x-visio", "application/pdf", "application/octet-stream");
$tiddlyCfg['max_file_size'] = 9933300000;
$tiddlyCfg['only_workspace_admin_can_upload'] = 0; //if enabled only the workspace owner will be able to upload files. If disabled (0) any logged in user can upload files. 

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
$tiddlyCfg['txtTheme'] = 'purleTheme';  // The default TiddlyWiki theme to use, ccTheme is the default, you can also try smmTheme.
//ccT core settings, do not affect by DB settings
$tiddlyCfg['allow_workspace_creation'] = 1;		//0=disable, 1=allow by public, ( 2=allow by user - not implemented yet) 
$tiddlyCfg['create_workspace'] = 1;  // allow users to create a workspace 
$tiddlyCfg['GettingStartedText'] = "To get started with this workspace, you'll need to modify the following tiddlers:\n* SiteTitle &amp; SiteSubtitle: The title and subtitle of the site, as shown above (after saving, they will also appear in the browser title bar)\n* MainMenu: The menu (usually on the left)\n* DefaultTiddlers: Contains the names of the tiddlers that you want to appear when the workspace is opened when a user is logged in.\n* AnonDefaultTiddlers: Contains the names of the tiddlers that you want to appear when the worksace is opened when a user who is not logged in.  This should contain  the login tiddler. [[Login]]\n* You can change the permission of this workspace at anytime by opening the [[Manage Users]] tiddler.";
// The text that will be displayed to users in the GettingStarted tiddler immediately after they have created a workspace.


$tiddlyCfg['extract_admin_from_url']=0;// The admin user for each workspace when create will be taken from the URL.  If turned on it means the user SimonMcManus owns the workspace SimonMcManus.
$tiddlyCfg['use_mod_rewrite'] = 0;  // 1=using mod_rewrite, 0=pass parameter via ?workspace=name

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

debug("------------------------------------------------------------------------ >> log breaker << ------------------------------------------------------------------------");
debug("QUERY_STRING: ".$_SERVER['QUERY_STRING'], "params");

$a = str_replace($_SERVER['QUERY_STRING'], "", str_replace(str_replace("index.php", "", $_SERVER['PHP_SELF']), "", $_SERVER['REQUEST_URI']));
if (isset($_REQUEST['workspace']))
	$tiddlyCfg['workspace_name'] = $_REQUEST['workspace'];
else
	$tiddlyCfg['workspace_name'] = $a;
if ($b = stristr($tiddlyCfg['workspace_name'], "?"))
	$tiddlyCfg['workspace_name'] = str_replace(stristr($tiddlyCfg['workspace_name'], "?"), "", $b);
if ($_POST['workspace'])
	$tiddlyCfg['workspace_name'] = $_POST['workspace'];	
	
debug("workspace_name : ".$tiddlyCfg['workspace_name'], "config");
$tiddlyCfg['pref']['base_folder'] = str_replace('/index.php', '', $_SERVER["SCRIPT_NAME"]);
debug("filename : ".$_SERVER["SCRIPT_NAME"], "config");

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
	
if(@file($file_location))
{
	readfile($file_location);
	exit;
}

/////////////////////////////////////////////////////////config dependent include////////////////////////////////////////////////////.

//include_once($cct_base."includes/url.php");
include_once($cct_base."includes/db.".$tiddlyCfg['db']['type'].".php");


//////////////////////////////////////////////////////////////////////// manupulate values////////////////////////////////////////////////////.

//////////////////////////////////////////////////////// config file ////////////////////////////////////////////////////////
//include default config file first before the desired config based either on config variable or URL
//used for seamless upgrade as possible
// GLOBAL PREFERENCES THAT PERSIST ACCROSS ALL workspaces

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


$admin_select_data['workspace_name']  = $tiddlyCfg['workspace_name'];
$results = db_record_select($tiddlyCfg['table']['admin'], $admin_select_data);// get list of admin users for workspace

$i = 0;
foreach($results as $result)
	$admin_array[$i++] = $result['username'];
	
if(is_array($admin_array))
	$tiddlyCfg['group']['admin'] = $admin_array;
else
	$tiddlyCfg['group']['admin'] = array();

$tiddlyCfg['group']['exampleGroup'] = array('admin', 'simon');

//user allow to upload rss, put in group names here like $tiddlyCfg['privilege_misc']['rss'] = array("<group1>", "<group2>");
$tiddlyCfg['privilege_misc']['rss'] = array("user");
$tiddlyCfg['privilege_misc']['upload'] = array("admin");			//user allow to upload the whole TW or import TW, put in group names here
$tiddlyCfg['privilege_misc']['markup'] = array("admin");			//user allow to change markup

/*	PRIVILEGE SYSTEM
		
The privilege system consist of four character, each represent a different action
	
privilege order
	read/insert/edit/delete

privilege value
	Allow (A)
	Deny (D)
	Undefine/Unchange (U)

Example : 

	for a privilege string "ADAU", the privilege for a particular tiddler to the user would be
	R	READ: allowed		the user is allowed to read
	C	INSERT: deny		the user is NOT allowed to insert a tiddler with a certain tag
	U	EDIT: allowed		the user is allow to edit the tiddler
	D	DELETE: undefined	undefined privilege. This would be replaced by either allowed or deny depending on the config "undefined_privilege"

Notes : 

	* UNDEFINED (normally treated as DENY, see settings below) can be overwrited by ALLOW
	* DENY has the highest priority and could not be overwrite by ALLOW/UNDEFINED
	* If a tiddler has several tag, of which one has deny in one of the privilege, it would be treated as deny on that privilege
	* Rename a tiddler requires EDIT privilege
	* Overwrite one tiddler with new tiddler requires EDIT privilege
	* Overwrite a tiddler(A) with another tiddler(B) require DELETE privilege for tiddler (A) , and EDIT for the overwritting tiddler (B)

*/

//default privileges
$tiddlyCfg['privilege_misc']['undefined_privilege'] = "D";		//defined what should undefined (U) be treated as
$tiddlyCfg['privilege_misc']['default_privilege'] = "UUUU";		//default privilege for all group and tags

//default privileges for certain groups, applied after default_privilege
//Format : $tiddlyCfg['privilege_misc']['group_default_privilege']['<group name>']
$tiddlyCfg['privilege_misc']['group_default_privilege']['anonymous'] = $tiddlyCfg['default_anonymous_perm'];
$tiddlyCfg['privilege_misc']['group_default_privilege']['user'] = 'AAAA';//$tiddlyCfg['default_user_perm'];
$tiddlyCfg['privilege_misc']['group_default_privilege']['admin'] = "AAAA";


/*  TAG BASED PERMISSIONS 

assign privilege to specific tag using groups

Format : 
$tiddlyCfg['privilege']['<put your group name here>']['<put your tag name here>'] = "<put your privilege here>";

Example : 

$tiddlyCfg['privilege']['anonymous']['systemConfig'] = "ADDD";

this would deny anonymous users to insert/edit/delete systemConfig tags but still allow it to run  */

$tiddlyCfg['privilege']['admin']['systemConfig'] = "AAAA";
$tiddlyCfg['privilege']['user']['systemConfig'] = "AAAD";

$tiddlyCfg['privilege']['anonymous']['private'] = "DDDD";
$tiddlyCfg['privilege']['anonymous']['comments'] = "AADD";		//allow comments to be post anonymously

// END OF PERMISSIONS 

$tiddlyCfg['version']="1.6.4";	//set ccTiddly Version number
$tiddlyCfg['session_expire'] = ($tiddlyCfg['session_expire']==0?9999999:$tiddlyCfg['session_expire']);
$tiddlyCfg['session_expire'] = $tiddlyCfg['session_expire'] * 60;  // Converts minutes to seconds to be added to an epoch value 

$tiddlyCfg['table']['main'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['main'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['backup'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['backup'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['config'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['config'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['user'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['user'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['group'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['group'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['privilege'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['privilege'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['tiddlywiki_type'] = $cct_base."tiddlywiki/".$tiddlyCfg['tiddlywiki_type'].".js"; // plain TW file, $cct_base defined in config.php

if ($tiddlyCfg['debug']['params']==1 || $tiddlyCfg['developing'] == 2 )
{
	foreach ($_POST as $k => $v) {
		debug("POST : ".$k." : ".$v, "params");
	}
	foreach ($_REQUEST as $k => $v) {
//		debug("REQUEST : ".$k." : ".$v, "params");
	}
}

?>
