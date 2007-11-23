<?php 
include_once('includes/db.mysql.php');

function instance_create($instance)
{
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
	
	$data1['body'] = "The easiest way to learn about TiddlyWiki is to use it! Try clicking on various links and see what happens - you cannot damage tiddlywiki.com or your browser. There is an extensive [[Community]] [[documentation wiki|http://www.tiddlywiki.org/]], including an invaluable [[FAQ|http://www.tiddlywiki.org/wiki/TiddlyWiki_FAQ]]. Other useful guides include:
	* Dave Gifford's [[TiddlyWiki for the Rest of Us|http://www.giffmex.org/twfortherestofus.html]]
	* Morris Gray's [[TW Help - TiddlyWiki help file for beginners|http://tiddlyspot.com/twhelp/]]
	* Dmitri Popov's [[TiddlyWiki quick reference card|http://nothickmanuals.info/doku.php/cheatsheets]]
	* Screencasts from [[JimVentola|http://faculty.massasoit.mass.edu/jventola/videocasts/tidhelp2/tidhelp2.html]] and [[LeonKilat|http://max.limpag.com/2006/09/07/using-a-tiddlywiki-a-video-guide/]].
	When you're ready to create your own TiddlyWiki on your computer, follow the instructions in DownloadSoftware and SaveChanges. There is also a free hosted service at http://tiddlyspot.com/ that makes it easier to share your TiddlyWiki with others (for more demanding applications there are several other ServerSide solutions available). Upload Pics
	
	&lt;form action='../../cctiddly/msghandle.php?instance=".$instance."' method='post' enctype='multipart/form-data'&gt;
	&lt;input type='file' name='file'  rows=10 id='file' /&gt;
	&lt;input type='submit' name='submit' value='Submit' /&gt;
	&lt;/form&gt;";
	$data1['title'] = 'TiddlyWiki';
	db_record_insert($tiddlyCfg['table']['name'],$data1);
	
	mkdir($tiddlyCfg['pref']['upload_dir'].$instance ,  0777);
	mkdir($tiddlyCfg['pref']['upload_dir'].$instance.'/images' ,  0777);
	mkdir($tiddlyCfg['pref']['upload_dir'].$instance.'/thumbs' ,  0777);
return true;}?> 