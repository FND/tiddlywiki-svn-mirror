<?php
$m = new Plugin('SEO Plugin','0.1','simonmcmanus.com');
// before saving each tiddler it creates a wikified version of that file in the html directory. 
$m->addEvent("preSave", 'seo/files/createHtml.php');  

// before returning file not found check if the file exists in the uploads/tiddlers/ directory. 
$m->addEvent("returnNotFound", 'seo/files/checkUrl.php');
$m->addEvent("outputTiddlers", 'seo/files/include.php');
?>