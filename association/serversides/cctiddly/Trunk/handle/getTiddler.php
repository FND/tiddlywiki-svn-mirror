<?php
	$cct_base = "../";
	include_once($cct_base."includes/header.php");
	
	$tiddler = db_tiddlers_mainSelectTitle($title);
//	print_r($tiddler);
	
	
	
	echo "['text:'".$tiddler['body']."','tags':'".$tiddler['tags']."', 'revision:'".$tiddler['revision']."','modifier:'".$tiddler['modifier']."','modified:'".$tiddler['modified']."','created:'".$tiddler['created']."']";
