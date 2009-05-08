<?php

$p = new Plugin('Skinny Tiddlers Plugin','0.2','simonmcmanus and FND');

$p->addTiddler(null, getcwd()."/plugins/SkinnyTiddlers/files/serverSideSearchPlugin.js");
$p->addTiddler(null, getcwd()."/plugins/SkinnyTiddlers/files/skinnyPlugin.js");
$p->addEvent('preOutputTiddler', getcwd()."/plugins/SkinnyTiddlers/files/removeBody.php")


?>
