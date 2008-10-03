<?php 

include_once($cct_base."includes/header.php");
include_once($cct_base."includes/user.php");
include_once($cct_base."includes/tiddler.php");


function workspace_create($workspace, $anonPerm="ADDD", $admin="")
{
	global $tiddlyCfg;
	if(!user_session_validate())
	{
		sendHeader("403");
		exit;	
	}
	if(eregi('[^a-zA-Z0-9.-/]', $workspace))
	{
		header('HTTP/1.0 400 Bad Request');
		exit;
	}
	
	if ($tiddlyCfg['create_workspace']!==1)
	{
		header('HTTP/1.0 403  Forbidden');
		exit;
	}
	
	error_log("ssdsds");
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
	$data1['workspace_name'] = $workspace;
	$data1['body'] = $workspace;
	$data1['title'] = 'SiteTitle';
	$data1['creator'] = 'ccTiddly';
	$data1['modifier'] = 'ccTiddly';
	$data1['modified'] = epochToTiddlyTime(mktime());
	$data1['created'] = epochToTiddlyTime(mktime());
	//$data1['fields'] = "changecount='1'";
	db_record_insert($tiddlyCfg['table']['main'],$data1);
		
		
	$data0['body'] = 'http://osmosoft.com/ More info about osmosoft can be found here ' ;
	$data0['title'] = 'Osmosoft';
	$data0['tags'] = 'excludeLists';
	db_record_insert($tiddlyCfg['table']['main'],$data0);
	
	
	$data1['body'] = $tiddlyCfg['GettingStartedText'];
	$data1['title'] = 'GettingStarted';
	db_record_insert($tiddlyCfg['table']['main'], $data1);
	
	$data1['body'] = 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name';
	$data1['title'] = 'SiteSubtitle';
	$data1['creator'] = 'ccTiddly'; 
	$data1['modifier'] = 'ccTiddly';
	$data1['created'] = epochToTiddlyTime(mktime());
	db_record_insert($tiddlyCfg['table']['main'],$data1);

	
	// ASSIGN THE WORKSPACE OWNERSHIP : 
	if ($admin == "")
		$owner['username'] = cookie_get('txtUserName');
	else
		$owner['username'] = $admin;
		
		
	$owner['workspace_name']=$workspace;
	db_record_insert($tiddlyCfg['table']['admin'],$owner);
//echo ;
//exit;
	header('HTTP/1.0 201 Created');

//	header("location:".$_SERVER['REQUEST_URI']);
  	return true;
}
?>