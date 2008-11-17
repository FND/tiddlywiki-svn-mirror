<?php
global $p;
$p = new Plugin('Wordpress Migration Plugin','0.1','simonmcmanus.com');
$p->wordpressInstance  = "simonmcmanus.wordpress.com";
$p->ccTiddlyInstance = "simonmcmanus.com";

/*
This plugin is designed to deal which any problems that may arise from migrating from wordpress to ccTiddly. 

Part 1 : 
Allow users to upload a CSV file to provide 301 redirects to a different URL. 

The became necessary after I noticed that some links to my wordpress blog were still point at my ccTiddly instance : 

eg : 

simonmcmanus.com/2007/12/12/BlogPost

should redirect to : 

simonmcmanus.wordpress.com/2007/12/12/BlogPost

*/
$m->addEvent("returnNotFound", getcwd().'/plugins/WordpressMigration/files/redirect.php');


?>