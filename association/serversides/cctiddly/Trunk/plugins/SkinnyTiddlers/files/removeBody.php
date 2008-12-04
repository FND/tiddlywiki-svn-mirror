<?php
$autoLoad = array("skinnyPlugin", "SiteTitle", "SiteSubtitle", "MainMenu");
$defaultTiddlers = getTiddler('AnonDefaultTiddlers', $tiddlyCfg['workspace_name']);
foreach(explode(" ", $defaultTiddlers['body']) as $tiddler)
{
	$defaults[] = str_replace("]]", "", str_replace("[[", "", $tiddler));	
}
array_merge($defaults, $autoLoad);
if(!in_array($t['title'], $autoLoad))
	$t['body'] = "";
?>