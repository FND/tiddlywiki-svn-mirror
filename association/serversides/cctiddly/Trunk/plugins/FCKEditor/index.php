<?php
$p = new Plugin('FCKEditor','0.1','simonmcmanus.com');

$p->addTiddler($data1, getcwd().'/plugins/FCKEditor/files/ToolbarCommands.tid');
$p->addTiddler($data1, getcwd().'/plugins/FCKEditor/files/MarkupPreHead.tid');
$data1['tags'] = 'systemConfig';
$p->addTiddler($data1, getcwd().'/plugins/FCKEditor/files/FCKEditorPlugin.js');
$p->addTiddler($data1, getcwd().'/plugins/FCKEditor/files/FCKSettings.js');

?>
