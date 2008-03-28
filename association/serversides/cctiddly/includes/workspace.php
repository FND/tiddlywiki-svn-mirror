<?php 

include_once($cct_base."includes/header.php");
include_once($cct_base."includes/user.php");
include_once($cct_base."includes/tiddler.php");

function workspace_create_new($anonPerm="AUUU",$hash=null)
{
	global $tiddlyCfg;
	debug("workspace_create_new: ".$tiddlyCfg['workspace_name']);
	
	if( $hash===null )
	{
		$tiddlyCfg['hashseed'] = rand();
	}else{
		$tiddlyCfg['hashseed'] = $hash;
	}
	
	//$tiddlyCfg['tiddlywiki_type'] = 'tiddlywiki';
	db_workspace_install();
	
	$data1['workspace_name'] = $workspace;
	$data1['body'] = $workspace;
	$data1['title'] = 'SiteTitle';
	$data1['creator'] = 'ccTiddly';
	$data1['modifier'] = 'ccTiddly';
	$data1['modified'] = epochToTiddlyTime(mktime());
	$data1['created'] = epochToTiddlyTime(mktime());
	$data1['fields'] = "changecount='1'";
	db_record_insert($tiddlyCfg['table']['main'],$data1);
		
	header('HTTP/1.0 201 Created');
}

function workspace_create($workspace, $anonPerm="ADDD")
{
	global $tiddlyCfg;
	if(!user_session_validate())
	{
		sendHeader("403");
		echo '<b>You do not appear to be logged in</b>';
		exit;	
	}
	
	
	if(eregi('[^a-zA-Z0-9.]', $workspace))
	{
		header('HTTP/1.0 400 Bad Request');
		exit("Workspace name can only include numbers, letters and full stops.");
	}
	
	if ($tiddlyCfg['create_workspace']!==1)
	{
		header('HTTP/1.0 403  Forbidden');
		exit("Thie ability to create workspaces on this server is currently disabled. Please contant your system administrator.");
	}
debug('1');
	$data['name'] = $workspace;
	$data['twLanguage'] = 'en';
	$data['keep_revision'] = 1;
	$data['require_login'] = 0;
	$data['session_expire'] = $tiddlyCfg['session_expire'];
	$data['tag_tiddler_with_modifier'] = '';
	$data['char_set'] = 'utf8';
	$data['hashseed'] = rand();
	$data['status'] = '';
	$data['tiddlywiki_type'] = 'tiddlywiki';
	$data['default_anonymous_perm'] = $anonPerm;	
	$data['default_user_perm'] = 'AAAA';
	$data['rss_group'] = '';
	$data['markup_group'] = '';
	db_record_insert($tiddlyCfg['table']['workspace'],$data);  
debug("2");
	$data1['workspace_name'] = $workspace;
	$data1['body'] = $workspace;
	$data1['title'] = 'SiteTitle';
	$data1['creator'] = 'ccTiddly';
	$data1['modifier'] = 'ccTiddly';
	$data1['modified'] = epochToTiddlyTime(mktime());
	$data1['created'] = epochToTiddlyTime(mktime());
	$data1['fields'] = "changecount='1'";
	db_record_insert($tiddlyCfg['table']['main'],$data1);
		
		
	$data1['body'] = 'http://osmosoft.com/ More info about osmosoft can be found here ' ;
	$data1['title'] = 'Osmosoft';
	db_record_insert($tiddlyCfg['table']['main'],$data1);
	
	
	$data1['body'] = "To get started with this blank TiddlyWiki, you'll need to modify the following tiddlers:\n* SiteTitle &amp; SiteSubtitle: The title and subtitle of the site, as shown above (after saving, they will also appear in the browser title bar)\n* MainMenu: The menu (usually on the left)\n* DefaultTiddlers: Contains the names of the tiddlers that you want to appear when the TiddlyWiki is opened";
	$data1['title'] = 'GettingStarted';
	db_record_insert($tiddlyCfg['table']['main'], $data1);
	
	
	
	$data1['body'] = 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name';
	$data1['title'] = 'SiteSubtitle';
	$data1['creator'] = 'ccTiddly';
	$data1['modifier'] = 'ccTiddly';
	$data1['created'] = epochToTiddlyTime(mktime());
	db_record_insert($tiddlyCfg['table']['main'],$data1);
	
	
	
	// ASSIGN THE WORKSPACE OWNERSHIP : 
	$owner['username'] = cookie_get('txtUserName');
	
	
	$owner['workspace_name']=$workspace;
	db_record_insert($tiddlyCfg['table']['admin'],$owner);
	
	
	header('HTTP/1.0 201 Created');
	return true;
}
?>