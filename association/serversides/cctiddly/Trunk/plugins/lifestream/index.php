<?php
$m = new Plugin('Life Steaminging Plugin','0.1','simonmcmanus.com');
//$m->addEvent("outputTiddlers", 'lifestream/files/include.php');
$m->addTiddlersFolder(getcwd()."/plugins/lifestream/files");
?>
