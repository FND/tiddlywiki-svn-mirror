<?php

//This server side search has been implemented so the search functionality still exists when the entire Tiddlywiki content is not downloaded.

$cct_base = "../";
include_once($cct_base."includes/header.php");

$tiddlers = getAllTiddlers('simon', 'cctiddlyasdfasdfasdfasdf');

echo "<br>";
//var_dump($a);
	foreach($tiddlers as $t)
	{
		print $t['title']."<br>";
	}


//	print tiddler_bodyDecode($tiddlers['M['body']);
?>