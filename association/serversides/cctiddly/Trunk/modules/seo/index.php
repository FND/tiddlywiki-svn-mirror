<?php

$m = new Module('SEO Plugin','0.1','simonmcmanus.com');
error_log(" index of seo plugin");
$m->addEvent("preSave", 'seo/files/createHtml.php');  
$m->addEvent("returnNotFound", 'seo/files/checkUrl.php');

//$m->addPlugin('sdk/inboundSMS.tiddler'); // plugin
//$m->addEvent("loadStoreArea", 'sdk/files/examples/cmds/getRecievedMessages.php');  // eventName, fileContainingCode

?>