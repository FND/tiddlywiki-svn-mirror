<?php
global $p;
$p = new Plugin('Wordpress Migration Plugin','0.1','simonmcmanus.com');
$p->wordpressInstance  = "simonmcmanus.wordpress.com";
$p->ccTiddlyInstance = "simonmcmanus.com";

/*
This plugin is designed to deal which any problems that may arise from migrating from wordpress to ccTiddly. 

Part 1 : 
Allow users to upload a CSV file to provide 301 redirects to a different URL. 

*/
$m->addEvent("returnNotFound", getcwd().'/plugins/WordpressMigration/files/redirect.php');


?>