<?php

//$autoLoad = array("titleTitle"=>""); // set the tiddlers which will not be lazily loaded

$defaultTiddler = ($user['verified']) ? "DefaultTiddlers" : "AnonDefaultTiddlers"; // if the user is logged in get default tiddlers, if the are not logged in get the anonDefaultTiddler

$defaultTiddlers = getTiddler('AnonDefaultTiddlers', $tiddlyCfg['workspace_name']); // fetch the default tiddlers from the db
foreach(explode(" ", $defaultTiddlers['body']) as $tiddler)
	$defaults[str_replace("]]", "", str_replace("[[", "", $tiddler))] = "";	 // for each default tiddler add them to the autoLoad array. 

// GET systemConfig tags
$systemConfigTiddlers = getTiddlersWithTags(array('systemConfig'), array());

foreach($systemConfigTiddlers as $sysTiddler)
{
//	echo $sysTiddler1['title']."\n";
	$autoLoad[$sysTiddler['title']] = "";
}

$autoLoad = array_merge($defaults, $autoLoad);

if(!isset($autoLoad[$t['title']])) // using isset instead of in_array to speed things up.
	$t['body'] = "";

?>
