<?php



$autoLoad = array("skinnyPlugin"=>"", "SiteTitle"=>"", "SiteSubtitle"=>"", "MainMenu"=>"", "002_ccTiddlyPlugins"=>"", "ColorPalette"=>"", "GettingStarted"=>""); // set the tiddlers which will not be lazily loaded


$defaultTiddler = ($user['verified']) ? "DefaultTiddlers" : "AnonDefaultTiddlers"; // if the user is logged in get default tiddlers, if the are not logged in get the anonDefaultTiddler

$defaultTiddlers = getTiddler('AnonDefaultTiddlers', $tiddlyCfg['workspace_name']); // fetch the default tiddlers from the db
foreach(explode(" ", $defaultTiddlers['body']) as $tiddler)
	$defaults[str_replace("]]", "", str_replace("[[", "", $tiddler))] = "";	 // for each default tiddler add them to the autoLoad array. 

/*
// GET systemConfig tags
$systemConfigTiddlers = getTiddlersWithTags(array('systemConfig'), array());

var_dump($systemConfigTiddlers);

foreach($systemConfigTiddlers as $sysTiddler1)
echo $sysTiddler1['title'];

	$autoLoad[$sysTiddler['title']] = "";

//echo	$defaults[$sysTiddler['title']] = "";
//$autoLoad = array_merge($systemConfigTiddlers, $autoLoad);
*/

$autoLoad = array_merge($defaults, $autoLoad);

//if(!in_array($t['title'], $autoLoad)) // remove the body of all tiddlers which should be skinily loaded. 
if(!isset($autoLoad[$t['title']])) // using isset instead of in_array to speed things up.
	$t['body'] = "";

?>