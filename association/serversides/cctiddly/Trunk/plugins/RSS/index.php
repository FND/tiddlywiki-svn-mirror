<?php
$p = new Plugin('RSS 2.0','0.1','simonmcmanus.com');
/*
Used to generate a RSS feed for each workspace.

*/

// before returning file not found check if the file exists in the uploads/tiddlers/ directory. 
$tiddler1['title'] = "MarkupPostHead";
if($tiddlyCfg['use_mod_rewrite'] ==1)
	$tiddler1['body'] = "<link rel='alternate' type='application/rss+xml' title='RSS Feed for ccTiddly workspace : ".$tiddlyCfg['workspace_name']."' href='".getURL()."?workspace='".$tiddlyCfg['workspace_name']."'/>";
else
	$tiddler1['body'] = "<link rel='alternate' type='application/rss+xml' title='RSS Feed for ccTiddly workspace : ".$tiddlyCfg['workspace_name']."' href='index.xml'/>";

$p->addTiddler($tiddler1);
$p->addEvent("returnNotFound", 'RSS/files/URImapping.php');
$p->addEvent("afterIncludes", 'RSS/files/URImapping.php');
?>
