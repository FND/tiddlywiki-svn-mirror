<?php
$m = new Plugin('RSS 2.0','0.1','simonmcmanus.com');

// before returning file not found check if the file exists in the uploads/tiddlers/ directory. 
$p->addTiddler(null, getcwd().'/plugins/RSS/files/MarkupPostBody.tiddler');
?>
