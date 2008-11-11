<?php
$m = new Plugin('RSS 2.0','0.1','simonmcmanus.com');

// before returning file not found check if the file exists in the uploads/tiddlers/ directory. 
$tiddler['title'] = "MarkupPostBody";
$tiddler['body'] = "<link rel='alternate' type='application/rss+xml' title='RSS' href='/plugins/RSS/files/rss.php?workspace='".$tiddlyCfg['workspace_name']."'/>";
$p->addTiddler($tiddler);
$p->addEvent("returnNotFound", 'RSS/files/URImapping.php');
$p->addEvent("afterIncludes", 'RSS/files/URImapping.php');
?>
