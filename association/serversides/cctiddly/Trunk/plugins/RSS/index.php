<?php
$m = new Plugin('RSS 2.0','0.1','simonmcmanus.com');
echo $tiddlyCfg['workspace_name'];



// before returning file not found check if the file exists in the uploads/tiddlers/ directory. 
$tiddler['title'] = "MarkupPostBody";
if($tiddlyCfg['use_mod_rewrite'] ==1)
	$tiddler['body'] = "<link rel='alternate' type='application/rss+xml' title='RSS' href='?workspace='".$tiddlyCfg['workspace_name']."'/>";
else
	$tiddler['body'] = "<link rel='alternate' type='application/rss+xml' title='RSS' href='".$tiddlyCfg['workspace_name']."/index.xml'/>";

$p->addTiddler($tiddler);
$p->addEvent("returnNotFound", 'RSS/files/URImapping.php');
$p->addEvent("afterIncludes", 'RSS/files/URImapping.php');
?>
