<?php

// This file defines the BT Web21c SDK ccTiddly Module
//echo 'SDK Module';
$m = new Module('SDK Module','5000','simonmcmanus.com');
$m->addPlugin('sdk/inboundSMS.tiddler'); // plugin
$m->addEvent("loadStoreArea", 'sdk/files/examples/cmds/getRecievedMessages.php');  // eventName, fileContainingCode
?>