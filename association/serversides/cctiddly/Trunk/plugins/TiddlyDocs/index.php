<?php

// Set up Permissions : 

$tiddlyCfg['privilege_misc']['undefined_privilege'] = "D";		//defined what should undefined (U) be treated 
$tiddlyCfg['privilege_misc']['default_privilege'] = "AUUU";		//default privilege for all group and tags
$tiddlyCfg['privilege_misc']['group_default_privilege']['anonymous'] = "DDDD";
$tiddlyCfg['privilege_misc']['group_default_privilege']['user'] = "AAAA";

// Tag based permissions : 


$tiddlyCfg['privilege']['admin']['systemConfig'] = "AAAA";
$tiddlyCfg['privilege']['non_admin']['systemConfig'] = "ADDD";

$tiddlyCfg['privilege']['admin']['document'] = "AAAA";
$tiddlyCfg['privilege']['non_admin']['document'] = "AAAA";


$p = new Plugin('Tiddler Tree','0.1','simonmcmanus.com');
$p->addTiddlersFolder(getcwd().'/plugins/TiddlyDocs/files');
?>
