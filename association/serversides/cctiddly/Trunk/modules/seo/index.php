<?php

$m = new Module('SEO Plugin','0.1','simonmcmanus.com');


$m->addEvent("returnNotFound", 'seo/files/checkUrl.php');  // eventName, fileContainingCode

// add to save script so it creates files on save. 




// mod rewrite override.
//  

// check to see if the file exists in the uploads directory


//$m->addPlugin('sdk/inboundSMS.tiddler'); // plugin
//$m->addEvent("loadStoreArea", 'sdk/files/examples/cmds/getRecievedMessages.php');  // eventName, fileContainingCode

?>