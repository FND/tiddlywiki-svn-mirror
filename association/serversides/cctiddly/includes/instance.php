<?php 

debug('create4 instance ');
include_once($cct_base."includes/db.mysql.php");

// returns false f the instance name already exists.

function instance_create($instance)
{
	
	// TODO check for instance already existing 
	// TODO return correct error of illegal chars are entered. 
	
//	if(!ctype_alnum($instance))
//	{
//		return 'Instance name can only include numbers and letters';
//	}

	global $tiddlyCfg;
	$data['name'] = $instance;
	$data['lang'] = 'en';
	$data['keep_revision'] = 1;
	$data['require_login'] = 0;
	$data['session_expire'] = $tiddlyCfg['pref']['session_expire'];
	$data['tag_tiddler_with_modifier'] = '';
	$data['char_set'] = 'utf8';
	$data['hashseed'] = rand();
	$data['debug'] = '1';	
	$data['status'] = '';
	$data['tiddlywiki_type'] = 'tiddlywiki';
	$data['default_anonymous_perm'] = 'DDDD';	
	$data['default_user_perm'] = 'AAAA';
	$data['rss_group'] = '';
	$data['markup_group'] = '';
														
	 db_record_insert('instance',$data);  
	 	
	// PRE POPULATE THE DATABASE WITH SOME TIDDLERS
	// CODE ADDED BY SIMONMCMANUS 
	
	
	$data1['instance_name'] = $instance;
	$data1['body'] = $instance;
	$data1['title'] = 'SiteTitle';
	db_record_insert($tiddlyCfg['table']['name'],$data1);
	
	$data1['body'] = 'http://'.$_SERVER['SERVER_NAME'].'/'.$_SERVER['PHP_SELF'];
	$data1['title'] = 'SiteUrl';
	db_record_insert($tiddlyCfg['table']['name'],$data1);
		
	$data1['body'] = 'http://osmosoft.com/ More info about osmosoft can be found here ' ;
	$data1['title'] = 'Osmosoft';
	db_record_insert($tiddlyCfg['table']['name'],$data1);
	
	
	$data1['body'] = 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name';
	$data1['title'] = 'SiteSubtitle';
	db_record_insert($tiddlyCfg['table']['name'],$data1);
	

	
	@mkdir($tiddlyCfg['pref']['upload_dir'].$instance ,  0777);
	@mkdir($tiddlyCfg['pref']['upload_dir'].$instance.'/images' ,  0777);
	@mkdir($tiddlyCfg['pref']['upload_dir'].$instance.'/thumbs' ,  0777);
	header('HTTP/1.0 201 Created');

return true;

}?>