

<?php


	$cct_base = "../";
	include_once($cct_base."includes/header.php");
	$tiddlyCfg['workspace_name'] = $_REQUEST['workspace'];
	$tiddler = db_tiddlers_mainSelectTitle($title);
	
	
	//use tiddler_id to obtain list of tiddler for revision
	$t= db_tiddlers_backupSelectOid($tiddler['id']);
	
	
	
//	print_r($tiddler);

	echo "{'created':'".$tiddler['created']."', 'text':'".$tiddler['body']."', 'tags':'".$tiddler['tags']."', 'modified':'".$tiddler['modified']."', 'bag':'', 'title':'METITLE', 'modifier':'".$tiddler['modifier']."',  'revision':".$tiddler['revision']."}";
exit;

