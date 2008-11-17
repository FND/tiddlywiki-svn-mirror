<?php
$m = new Plugin('SEO Plugin','0.1','simonmcmanus.com');
// before saving each tiddler it creates a wikified version of that file in the html directory. 
$m->addEvent("preSave", dirname(getcwd()).'/plugins/seo/files/createHtml.php');  
$m->addEvent("preRename", dirname(getcwd()).'/plugins/seo/files/renameCreateHtml.php');  
// before returning file not found check if the file exists in the uploads/tiddlers/ directory. 
$m->addEvent("returnNotFound", getcwd().'/plugins/seo/files/checkUrl.php');
//$m->addEvent("outputTiddlers", getcwd().'/plugins/seo/files/include.php');
$m->addTiddler(null, getcwd()."/plugins/seo/files/generate.js");
?>