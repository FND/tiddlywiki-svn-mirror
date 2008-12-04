<?php
$autoLoad = array("skinnyPlugin", "SiteTitle", "SiteSubtitle", "MainMenu"); // set the tiddlers which will not be lazily loaded
$defaultTiddler = ($user['verified']) ? "DefaultTiddlers" : "AnonDefaultTiddlers"; // if the user is logged in get default tiddlers, if the are not logged in get the anonDefaultTiddler
$defaultTiddlers = getTiddler('AnonDefaultTiddlers', $tiddlyCfg['workspace_name']); // fetch the default tiddlers from the db
foreach(explode(" ", $defaultTiddlers['body']) as $tiddler)
	$defaults[] = str_replace("]]", "", str_replace("[[", "", $tiddler));	 // for each default tiddler add them to the autoLoad array. 
array_merge($defaults, $autoLoad);
if(!in_array($t['title'], $autoLoad)) // remove the body of all tiddlers which should be skinily loaded. 
	$t['body'] = "";
?>