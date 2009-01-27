<?php
$p = new Plugin('FCKEditor Plugin','0.1','simonmcmanus.com');
$data1['tags'] = 'systemConfig';
$p->addTiddler($data1, getcwd().'/plugins/FCKEditor/files/FCKEditorPlugin.tiddler');
$data1['tags'] = '';
$p->addTiddler($data1, getcwd().'/plugins/FCKEditor/files/ToolbarCommands.tiddler');
$p->addTiddler($data1, getcwd().'/plugins/FCKEditor/files/MarkupPreHead.tiddler');

?>
