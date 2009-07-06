<?php

// Set up Permissions : 

$tiddlyCfg['privilege_misc']['undefined_privilege'] = "D";		
$tiddlyCfg['privilege_misc']['default_privilege'] = "AUUU";		
$tiddlyCfg['privilege_misc']['group_default_privilege']['anonymous'] = "UDDD";
$tiddlyCfg['privilege_misc']['group_default_privilege']['user'] = "AAAA"; // THIS MAY NEED TO BE CHANGED

// Tag based permissions : 

$tiddlyCfg['privilege']['admin']['systemConfig'] = "AAAA";
$tiddlyCfg['privilege']['non_admin']['systemConfig'] = "ADDD";

$tiddlyCfg['privilege']['admin']['document'] = "AAAA";
$tiddlyCfg['privilege']['non_admin']['document'] = "AUAA";


$tiddlyCfg['show_register_on_login'] = false;

$p = new Plugin('Tiddler Tree','0.1','simonmcmanus.com');
$p->addTiddlersFolder(getcwd().'/plugins/TiddlyDocs/files');
?>
